import { expect, test, type Locator, type Page } from '@playwright/test';

const styleNumber = async (locator: Locator, property: string) =>
  locator.evaluate((element, name) => {
    return Number.parseFloat((element as HTMLElement).style.getPropertyValue(name));
  }, property);

const rotationDegrees = async (locator: Locator) =>
  locator.evaluate(element => {
    // WebKit may not round-trip rotate() through the inline style while a rAF-throttled
    // interaction updates it, so fall back to the computed matrix decomposition.
    const match = (element as HTMLElement).style.transform.match(/rotate\((-?[\d.]+)deg\)/);
    if (match) return Number(match[1]);
    const computed = getComputedStyle(element).transform;
    const matrix = computed.match(/matrix3?d?\(([^)]+)\)/);
    if (!matrix) return 0;
    const values = matrix[1].split(',').map(Number);
    if (values.length < 2) return 0;
    return Math.round(Math.atan2(values[1], values[0]) * (180 / Math.PI));
  });

const enableKeyboard = async (page: Page) => {
  await page
    .locator('.control-row')
    .filter({ hasText: '键盘控制:' })
    .locator('input[type="checkbox"]')
    .check();
};

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /VueMovableBox/ })).toBeVisible();
});

test('demo renders its SVG icon system and favicon', async ({ page, request }) => {
  const icons = page.locator('.demo-icon');
  expect(await icons.count()).toBeGreaterThan(20);
  await expect(icons.first()).toBeVisible();
  await expect(page.locator('.group-canvas .demo-icon').first()).toHaveCSS(
    'color',
    'rgb(51, 65, 85)'
  );
  await expect(page.locator('link[rel="icon"]')).toHaveAttribute('href', '/examples/favicon.svg');

  const favicon = await request.get('/examples/favicon.svg');
  expect(favicon.ok()).toBe(true);
});

test('demo layout keeps canvas bounds and status overlay visible without nested clipping', async ({
  page
}) => {
  const canvas = page.locator('.canvas-container');
  const wrapper = page.locator('.primary-canvas-wrapper');
  const status = page.locator('.selection-info');
  const dimensions = await canvas.evaluate(element => ({
    clientHeight: element.clientHeight,
    inlineHeight: Number.parseFloat((element as HTMLElement).style.height)
  }));
  const overflow = await wrapper.evaluate(element => element.scrollHeight - element.clientHeight);

  expect(dimensions.clientHeight).toBe(dimensions.inlineHeight);
  expect(overflow).toBeLessThanOrEqual(2);
  await expect(status).toBeVisible();
});

test('keyboard focus activates the box without stealing keys from slot controls', async ({
  page
}) => {
  const box = page.locator('.auto-draggable').first();
  await enableKeyboard(page);
  await page.getByRole('button', { name: /deactivate/ }).click();

  const initialLeft = await styleNumber(box, 'left');
  await box.focus();
  await box.press('ArrowRight');

  await expect(box).toHaveClass(/is-active/);
  expect(await styleNumber(box, 'left')).toBeGreaterThan(initialLeft);
  await expect(box.locator('.handle')).toHaveCount(8);

  const contentButton = box.getByRole('button', { name: '内容按钮' });
  await contentButton.focus();
  const leftBeforeChildKey = await styleNumber(box, 'left');
  await contentButton.press('ArrowRight');
  expect(await styleNumber(box, 'left')).toBe(leftBeforeChildKey);

  await page.getByRole('button', { name: /deactivate/ }).click();
  await box.click({ button: 'right' });
  await expect(box).not.toHaveClass(/is-dragging/);
  await expect(page.locator('.log-container')).not.toContainText('drag-start');
});

test('mouse dragging uses native pointer capture', async ({ page, browserName }) => {
  // eslint-disable-next-line playwright/no-skipped-test
  test.skip(browserName !== 'chromium', 'Implicit pointer capture semantics are verified on Chromium only');
  const box = page.locator('.auto-draggable').first();
  await box.evaluate(element => {
    element.addEventListener(
      'gotpointercapture',
      event =>
        element.setAttribute('data-captured-pointer', String((event as PointerEvent).pointerId)),
      { once: true }
    );
  });

  const bounds = await box.boundingBox();
  expect(bounds).not.toBeNull();
  const initialLeft = await styleNumber(box, 'left');
  await page.mouse.move(bounds!.x + 20, bounds!.y + 20);
  await page.mouse.down();
  await expect(box).toHaveAttribute('data-captured-pointer', /\d+/);
  await page.mouse.move(bounds!.x + bounds!.width + 80, bounds!.y + 40, { steps: 5 });
  await page.mouse.up();

  expect(await styleNumber(box, 'left')).toBeGreaterThan(initialLeft);
  await expect(page.locator('.log-container')).toContainText('drag-stop');
});

