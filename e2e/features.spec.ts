import { expect, test, type Page } from '@playwright/test';

const fixture = (mode: string) => `/examples/e2e-fixture.html?mode=${mode}`;

const boxLeft = async (page: Page, index = 0) =>
  parseFloat(
    await page
      .locator('.auto-draggable')
      .nth(index)
      .evaluate(element => (element as HTMLElement).style.left)
  );

const dragBox = async (page: Page, deltaX: number, deltaY: number, index = 0) => {
  const box = page.locator('.auto-draggable').nth(index);
  const bounds = (await box.boundingBox())!;
  await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
  await page.mouse.down();
  await page.mouse.move(bounds.x + bounds.width / 2 + deltaX, bounds.y + bounds.height / 2 + deltaY, {
    steps: 6
  });
  await page.mouse.up();
  await expect(page.locator('.auto-draggable').nth(index)).toBeVisible();
};

test.describe('v3.2+ collision fixtures', () => {
  test('precise collision stops a drag at a rotated target in a real browser', async ({ page }) => {
    await page.goto(fixture('collision-rotated'));
    const box = page.locator('.auto-draggable').first();
    const bounds = (await box.boundingBox())!;
    const startLeft = await boxLeft(page);

    // Drag straight toward the diamond target; precise collision must stop the box
    // before its rotated contour overlaps, well short of the raw 500px drag.
    await page.mouse.move(bounds.x + 40, bounds.y + 20);
    await page.mouse.down();
    await page.mouse.move(bounds.x + 540, bounds.y + 20, { steps: 12 });
    await page.mouse.up();

    const finalLeft = await boxLeft(page);
    // Precise contact lands around 187px; the legacy aabb approximation would stop near
    // 210px, so the window below only passes for precise collision.
    expect(finalLeft).toBeGreaterThan(150);
    expect(finalLeft).toBeLessThan(200);
  });
});

test.describe('v3.3 rotation snap and fixed-anchor fixtures', () => {
  test('keyboard rotation snaps to the configured snap angles', async ({ page }) => {
    await page.goto(fixture('rotation-snap'));
    await page.locator('.auto-draggable').first().click();
    await page.locator('.rotation-handle').focus();
    const transform = () => page.locator('.auto-draggable').first().getAttribute('style');

    // Step 25 with candidates [0, 45] and threshold 10: the first press lands between
    // candidates and commits unsnapped, proving the keyboard path is wired.
    await page.keyboard.press('ArrowRight');
    await expect
      .poll(async () => (await transform())?.includes('rotate(25deg)'), { timeout: 5_000 })
      .toBe(true);

    // The second press reaches 50, which is within 5 degrees of the 45-degree candidate
    // and must snap back to 45 instead of committing 50.
    await page.keyboard.press('ArrowRight');
    await expect
      .poll(async () => (await transform())?.includes('rotate(45deg)'), { timeout: 5_000 })
      .toBe(true);
  });

  test('fixed-anchor resize keeps the opposite corner pinned', async ({ page }) => {
    await page.goto(fixture('fixed-anchor'));
    const box = page.locator('.auto-draggable').first();
    const before = await box.evaluate(element => ({
      left: (element as HTMLElement).style.left,
      top: (element as HTMLElement).style.top
    }));

    // Handles only render while the box is active; the fixture keeps it active.
    const handle = page.locator('.handle-br');
    await expect(handle).toBeVisible();
    const bounds = (await handle.boundingBox())!;
    await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
    await page.mouse.down();
    await page.mouse.move(bounds.x + bounds.width / 2 + 60, bounds.y + bounds.height / 2 + 40, {
      steps: 5
    });
    await page.mouse.up();

    expect(await box.evaluate(element => (element as HTMLElement).style.left)).toBe(before.left);
    expect(await box.evaluate(element => (element as HTMLElement).style.top)).toBe(before.top);
    expect(await box.evaluate(element => (element as HTMLElement).style.width)).toBe('180px');
  });
});

test.describe('v3.4 group collision fixtures', () => {
  test('group-collision all mode stops the whole formation at the earliest contact', async ({
    page
  }) => {
    await page.goto(fixture('group-all'));

    await dragBox(page, 400, 0);

    // The follower reaches the wall after ~80px of shared motion; the leader carries the
    // same limited delta instead of tunnelling through.
    const leaderLeft = await boxLeft(page, 0);
    const followerLeft = await boxLeft(page, 1);
    expect(leaderLeft).toBeGreaterThan(60);
    expect(leaderLeft).toBeLessThan(200);
    expect(followerLeft - leaderLeft).toBeCloseTo(160, 3);
  });
});
