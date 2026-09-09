import { nextTick } from 'vue';
import { mount, type VueWrapper } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import MovableBox from './MovableBox.vue';

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
  | 'pointerdown'
  | 'pointermove'
  | 'pointerup'
  | 'pointercancel'
  | 'lostpointercapture';

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
    const dragUpdate = dragging.emitted('update:modelValue')?.at(-1)?.[0] as Record<
      string,
      number
    >;
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
        { axis: 'horizontal', gap: 75, targetIds: ['left-anchor', 'right-anchor'], guides: [50, 250] }
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
    document.documentElement.dispatchEvent(pointerEvent('pointerup', 0, 0));
  });

  it('emits snap again when the snapped coordinate changes', async () => {
    const wrapper = mountBox({
      modelValue: makeModel({ left: 8, top: 100, width: 20, height: 20 }),
      snapToElements: true,
      snapThreshold: 5,
      snapTargets: [{ id: 'target', left: 10, top: 300, width: 20, height: 20 }]
    });
    await wrapper.get('.auto-draggable').trigger('pointerdown', { clientX: 0, clientY: 0 });
    document.documentElement.dispatchEvent(
      pointerEvent('pointermove', 1, 0)
    );
    await flushFrame();
    expect(wrapper.emitted('snap')).toHaveLength(1);

    await wrapper.setProps({
      snapTargets: [{ id: 'target', left: 12, top: 300, width: 20, height: 20 }]
    });
    document.documentElement.dispatchEvent(
      pointerEvent('pointermove', 1, 0)
    );
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
    document.documentElement.dispatchEvent(
      pointerEvent('pointermove', 2, 2)
    );
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
    document.documentElement.dispatchEvent(
      pointerEvent('pointermove', 4, 0)
    );
    await flushFrame();
    document.documentElement.dispatchEvent(
      pointerEvent('pointermove', 6, 0)
    );
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

    await wrapper.get('.auto-draggable').trigger('keydown', { key: 'Escape' });
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

    await wrapper.get('.auto-draggable').trigger('keydown', { key: 'Escape' });
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
    expect(topLeft.attributes('aria-keyshortcuts')).toBe(
      'ArrowUp ArrowDown ArrowLeft ArrowRight'
    );

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
    document.documentElement.dispatchEvent(
      pointerEvent('pointermove', 40, 50, { pointerId: 1 })
    );
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
      document.documentElement.dispatchEvent(
        pointerEvent('pointermove', 100, 100)
      );
      await flushFrame();

      expect(wrapper.emitted('update:modelValue')).toBeFalsy();
      expect(wrapper.get('.auto-draggable').classes()).not.toContain('is-dragging');
    }
  );

  it('cancels an active interaction when the active prop becomes false', async () => {
    const wrapper = mountBox({ active: true });
    await wrapper.get('.auto-draggable').trigger('pointerdown', { clientX: 0, clientY: 0 });
    await wrapper.setProps({ active: false });
    document.documentElement.dispatchEvent(
      pointerEvent('pointermove', 100, 100)
    );
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

    await wrapper.get('.auto-draggable').trigger('keydown', { key: 'Escape' });
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
});