test('native touch cancellation restores state and pen input completes', async ({ page, browserName }) => {
  // CDP-driven touch synthesis is a Chromium-only capability.
  // eslint-disable-next-line playwright/no-skipped-test
  test.skip(browserName !== 'chromium', 'CDP touch synthesis is Chromium-only');
  const box = page.locator('.auto-draggable').first();
  const session = await page.context().newCDPSession(page);
  await box.evaluate(element => {
    element.addEventListener('pointerdown', event => {
      element.setAttribute('data-pointer-type', (event as PointerEvent).pointerType);
    });
  });

  const bounds = await box.boundingBox();
  expect(bounds).not.toBeNull();
  const x = bounds!.x + 25;
  const y = bounds!.y + 25;
  const initialLeft = await styleNumber(box, 'left');

  await session.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ x, y, id: 1, radiusX: 2, radiusY: 2, force: 1 }]
  });
  await session.send('Input.dispatchTouchEvent', {
    type: 'touchMove',
    touchPoints: [{ x: x + 40, y, id: 1, radiusX: 2, radiusY: 2, force: 1 }]
  });
  await expect(box).toHaveAttribute('data-pointer-type', 'touch');
  await session.send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] });

  expect(await styleNumber(box, 'left')).toBe(initialLeft);
  await expect(page.locator('.log-container')).toContainText('drag-cancel');

  await session.send('Input.dispatchMouseEvent', {
    type: 'mousePressed',
    x,
    y,
    button: 'left',
    buttons: 1,
    clickCount: 1,
    pointerType: 'pen'
  });
  await session.send('Input.dispatchMouseEvent', {
    type: 'mouseMoved',
    x: x + 50,
    y,
    button: 'none',
    buttons: 1,
    pointerType: 'pen'
  });
  await expect(box).toHaveAttribute('data-pointer-type', 'pen');
  await session.send('Input.dispatchMouseEvent', {
    type: 'mouseReleased',
    x: x + 50,
    y,
    button: 'left',
    buttons: 0,
    clickCount: 1,
    pointerType: 'pen'
  });

  expect(await styleNumber(box, 'left')).toBeGreaterThan(initialLeft);
  await expect(page.locator('.log-container')).toContainText('drag-stop');
});

test('RTL keeps resize handles on their physical edges', async ({ page }) => {
  const box = page.locator('.auto-draggable').first();
  await box.evaluate(element => element.setAttribute('dir', 'rtl'));
  const leftHandle = box.locator('.handle-ml');
  const topLeftHandle = box.locator('.handle-tl');
  const topRightHandle = box.locator('.handle-tr');

  const boxBounds = await box.boundingBox();
  const leftBounds = await leftHandle.boundingBox();
  const topLeftBounds = await topLeftHandle.boundingBox();
  const topRightBounds = await topRightHandle.boundingBox();
  expect(boxBounds && leftBounds && topLeftBounds && topRightBounds).toBeTruthy();
  expect(Math.abs(topLeftBounds!.x + topLeftBounds!.width / 2 - boxBounds!.x)).toBeLessThan(2);
  expect(
    Math.abs(topRightBounds!.x + topRightBounds!.width / 2 - (boxBounds!.x + boxBounds!.width))
  ).toBeLessThan(2);

  const initialLeft = await styleNumber(box, 'left');
  const initialWidth = await styleNumber(box, 'width');
  await page.mouse.move(
    leftBounds!.x + leftBounds!.width / 2,
    leftBounds!.y + leftBounds!.height / 2
  );
  await page.mouse.down();
  await page.mouse.move(leftBounds!.x + 20, leftBounds!.y + leftBounds!.height / 2);
  await page.mouse.up();

  expect(await styleNumber(box, 'left')).toBeGreaterThan(initialLeft);
  expect(await styleNumber(box, 'width')).toBeLessThan(initialWidth);
});

test('group drag moves the whole selection and reports a batch payload', async ({ page }) => {
  const leader = page.locator('.group-canvas .auto-draggable').nth(1);
  const member = page.locator('.group-canvas .auto-draggable').first();
  await leader.scrollIntoViewIfNeeded();

  const memberLeftBefore = await styleNumber(member, 'left');
  const memberTopBefore = await styleNumber(member, 'top');
  const leaderBounds = await leader.boundingBox();
  expect(leaderBounds).toBeTruthy();

  await page.mouse.move(leaderBounds!.x + leaderBounds!.width / 2, leaderBounds!.y + 20);
  await page.mouse.down();
  await page.mouse.move(leaderBounds!.x + leaderBounds!.width / 2 + 40, leaderBounds!.y + 50, {
    steps: 5
  });
  await page.mouse.up();

  expect(await styleNumber(member, 'left')).toBe(memberLeftBefore + 40);
  expect(await styleNumber(member, 'top')).toBe(memberTopBefore + 30);
  await expect(page.locator('.log-container')).toContainText('group-move-stop');
  await expect(page.locator('.group-selected-label')).toContainText('g1, g2');
});

