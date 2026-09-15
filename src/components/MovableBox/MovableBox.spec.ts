import { nextTick, ref } from 'vue';
import { mount, type VueWrapper } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import MovableBox from './MovableBox.vue';
import { localToWorld } from './utils/fixed-anchor';
import { resolveTransformOrigin, rotatedAABBAt } from './utils/rotation';

const flushFrame = () => new Promise(resolve => setTimeout(resolve, 0));

const makeModel = (overrides: Record<string, unknown> = {}) => ({
  left: 10,
  top: 20,
  width: 120,
  height: 80,
  zIndex: 1,
  uid: 'box-1',
  ...overrides
});

const mountBox = (overrides: Record<string, unknown> = {}, slots: Record<string, string> = {}) => {
  const wrapper = mount(MovableBox, {
    props: {
      modelValue: makeModel(),
      draggable: true,
      resizable: true,
      limitAreaForParent: false,
      ...overrides
    },
    slots,
    attachTo: document.body
  });
  const parent = wrapper.element.parentElement as HTMLElement;
  Object.defineProperty(parent, 'clientWidth', { configurable: true, value: 500 });
  Object.defineProperty(parent, 'clientHeight', { configurable: true, value: 400 });
  return wrapper;
};

type TestPointerEventType =
  'pointerdown' | 'pointermove' | 'pointerup' | 'pointercancel' | 'lostpointercapture';

const pointerEvent = (
  type: TestPointerEventType,
  x: number,
  y: number,
  init: PointerEventInit = {}
) =>
  new PointerEvent(type, {
    bubbles: true,
    cancelable: true,
    clientX: x,
    clientY: y,
    pointerId: 1,
    pointerType: 'mouse',
    ...init
  });

const pointerDrag = async (
  wrapper: VueWrapper,
  from: readonly [number, number],
  to: readonly [number, number],
  selector = '.auto-draggable',
  finish = true
) => {
  await wrapper.get(selector).trigger('pointerdown', {
    clientX: from[0],
    clientY: from[1],
    pointerId: 1
  });
  document.documentElement.dispatchEvent(pointerEvent('pointermove', to[0], to[1]));
  await flushFrame();
  if (finish) {
    document.documentElement.dispatchEvent(pointerEvent('pointerup', to[0], to[1]));
  }
  await nextTick();
};

