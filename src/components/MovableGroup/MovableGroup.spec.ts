import { defineComponent, h, nextTick, ref } from 'vue';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import MovableBox from '../MovableBox/MovableBox.vue';
import MovableGroup from './MovableGroup.vue';
import type { ExtendsMovableBox, MovableBoxProps } from '../../types/MovableBox';

const flushFrame = () => new Promise(resolve => setTimeout(resolve, 0));

type TestRect = ExtendsMovableBox;

const makeRect = (overrides: Partial<TestRect> = {}): TestRect => ({
  left: 0,
  top: 0,
  width: 100,
  height: 50,
  zIndex: 1,
  ...overrides
});

const pointerEvent = (
  type: 'pointermove' | 'pointerup' | 'pointercancel',
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

interface GroupMountOptions {
  rects?: Record<string, TestRect>;
  selected?: string[];
  sharedBounds?: boolean;
  area?: { width: number; height: number };
  boxProps?: Record<string, Partial<MovableBoxProps>>;
}

interface GroupHostExpose {
  models: Record<string, TestRect>;
  selected: string[];
}

const mountGroup = (options: GroupMountOptions = {}) => {
  const {
    rects = {
      a: makeRect({ left: 0, top: 0 }),
      b: makeRect({ left: 150, top: 0 }),
      c: makeRect({ left: 300, top: 0 })
    },
    selected = ['a', 'b'],
    sharedBounds = true,
    area = { width: 600, height: 400 },
    boxProps = {}
  } = options;

  const models: Record<string, TestRect> = { ...rects };
  const selectedRef = ref<string[]>([...selected]);

  const Host = defineComponent({
    setup(_, { expose }) {
      expose({
        get models() {
          return models;
        },
        get selected() {
          return selectedRef.value;
        }
      } satisfies GroupHostExpose);
      return () =>
        h('div', { class: 'area' }, [
          h(
            MovableGroup,
            {
              selected: selectedRef.value,
              'onUpdate:selected': (ids: string[]) => {
                selectedRef.value = ids;
              },
              sharedBounds
            },
            {
              default: () =>
                Object.entries(models).map(([id, rect]) =>
                  h(MovableBox, {
                    ...(boxProps[id] ?? {}),
                    memberId: id,
                    modelValue: rect,
                    'onUpdate:modelValue': (value: TestRect) => {
                      models[id] = value;
                    },
                    limitAreaForParent: true,
                    draggable: true,
                    resizable: true
                  })
                )
            }
          )
        ]);
    }
  });

  const wrapper = mount(Host, { attachTo: document.body });
  const areaElement = wrapper.get('.area').element as HTMLElement;
  Object.defineProperty(areaElement, 'clientWidth', { configurable: true, value: area.width });
  Object.defineProperty(areaElement, 'clientHeight', { configurable: true, value: area.height });

  return {
    wrapper,
    models,
    selectedRef,
    group: wrapper.getComponent(MovableGroup),
    boxes: () => wrapper.findAll('.auto-draggable')
  };
};

const dragBox = async (
  harness: ReturnType<typeof mountGroup>,
  index: number,
  from: readonly [number, number],
  to: readonly [number, number],
  finish = true
) => {
  await harness.boxes()[index].trigger('pointerdown', {
    clientX: from[0],
    clientY: from[1],
    pointerId: 1
  });
  document.documentElement.dispatchEvent(pointerEvent('pointermove', to[0], to[1]));
  await flushFrame();
  if (finish) document.documentElement.dispatchEvent(pointerEvent('pointerup', to[0], to[1]));
  await nextTick();
};

describe('MovableGroup', () => {
  it('moves the whole selection with the leader and leaves unselected members in place', async () => {
    const harness = mountGroup();
    await dragBox(harness, 1, [200, 25], [260, 65]);

    expect(harness.models.b).toMatchObject({ left: 210, top: 40 });
    expect(harness.models.a).toMatchObject({ left: 60, top: 40 });
    expect(harness.models.c).toMatchObject({ left: 300, top: 0 });
    expect(harness.selectedRef.value).toEqual(['a', 'b']);

    const updateEmits = harness.wrapper
      .findAllComponents(MovableBox)
      .map(box => box.emitted('update:modelValue')?.length ?? 0);
    expect(updateEmits).toEqual([expect.any(Number), expect.any(Number), 0]);
  });

  it('ignores registered group members when snapping the leader', async () => {
    const harness = mountGroup({
      rects: {
        a: makeRect({ left: 100 }),
        b: makeRect({ left: 250 })
      },
      boxProps: {
        b: {
          snapToElements: true,
          snapTargets: [{ id: 'a', left: 100, top: 0, width: 100, height: 50 }]
        }
      }
    });

    await harness.boxes()[1].trigger('pointerdown', {
      clientX: 300,
      clientY: 25,
      pointerId: 1
    });
    document.documentElement.dispatchEvent(pointerEvent('pointermove', 260, 25));
    await flushFrame();
    document.documentElement.dispatchEvent(pointerEvent('pointermove', 240, 25));
    await flushFrame();
    document.documentElement.dispatchEvent(pointerEvent('pointerup', 240, 25));
    await nextTick();

    expect(harness.models.a).toMatchObject({ left: 40 });
    expect(harness.models.b).toMatchObject({ left: 190 });
  });

  it('ignores registered group members when resolving leader collisions', async () => {
    const harness = mountGroup({
      rects: {
        a: makeRect({ left: 100 }),
        b: makeRect({ left: 250 })
      },
      boxProps: {
        b: {
          collisionEnabled: true,
          snapTargets: [{ id: 'a', left: 100, top: 0, width: 100, height: 50 }]
        }
      }
    });

    await harness.boxes()[1].trigger('pointerdown', {
      clientX: 300,
      clientY: 25,
      pointerId: 1
    });
    document.documentElement.dispatchEvent(pointerEvent('pointermove', 260, 25));
    await flushFrame();
    document.documentElement.dispatchEvent(pointerEvent('pointermove', 200, 25));
    await flushFrame();
    document.documentElement.dispatchEvent(pointerEvent('pointerup', 200, 25));
    await nextTick();

    expect(harness.models.a).toMatchObject({ left: 0 });
    expect(harness.models.b).toMatchObject({ left: 150 });
  });

  it('replaces the selection when the leader is unselected', async () => {
    const harness = mountGroup();
    await dragBox(harness, 2, [350, 25], [380, 25]);

    expect(harness.selectedRef.value).toEqual(['c']);
    expect(harness.models.c).toMatchObject({ left: 330, top: 0 });
    expect(harness.models.a).toMatchObject({ left: 0, top: 0 });
    expect(harness.models.b).toMatchObject({ left: 150, top: 0 });
    const start = harness.group.emitted('move-start')?.at(-1)?.[0] as {
      rects: { id: string }[];
    };
    const stop = harness.group.emitted('move-stop')?.at(-1)?.[0] as {
      rects: { id: string }[];
    };
    expect(start.rects.map(record => record.id)).toEqual(['c']);
    expect(stop.rects.map(record => record.id)).toEqual(['c']);
  });

  it('emits immutable batch payloads during and after the move', async () => {
    const harness = mountGroup();
    await dragBox(harness, 1, [200, 25], [240, 45]);

    const move = harness.group.emitted('move')?.at(-1)?.[0] as {
      leaderId: string;
      rects: { id: string; rect: TestRect }[];
    };
    expect(move.leaderId).toBe('b');
    expect(move.rects).toEqual([
      { id: 'a', rect: expect.objectContaining({ left: 40, top: 20 }) },
      { id: 'b', rect: expect.objectContaining({ left: 190, top: 20 }) }
    ]);

    const stop = harness.group.emitted('move-stop')?.at(-1)?.[0] as {
      leaderId: string;
      rects: { id: string; rect: TestRect; startRect: TestRect }[];
    };
    expect(stop.leaderId).toBe('b');
    expect(stop.rects).toEqual([
      {
        id: 'a',
        rect: expect.objectContaining({ left: 40, top: 20 }),
        startRect: expect.objectContaining({ left: 0, top: 0 })
      },
      {
        id: 'b',
        rect: expect.objectContaining({ left: 190, top: 20 }),
        startRect: expect.objectContaining({ left: 150, top: 0 })
      }
    ]);

    for (const record of stop.rects) {
      expect(record.rect).not.toBe(record.startRect);
      expect(record.startRect).not.toBe(harness.models[record.id]);
    }
  });

  it('stops the whole formation at the shared bounds edge', async () => {
    const harness = mountGroup();
    // Union starts at left 0, so no leftward movement is possible for any member.
    await dragBox(harness, 1, [200, 25], [80, 25]);
    expect(harness.models.a).toMatchObject({ left: 0, top: 0 });
    expect(harness.models.b).toMatchObject({ left: 150, top: 0 });

    // Union right edge is 250; a +350 delta lands the union exactly on the area's right edge.
    await dragBox(harness, 1, [200, 25], [550, 25]);
    expect(harness.models.a).toMatchObject({ left: 350, top: 0 });
    expect(harness.models.b).toMatchObject({ left: 500, top: 0 });
  });

  it('clamps members individually when sharedBounds is off', async () => {
    const harness = mountGroup({ sharedBounds: false });
    // Member a starts at left 0; dragging the leader left by 80 would push a to -80.
    await dragBox(harness, 1, [200, 25], [120, 25]);
    expect(harness.models.a).toMatchObject({ left: 0, top: 0 });
    // The leader keeps its own (interaction-clamped) movement.
    expect(harness.models.b).toMatchObject({ left: 70, top: 0 });
  });

  it('uses each member bounds when sharedBounds is off', async () => {
    const harness = mountGroup({
      rects: {
        a: makeRect({ left: 100 }),
        b: makeRect({ left: 250 })
      },
      sharedBounds: false,
      boxProps: {
        a: { boundsMargin: { left: 100 } }
      }
    });

    await dragBox(harness, 1, [300, 25], [220, 25]);

    expect(harness.models.a).toMatchObject({ left: 100 });
    expect(harness.models.b).toMatchObject({ left: 170 });
  });

  it('ignores a second concurrent leader instead of hijacking the active session', async () => {
    const harness = mountGroup();
    // Start dragging b (opens the group session)...
    await harness.boxes()[1].trigger('pointerdown', {
      clientX: 200,
      clientY: 25,
      pointerId: 2
    });
    document.documentElement.dispatchEvent(pointerEvent('pointermove', 240, 45, { pointerId: 2 }));
    await flushFrame();
    // ...then a second pointer tries to drag c mid-session.
    await harness.boxes()[2].trigger('pointerdown', {
      clientX: 350,
      clientY: 25,
      pointerId: 7
    });
    document.documentElement.dispatchEvent(pointerEvent('pointermove', 420, 25, { pointerId: 7 }));
    await flushFrame();
    document.documentElement.dispatchEvent(pointerEvent('pointerup', 420, 25, { pointerId: 7 }));
    document.documentElement.dispatchEvent(pointerEvent('pointerup', 240, 45, { pointerId: 2 }));
    await nextTick();

    // c moved solo (its group beginDrag was ignored) and the b-formation stayed intact.
    expect(harness.models.c).toMatchObject({ left: 370, top: 0 });
    expect(harness.models.a).toMatchObject({ left: 40, top: 20 });
    expect(harness.models.b).toMatchObject({ left: 190, top: 20 });
    expect(harness.selectedRef.value).toEqual(['a', 'b']);
  });

  it('does not let a second selected member reuse the active leader session', async () => {
    const harness = mountGroup();
    await harness.boxes()[1].trigger('pointerdown', {
      clientX: 200,
      clientY: 25,
      pointerId: 2
    });
    document.documentElement.dispatchEvent(pointerEvent('pointermove', 240, 45, { pointerId: 2 }));
    await flushFrame();

    await harness.boxes()[0].trigger('pointerdown', {
      clientX: 40,
      clientY: 20,
      pointerId: 7
    });
    document.documentElement.dispatchEvent(pointerEvent('pointermove', 110, 20, { pointerId: 7 }));
    await flushFrame();
    document.documentElement.dispatchEvent(pointerEvent('pointerup', 110, 20, { pointerId: 7 }));
    document.documentElement.dispatchEvent(pointerEvent('pointerup', 240, 45, { pointerId: 2 }));
    await nextTick();

    expect(harness.models.a).toMatchObject({ left: 40, top: 20 });
    expect(harness.models.b).toMatchObject({ left: 190, top: 20 });
    expect(harness.wrapper.findAllComponents(MovableBox)[0].emitted('drag-start')).toBeUndefined();
    expect(harness.group.emitted('move-start')).toHaveLength(1);
    expect(harness.group.emitted('move-stop')).toHaveLength(1);
  });

  it('restores every member when the leader interaction is cancelled', async () => {
    const harness = mountGroup();
    await harness.boxes()[1].trigger('pointerdown', {
      clientX: 200,
      clientY: 25,
      pointerId: 1
    });
    document.documentElement.dispatchEvent(pointerEvent('pointermove', 260, 65));
    await flushFrame();
    document.documentElement.dispatchEvent(pointerEvent('pointercancel', 260, 65));
    await nextTick();

    expect(harness.models.a).toMatchObject({ left: 0, top: 0 });
    expect(harness.models.b).toMatchObject({ left: 150, top: 0 });

    const cancel = harness.group.emitted('move-cancel')?.at(-1)?.[0] as {
      leaderId: string;
      rects: { id: string; rect: TestRect; startRect: TestRect }[];
    };
    expect(cancel.leaderId).toBe('b');
    for (const record of cancel.rects) {
      expect(record.rect).toEqual(record.startRect);
    }
    expect(harness.group.emitted('move-stop')).toBeUndefined();
  });

  it('does not open a group session for resize interactions', async () => {
    const harness = mountGroup();
    const handle = harness.boxes()[1].get('.handle-br');
    await handle.trigger('pointerdown', { clientX: 246, clientY: 46, pointerId: 1 });
    document.documentElement.dispatchEvent(pointerEvent('pointermove', 266, 66));
    await flushFrame();
    document.documentElement.dispatchEvent(pointerEvent('pointerup', 266, 66));
    await nextTick();

    expect(harness.group.emitted('move-start')).toBeUndefined();
    expect(harness.models.a).toMatchObject({ left: 0, top: 0 });
    expect(harness.models.b?.width).toBeGreaterThan(100);
  });

  it('exposes selection helpers and registered member rectangles', async () => {
    const harness = mountGroup();
    const groupExpose = (
      harness.group.vm.$ as unknown as {
        exposed: {
          getSelected: () => string[];
          select: (ids?: string[]) => void;
          getMemberRects: () => { id: string }[];
        };
      }
    ).exposed;

    expect(groupExpose.getSelected()).toEqual(['a', 'b']);
    expect(groupExpose.getMemberRects().map(member => member.id)).toEqual(['a', 'b', 'c']);

    groupExpose.select(['c']);
    expect(harness.selectedRef.value).toEqual(['c']);
    groupExpose.select();
    expect(harness.selectedRef.value).toEqual(['a', 'b', 'c']);
  });

  it('cleans up the session when the host unmounts mid-drag', async () => {
    const harness = mountGroup();
    await harness.boxes()[1].trigger('pointerdown', {
      clientX: 200,
      clientY: 25,
      pointerId: 1
    });
    document.documentElement.dispatchEvent(pointerEvent('pointermove', 240, 45));
    await flushFrame();

    harness.wrapper.unmount();
    expect(harness.group.emitted('move-stop')).toBeUndefined();
  });
});