test('unselected group member is left in place while the selection follows the leader', async ({
  page
}) => {
  const unselected = page.locator('.group-canvas .auto-draggable').nth(2);
  const leader = page.locator('.group-canvas .auto-draggable').nth(1);
  await leader.scrollIntoViewIfNeeded();

  const unselectedLeft = await styleNumber(unselected, 'left');
  const leaderBounds = await leader.boundingBox();
  expect(leaderBounds).toBeTruthy();

  await page.mouse.move(leaderBounds!.x + 30, leaderBounds!.y + 20);
  await page.mouse.down();
  await page.mouse.move(leaderBounds!.x + 90, leaderBounds!.y + 20, { steps: 4 });
  await page.mouse.up();

  expect(await styleNumber(unselected, 'left')).toBe(unselectedLeft);
  await expect(page.locator('.group-selected-label')).toContainText('g1, g2');
});

test('rotation applies as CSS transform and rotated boxes still drag cleanly', async ({ page }) => {
  const box = page.locator('.auto-draggable').first();

  const slider = page.locator('.control-row', { hasText: '旋转' }).locator('input[type="range"]');
  await slider.fill('45');
  await expect(box).toHaveAttribute('style', /rotate\(45deg\)/);

  await box.scrollIntoViewIfNeeded();
  const before = await styleNumber(box, 'left');
  // The demo canvas zooms to 0.6, so a 40px visual drag moves left by 40 / 0.6 in
  // the box's coordinate space.
  const scale = Number(
    await page.locator('.control-row', { hasText: '缩放比例' }).locator('input').inputValue()
  );
  const bounds = await box.boundingBox();
  expect(bounds).toBeTruthy();
  await page.mouse.move(bounds!.x + bounds!.width / 2, bounds!.y + bounds!.height / 2);
  await page.mouse.down();
  await page.mouse.move(bounds!.x + bounds!.width / 2 + 40, bounds!.y + bounds!.height / 2 + 20, {
    steps: 4
  });
  await page.mouse.up();

  expect(await styleNumber(box, 'left')).toBeCloseTo(before + 40 / scale, 0);
  await expect(box).toHaveAttribute('style', /rotate\(45deg\)/);
});

test('rotation handle captures the pointer and Escape restores the committed angle', async ({
  page,
  browserName
}) => {
  const box = page.locator('.auto-draggable').first();
  const handle = box.getByRole('slider', { name: 'Rotation' });
  await box.scrollIntoViewIfNeeded();
  await expect(handle).toBeVisible();
  // gotpointercapture dispatch timing differs across engines; the attribute probe is a
  // Chromium-only assertion and other engines verify the is-rotating state instead.
  if (browserName === 'chromium') {
    await box.evaluate(element => {
      element.addEventListener(
        'gotpointercapture',
        event =>
          element.setAttribute('data-rotation-pointer', String((event as PointerEvent).pointerId)),
        { once: true }
      );
    });
  }

  const boxBounds = await box.boundingBox();
  const handleBounds = await handle.boundingBox();
  expect(boxBounds && handleBounds).toBeTruthy();
  const center = {
    x: boxBounds!.x + boxBounds!.width / 2,
    y: boxBounds!.y + boxBounds!.height / 2
  };

  await page.mouse.move(
    handleBounds!.x + handleBounds!.width / 2,
    handleBounds!.y + handleBounds!.height / 2
  );
  await page.mouse.down();
  await expect(box).toHaveClass(/is-rotating/);
  if (browserName === 'chromium') {
    await expect(box).toHaveAttribute('data-rotation-pointer', /\d+/);
  }
  await page.mouse.move(center.x + 70, center.y, { steps: 5 });
  // The interaction commits on rAF; poll instead of reading a single instant.
  await expect
    .poll(() => rotationDegrees(box), { timeout: 5_000 })
    .toBeCloseTo(90, 0);
  await page.mouse.up();
  await expect(box).not.toHaveClass(/is-rotating/);
  await expect(page.locator('.log-container')).toContainText('rotate-stop');

  const committedAngle = await rotationDegrees(box);
  const rotatedBounds = await box.boundingBox();
  const rotatedHandleBounds = await handle.boundingBox();
  expect(rotatedBounds && rotatedHandleBounds).toBeTruthy();
  const rotatedCenter = {
    x: rotatedBounds!.x + rotatedBounds!.width / 2,
    y: rotatedBounds!.y + rotatedBounds!.height / 2
  };

  const externalControl = page
    .locator('.control-row', { hasText: '缩放比例' })
    .locator('input[type="range"]');
  await externalControl.focus();
  await page.mouse.move(
    rotatedHandleBounds!.x + rotatedHandleBounds!.width / 2,
    rotatedHandleBounds!.y + rotatedHandleBounds!.height / 2
  );
  await page.mouse.down();
  expect(await box.evaluate(element => element.contains(document.activeElement))).toBe(false);
  await page.mouse.move(rotatedCenter.x, rotatedCenter.y + 70, { steps: 5 });
  await expect
    .poll(() => rotationDegrees(box), { timeout: 5_000 })
    .not.toBe(committedAngle);
  await page.keyboard.press('Escape');
  await page.mouse.up();

  expect(await rotationDegrees(box)).toBe(committedAngle);
  await expect(box).not.toHaveClass(/is-rotating/);
  await expect(page.locator('.log-container')).toContainText('rotate-cancel');
});