describe('MovableBox', () => {
  it('renders the model and synchronizes external replacements', async () => {
    const wrapper = mountBox();
    expect(wrapper.get('.auto-draggable').attributes('style')).toContain('left: 10px');

    await wrapper.setProps({ modelValue: makeModel({ left: 75, top: 45 }) });
    expect(wrapper.get('.auto-draggable').attributes('style')).toContain('left: 75px');
    expect(wrapper.get('.auto-draggable').attributes('style')).toContain('top: 45px');
  });

  it('emits an immutable model while retaining custom fields', async () => {
    const model = makeModel();
    const wrapper = mountBox({ modelValue: model });
    await pointerDrag(wrapper, [100, 200], [170, 260]);

    const update = wrapper.emitted('update:modelValue')?.at(-1)?.[0] as Record<string, unknown>;
    expect(model).toMatchObject({ left: 10, top: 20 });
    expect(update).not.toBe(model);
    expect(update).toMatchObject({ left: 80, top: 80, uid: 'box-1' });
    expect(wrapper.get('.auto-draggable').attributes('style')).toContain('left: 80px');
  });

  it('applies pointer direction restrictions before grid snapping', async () => {
    const wrapper = mountBox({
      dragDirections: ['left', 'right'],
      snapToGrid: true,
      gridSize: 20
    });
    await pointerDrag(wrapper, [0, 0], [15, 27]);
    const update = wrapper.emitted('update:modelValue')?.at(-1)?.[0] as Record<string, number>;
    expect(update).toMatchObject({ left: 20, top: 20 });
  });

  it.each([
    ['left', [-15, 20], { left: -5, top: 20 }],
    ['right', [15, 20], { left: 25, top: 20 }],
    ['top', [15, -20], { left: 10, top: 0 }],
    ['bottom', [15, 20], { left: 10, top: 40 }]
  ] as const)('allows only %s pointer movement', async (direction, delta, expected) => {
    const wrapper = mountBox({ dragDirections: [direction] });
    await pointerDrag(wrapper, [0, 0], delta);
    const update = wrapper.emitted('update:modelValue')?.at(-1)?.[0] as Record<string, number>;
    expect(update).toMatchObject(expected);
  });

  it('applies direction restrictions to touch and keyboard movement', async () => {
    const touchWrapper = mountBox({ dragDirections: ['left'] });
    touchWrapper
      .get('.auto-draggable')
      .element.dispatchEvent(pointerEvent('pointerdown', 10, 20, { pointerType: 'touch' }));
    document.documentElement.dispatchEvent(pointerEvent('pointermove', 40, 50));
    document.documentElement.dispatchEvent(pointerEvent('pointerup', 40, 50));
    await nextTick();
    expect(touchWrapper.emitted('update:modelValue')?.at(-1)?.[0]).toMatchObject({
      left: 10,
      top: 20
    });

    const keyboardWrapper = mountBox({
      active: true,
      keyboardEnabled: true,
      keyboardStep: 10,
      dragDirections: ['left']
    });
    await keyboardWrapper.get('.auto-draggable').trigger('keydown', { key: 'ArrowRight' });
    expect(keyboardWrapper.emitted('update:modelValue')).toBeFalsy();
    await keyboardWrapper.get('.auto-draggable').trigger('keydown', { key: 'ArrowLeft' });
    expect(keyboardWrapper.emitted('update:modelValue')?.at(-1)?.[0]).toMatchObject({ left: 0 });
  });

  it('does not snap a direction-locked axis', async () => {
    const wrapper = mountBox({
      modelValue: makeModel({ top: 23 }),
      dragDirections: ['left', 'right'],
      snapToGrid: true,
      gridSize: 20,
      snapToElements: true,
      snapThreshold: 10,
      snapTargets: [{ id: 'target', left: 300, top: 25, width: 50, height: 50 }]
    });
    await pointerDrag(wrapper, [0, 0], [15, 30]);
    const update = wrapper.emitted('update:modelValue')?.at(-1)?.[0] as Record<string, number>;
    expect(update.top).toBe(23);
  });

  it('does not let grid or element snapping reverse a one-way drag', async () => {
    const gridWrapper = mountBox({
      modelValue: makeModel({ left: 5 }),
      dragDirections: ['right'],
      snapToGrid: true,
      gridSize: 20
    });
    await pointerDrag(gridWrapper, [0, 0], [1, 0]);
    expect(gridWrapper.emitted('update:modelValue')?.at(-1)?.[0]).toMatchObject({ left: 5 });

    const elementWrapper = mountBox({
      modelValue: makeModel({ left: 10, width: 20 }),
      dragDirections: ['right'],
      snapToElements: true,
      snapThreshold: 10,
      snapTargets: [{ id: 'left-target', left: 5, top: 200, width: 20, height: 20 }]
    });
    await pointerDrag(elementWrapper, [0, 0], [1, 0]);
    expect(elementWrapper.emitted('update:modelValue')?.at(-1)?.[0]).toMatchObject({ left: 10 });
  });

  it('converts pointer deltas to percentage points for drag and resize', async () => {
    const dragging = mountBox({
      modelValue: makeModel({ left: 10, top: 20, width: 20, height: 20 }),
      unitType: '%'
    });
    await pointerDrag(dragging, [0, 0], [50, 40]);
    const dragUpdate = dragging.emitted('update:modelValue')?.at(-1)?.[0] as Record<string, number>;
    expect(dragUpdate).toMatchObject({ left: 20, top: 30 });

    const resizing = mountBox({
      modelValue: makeModel({ left: 10, top: 20, width: 20, height: 20 }),
      unitType: '%',
      handles: ['br']
    });
    await pointerDrag(resizing, [0, 0], [50, 40], '.handle-br');
    const resizeUpdate = resizing.emitted('update:modelValue')?.at(-1)?.[0] as Record<
      string,
      number
    >;
    expect(resizeUpdate).toMatchObject({ width: 30, height: 30 });
  });

  it('adds edgeDistance and boundsMargin on every side', async () => {
    const wrapper = mountBox({
      modelValue: makeModel({ left: 30, top: 30, width: 100, height: 80 }),
      limitAreaForParent: true,
      edgeDistance: 10,
      boundsMargin: { top: 5, right: 5, bottom: 5, left: 5 }
    });
    await pointerDrag(wrapper, [100, 100], [-100, -100]);
    const update = wrapper.emitted('update:modelValue')?.at(-1)?.[0] as Record<string, number>;
    expect(update).toMatchObject({ left: 15, top: 15 });
    expect(wrapper.emitted('out-of-bounds')).toBeTruthy();
  });

  it('reports out-of-bounds without clamping when parent limiting is disabled', async () => {
    const wrapper = mountBox({
      modelValue: makeModel({ left: 30, top: 30, width: 100, height: 80 }),
      limitAreaForParent: false
    });
    await pointerDrag(wrapper, [100, 100], [-100, -100]);
    const update = wrapper.emitted('update:modelValue')?.at(-1)?.[0] as Record<string, number>;
    expect(update).toMatchObject({ left: -170, top: -170 });
    expect(wrapper.emitted('out-of-bounds')?.map(args => args[0])).toEqual(['left', 'top']);
  });

  it('reports the resized edge outside an unclamped parent area', async () => {
    const wrapper = mountBox({
      modelValue: makeModel({ left: 100, top: 50, width: 100, height: 80 }),
      limitAreaForParent: false,
      handles: ['mr']
    });
    await pointerDrag(wrapper, [0, 0], [400, 0], '.handle-mr');
    const update = wrapper.emitted('update:modelValue')?.at(-1)?.[0] as Record<string, number>;
    expect(update.width).toBe(500);
    expect(wrapper.emitted('out-of-bounds')?.map(args => args[0])).toEqual(['right']);
  });

  it('snaps to the nearest element, renders guides, and clears them on stop', async () => {
    const wrapper = mountBox({
      modelValue: makeModel({ left: 10, top: 20, width: 100, height: 80 }),
      snapToElements: true,
      snapThreshold: 5,
      snapTargets: [{ id: 'target', left: 115, top: 20, width: 100, height: 80 }]
    });
    await pointerDrag(wrapper, [0, 0], [2, 0], '.auto-draggable', false);

    expect(wrapper.get('.auto-draggable').attributes('style')).toContain('left: 15px');
    expect(wrapper.find('.movable-box-guide--vertical').exists()).toBe(true);
    expect(wrapper.emitted('snap')?.at(-1)?.[0]).toMatchObject({
      snapped: true,
      targetId: 'target'
    });

    document.documentElement.dispatchEvent(pointerEvent('pointerup', 0, 0));
    await nextTick();
    expect(wrapper.find('.movable-box-guide').exists()).toBe(false);
    expect(wrapper.emitted('snap')?.at(-1)?.[0]).toEqual({ snapped: false });
  });

  it('equalizes spacing between two targets and reports the spacing payload', async () => {
    const wrapper = mountBox({
      modelValue: makeModel({ left: 122, top: 500, width: 50, height: 50 }),
      snapToElements: true,
      snapThreshold: 6,
      snapTargets: [
        { id: 'left-anchor', left: 0, top: 400, width: 50, height: 50 },
        { id: 'right-anchor', left: 250, top: 400, width: 50, height: 50 }
      ]
    });
    await pointerDrag(wrapper, [0, 0], [1, 0], '.auto-draggable', false);

    expect(wrapper.get('.auto-draggable').attributes('style')).toContain('left: 125px');
    expect(wrapper.emitted('snap')?.at(-1)?.[0]).toMatchObject({
      snapped: true,
      spacing: [
        {
          axis: 'horizontal',
          gap: 75,
          targetIds: ['left-anchor', 'right-anchor'],
          guides: [50, 250]
        }
      ]
    });
    expect(wrapper.findAll('.movable-box-guide--vertical')).toHaveLength(2);

    document.documentElement.dispatchEvent(pointerEvent('pointerup', 0, 0));
    await nextTick();
    expect(wrapper.emitted('snap')?.at(-1)?.[0]).toEqual({ snapped: false });
  });

  it('honors snapFilter by dropping excluded targets on the filtered axis', async () => {
    const wrapper = mountBox({
      modelValue: makeModel({ left: 8, top: 500, width: 20, height: 20 }),
      snapToElements: true,
      snapThreshold: 5,
      snapTargets: [
        { id: 'kept', left: 5, top: 300, width: 20, height: 20 },
        { id: 'excluded', left: 10, top: 300, width: 20, height: 20 }
      ],
      snapFilter: (target: { id?: string }) => target.id !== 'excluded'
    });
    await pointerDrag(wrapper, [0, 0], [1, 0], '.auto-draggable', false);

    expect(wrapper.get('.auto-draggable').attributes('style')).toContain('left: 5px');
    expect(wrapper.emitted('snap')?.at(-1)?.[0]).toMatchObject({ targetId: 'kept' });
    document.documentElement.dispatchEvent(pointerEvent('pointerup', 0, 0));
  });

  it('applies the rotation and transform origin as CSS', async () => {
    const wrapper = mountBox({ rotate: 45, transformOrigin: 'top left' });
    const style = wrapper.get('.auto-draggable').attributes('style');
    expect(style).toContain('rotate(45deg)');
    expect(style).toContain('transform-origin: top left');

    await wrapper.setProps({ rotate: 'bad' });
    expect(wrapper.get('.auto-draggable').attributes('style')).not.toContain('rotate');
  });

  it('uses the same fallback transform origin for CSS and geometry', async () => {
    const wrapper = mountBox({ rotate: 45, transformOrigin: 'calc(10px + 5%)' });

    expect(wrapper.get('.auto-draggable').attributes('style')).toContain(
      'transform-origin: center'
    );
  });

  it('falls back to center for invalid transform-origin token pairs', () => {
    const wrapper = mountBox({ rotate: 45, transformOrigin: 'left right' });

    expect(wrapper.get('.auto-draggable').attributes('style')).toContain(
      'transform-origin: center'
    );
  });

  it('falls back to center instead of truncating extra transform-origin tokens', () => {
    const wrapper = mountBox({ rotate: 45, transformOrigin: 'left top 5px' });

    expect(wrapper.get('.auto-draggable').attributes('style')).toContain(
      'transform-origin: center'
    );
  });

  it('converts px transform origins before probing percentage geometry', async () => {
    const wrapper = mountBox({
      modelValue: makeModel({ left: 90, top: 0, width: 20, height: 20 }),
      unitType: '%',
      rotate: 90,
      transformOrigin: '10px 20px',
      limitAreaForParent: true
    });
    await pointerDrag(wrapper, [0, 0], [1000, 0]);

    const update = wrapper.emitted('update:modelValue')?.at(-1)?.[0] as Record<string, number>;
    expect(update.left).toBe(94);
    expect(wrapper.get('.auto-draggable').attributes('style')).toContain(
      'transform-origin: 10px 20px'
    );
  });

  it('clamps rotated boxes by their axis-aligned bounding box', async () => {
    // 100x80 box rotated 90 degrees has a 80x100 AABB; with limitAreaForParent the
    // parent is 500x400, so the AABB right edge (left + 10 + 80) stops at 500.
    const wrapper = mountBox({
      modelValue: makeModel({ left: 480, top: 20, width: 100, height: 80 }),
      rotate: 90,
      limitAreaForParent: true
    });
    await pointerDrag(wrapper, [0, 0], [200, 0]);

    // Dragging right by 200 would put the unrotated left at 680; the AABB left clamps
    // to maxLeft = 500 - 80 = 420, which shifts the local rect back to 410.
    expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toMatchObject({ left: 410 });
  });

  it('maps pointer resize deltas into the rotated local space', async () => {
    const wrapper = mountBox({
      modelValue: makeModel({ left: 100, top: 100, width: 120, height: 80 }),
      rotate: 90,
      limitAreaForParent: false
    });
    const handle = wrapper.get('.handle-br');
    await handle.trigger('pointerdown', { clientX: 0, clientY: 0, pointerId: 1 });
    document.documentElement.dispatchEvent(pointerEvent('pointermove', 20, 0));
    await flushFrame();
    document.documentElement.dispatchEvent(pointerEvent('pointerup', 20, 0));
    await nextTick();

    // Screen +20px right maps to local -20px on y for a 90-degree rotation, so the
    // br handle shrinks height; width stays untouched.
    const update = wrapper.emitted('update:modelValue')?.at(-1)?.[0] as Record<string, number>;
    expect(update).toMatchObject({ width: 120, height: 60 });
  });

  it('clamps the rotated AABB when resizing pushes it out of the area', async () => {
    // 200x100 box rotated 90 degrees: growing local width to 400 grows the visual AABB
    // to 400 tall, which must stop at the area's top edge instead of overflowing.
    const wrapper = mountBox({
      modelValue: makeModel({ left: 0, top: 0, width: 200, height: 100 }),
      rotate: 90,
      limitAreaForParent: true
    });
    const handle = wrapper.get('.handle-mr');
    await handle.trigger('pointerdown', { clientX: 0, clientY: 0, pointerId: 1 });
    // Screen +200px down maps to local +200px on x for a 90-degree rotation.
    document.documentElement.dispatchEvent(pointerEvent('pointermove', 0, 200));
    await flushFrame();
    document.documentElement.dispatchEvent(pointerEvent('pointerup', 0, 200));
    await nextTick();

    const update = wrapper.emitted('update:modelValue')?.at(-1)?.[0] as Record<string, number>;
    // Width grew to 400; the AABB (100 wide, 400 tall at left 50) clamps to top 0,
    // shifting the local rect from 0 to 150.
    expect(update).toMatchObject({ width: 400, top: 150, height: 100 });
  });

  it('does not cap rotated resize by the unrotated right edge', async () => {
    const wrapper = mountBox({
      modelValue: makeModel({ left: 300, top: 150, width: 100, height: 100 }),
      rotate: 90,
      limitAreaForParent: true
    });
    const handle = wrapper.get('.handle-mr');
    await handle.trigger('pointerdown', { clientX: 0, clientY: 0, pointerId: 1 });
    document.documentElement.dispatchEvent(pointerEvent('pointermove', 0, 200));
    await flushFrame();
    document.documentElement.dispatchEvent(pointerEvent('pointerup', 0, 200));
    await nextTick();

    const update = wrapper.emitted('update:modelValue')?.at(-1)?.[0] as Record<string, number>;
    expect(update).toMatchObject({ left: 300, top: 150, width: 300, height: 100 });
  });

  it('scales the rotated rectangle down when its AABB exceeds the area itself', async () => {
    // Dragging 300px would grow local width to 500; the 500-tall AABB cannot fit the
    // 400px-tall area, so the size converges to the maximum that fits (400x100).
    const wrapper = mountBox({
      modelValue: makeModel({ left: 0, top: 0, width: 200, height: 100 }),
      rotate: 90,
      limitAreaForParent: true
    });
    const handle = wrapper.get('.handle-mr');
    await handle.trigger('pointerdown', { clientX: 0, clientY: 0, pointerId: 1 });
    document.documentElement.dispatchEvent(pointerEvent('pointermove', 0, 300));
    await flushFrame();
    document.documentElement.dispatchEvent(pointerEvent('pointerup', 0, 300));
    await nextTick();

    const update = wrapper.emitted('update:modelValue')?.at(-1)?.[0] as Record<string, number>;
    expect(update).toMatchObject({ width: 400, height: 100, top: 150 });
  });

  it('clamps rotated keyboard resize against the area through the AABB', async () => {
    const wrapper = mountBox({
      modelValue: makeModel({ left: 0, top: 0, width: 200, height: 100 }),
      rotate: 90,
      limitAreaForParent: true,
      active: true,
      keyboardEnabled: true,
      keyboardStep: 100,
      resizeDirections: ['mr']
    });
    // At 90 degrees screen-down maps to local +width, so each Shift+ArrowDown adds 100
    // to the local width via the mr handle; four presses request 600 wide, which must
    // converge to the 400 that fits the 400px area.
    for (let index = 0; index < 4; index += 1) {
      await wrapper.get('.auto-draggable').trigger('keydown', {
        key: 'ArrowDown',
        shiftKey: true
      });
    }

    const update = wrapper.emitted('update:modelValue')?.at(-1)?.[0] as Record<string, number>;
    expect(update).toMatchObject({ width: 400, height: 100, top: 150 });
  });

  it('shrinks only the dragged axis at intermediate angles and respects minHeight', async () => {
    // 300x300 box rotated 60 degrees, growing width via the mr handle. Solving both
    // AABB spans for the dragged axis caps width at ~288; height must stay untouched.
    const wrapper = mountBox({
      modelValue: makeModel({ left: 0, top: 0, width: 300, height: 300 }),
      rotate: 60,
      limitAreaForParent: true,
      minHeight: 250
    });
    const handle = wrapper.get('.handle-mr');
    await handle.trigger('pointerdown', { clientX: 0, clientY: 0, pointerId: 1 });
    document.documentElement.dispatchEvent(pointerEvent('pointermove', 0, 200));
    await flushFrame();
    document.documentElement.dispatchEvent(pointerEvent('pointerup', 0, 200));
    await nextTick();

    const update = wrapper.emitted('update:modelValue')?.at(-1)?.[0] as Record<string, number>;
    expect(update).toMatchObject({ width: 288, height: 300 });
  });

  it('keeps the opposite edge fixed when fitting a rotated left-edge resize', async () => {
    const wrapper = mountBox({
      modelValue: makeModel({ left: 100, top: 50, width: 300, height: 300 }),
      rotate: 60,
      limitAreaForParent: true
    });
    const handle = wrapper.get('.handle-ml');
    await handle.trigger('pointerdown', { clientX: 0, clientY: 0, pointerId: 1 });
    document.documentElement.dispatchEvent(pointerEvent('pointermove', -200, 0));
    await flushFrame();
    document.documentElement.dispatchEvent(pointerEvent('pointerup', -200, 0));
    await nextTick();

    const update = wrapper.emitted('update:modelValue')?.at(-1)?.[0] as Record<string, number>;
    expect(update).toMatchObject({ left: 112, width: 288, height: 300 });
    expect(update.left + update.width).toBe(400);
  });

  it('shrinks at the anchor instead of moving the fixed edge during AABB clamping', async () => {
    const wrapper = mountBox({
      modelValue: makeModel({ left: 200, top: 150, width: 100, height: 100 }),
      rotate: 45,
      limitAreaForParent: true
    });
    const handle = wrapper.get('.handle-ml');
    await handle.trigger('pointerdown', { clientX: 0, clientY: 0, pointerId: 1 });
    document.documentElement.dispatchEvent(pointerEvent('pointermove', -354, -354));
    await flushFrame();
    document.documentElement.dispatchEvent(pointerEvent('pointerup', -354, -354));
    await nextTick();

    const update = wrapper.emitted('update:modelValue')?.at(-1)?.[0] as Record<string, number>;
    const probe = rotatedAABBAt(
      update as { left: number; top: number; width: number; height: number },
      45,
      resolveTransformOrigin('center', update.width, update.height)
    );
    expect(update.left + update.width).toBe(300);
    expect(probe.left).toBeGreaterThanOrEqual(0);
  });

  it('keeps the opposite edge fixed when fitting a rotated top-edge resize', async () => {
    const wrapper = mountBox({
      modelValue: makeModel({ left: 100, top: 40, width: 300, height: 300 }),
      rotate: 60,
      limitAreaForParent: true
    });
    const handle = wrapper.get('.handle-tm');
    await handle.trigger('pointerdown', { clientX: 0, clientY: 0, pointerId: 1 });
    document.documentElement.dispatchEvent(pointerEvent('pointermove', 0, -200));
    await flushFrame();
    document.documentElement.dispatchEvent(pointerEvent('pointerup', 0, -200));
    await nextTick();

    const update = wrapper.emitted('update:modelValue')?.at(-1)?.[0] as Record<string, number>;
    expect(update).toMatchObject({ top: 60, width: 300, height: 280 });
    expect(update.top + update.height).toBe(340);
  });

  it('keeps both opposite edges fixed when fitting a rotated top-left resize', async () => {
    const wrapper = mountBox({
      modelValue: makeModel({ left: 100, top: 46, width: 300, height: 300 }),
      rotate: 60,
      limitAreaForParent: true
    });
    const handle = wrapper.get('.handle-tl');
    await handle.trigger('pointerdown', { clientX: 0, clientY: 0, pointerId: 1 });
    document.documentElement.dispatchEvent(pointerEvent('pointermove', 73, -273));
    await flushFrame();
    document.documentElement.dispatchEvent(pointerEvent('pointerup', 73, -273));
    await nextTick();

    const update = wrapper.emitted('update:modelValue')?.at(-1)?.[0] as Record<string, number>;
    expect(update.left + update.width).toBe(400);
    expect(update.top + update.height).toBe(346);
  });

  it('never collapses a corner-handle resize that exceeds the area', async () => {
    // Corner handles shrink along the drag ray (one uniform factor) instead of two
    // independent projections, so an over-bounds 60-degree drag converges to a
    // non-degenerate size rather than collapsing an axis to zero.
    const wrapper = mountBox({
      modelValue: makeModel({ left: 0, top: 0, width: 300, height: 300 }),
      rotate: 60,
      limitAreaForParent: true
    });
    const handle = wrapper.get('.handle-br');
    await handle.trigger('pointerdown', { clientX: 0, clientY: 0, pointerId: 1 });
    document.documentElement.dispatchEvent(pointerEvent('pointermove', 0, 200));
    await flushFrame();
    document.documentElement.dispatchEvent(pointerEvent('pointerup', 0, 200));
    await nextTick();

    const update = wrapper.emitted('update:modelValue')?.at(-1)?.[0] as Record<string, number>;
    expect(update).toMatchObject({ width: 310, height: 262 });
    expect(update.width).toBeGreaterThan(0);
    expect(update.height).toBeGreaterThan(0);
  });

  it('keeps the locked ratio when a rotated resize exceeds the area', async () => {
    const wrapper = mountBox({
      modelValue: makeModel({ left: 0, top: 0, width: 200, height: 100 }),
      rotate: 60,
      limitAreaForParent: true,
      ratioLock: true
    });
    const handle = wrapper.get('.handle-br');
    await handle.trigger('pointerdown', { clientX: 0, clientY: 0, pointerId: 1 });
    document.documentElement.dispatchEvent(pointerEvent('pointermove', 0, 400));
    await flushFrame();
    document.documentElement.dispatchEvent(pointerEvent('pointerup', 0, 400));
    await nextTick();

    const update = wrapper.emitted('update:modelValue')?.at(-1)?.[0] as Record<string, number>;
    expect(update).toMatchObject({ width: 358, height: 179 });
    expect(update.width / update.height).toBeCloseTo(2, 1);
  });

  it('honors transformOrigin in the rotated geometry', async () => {
    // 120x80 box at (100, 100) rotated 90deg around its top-left corner: the visual
    // AABB is (20, 100, 80, 120). With the area 500x400, dragging right must stop the
    // visual AABB right edge (left + 80) at 500, i.e. visual left 420, local left 500.
    const wrapper = mountBox({
      modelValue: makeModel({ left: 100, top: 100, width: 120, height: 80 }),
      rotate: 90,
      transformOrigin: 'top left',
      limitAreaForParent: true
    });
    await pointerDrag(wrapper, [0, 0], [600, 0]);

    const update = wrapper.emitted('update:modelValue')?.at(-1)?.[0] as Record<string, number>;
    expect(update).toMatchObject({ left: 500 });
  });

  it('snaps the rotated bounding box and shifts the local rect accordingly', async () => {
    const wrapper = mountBox({
      modelValue: makeModel({ left: 20, top: 500, width: 100, height: 50 }),
      rotate: 90,
      snapToElements: true,
      snapThreshold: 20,
      limitAreaForParent: false,
      snapTargets: [{ id: 'edge', left: 60, top: 100, width: 50, height: 50 }]
    });
    await pointerDrag(wrapper, [0, 0], [1, 0], '.auto-draggable', false);

    // AABB of the rotated box is 50 wide starting at left 45; snapping its left edge
    // to the target's left (60) shifts the local rect by +15 to 35.
    expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toMatchObject({ left: 35 });
    expect(wrapper.emitted('snap')?.at(-1)?.[0]).toMatchObject({
      snapped: true,
      targetId: 'edge'
    });
    expect(wrapper.emitted('guides')?.at(-1)?.[0]).toMatchObject({ vertical: [60] });
    document.documentElement.dispatchEvent(pointerEvent('pointerup', 0, 0));
  });

  it('keeps a rotated resize outside collision targets', async () => {
    const wrapper = mountBox({
      modelValue: makeModel({ left: 0, top: 0, width: 100, height: 100 }),
      rotate: 45,
      collisionEnabled: true,
      snapTargets: [{ id: 'wall', left: 160, top: -200, width: 100, height: 500 }]
    });
    const handle = wrapper.get('.handle-mr');
    await handle.trigger('pointerdown', { clientX: 0, clientY: 0, pointerId: 1 });
    document.documentElement.dispatchEvent(pointerEvent('pointermove', 100, 100));
    await flushFrame();
    document.documentElement.dispatchEvent(pointerEvent('pointerup', 100, 100));
    await nextTick();

    const update = wrapper.emitted('update:modelValue')?.at(-1)?.[0] as Record<string, number>;
    const origin = resolveTransformOrigin('center', update.width, update.height);
    const probe = rotatedAABBAt(
      {
        left: update.left,
        top: update.top,
        width: update.width,
        height: update.height
      },
      45,
      origin
    );
    expect(probe.left + probe.width).toBeLessThanOrEqual(161);
    expect(wrapper.emitted('collision')).toContainEqual([
      expect.objectContaining({ colliding: true, targetId: 'wall' })
    ]);
  });

  it('emits snap again when the snapped coordinate changes', async () => {
    const wrapper = mountBox({
      modelValue: makeModel({ left: 8, top: 100, width: 20, height: 20 }),
      snapToElements: true,
      snapThreshold: 5,
      snapTargets: [{ id: 'target', left: 10, top: 300, width: 20, height: 20 }]
    });
    await wrapper.get('.auto-draggable').trigger('pointerdown', { clientX: 0, clientY: 0 });
    document.documentElement.dispatchEvent(pointerEvent('pointermove', 1, 0));
    await flushFrame();
    expect(wrapper.emitted('snap')).toHaveLength(1);

    await wrapper.setProps({
      snapTargets: [{ id: 'target', left: 12, top: 300, width: 20, height: 20 }]
    });
    document.documentElement.dispatchEvent(pointerEvent('pointermove', 1, 0));
    await flushFrame();

    expect(wrapper.get('.auto-draggable').attributes('style')).toContain('left: 12px');
    expect(wrapper.emitted('snap')).toHaveLength(2);
    document.documentElement.dispatchEvent(pointerEvent('pointerup', 0, 0));
  });

  it('emits snap and guides again when a secondary snap target changes', async () => {
    const horizontalTarget = { id: 'horizontal', left: 115, top: 500, width: 100, height: 80 };
    const verticalTarget = { id: 'vertical-1', left: 500, top: 105, width: 100, height: 80 };
    const wrapper = mountBox({
      modelValue: makeModel({ width: 100, height: 80 }),
      snapToElements: true,
      snapThreshold: 5,
      snapTargets: [horizontalTarget, verticalTarget]
    });
    await pointerDrag(wrapper, [0, 0], [2, 2], '.auto-draggable', false);
    const snapCount = wrapper.emitted('snap')?.length ?? 0;
    const guideCount = wrapper.emitted('guides')?.length ?? 0;

    await wrapper.setProps({
      snapTargets: [horizontalTarget, { ...verticalTarget, id: 'vertical-2' }]
    });
    document.documentElement.dispatchEvent(pointerEvent('pointermove', 2, 2));
    await flushFrame();

    expect(wrapper.emitted('snap')).toHaveLength(snapCount + 1);
    expect(wrapper.emitted('snap')?.at(-1)?.[0]).toMatchObject({
      targetIds: { horizontal: 'horizontal', vertical: 'vertical-2' }
    });
    expect(wrapper.emitted('guides')).toHaveLength(guideCount + 1);
    document.documentElement.dispatchEvent(pointerEvent('pointerup', 0, 0));
  });

  it('clamps drag to the target edge without leaving a small gap', async () => {
    const wrapper = mountBox({
      modelValue: makeModel({ left: 8, top: 0, width: 50, height: 50 }),
      collisionEnabled: true,
      snapTargets: [{ id: 'target', left: 60, top: 0, width: 50, height: 50 }]
    });
    await wrapper.get('.auto-draggable').trigger('pointerdown', { clientX: 0, clientY: 0 });
    document.documentElement.dispatchEvent(pointerEvent('pointermove', 4, 0));
    await flushFrame();
    document.documentElement.dispatchEvent(pointerEvent('pointermove', 6, 0));
    await flushFrame();

    expect(wrapper.get('.auto-draggable').attributes('style')).toContain('left: 10px');
    expect(wrapper.emitted('collision')).toHaveLength(1);
    expect(wrapper.emitted('collision')?.[0]?.[0]).toMatchObject({
      colliding: true,
      targetId: 'target'
    });
    document.documentElement.dispatchEvent(pointerEvent('pointerup', 0, 0));
    expect(wrapper.emitted('collision')).toHaveLength(2);
    expect(wrapper.emitted('collision')?.[1]?.[0]).toEqual({ colliding: false });
  });

  it('prevents a fast drag from tunneling through a collision target', async () => {
    const wrapper = mountBox({
      modelValue: makeModel({ left: 0, top: 0, width: 50, height: 50 }),
      collisionEnabled: true,
      snapTargets: [{ id: 'target', left: 60, top: 0, width: 50, height: 50 }]
    });
    await pointerDrag(wrapper, [0, 0], [120, 0]);

    const update = wrapper.emitted('update:modelValue')?.at(-1)?.[0] as Record<string, number>;
    expect(update.left).toBe(10);
    expect(wrapper.emitted('collision')?.[0]?.[0]).toMatchObject({
      colliding: true,
      direction: 'left',
      targetId: 'target'
    });
  });

  it('prevents a diagonal drag from tunneling through a collision target', async () => {
    const wrapper = mountBox({
      modelValue: makeModel({ left: 0, top: 0, width: 20, height: 20 }),
      collisionEnabled: true,
      snapTargets: [{ id: 'target', left: 50, top: 50, width: 20, height: 20 }]
    });
    await pointerDrag(wrapper, [0, 0], [100, 100]);

    const update = wrapper.emitted('update:modelValue')?.at(-1)?.[0] as Record<string, number>;
    // Precise collision slides the box flush around the target's corner along the
    // contact tangent, so the drag completes without ever penetrating the obstacle.
    expect(update).toMatchObject({ left: 100, top: 100 });
    expect(wrapper.emitted('collision')?.[0]?.[0]).toMatchObject({
      colliding: true,
      targetId: 'target'
    });
  });

  it('stops a diagonal drag at the corner in legacy aabb collision mode', async () => {
    const wrapper = mountBox({
      modelValue: makeModel({ left: 0, top: 0, width: 20, height: 20 }),
      collisionEnabled: true,
      collisionMode: 'aabb',
      snapTargets: [{ id: 'target', left: 50, top: 50, width: 20, height: 20 }]
    });
    await pointerDrag(wrapper, [0, 0], [100, 100]);

    const update = wrapper.emitted('update:modelValue')?.at(-1)?.[0] as Record<string, number>;
    expect(update).toMatchObject({ left: 30, top: 30 });
    expect(wrapper.emitted('collision')?.[0]?.[0]).toMatchObject({
      colliding: true,
      targetId: 'target'
    });
  });

  it('slides vertically along a side collision despite horizontal pointer jitter', async () => {
    const wrapper = mountBox({
      modelValue: makeModel({ left: 10, top: 0, width: 50, height: 50 }),
      collisionEnabled: true,
      snapTargets: [{ id: 'target', left: 60, top: 0, width: 50, height: 100 }]
    });
    await pointerDrag(wrapper, [0, 0], [2, 30]);

    const update = wrapper.emitted('update:modelValue')?.at(-1)?.[0] as Record<string, number>;
    expect(update).toMatchObject({ left: 10, top: 30 });
    expect(wrapper.emitted('collision')?.[0]?.[0]).toMatchObject({
      colliding: true,
      targetId: 'target'
    });
  });

  it('slides horizontally along a vertical collision despite vertical pointer jitter', async () => {
    const wrapper = mountBox({
      modelValue: makeModel({ left: 0, top: 10, width: 50, height: 50 }),
      collisionEnabled: true,
      snapTargets: [{ id: 'target', left: 0, top: 60, width: 100, height: 50 }]
    });
    await pointerDrag(wrapper, [0, 0], [30, 2]);

    const update = wrapper.emitted('update:modelValue')?.at(-1)?.[0] as Record<string, number>;
    expect(update).toMatchObject({ left: 30, top: 10 });
  });

  it('preserves a vertical snap when collision only adjusts the horizontal axis', async () => {
    const wrapper = mountBox({
      modelValue: makeModel({ left: 10, top: 18, width: 50, height: 20 }),
      isKeepDecimals: true,
      snapToElements: true,
      snapThreshold: 1,
      collisionEnabled: true,
      snapTargets: [
        { id: 'blocker', left: 60, top: 0, width: 50, height: 100 },
        { id: 'guide', left: 300, top: 20, width: 50, height: 20 }
      ]
    });
    await pointerDrag(wrapper, [0, 0], [2, 1], '.auto-draggable', false);

    const update = wrapper.emitted('update:modelValue')?.at(-1)?.[0] as Record<string, number>;
    expect(update).toMatchObject({ left: 10, top: 20 });
    expect(wrapper.find('.movable-box-guide--horizontal').exists()).toBe(true);
    expect(wrapper.emitted('snap')?.at(-1)?.[0]).toMatchObject({
      snapped: true,
      point: 'top',
      targetId: 'guide'
    });
    document.documentElement.dispatchEvent(pointerEvent('pointerup', 0, 0));
  });

  it('allows overlap when configured while still reporting collision', async () => {
    const wrapper = mountBox({
      modelValue: makeModel({ left: 0, top: 0, width: 50, height: 50 }),
      collisionEnabled: true,
      allowOverlap: true,
      snapTargets: [{ id: 'target', left: 60, top: 0, width: 50, height: 50 }]
    });
    await pointerDrag(wrapper, [0, 0], [20, 0]);
    expect(wrapper.get('.auto-draggable').attributes('style')).toContain('left: 20px');
    expect(wrapper.emitted('collision')?.[0]?.[0]).toMatchObject({ colliding: true });
  });

  it('allows an initially overlapping box to move toward a valid position', async () => {
    const wrapper = mountBox({
      modelValue: makeModel({ left: 0, top: 0, width: 80, height: 50 }),
      collisionEnabled: true,
      snapTargets: [{ id: 'target', left: 60, top: 0, width: 50, height: 50 }]
    });
    await pointerDrag(wrapper, [0, 0], [-10, 0]);
    expect(wrapper.get('.auto-draggable').attributes('style')).toContain('left: -10px');
  });

  it('clamps resize to the target edge', async () => {
    const wrapper = mountBox({
      modelValue: makeModel({ left: 0, top: 0, width: 50, height: 50 }),
      handles: ['br'],
      collisionEnabled: true,
      snapTargets: [{ id: 'target', left: 60, top: 0, width: 50, height: 50 }]
    });
    await pointerDrag(wrapper, [50, 50], [80, 50], '.handle-br');
    expect(wrapper.get('.auto-draggable').attributes('style')).toContain('width: 60px');
    expect(wrapper.emitted('collision')?.[0]?.[0]).toMatchObject({ colliding: true });
  });

  it('keeps the opposite edge anchored when resize reaches the parent boundary', async () => {
    const wrapper = mountBox({
      modelValue: makeModel({ left: 100, top: 50, width: 100, height: 80 }),
      limitAreaForParent: true,
      handles: ['mr']
    });
    await pointerDrag(wrapper, [0, 0], [1000, 0], '.handle-mr');
    const update = wrapper.emitted('update:modelValue')?.at(-1)?.[0] as Record<string, number>;
    expect(update).toMatchObject({ left: 100, width: 400 });
  });

  it.each([
    ['tl', -10, -10],
    ['tm', 0, -10],
    ['tr', 10, -10],
    ['mr', 10, 0],
    ['br', 10, 10],
    ['bm', 0, 10],
    ['bl', -10, 10],
    ['ml', -10, 0]
  ] as const)('resizes through the %s handle', async (handle, deltaX, deltaY) => {
    const wrapper = mountBox({ handles: [handle], resizeDirections: [handle] });
    await pointerDrag(wrapper, [0, 0], [deltaX, deltaY], `.handle-${handle}`);
    const update = wrapper.emitted('update:modelValue')?.at(-1)?.[0] as Record<string, number>;
    expect(update).toBeTruthy();
    expect(
      update.left !== 10 || update.top !== 20 || update.width !== 120 || update.height !== 80
    ).toBe(true);
  });

  it('enforces resize handles, min/max size, and ratio lock', async () => {
    const wrapper = mountBox({
      modelValue: makeModel({ left: 0, top: 0, width: 100, height: 50 }),
      handles: ['br'],
      resizeDirections: ['br'],
      minWidth: 80,
      minHeight: 40,
      maxWidth: 140,
      maxHeight: 70,
      ratioLock: true
    });
    expect(wrapper.findAll('.handle')).toHaveLength(1);
    await pointerDrag(wrapper, [100, 50], [200, 100], '.handle-br');
    const update = wrapper.emitted('update:modelValue')?.at(-1)?.[0] as Record<string, number>;
    expect(update.width).toBe(140);
    expect(update.height).toBe(70);

    await pointerDrag(wrapper, [0, 0], [-200, -200], '.handle-br');
    const minimum = wrapper.emitted('update:modelValue')?.at(-1)?.[0] as Record<string, number>;
    expect(minimum.width).toBe(80);
    expect(minimum.height).toBe(40);
  });

  it('hides and blocks handles excluded by resizeDirections', async () => {
    const wrapper = mountBox({ handles: ['br'], resizeDirections: [] });
    expect(wrapper.get('.handle-br').isVisible()).toBe(false);
    await wrapper.get('.handle-br').trigger('pointerdown', { clientX: 0, clientY: 0 });
    expect(wrapper.emitted('resize-start')).toBeFalsy();
  });

  it('keeps ratio-locked resizing finite when the initial height is zero', async () => {
    const wrapper = mountBox({
      modelValue: makeModel({ left: 0, top: 0, width: 100, height: 0 }),
      handles: ['br'],
      resizeDirections: ['br'],
      ratioLock: true
    });
    await pointerDrag(wrapper, [0, 0], [10, 10], '.handle-br');

    const update = wrapper.emitted('update:modelValue')?.at(-1)?.[0] as Record<string, number>;
    expect(Number.isFinite(update.width)).toBe(true);
    expect(Number.isFinite(update.height)).toBe(true);
    expect(update).toMatchObject({ width: 110, height: 110 });
  });

  it('keeps the deprecated resizeable alias functional', async () => {
    const wrapper = mountBox({ resizable: undefined, resizeable: false });
    await wrapper.get('.auto-draggable').trigger('pointerdown', { clientX: 0, clientY: 0 });
    expect(wrapper.find('.handle').isVisible()).toBe(false);
  });

  it('supports keyboard movement, grid snapping, and Escape deactivation', async () => {
    const wrapper = mountBox({
      active: true,
      keyboardEnabled: true,
      keyboardStep: 7,
      snapToGrid: true,
      gridSize: 10
    });
    await wrapper.get('.auto-draggable').trigger('keydown', { key: 'ArrowRight' });
    expect(wrapper.get('.auto-draggable').attributes('style')).toContain('left: 20px');

    await wrapper.get('.rotation-handle').trigger('keydown', { key: 'Escape' });
    expect(wrapper.emitted('inactive')).toBeTruthy();
  });

  it('does not move a readonly box with the keyboard', async () => {
    const wrapper = mountBox({ active: true, initRect: true, keyboardEnabled: true });

    await wrapper.get('.auto-draggable').trigger('keydown', { key: 'ArrowRight' });

    expect(wrapper.emitted('update:modelValue')).toBeFalsy();
    expect(wrapper.emitted('move')).toBeFalsy();
  });

  it('prevents a large keyboard step from tunneling through a collision target', async () => {
    const wrapper = mountBox({
      modelValue: makeModel({ left: 0, top: 0, width: 50, height: 50 }),
      active: true,
      keyboardEnabled: true,
      keyboardStep: 120,
      collisionEnabled: true,
      snapTargets: [{ id: 'target', left: 60, top: 0, width: 50, height: 50 }]
    });
    await wrapper.get('.auto-draggable').trigger('keydown', { key: 'ArrowRight' });

    expect(wrapper.get('.auto-draggable').attributes('style')).toContain('left: 10px');
    expect(wrapper.emitted('collision')?.[0]?.[0]).toMatchObject({ colliding: true });
  });

  it('resizes with Shift and arrow keys while respecting size bounds', async () => {
    const wrapper = mountBox({
      active: true,
      keyboardEnabled: true,
      keyboardStep: 50,
      handles: ['br'],
      resizeDirections: ['br'],
      maxWidth: 130
    });
    await wrapper.get('.auto-draggable').trigger('keydown', { key: 'ArrowRight', shiftKey: true });
    expect(wrapper.get('.auto-draggable').attributes('style')).toContain('width: 130px');
    expect(wrapper.emitted('resize')).toBeTruthy();

    await wrapper.get('.auto-draggable').trigger('keydown', { key: 'ArrowLeft', shiftKey: true });
    expect(wrapper.get('.auto-draggable').attributes('style')).toContain('width: 80px');

    const withoutKeyboard = mountBox({ handles: ['br'] });
    await withoutKeyboard
      .get('.auto-draggable')
      .trigger('keydown', { key: 'ArrowRight', shiftKey: true });
    expect(withoutKeyboard.emitted('resize')).toBeFalsy();
  });

  it('resizes along a focused handle axis and inverts with Shift', async () => {
    const wrapper = mountBox({
      active: true,
      keyboardEnabled: true,
      keyboardStep: 10,
      handles: ['mr'],
      resizeDirections: ['mr']
    });
    const handle = wrapper.get('.handle-mr');
    await handle.trigger('focus');

    await handle.trigger('keydown', { key: 'ArrowRight' });
    expect(wrapper.get('.auto-draggable').attributes('style')).toContain('width: 130px');

    await handle.trigger('keydown', { key: 'ArrowDown' });
    expect(wrapper.get('.auto-draggable').attributes('style')).toContain('height: 80px');

    await handle.trigger('keydown', { key: 'ArrowLeft', shiftKey: true });
    expect(wrapper.get('.auto-draggable').attributes('style')).toContain('width: 140px');
  });

  it('moves instead of resizing after the focused handle loses focus', async () => {
    const wrapper = mountBox({
      active: true,
      keyboardEnabled: true,
      keyboardStep: 10,
      handles: ['mr'],
      resizeDirections: ['mr']
    });
    const handle = wrapper.get('.handle-mr');
    await handle.trigger('focus');
    await handle.trigger('keydown', { key: 'ArrowRight' });
    expect(wrapper.get('.auto-draggable').attributes('style')).toContain('width: 130px');

    await handle.trigger('blur');
    await wrapper.get('.auto-draggable').trigger('keydown', { key: 'ArrowRight' });
    expect(wrapper.get('.auto-draggable').attributes('style')).toContain('left: 20px');
    expect(wrapper.get('.auto-draggable').attributes('style')).toContain('width: 130px');
  });

  it('activates an inactive box when keyboard focus enters the box', async () => {
    const wrapper = mountBox({ active: false, keyboardEnabled: true });
    const box = wrapper.get('.auto-draggable');

    await box.trigger('focus');
    await box.trigger('keydown', { key: 'ArrowRight' });

    expect(wrapper.emitted('active')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toMatchObject({ left: 11 });
    expect(wrapper.get('.handle-br').isVisible()).toBe(true);
  });

  it('does not handle arrow keys from interactive slot content', async () => {
    const wrapper = mountBox(
      { active: true, keyboardEnabled: true },
      { default: '<button class="slot-button"><span>action</span></button>' }
    );
    const event = new KeyboardEvent('keydown', {
      key: 'ArrowRight',
      bubbles: true,
      cancelable: true
    });

    wrapper.get('.slot-button span').element.dispatchEvent(event);
    await nextTick();

    expect(event.defaultPrevented).toBe(false);
    expect(wrapper.emitted('update:modelValue')).toBeFalsy();
  });

  it('rejects non-primary pointers and non-primary mouse buttons', async () => {
    const wrapper = mountBox();
    const box = wrapper.get('.auto-draggable').element;

    box.dispatchEvent(pointerEvent('pointerdown', 10, 20, { button: 2 }));
    box.dispatchEvent(
      pointerEvent('pointerdown', 10, 20, { pointerId: 2, pointerType: 'touch', isPrimary: false })
    );

    expect(wrapper.emitted('drag-start')).toBeFalsy();
    expect(wrapper.emitted('active')).toBeFalsy();
  });

  it('ignores a second pointer down while an interaction is in progress', async () => {
    const wrapper = mountBox();
    await wrapper
      .get('.auto-draggable')
      .trigger('pointerdown', { clientX: 0, clientY: 0, pointerId: 1 });
    await wrapper
      .get('.auto-draggable')
      .trigger('pointerdown', { clientX: 50, clientY: 50, pointerId: 2 });

    document.documentElement.dispatchEvent(pointerEvent('pointermove', 30, 0));
    await flushFrame();
    expect(wrapper.get('.auto-draggable').attributes('style')).toContain('left: 40px');
    expect(wrapper.emitted('drag-start')).toHaveLength(1);

    document.documentElement.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })
    );
    await nextTick();
    await nextTick();
    expect(wrapper.get('.auto-draggable').attributes('style')).toContain('left: 10px');
  });

  it('exposes accessible semantics on resize handles', async () => {
    const wrapper = mountBox({ active: true, keyboardEnabled: true, handles: ['tl', 'mr', 'bm'] });
    const middleRight = wrapper.get('.handle-mr');
    expect(middleRight.attributes('role')).toBe('separator');
    expect(middleRight.attributes('aria-orientation')).toBe('vertical');
    expect(middleRight.attributes('aria-label')).toBe('Resize middle right');
    expect(middleRight.attributes('aria-valuenow')).toBe('120');
    expect(middleRight.attributes('aria-valuemin')).toBe('0');
    expect(middleRight.attributes('aria-valuetext')).toBe('120 pixels');
    expect(middleRight.attributes('aria-keyshortcuts')).toBe('ArrowLeft ArrowRight');
    expect(middleRight.attributes('tabindex')).toBe('0');
    expect(wrapper.get('.handle-bm').attributes('aria-orientation')).toBe('horizontal');
    expect(wrapper.get('.handle-bm').attributes('aria-valuenow')).toBe('80');

    const topLeft = wrapper.get('.handle-tl');
    expect(topLeft.attributes('role')).toBe('group');
    expect(topLeft.attributes('aria-roledescription')).toBe('two-axis resize handle');
    expect(topLeft.attributes('aria-orientation')).toBeUndefined();
    expect(topLeft.attributes('aria-valuenow')).toBeUndefined();
    expect(topLeft.attributes('aria-keyshortcuts')).toBe('ArrowUp ArrowDown ArrowLeft ArrowRight');

    const withoutKeyboard = mountBox({ active: true, handles: ['mr'] });
    expect(withoutKeyboard.get('.handle-mr').attributes('tabindex')).toBeUndefined();
  });

  it('processes the final queued touch frame before pointerup', async () => {
    const wrapper = mountBox();
    wrapper.get('.auto-draggable').element.dispatchEvent(pointerEvent('pointerdown', 10, 20));
    document.documentElement.dispatchEvent(pointerEvent('pointermove', 40, 50));
    document.documentElement.dispatchEvent(pointerEvent('pointerup', 40, 50));
    await nextTick();
    expect(wrapper.get('.auto-draggable').attributes('style')).toContain('left: 40px');
    expect(wrapper.emitted('drag-stop')).toBeTruthy();
  });

  it('cleans up listeners after pointercancel', async () => {
    const wrapper = mountBox();
    wrapper.get('.auto-draggable').element.dispatchEvent(pointerEvent('pointerdown', 10, 20));
    document.documentElement.dispatchEvent(pointerEvent('pointermove', 40, 50));
    document.documentElement.dispatchEvent(pointerEvent('pointercancel', 40, 50));
    await nextTick();
    expect(wrapper.emitted('drag-cancel')).toBeTruthy();
    expect(wrapper.emitted('drag-stop')).toBeFalsy();
    const updatesAfterCancel = wrapper.emitted('update:modelValue')?.length ?? 0;

    document.documentElement.dispatchEvent(pointerEvent('pointermove', 80, 90));
    await flushFrame();
    expect(wrapper.emitted('update:modelValue')?.length ?? 0).toBe(updatesAfterCancel);
    expect(wrapper.get('.auto-draggable').classes()).not.toContain('is-dragging');
    expect(wrapper.get('.auto-draggable').attributes('style')).toContain('left: 10px');
  });

  it('ignores lost pointer capture events from a different pointer', async () => {
    const wrapper = mountBox();
    const box = wrapper.get('.auto-draggable');
    box.element.dispatchEvent(pointerEvent('pointerdown', 10, 20, { pointerId: 1 }));
    box.element.dispatchEvent(pointerEvent('lostpointercapture', 10, 20, { pointerId: 2 }));
    document.documentElement.dispatchEvent(pointerEvent('pointermove', 40, 50, { pointerId: 1 }));
    await flushFrame();

    expect(wrapper.emitted('drag-cancel')).toBeFalsy();
    expect(box.attributes('style')).toContain('left: 40px');
    document.documentElement.dispatchEvent(pointerEvent('pointerup', 40, 50, { pointerId: 1 }));
  });

  it('emits immutable updates from exposed methods and resets to the initial model', async () => {
    const wrapper = mountBox({
      modelValue: makeModel({ left: 25, top: 35 }),
      snapToGrid: true,
      gridSize: 20,
      snapToElements: true,
      snapTargets: [{ id: 'target', left: 100, top: 100, width: 100, height: 100 }]
    });
    const vm = wrapper.vm as unknown as {
      setPosition: (left: number, top: number) => void;
      setSize: (width: number, height: number) => void;
      reset: () => void;
      activate: () => void;
      deactivate: () => void;
    };

    vm.setPosition(103, 117);
    expect(wrapper.emitted('update:modelValue')?.[0]?.[0]).toMatchObject({ left: 103, top: 117 });
    vm.setSize(200, 210);
    expect(wrapper.emitted('update:modelValue')).toHaveLength(2);
    vm.reset();
    await nextTick();
    expect(wrapper.get('.auto-draggable').attributes('style')).toContain('left: 25px');
    expect(wrapper.get('.auto-draggable').attributes('style')).toContain('width: 120px');

    vm.activate();
    vm.deactivate();
    expect(wrapper.emitted('active')).toBeTruthy();
    expect(wrapper.emitted('inactive')).toBeTruthy();
  });

  it('does not start interactions while disabled or readonly', async () => {
    const disabled = mountBox({ disabled: true });
    await disabled.get('.auto-draggable').trigger('pointerdown', { clientX: 0, clientY: 0 });
    expect(disabled.emitted('drag-start')).toBeFalsy();

    const readonly = mountBox({ initRect: true });
    await readonly.get('.auto-draggable').trigger('pointerdown', { clientX: 0, clientY: 0 });
    expect(readonly.emitted('drag-start')).toBeFalsy();
  });

  it('starts drags only from elements matching dragHandle', async () => {
    const wrapper = mountBox(
      { dragHandle: '.grip' },
      { default: '<button class="grip">move</button><button class="other">still</button>' }
    );

    await wrapper.get('.other').trigger('pointerdown', { clientX: 0, clientY: 0 });
    expect(wrapper.emitted('drag-start')).toBeFalsy();

    await wrapper.get('.grip').trigger('pointerdown', { clientX: 0, clientY: 0 });
    expect(wrapper.emitted('drag-start')).toBeTruthy();
    document.documentElement.dispatchEvent(pointerEvent('pointerup', 0, 0));
  });

  it('keeps resize handles working while dragHandle is configured', async () => {
    const wrapper = mountBox(
      { dragHandle: '.grip', handles: ['br'] },
      { default: '<span class="grip">grip</span>' }
    );
    await pointerDrag(wrapper, [0, 0], [10, 10], '.handle-br');
    expect(wrapper.emitted('resize-start')).toBeTruthy();
  });

  it('ignores drag starts inside dragCancel areas', async () => {
    const wrapper = mountBox(
      { dragCancel: '.no-drag' },
      { default: '<button class="no-drag">form</button>' }
    );

    await wrapper.get('.no-drag').trigger('pointerdown', { clientX: 0, clientY: 0 });
    expect(wrapper.emitted('drag-start')).toBeFalsy();

    await wrapper.get('.auto-draggable').trigger('pointerdown', { clientX: 0, clientY: 0 });
    expect(wrapper.emitted('drag-start')).toBeTruthy();
    document.documentElement.dispatchEvent(pointerEvent('pointerup', 0, 0));
  });

  it('treats invalid drag selectors as blocking rather than crashing', async () => {
    for (const props of [{ dragHandle: '<<<' }, { dragCancel: '<<<' }]) {
      const wrapper = mountBox(props);
      await wrapper.get('.auto-draggable').trigger('pointerdown', { clientX: 0, clientY: 0 });
      expect(wrapper.emitted('drag-start')).toBeFalsy();
      wrapper.unmount();
    }
  });

  it('rejects interactions via canDrag and canResize guards without touching the model', async () => {
    const blocked = mountBox({ canDrag: () => false, canResize: () => false, handles: ['br'] });

    await blocked.get('.auto-draggable').trigger('pointerdown', { clientX: 0, clientY: 0 });
    expect(blocked.emitted('drag-start')).toBeFalsy();
    expect(blocked.emitted('active')).toBeFalsy();

    await pointerDrag(blocked, [0, 0], [20, 20], '.handle-br');
    expect(blocked.emitted('resize-start')).toBeFalsy();
    expect(blocked.emitted('update:modelValue')).toBeFalsy();
    expect(blocked.emitted('resize-cancel')).toBeFalsy();
  });

  it('applies canDrag and canResize guards to keyboard interactions', async () => {
    const blocked = mountBox({
      active: true,
      keyboardEnabled: true,
      canDrag: () => false,
      canResize: () => false,
      handles: ['br'],
      resizeDirections: ['br']
    });
    const box = blocked.get('.auto-draggable');

    await box.trigger('keydown', { key: 'ArrowRight' });
    await box.trigger('keydown', { key: 'ArrowRight', shiftKey: true });

    expect(blocked.emitted('update:modelValue')).toBeFalsy();
    expect(blocked.emitted('move')).toBeFalsy();
    expect(blocked.emitted('resize')).toBeFalsy();
  });

  it('only blocks the guarded interaction type and passes the current rectangle', async () => {
    const seen: Array<Record<string, unknown>> = [];
    const wrapper = mountBox({
      handles: ['br'],
      canDrag: (value: Record<string, number>) => {
        seen.push(value);
        return false;
      }
    });

    await wrapper.get('.auto-draggable').trigger('pointerdown', { clientX: 0, clientY: 0 });
    expect(wrapper.emitted('drag-start')).toBeFalsy();

    await pointerDrag(wrapper, [0, 0], [20, 20], '.handle-br');
    expect(wrapper.emitted('resize-start')).toBeTruthy();
    expect(seen[0]).toMatchObject({ left: 10, top: 20, width: 120, height: 80 });
    document.documentElement.dispatchEvent(pointerEvent('pointerup', 0, 0));
  });

  it.each(['disabled', 'initRect'] as const)(
    'cancels an active interaction when %s becomes true',
    async prop => {
      const wrapper = mountBox();
      await wrapper.get('.auto-draggable').trigger('pointerdown', { clientX: 0, clientY: 0 });
      await wrapper.setProps({ [prop]: true });
      document.documentElement.dispatchEvent(pointerEvent('pointermove', 100, 100));
      await flushFrame();

      expect(wrapper.emitted('update:modelValue')).toBeFalsy();
      expect(wrapper.get('.auto-draggable').classes()).not.toContain('is-dragging');
    }
  );

  it('cancels an active interaction when the active prop becomes false', async () => {
    const wrapper = mountBox({ active: true });
    await wrapper.get('.auto-draggable').trigger('pointerdown', { clientX: 0, clientY: 0 });
    await wrapper.setProps({ active: false });
    document.documentElement.dispatchEvent(pointerEvent('pointermove', 100, 100));
    await flushFrame();

    expect(wrapper.emitted('update:modelValue')).toBeFalsy();
    expect(wrapper.get('.auto-draggable').classes()).not.toContain('is-dragging');
    expect(wrapper.emitted('inactive')).toBeTruthy();
  });

  it('aborts an active interaction when deactivated by method', async () => {
    const methodWrapper = mountBox();
    await methodWrapper.get('.auto-draggable').trigger('pointerdown', { clientX: 0, clientY: 0 });
    (methodWrapper.vm as unknown as { deactivate: () => void }).deactivate();
    document.documentElement.dispatchEvent(pointerEvent('pointermove', 100, 100));
    await flushFrame();
    expect(methodWrapper.emitted('update:modelValue')).toBeFalsy();
    expect(methodWrapper.get('.auto-draggable').classes()).not.toContain('is-dragging');
  });

  it('cancels a drag with Escape, restores the rectangle, and skips drag-stop', async () => {
    const wrapper = mountBox();
    await pointerDrag(wrapper, [0, 0], [30, 0], '.auto-draggable', false);
    expect(wrapper.get('.auto-draggable').attributes('style')).toContain('left: 40px');

    document.documentElement.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })
    );
    await nextTick();
    await nextTick();
    expect(wrapper.get('.auto-draggable').attributes('style')).toContain('left: 10px');
    expect(wrapper.emitted('drag-cancel')?.[0]?.[0]).toBeInstanceOf(KeyboardEvent);
    expect(wrapper.emitted('drag-cancel')?.[0]?.[1]).toMatchObject({ left: 10 });
    expect(wrapper.emitted('drag-stop')).toBeFalsy();

    document.documentElement.dispatchEvent(pointerEvent('pointermove', 100, 100));
    await flushFrame();
    expect(wrapper.get('.auto-draggable').attributes('style')).toContain('left: 10px');
  });

  it('cancels a resize with Escape and emits resize-cancel', async () => {
    const wrapper = mountBox({ handles: ['br'] });
    await pointerDrag(wrapper, [0, 0], [30, 0], '.handle-br', false);
    expect(wrapper.get('.auto-draggable').attributes('style')).toContain('width: 150px');

    await wrapper.get('.auto-draggable').trigger('keydown', { key: 'Escape' });
    await nextTick();
    expect(wrapper.get('.auto-draggable').attributes('style')).toContain('width: 120px');
    expect(wrapper.emitted('resize-cancel')).toBeTruthy();
    expect(wrapper.emitted('resize-stop')).toBeFalsy();
  });

  it('cancels an interaction through the exposed cancelInteraction method', async () => {
    const wrapper = mountBox();
    await pointerDrag(wrapper, [0, 0], [30, 0], '.auto-draggable', false);
    (wrapper.vm as unknown as { cancelInteraction: () => void }).cancelInteraction();
    await nextTick();

    expect(wrapper.get('.auto-draggable').attributes('style')).toContain('left: 10px');
    expect(wrapper.emitted('drag-cancel')?.[0]?.[0]).toBeNull();
    expect(wrapper.emitted('drag-stop')).toBeFalsy();
  });

  it('ignores Escape while idle without keyboardEnabled', async () => {
    const wrapper = mountBox();
    await wrapper.get('.auto-draggable').trigger('keydown', { key: 'Escape' });
    expect(wrapper.emitted('inactive')).toBeFalsy();
    expect(wrapper.emitted('drag-cancel')).toBeFalsy();
  });

  it('cancels a pending animation frame and document listeners on unmount', async () => {
    const wrapper = mountBox();
    await wrapper.get('.auto-draggable').trigger('pointerdown', { clientX: 0, clientY: 0 });
    document.documentElement.dispatchEvent(pointerEvent('pointermove', 100, 100));
    wrapper.unmount();
    document.documentElement.dispatchEvent(pointerEvent('pointermove', 150, 150));
    document.documentElement.dispatchEvent(pointerEvent('pointerup', 0, 0));
    await flushFrame();

    expect(wrapper.emitted('update:modelValue')).toBeFalsy();
  });

  it('does not emit inactive when unmounting during an interaction', async () => {
    const wrapper = mountBox({ active: false });
    await wrapper.get('.auto-draggable').trigger('pointerdown', { clientX: 0, clientY: 0 });
    wrapper.unmount();
    await flushFrame();

    expect(wrapper.emitted('inactive')).toBeFalsy();
  });

  it('rotates from the interactive handle and emits the complete lifecycle', async () => {
    const wrapper = mountBox({ active: true, rotatable: true, rotate: 0 });
    const box = wrapper.get('.auto-draggable').element as HTMLElement;
    Object.defineProperty(box, 'offsetWidth', { configurable: true, value: 120 });
    Object.defineProperty(box, 'offsetHeight', { configurable: true, value: 80 });
    box.getBoundingClientRect = () =>
      ({ left: 10, top: 20, right: 130, bottom: 100, width: 120, height: 80 }) as DOMRect;

    wrapper
      .get('.rotation-handle')
      .element.dispatchEvent(pointerEvent('pointerdown', 70, 0, { isPrimary: true }));
    document.documentElement.dispatchEvent(pointerEvent('pointermove', 130, 60));
    await flushFrame();
    document.documentElement.dispatchEvent(pointerEvent('pointerup', 130, 60));
    await nextTick();

    expect(wrapper.emitted('rotate-start')?.[0]?.[1]).toBe(0);
    expect(wrapper.emitted('update:rotate')?.at(-1)?.[0]).toBe(90);
    expect(wrapper.emitted('rotate')?.at(-1)?.[0]).toBe(90);
    expect(wrapper.emitted('rotate-stop')?.[0]?.slice(1)).toEqual([0, 90]);
    expect(wrapper.get('.auto-draggable').attributes('style')).toContain('rotate(90deg)');
    expect(wrapper.emitted('drag-start')).toBeFalsy();
  });

  it('quantizes pointer rotation to the configured decimal places', async () => {
    const wrapper = mountBox({
      active: true,
      rotatable: true,
      rotate: 0,
      isKeepDecimals: true,
      decimalPlaces: 2
    });
    const box = wrapper.get('.auto-draggable').element as HTMLElement;
    Object.defineProperty(box, 'offsetWidth', { configurable: true, value: 120 });
    Object.defineProperty(box, 'offsetHeight', { configurable: true, value: 80 });
    box.getBoundingClientRect = () =>
      ({ left: 10, top: 20, right: 130, bottom: 100, width: 120, height: 80 }) as DOMRect;

    wrapper
      .get('.rotation-handle')
      .element.dispatchEvent(pointerEvent('pointerdown', 70, 0, { isPrimary: true }));
    const pointerAngle = (-88.7655 * Math.PI) / 180;
    document.documentElement.dispatchEvent(
      pointerEvent(
        'pointermove',
        70 + 60 * Math.cos(pointerAngle),
        60 + 60 * Math.sin(pointerAngle)
      )
    );
    await flushFrame();
    document.documentElement.dispatchEvent(pointerEvent('pointerup', 0, 0));
    await nextTick();

    expect(wrapper.emitted('update:rotate')?.at(-1)?.[0]).toBe(1.23);
    expect(wrapper.emitted('rotate-stop')?.at(-1)?.slice(1)).toEqual([0, 1.23]);
  });

  it('normalizes handle rotation across the 180 degree boundary', async () => {
    const wrapper = mountBox({ active: true, rotatable: true, rotate: 170 });
    const box = wrapper.get('.auto-draggable').element as HTMLElement;
    Object.defineProperty(box, 'offsetWidth', { configurable: true, value: 120 });
    Object.defineProperty(box, 'offsetHeight', { configurable: true, value: 80 });
    box.getBoundingClientRect = () =>
      ({ left: 10, top: 20, right: 130, bottom: 100, width: 120, height: 80 }) as DOMRect;

    wrapper
      .get('.rotation-handle')
      .element.dispatchEvent(pointerEvent('pointerdown', 70, 0, { isPrimary: true }));
    document.documentElement.dispatchEvent(pointerEvent('pointermove', 80, 1));
    await flushFrame();
    document.documentElement.dispatchEvent(pointerEvent('pointerup', 80, 1));

    const value = wrapper.emitted('update:rotate')?.at(-1)?.[0] as number;
    expect(value).toBeGreaterThan(-180);
    expect(value).toBeLessThanOrEqual(180);
  });

  it('cancels an active rotation with Escape and restores the previous angle', async () => {
    const wrapper = mountBox({ active: true, rotatable: true, rotate: 15 });
    const box = wrapper.get('.auto-draggable').element as HTMLElement;
    Object.defineProperty(box, 'offsetWidth', { configurable: true, value: 120 });
    Object.defineProperty(box, 'offsetHeight', { configurable: true, value: 80 });
    box.getBoundingClientRect = () =>
      ({ left: 10, top: 20, right: 130, bottom: 100, width: 120, height: 80 }) as DOMRect;

    wrapper
      .get('.rotation-handle')
      .element.dispatchEvent(pointerEvent('pointerdown', 70, 0, { isPrimary: true }));
    document.documentElement.dispatchEvent(pointerEvent('pointermove', 130, 60));
    await flushFrame();
    await wrapper.get('.auto-draggable').trigger('keydown', { key: 'Escape' });

    expect(wrapper.emitted('rotate-cancel')?.[0]?.slice(1)).toEqual([15, 15]);
    expect(wrapper.emitted('update:rotate')?.at(-1)?.[0]).toBe(15);
    expect(wrapper.emitted('rotate-stop')).toBeFalsy();
    expect(wrapper.get('.auto-draggable').attributes('style')).toContain('rotate(15deg)');
  });

  it('supports external rotation updates and accessible keyboard rotation', async () => {
    const wrapper = mountBox({
      active: true,
      rotatable: true,
      rotate: 30,
      keyboardEnabled: true,
      keyboardStep: 5
    });
    await wrapper.setProps({ rotate: 45 });
    expect(wrapper.get('.auto-draggable').attributes('style')).toContain('rotate(45deg)');

    const handle = wrapper.get('.rotation-handle');
    expect(handle.attributes('role')).toBe('slider');
    expect(handle.attributes('aria-keyshortcuts')).toBe('ArrowLeft ArrowRight Home');
    await handle.trigger('keydown', { key: 'ArrowRight' });
    expect(wrapper.emitted('update:rotate')?.at(-1)?.[0]).toBe(50);
    await handle.trigger('keydown', { key: 'Home' });
    expect(wrapper.emitted('update:rotate')?.at(-1)?.[0]).toBe(0);
  });

  it('keeps external rotation authoritative until the next interaction', async () => {
    const wrapper = mountBox({
      active: true,
      rotatable: true,
      keyboardEnabled: true,
      rotate: 12.345,
      isKeepDecimals: false
    });

    const transform = wrapper.get('.auto-draggable').attributes('style') ?? '';
    const renderedAngle = Number(transform.match(/rotate\(([-\d.]+)deg\)/)?.[1]);
    expect(renderedAngle).toBeCloseTo(12.345, 10);
    expect(wrapper.emitted('update:rotate')).toBeFalsy();

    await wrapper.get('.rotation-handle').trigger('keydown', { key: 'ArrowRight' });

    expect(wrapper.emitted('update:rotate')?.at(-1)?.[0]).toBe(13);
    expect(wrapper.emitted('rotate')?.at(-1)?.[0]).toBe(13);
    const stopPayload = wrapper.emitted('rotate-stop')?.at(-1)?.slice(1) as number[];
    expect(stopPayload[0]).toBeCloseTo(12.345, 10);
    expect(stopPayload[1]).toBe(13);
  });

  it.each([
    { isKeepDecimals: false, decimalPlaces: 3, expected: 1 },
    { isKeepDecimals: true, decimalPlaces: 2, expected: 1.23 },
    { isKeepDecimals: true, decimalPlaces: 3, expected: 1.235 }
  ])(
    'quantizes keyboard rotation with isKeepDecimals=$isKeepDecimals and decimalPlaces=$decimalPlaces',
    async ({ isKeepDecimals, decimalPlaces, expected }) => {
      const wrapper = mountBox({
        active: true,
        rotatable: true,
        keyboardEnabled: true,
        keyboardStep: 1.2345,
        isKeepDecimals,
        decimalPlaces
      });

      await wrapper.get('.rotation-handle').trigger('keydown', { key: 'ArrowRight' });

      expect(wrapper.emitted('update:rotate')?.at(-1)?.[0]).toBe(expected);
      expect(wrapper.emitted('rotate')?.at(-1)?.[0]).toBe(expected);
      expect(wrapper.emitted('rotate-stop')?.at(-1)?.slice(1)).toEqual([0, expected]);
    }
  );

  it('does not advertise rotation keyboard shortcuts while keyboard control is disabled', () => {
    const wrapper = mountBox({ active: true, rotatable: true });
    expect(wrapper.get('.rotation-handle').attributes('aria-keyshortcuts')).toBeUndefined();
  });

  it('honors rotation handle offsets below 16 pixels', () => {
    const wrapper = mountBox({ active: true, rotatable: true, rotationHandleOffset: 8 });
    expect(wrapper.get('.rotation-handle').attributes('style')).toContain(
      '--rotation-handle-offset: 8px'
    );
  });

  it.each([-5, Number.NaN])('falls back to a one-degree rotation step for %s', async step => {
    const wrapper = mountBox({
      active: true,
      rotatable: true,
      rotate: 30,
      keyboardEnabled: true,
      keyboardStep: step
    });

    await wrapper.get('.rotation-handle').trigger('keydown', { key: 'ArrowRight' });

    expect(wrapper.emitted('update:rotate')?.at(-1)?.[0]).toBe(31);
  });

  // --- v3.2.0: precise rotated-rectangle collision ---

  const mountRotatedBox = (overrides: Record<string, unknown> = {}) => {
    const wrapper = mountBox({
      modelValue: makeModel({ left: 0, top: 0, width: 100, height: 100 }),
      rotate: 45,
      collisionEnabled: true,
      ...overrides
    });
    return wrapper;
  };

  it('drags freely past a target that only the legacy AABB would report', async () => {
    // The rotated 100x100 contour stays clear of the tiny corner box; the legacy AABB
    // mode reports a collision and blocks the escape.
    const wrapper = mountRotatedBox({
      snapTargets: [{ id: 'corner', left: -20, top: -20, width: 5, height: 5 }]
    });
    await pointerDrag(wrapper, [0, 0], [-2, 0]);
    expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toMatchObject({ left: -2 });
    expect(wrapper.emitted('collision')).toBeFalsy();
  });

  it('blocks the same drag in legacy aabb collision mode', async () => {
    const wrapper = mountRotatedBox({
      collisionMode: 'aabb',
      snapTargets: [{ id: 'corner', left: -20, top: -20, width: 5, height: 5 }]
    });
    await pointerDrag(wrapper, [0, 0], [-2, 0]);
    expect(wrapper.emitted('update:modelValue')).toBeFalsy();
  });

  it('stops a drag that the legacy AABB mode would miss against a rotated target', async () => {
    // The box starts clear of the diamond's right tip and drags left into it; legacy
    // mode only compares against the unrotated 100x100 rect and lets the drag through.
    const wrapper = mountBox({
      modelValue: makeModel({ left: 125, top: 45, width: 5, height: 10 }),
      collisionEnabled: true,
      snapTargets: [{ id: 'diamond', left: 0, top: 0, width: 100, height: 100, rotate: 45 }]
    });
    await pointerDrag(wrapper, [0, 0], [-20, 0]);
    const update = wrapper.emitted('update:modelValue')?.at(-1)?.[0] as Record<string, number>;
    // The drag stops when the box corner touches the diamond's upper-right edge
    // (left about 121) instead of reaching the dragged position 105.
    expect(update.left).toBeGreaterThan(115);
    expect(update.left).toBeLessThanOrEqual(121);
    expect(wrapper.emitted('collision')?.[0]?.[0]).toMatchObject({
      colliding: true,
      targetId: 'diamond'
    });
  });

  it('lets the same drag pass in legacy aabb collision mode', async () => {
    const wrapper = mountBox({
      modelValue: makeModel({ left: 125, top: 45, width: 5, height: 10 }),
      collisionEnabled: true,
      collisionMode: 'aabb',
      snapTargets: [{ id: 'diamond', left: 0, top: 0, width: 100, height: 100, rotate: 45 }]
    });
    await pointerDrag(wrapper, [0, 0], [-20, 0]);
    expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toMatchObject({ left: 105 });
  });

  it('keeps keyboard rotation working in percent units', async () => {
    // Regression: bounds for the rotated box were once compared in px against percent
    // edges, which froze rotation entirely for any percent-mode box.
    const wrapper = mountBox({
      modelValue: makeModel({ left: 10, top: 10, width: 20, height: 20 }),
      unitType: '%',
      limitAreaForParent: true,
      active: true,
      rotatable: true,
      keyboardEnabled: true,
      keyboardStep: 90
    });
    await wrapper.get('.rotation-handle').trigger('keydown', { key: 'ArrowRight' });
    expect(wrapper.emitted('update:rotate')?.at(-1)?.[0]).toBe(90);
  });

  it('does not constrain rotation when collision is disabled', async () => {
    // snapTargets stay snap-only unless collisionEnabled turns them into obstacles.
    const wrapper = mountBox({
      modelValue: makeModel({ left: 0, top: 0, width: 100, height: 100 }),
      active: true,
      rotatable: true,
      keyboardEnabled: true,
      keyboardStep: 90,
      snapTargets: [{ id: 'blocker', left: 80, top: 0, width: 40, height: 40 }]
    });
    await wrapper.get('.rotation-handle').trigger('keydown', { key: 'ArrowRight' });
    expect(wrapper.emitted('update:rotate')?.at(-1)?.[0]).toBe(90);
  });

  it('allows rotation through targets when overlap is explicitly allowed', async () => {
    const wrapper = mountBox({
      modelValue: makeModel({ left: 0, top: 0, width: 100, height: 100 }),
      active: true,
      rotatable: true,
      keyboardEnabled: true,
      keyboardStep: 90,
      collisionEnabled: true,
      allowOverlap: true,
      snapTargets: [{ id: 'blocker', left: 80, top: 0, width: 40, height: 40 }]
    });
    await wrapper.get('.rotation-handle').trigger('keydown', { key: 'ArrowRight' });
    expect(wrapper.emitted('update:rotate')?.at(-1)?.[0]).toBe(90);
  });

  it('snaps onto a rotated target in percent units without unit mixing', async () => {
    // Target (8%, 40%, 20x10) rotated 90deg has its visual AABB at left 14% of the
    // 500px container; the box's left edge should align there in percent units.
    const wrapper = mountBox({
      modelValue: makeModel({ left: 0, top: 0, width: 20, height: 20 }),
      unitType: '%',
      snapToElements: true,
      snapThreshold: 20,
      snapTargets: [{ id: 'rotated', left: 8, top: 40, width: 20, height: 10, rotate: 90 }]
    });
    // 12px of pointer travel round to 2 percent points of model delta on the 500px area.
    // The rotated target's visual AABB spans left 14% to 22% in model units; the moving
    // box's right edge lands flush on the target's visual right edge, so the snap fires.
    // With px/model mixing this snap never resolves (px values read as percent points
    // are far outside the threshold).
    await pointerDrag(wrapper, [0, 0], [12, 0], '.auto-draggable', false);
    const update = wrapper.emitted('update:modelValue')?.at(-1)?.[0] as Record<string, number>;
    expect(update.left).toBe(2);
    expect(wrapper.emitted('snap')?.at(-1)?.[0]).toMatchObject({
      snapped: true,
      targetId: 'rotated'
    });
    document.documentElement.dispatchEvent(pointerEvent('pointerup', 0, 0));
  });

  it('recovers rotation when the start angle sits outside the bounds area', async () => {
    // A 480x380 box in the 500x400 area only fits within about 2 degrees; rotating
    // toward 0 from an out-of-bounds 10 degrees must recover to the first safe angle
    // instead of locking the interaction.
    const wrapper = mountBox({
      modelValue: makeModel({ left: 10, top: 10, width: 480, height: 380 }),
      limitAreaForParent: true,
      active: true,
      rotatable: true,
      keyboardEnabled: true,
      keyboardStep: 45,
      rotate: 10
    });
    await wrapper.get('.rotation-handle').trigger('keydown', { key: 'ArrowLeft' });
    const value = wrapper.emitted('update:rotate')?.at(-1)?.[0] as number;
    expect(value).toBeGreaterThanOrEqual(0);
    expect(value).toBeLessThan(10);
  });

  it('reports the contact normal in the collision payload', async () => {
    const wrapper = mountBox({
      modelValue: makeModel({ left: 0, top: 0, width: 50, height: 50 }),
      collisionEnabled: true,
      snapTargets: [{ id: 'target', left: 60, top: 0, width: 50, height: 50 }]
    });
    await pointerDrag(wrapper, [0, 0], [120, 0]);
    const payload = wrapper.emitted('collision')?.[0]?.[0] as Record<string, unknown>;
    expect(payload.colliding).toBe(true);
    const normal = payload.normal as { x: number; y: number };
    expect(normal.x).toBeCloseTo(-1, 4);
    expect(normal.y).toBeCloseTo(0, 4);
    expect(payload.direction).toBe('left');
  });

  it('omits the contact normal in legacy aabb collision mode', async () => {
    const wrapper = mountBox({
      modelValue: makeModel({ left: 0, top: 0, width: 50, height: 50 }),
      collisionEnabled: true,
      collisionMode: 'aabb',
      snapTargets: [{ id: 'target', left: 60, top: 0, width: 50, height: 50 }]
    });
    await pointerDrag(wrapper, [0, 0], [120, 0]);
    const payload = wrapper.emitted('collision')?.[0]?.[0] as Record<string, unknown>;
    expect(payload.colliding).toBe(true);
    expect(payload.normal).toBeUndefined();
  });

  it('constrains keyboard rotation against a rotated collision target', async () => {
    const wrapper = mountRotatedBox({
      active: true,
      rotatable: true,
      keyboardEnabled: true,
      keyboardStep: 90,
      snapTargets: [{ id: 'blocker', left: 80, top: 0, width: 40, height: 40 }]
    });
    await wrapper.get('.rotation-handle').trigger('keydown', { key: 'ArrowRight' });
    const value = wrapper.emitted('update:rotate')?.at(-1)?.[0] as number;
    // A full 90-degree swing would sweep the corners through the blocker.
    expect(value).toBeGreaterThan(0);
    expect(value).toBeLessThan(90);
  });

  it('applies the full keyboard rotation when nothing blocks the path', async () => {
    const wrapper = mountRotatedBox({
      rotate: 0,
      active: true,
      rotatable: true,
      keyboardEnabled: true,
      keyboardStep: 90
    });
    await wrapper.get('.rotation-handle').trigger('keydown', { key: 'ArrowRight' });
    expect(wrapper.emitted('update:rotate')?.at(-1)?.[0]).toBe(90);
  });

  it('renders snap guides in a counter-rotated presentation layer', async () => {
    const wrapper = mountBox({
      modelValue: makeModel({ left: 8, top: 100, width: 120, height: 80 }),
      rotate: 30,
      snapToElements: true,
      snapThreshold: 30,
      snapTargets: [{ id: 'edge', left: 10, top: 300, width: 100, height: 80 }]
    });
    await pointerDrag(wrapper, [0, 0], [1, 0], '.auto-draggable', false);
    const layer = wrapper.get('.movable-box-guides-layer');
    expect(layer.attributes('style')).toContain('rotate(-30deg)');
    expect(layer.attributes('style')).toContain('width: 500px');
    const guide = wrapper.get('.movable-box-guide--vertical');
    // The snap resolves on the rotated box's visual probe: center-x aligns at 60.
    expect(guide.attributes('style')).toContain('left: 60px');
    document.documentElement.dispatchEvent(pointerEvent('pointerup', 0, 0));
  });

  it('rotates resize deltas in pixel space before mapping onto percent units', async () => {
    const wrapper = mountBox({
      modelValue: makeModel({ left: 10, top: 10, width: 120, height: 80 }),
      unitType: '%',
      rotate: 90,
      handles: ['br'],
      resizeDirections: ['br']
    });
    // A 40px downward drag is horizontal in the box's local frame: +8% width (of 500px),
    // no height change. Percent-first rotation would have produced +10% width.
    await pointerDrag(wrapper, [130, 90], [130, 130], '.handle-br');
    const update = wrapper.emitted('update:modelValue')?.at(-1)?.[0] as Record<string, number>;
    expect(update.width).toBe(128);
    expect(update.height).toBe(80);
  });

  // --- v3.4.0: target geometry cache (FEAT-34-03) ---

  it('invalidates cached target geometry when a target mutates in place', async () => {
    const targets = ref([{ id: 'wall', left: 60, top: 0, width: 50, height: 50 }]);
    const wrapper = mount(MovableBox, {
      props: {
        modelValue: makeModel({ left: 0, top: 0, width: 20, height: 20 }),
        draggable: true,
        resizable: true,
        limitAreaForParent: false,
        collisionEnabled: true,
        snapTargets: targets.value
      },
      attachTo: document.body
    });
    const parent = wrapper.element.parentElement as HTMLElement;
    Object.defineProperty(parent, 'clientWidth', { configurable: true, value: 600 });
    Object.defineProperty(parent, 'clientHeight', { configurable: true, value: 400 });

    await pointerDrag(wrapper, [0, 0], [60, 0]);
    expect((wrapper.emitted('update:modelValue')?.at(-1)?.[0] as Record<string, number>).left).toBe(
      40
    );

    // Mutate the target in place: the geometry cache must invalidate and the same drag
    // must now pass freely.
    targets.value[0].left = 300;
    await nextTick();

    await wrapper.setProps({ modelValue: makeModel({ left: 0, top: 0, width: 20, height: 20 }) });
    await pointerDrag(wrapper, [0, 0], [60, 0]);
    expect((wrapper.emitted('update:modelValue')?.at(-1)?.[0] as Record<string, number>).left).toBe(
      60
    );
  });

  // --- v3.3.0: transform interaction enhancements ---

  it('rejects pointer rotation through canRotate without side effects', async () => {
    const wrapper = mountBox({
      modelValue: makeModel({ left: 0, top: 0, width: 100, height: 80 }),
      active: false,
      rotatable: true,
      canRotate: () => false
    });
    const box = wrapper.get('.auto-draggable').element as HTMLElement;
    Object.defineProperty(box, 'offsetWidth', { configurable: true, value: 100 });
    Object.defineProperty(box, 'offsetHeight', { configurable: true, value: 80 });
    box.getBoundingClientRect = () =>
      ({ left: 0, top: 0, right: 100, bottom: 80, width: 100, height: 80 }) as DOMRect;

    wrapper
      .get('.rotation-handle')
      .element.dispatchEvent(pointerEvent('pointerdown', 60, 0, { isPrimary: true }));
    document.documentElement.dispatchEvent(pointerEvent('pointermove', 100, 40));
    await flushFrame();
    document.documentElement.dispatchEvent(pointerEvent('pointerup', 100, 40));
    await nextTick();

    expect(wrapper.emitted('rotate-start')).toBeFalsy();
    expect(wrapper.emitted('update:rotate')).toBeFalsy();
    expect(wrapper.emitted('active')).toBeFalsy();
    expect(wrapper.get('.auto-draggable').classes()).not.toContain('is-rotating');
  });

  it('rejects keyboard rotation through canRotate without events', async () => {
    const wrapper = mountBox({
      active: true,
      rotatable: true,
      keyboardEnabled: true,
      canRotate: () => false
    });
    await wrapper.get('.rotation-handle').trigger('keydown', { key: 'ArrowRight' });
    expect(wrapper.emitted('rotate-start')).toBeFalsy();
    expect(wrapper.emitted('update:rotate')).toBeFalsy();
  });

  it('allows rotation when canRotate approves', async () => {
    const wrapper = mountBox({
      active: true,
      rotatable: true,
      keyboardEnabled: true,
      canRotate: () => true
    });
    await wrapper.get('.rotation-handle').trigger('keydown', { key: 'ArrowRight' });
    expect(wrapper.emitted('rotate-start')).toBeTruthy();
    expect(wrapper.emitted('update:rotate')?.at(-1)?.[0]).toBe(1);
  });

  it('snaps keyboard rotation to the configured snap angles', async () => {
    const wrapper = mountBox({
      active: true,
      rotatable: true,
      keyboardEnabled: true,
      keyboardStep: 5,
      rotationSnapAngles: [0, 45, 90],
      rotationSnapThreshold: 10
    });
    await wrapper.get('.rotation-handle').trigger('keydown', { key: 'ArrowRight' });
    // A 5-degree step lands within 10 degrees of 0 and snaps back to it.
    expect(wrapper.emitted('update:rotate')?.at(-1)?.[0]).toBe(0);

    await wrapper.get('.rotation-handle').trigger('keydown', { key: 'ArrowRight', shiftKey: true });
    // Shift steps 50 degrees from 0, which is within 10 of 45 and snaps there.
    expect(wrapper.emitted('update:rotate')?.at(-1)?.[0]).toBe(45);
  });

  it('quantizes a snapped rotation angle to the configured decimal places', async () => {
    const wrapper = mountBox({
      active: true,
      rotatable: true,
      keyboardEnabled: true,
      keyboardStep: 10,
      rotationSnapAngles: [12.3456],
      rotationSnapThreshold: 5,
      isKeepDecimals: true,
      decimalPlaces: 2
    });

    await wrapper.get('.rotation-handle').trigger('keydown', { key: 'ArrowRight' });

    expect(wrapper.emitted('update:rotate')?.at(-1)?.[0]).toBe(12.35);
    expect(wrapper.emitted('rotate-stop')?.at(-1)?.slice(1)).toEqual([0, 12.35]);
  });

  it('snaps pointer rotation before emitting the committed angle', async () => {
    const wrapper = mountBox({
      active: true,
      rotatable: true,
      rotationSnapAngles: [45],
      rotationSnapThreshold: 10
    });
    const box = wrapper.get('.auto-draggable').element as HTMLElement;
    Object.defineProperty(box, 'offsetWidth', { configurable: true, value: 120 });
    Object.defineProperty(box, 'offsetHeight', { configurable: true, value: 80 });
    box.getBoundingClientRect = () =>
      ({ left: 10, top: 20, right: 130, bottom: 100, width: 120, height: 80 }) as DOMRect;

    wrapper
      .get('.rotation-handle')
      .element.dispatchEvent(pointerEvent('pointerdown', 70, 0, { isPrimary: true }));
    const radians = (-50 * Math.PI) / 180;
    document.documentElement.dispatchEvent(
      pointerEvent('pointermove', 70 + 60 * Math.cos(radians), 60 + 60 * Math.sin(radians))
    );
    await flushFrame();
    document.documentElement.dispatchEvent(pointerEvent('pointerup', 0, 0));
    await nextTick();

    expect(wrapper.emitted('update:rotate')?.at(-1)?.[0]).toBe(45);
    expect(wrapper.emitted('rotate-stop')?.at(-1)?.slice(1)).toEqual([0, 45]);
  });

  it('resets to zero with Home without reapplying angle snapping', async () => {
    const wrapper = mountBox({
      active: true,
      rotatable: true,
      rotate: 30,
      keyboardEnabled: true,
      rotationSnapAngles: [45],
      rotationSnapThreshold: 90
    });

    await wrapper.get('.rotation-handle').trigger('keydown', { key: 'Home' });

    expect(wrapper.emitted('update:rotate')?.at(-1)?.[0]).toBe(0);
  });

  it('keeps snapped rotation inside parent bounds in legacy aabb collision mode', async () => {
    const wrapper = mountBox({
      modelValue: makeModel({ left: 200, top: 100, width: 300, height: 100 }),
      active: true,
      rotatable: true,
      keyboardEnabled: true,
      keyboardStep: 90,
      limitAreaForParent: true,
      collisionMode: 'aabb',
      rotationSnapAngles: [90],
      rotationSnapThreshold: 10
    });

    await wrapper.get('.rotation-handle').trigger('keydown', { key: 'ArrowRight' });

    expect(wrapper.emitted('update:rotate')?.at(-1)?.[0]).toBe(0);
  });

  it('quantizes a constrained snapped angle toward the last safe value', async () => {
    const width = 300;
    const height = 100;
    const boundaryAngle = 16.6;
    const radians = (boundaryAngle * Math.PI) / 180;
    const boundarySpan = width * Math.cos(radians) + height * Math.sin(radians);
    const centerX = 500 - boundarySpan / 2;
    const wrapper = mountBox({
      modelValue: makeModel({ left: centerX - width / 2, top: 150, width, height }),
      active: true,
      rotatable: true,
      keyboardEnabled: true,
      keyboardStep: 90,
      limitAreaForParent: true,
      rotationSnapAngles: [90],
      rotationSnapThreshold: 10
    });

    await wrapper.get('.rotation-handle').trigger('keydown', { key: 'ArrowRight' });

    expect(wrapper.emitted('update:rotate')?.at(-1)?.[0]).toBe(16);
  });

  it('quantizes toward the safe side when recovering from an invalid start angle', async () => {
    const width = 300;
    const height = 100;
    const boundaryAngle = 16.6;
    const radians = (boundaryAngle * Math.PI) / 180;
    const boundarySpan = width * Math.cos(radians) + height * Math.sin(radians);
    const centerX = 500 - boundarySpan / 2;
    const wrapper = mountBox({
      modelValue: makeModel({ left: centerX - width / 2, top: 150, width, height }),
      active: true,
      rotatable: true,
      rotate: 17,
      keyboardEnabled: true,
      keyboardStep: 1,
      limitAreaForParent: true
    });

    await wrapper.get('.rotation-handle').trigger('keydown', { key: 'ArrowLeft' });

    expect(wrapper.emitted('update:rotate')?.at(-1)?.[0]).toBe(16);
  });

  it('cannot use rotation snapping to swing through a collision target', async () => {
    const wrapper = mountBox({
      modelValue: makeModel({ left: 0, top: 0, width: 100, height: 100 }),
      active: true,
      rotatable: true,
      keyboardEnabled: true,
      keyboardStep: 90,
      collisionEnabled: true,
      rotationSnapAngles: [90],
      snapTargets: [{ id: 'blocker', left: -60, top: 30, width: 40, height: 40 }]
    });
    await wrapper.get('.rotation-handle').trigger('keydown', { key: 'ArrowRight' });
    const value = wrapper.emitted('update:rotate')?.at(-1)?.[0] as number;
    // The rotated left vertex sweeps into the blocker around 45 degrees, so the snapped
    // 90-degree candidate is constrained along the path.
    expect(value).toBeLessThan(45);
    expect(value).toBeGreaterThan(0);
  });

  it('blocks drags with snapTargets when collisionTargets is omitted', async () => {
    const wrapper = mountBox({
      modelValue: makeModel({ left: 0, top: 0, width: 20, height: 20 }),
      collisionEnabled: true,
      snapTargets: [{ id: 'wall', left: 50, top: 0, width: 20, height: 20 }]
    });
    await pointerDrag(wrapper, [0, 0], [60, 0]);
    const update = wrapper.emitted('update:modelValue')?.at(-1)?.[0] as Record<string, number>;
    expect(update.left).toBe(30);
  });

  it('ignores all obstacles when collisionTargets is an empty array', async () => {
    const wrapper = mountBox({
      modelValue: makeModel({ left: 0, top: 0, width: 20, height: 20 }),
      collisionEnabled: true,
      snapTargets: [{ id: 'wall', left: 50, top: 0, width: 20, height: 20 }],
      collisionTargets: []
    });
    await pointerDrag(wrapper, [0, 0], [60, 0]);
    const update = wrapper.emitted('update:modelValue')?.at(-1)?.[0] as Record<string, number>;
    expect(update.left).toBe(60);
  });

  it('ignores invalid targets in precise collision mode instead of moving them to zero', async () => {
    const wrapper = mountBox({
      modelValue: makeModel({ left: 20, top: 0, width: 20, height: 20 }),
      collisionEnabled: true,
      collisionTargets: [{ id: 'invalid', left: 'invalid', top: 0, width: 20, height: 20 }]
    });

    await pointerDrag(wrapper, [0, 0], [-20, 0]);

    expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toMatchObject({ left: 0 });
    expect(wrapper.emitted('collision')).toBeFalsy();
  });

  it('uses explicit collisionTargets independently of snap targets', async () => {
    const wrapper = mountBox({
      modelValue: makeModel({ left: 0, top: 0, width: 20, height: 20 }),
      collisionEnabled: true,
      snapTargets: [{ id: 'snap-only', left: 50, top: 0, width: 20, height: 20 }],
      collisionTargets: [{ id: 'obstacle', left: 60, top: 50, width: 20, height: 20 }]
    });
    // The snap-only target no longer blocks horizontally.
    await pointerDrag(wrapper, [0, 0], [60, 0]);
    const update = wrapper.emitted('update:modelValue')?.at(-1)?.[0] as Record<string, number>;
    expect(update.left).toBe(60);
    // But the explicit obstacle still blocks vertically.
    await pointerDrag(wrapper, [0, 0], [0, 60]);
    const second = wrapper.emitted('update:modelValue')?.at(-1)?.[0] as Record<string, number>;
    expect(second.top).toBe(30);
  });

  it('resizes with a fixed world-space anchor in fixed-anchor mode', async () => {
    const wrapper = mountBox({
      modelValue: makeModel({ left: 10, top: 20, width: 100, height: 50 }),
      handles: ['br'],
      resizeDirections: ['br'],
      resizeMode: 'fixed-anchor'
    });
    await pointerDrag(wrapper, [110, 70], [150, 100], '.handle-br');
    const update = wrapper.emitted('update:modelValue')?.at(-1)?.[0] as Record<string, number>;
    // The top-left corner stays pinned while the box grows by the pointer delta.
    expect(update.left).toBe(10);
    expect(update.top).toBe(20);
    expect(update.width).toBe(140);
    expect(update.height).toBe(80);
  });

  it('resizes rotated boxes with a fixed anchor in fixed-anchor mode', async () => {
    const wrapper = mountBox({
      modelValue: makeModel({ left: 10, top: 20, width: 100, height: 50 }),
      rotate: 45,
      handles: ['mr'],
      resizeDirections: ['mr'],
      resizeMode: 'fixed-anchor'
    });
    const anchorBefore = localToWorld({ left: 10, top: 20, width: 100, height: 50 }, 45, 'center', {
      x: 0,
      y: 25
    });
    await pointerDrag(wrapper, [110, 45], [160, 45], '.handle-mr');
    const update = wrapper.emitted('update:modelValue')?.at(-1)?.[0] as Record<string, number>;
    // A 50px horizontal drag projects onto the rotated local x axis: width grows by
    // 50*cos(45) = 35.4 (rounded) while the height stays untouched.
    expect(update.width).toBe(135);
    expect(update.height).toBe(50);
    // The left edge midpoint anchor keeps its rotated world position.
    const anchorAfter = localToWorld(
      { left: update.left, top: update.top, width: update.width, height: update.height },
      45,
      'center',
      { x: 0, y: update.height / 2 }
    );
    expect(anchorAfter.x).toBeCloseTo(anchorBefore.x, 0);
    expect(anchorAfter.y).toBeCloseTo(anchorBefore.y, 0);
  });

  it('applies percent-unit size limits in fixed-anchor mode', async () => {
    const wrapper = mountBox({
      modelValue: makeModel({ left: 10, top: 20, width: 40, height: 50 }),
      unitType: '%',
      handles: ['br'],
      resizeDirections: ['br'],
      resizeMode: 'fixed-anchor',
      minWidth: 20
    });
    // Shrinking by 180px (-36%) hits the 20% (=100px of 500) minimum width; model-unit
    // values treated as px would have clamped at 20px = 4%.
    await pointerDrag(wrapper, [210, 70], [30, 30], '.handle-br');
    const update = wrapper.emitted('update:modelValue')?.at(-1)?.[0] as Record<string, number>;
    expect(update.width).toBe(20);
    expect(update.height).toBe(40);
    expect(update.left).toBe(10);
    expect(update.top).toBe(20);
  });

  it('applies percent-unit maximum height in fixed-anchor mode', async () => {
    const wrapper = mountBox({
      modelValue: makeModel({ left: 10, top: 20, width: 40, height: 50 }),
      unitType: '%',
      handles: ['br'],
      resizeDirections: ['br'],
      resizeMode: 'fixed-anchor',
      maxHeight: 80
    });
    // Growing 160px (+32%) hits the 80% (=320px of 400) maximum height.
    await pointerDrag(wrapper, [210, 70], [210, 230], '.handle-br');
    const update = wrapper.emitted('update:modelValue')?.at(-1)?.[0] as Record<string, number>;
    expect(update.height).toBe(80);
    expect(update.width).toBe(40);
    expect(update.left).toBe(10);
    expect(update.top).toBe(20);
  });

  it('keeps ratio-locked fixed-anchor output within conflicting maximum sizes', async () => {
    const wrapper = mountBox({
      modelValue: makeModel({ left: 10, top: 20, width: 100, height: 50 }),
      handles: ['br'],
      resizeDirections: ['br'],
      resizeMode: 'fixed-anchor',
      ratioLock: true,
      minHeight: 80,
      maxWidth: 100
    });

    await pointerDrag(wrapper, [110, 70], [210, 70], '.handle-br');
    const update = wrapper.emitted('update:modelValue')?.at(-1)?.[0] as Record<string, number>;

    expect(update).toMatchObject({ left: 10, top: 20, width: 100, height: 50 });
  });

  it('shrinks at the parent edge instead of moving the fixed anchor', async () => {
    const wrapper = mountBox({
      modelValue: makeModel({ left: 400, top: 100, width: 100, height: 50 }),
      handles: ['mr'],
      resizeDirections: ['mr'],
      resizeMode: 'fixed-anchor',
      limitAreaForParent: true
    });

    await pointerDrag(wrapper, [500, 125], [600, 125], '.handle-mr');
    const update = wrapper.emitted('update:modelValue')?.at(-1)?.[0] as Record<string, number>;

    expect(update).toMatchObject({ left: 400, top: 100, width: 100, height: 50 });
  });

  it('keeps a rotated non-center anchor while fitting to the parent boundary', async () => {
    const start = { left: 300, top: 100, width: 100, height: 50 };
    const wrapper = mountBox({
      modelValue: makeModel(start),
      rotate: 45,
      transformOrigin: 'left top',
      handles: ['mr'],
      resizeDirections: ['mr'],
      resizeMode: 'fixed-anchor',
      limitAreaForParent: true
    });
    const anchorBefore = localToWorld(start, 45, 'left top', { x: 0, y: 25 });

    await pointerDrag(wrapper, [400, 125], [700, 125], '.handle-mr');
    const update = wrapper.emitted('update:modelValue')?.at(-1)?.[0] as Record<string, number>;
    const result = {
      left: update.left,
      top: update.top,
      width: update.width,
      height: update.height
    };
    const anchorAfter = localToWorld(result, 45, 'left top', {
      x: 0,
      y: result.height / 2
    });
    const aabb = rotatedAABBAt(
      result,
      45,
      resolveTransformOrigin('left top', result.width, result.height)
    );

    expect(anchorAfter.x).toBeCloseTo(anchorBefore.x, 0);
    expect(anchorAfter.y).toBeCloseTo(anchorBefore.y, 0);
    expect(aabb.left).toBeGreaterThanOrEqual(-0.001);
    expect(aabb.left + aabb.width).toBeLessThanOrEqual(500.001);
  });

  it('keeps the fixed anchor when collision shortens a resize path', async () => {
    const wrapper = mountBox({
      modelValue: makeModel({ left: 0, top: 0, width: 50, height: 50 }),
      handles: ['mr'],
      resizeDirections: ['mr'],
      resizeMode: 'fixed-anchor',
      collisionEnabled: true,
      collisionTargets: [{ id: 'wall', left: 100, top: 0, width: 50, height: 50 }]
    });

    await pointerDrag(wrapper, [50, 25], [200, 25], '.handle-mr');
    const update = wrapper.emitted('update:modelValue')?.at(-1)?.[0] as Record<string, number>;

    expect(update.left).toBe(0);
    expect(update.width).toBe(100);
  });

  it('resizes a rotated fixed-anchor handle along its local keyboard axis', async () => {
    const wrapper = mountBox({
      modelValue: makeModel({ left: 100, top: 100, width: 100, height: 50 }),
      rotate: 90,
      active: true,
      keyboardEnabled: true,
      keyboardStep: 10,
      handles: ['mr'],
      resizeDirections: ['mr'],
      resizeMode: 'fixed-anchor'
    });
    const handle = wrapper.get('.handle-mr');
    await handle.trigger('focus');

    await handle.trigger('keydown', { key: 'ArrowRight' });

    const update = wrapper.emitted('update:modelValue')?.at(-1)?.[0] as Record<string, number>;
    const anchorBefore = localToWorld(
      { left: 100, top: 100, width: 100, height: 50 },
      90,
      'center',
      { x: 0, y: 25 }
    );
    const anchorAfter = localToWorld(
      { left: update.left, top: update.top, width: update.width, height: update.height },
      90,
      'center',
      { x: 0, y: update.height / 2 }
    );

    expect(update.width).toBe(110);
    expect(anchorAfter.x).toBeCloseTo(anchorBefore.x, 0);
    expect(anchorAfter.y).toBeCloseTo(anchorBefore.y, 0);
  });
});
