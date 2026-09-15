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
  groupCollision?: 'leader' | 'all';
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
    groupCollision = 'leader',
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
              sharedBounds,
              groupCollision
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
  it('moves the whole selection with the leader', async () => {
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

  it('refreshes follower bounds when the container resizes between group drags', async () => {
    const harness = mountGroup({
      rects: {
        a: makeRect({ left: 150, top: 0 }),
        b: makeRect({ left: 0, top: 0 })
      },
      selected: ['a', 'b'],
      sharedBounds: false
    });

    // Prime both members' cached area snapshots at the original 600px width.
    await dragBox(harness, 1, [50, 25], [50, 25]);
    const areaElement = harness.wrapper.get('.area').element as HTMLElement;
    Object.defineProperty(areaElement, 'clientWidth', { configurable: true, value: 300 });

    await dragBox(harness, 1, [50, 25], [250, 25]);

    // The leader stops at left 200 and the follower must independently stop at the same
    // current edge, rather than using the previous 600px area and moving to left 350.
    expect(harness.models.b).toMatchObject({ left: 200, top: 0 });
    expect(harness.models.a).toMatchObject({ left: 200, top: 0 });
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

  // --- v3.2.0: rotated member bounds use the visual (AABB) contour ---

  it('clamps shared-bounds movement to the union of rotated member visuals', async () => {
    // Roadmap case: a 100x100 member rotated 45 degrees has a 141.4px visual width, so
    // the formation must stop before that contour leaves the 600px area.
    const harness = mountGroup({
      rects: {
        a: makeRect({ left: 0, top: 0, width: 100, height: 50 }),
        b: makeRect({ left: 50, top: 100, width: 100, height: 100 })
      },
      selected: ['a', 'b'],
      boxProps: {
        b: { rotate: 45 }
      }
    });
    await dragBox(harness, 1, [100, 150], [550, 150]);

    const visualRight = Number(harness.models.b.left) + 120.71;
    expect(visualRight).toBeLessThanOrEqual(600.01);
    expect(harness.models.b.left).toBeCloseTo(479.29, 0);
    // Shared bounds keep member relative positions.
    expect(harness.models.a.left).toBeCloseTo(429.29, 0);
  });

  it('clamps each rotated member to its own visual contour without shared bounds', async () => {
    const harness = mountGroup({
      rects: {
        a: makeRect({ left: 0, top: 0, width: 100, height: 50 }),
        b: makeRect({ left: 50, top: 100, width: 100, height: 100 })
      },
      selected: ['a', 'b'],
      sharedBounds: false,
      boxProps: {
        b: { rotate: 45 }
      }
    });
    await dragBox(harness, 1, [100, 150], [650, 150]);

    // The rotated member stops on its own visual contour; the unrotated leader stops at
    // the same delta because its own box-level edge (rotated probe width) binds first.
    expect(Number(harness.models.b.left) + 120.71).toBeLessThanOrEqual(600.01);
    expect(harness.models.b.left).toBeCloseTo(479.29, 0);
    expect(harness.models.a.left).toBeCloseTo(429, 0);
  });

  // --- v3.4.0: group-wide collision (FEAT-34-01) ---

  it('lets follower members pass through obstacles in leader collision mode', async () => {
    const harness = mountGroup({
      rects: {
        a: makeRect({ left: 0, top: 0 }),
        b: makeRect({ left: 200, top: 0 })
      },
      selected: ['a', 'b'],
      groupCollision: 'leader',
      boxProps: {
        a: {
          collisionEnabled: true,
          snapTargets: [{ id: 'wall', left: 350, top: 0, width: 50, height: 50 }]
        },
        b: {
          collisionEnabled: true,
          snapTargets: [{ id: 'wall', left: 350, top: 0, width: 50, height: 50 }]
        }
      }
    });
    await dragBox(harness, 0, [50, 25], [250, 25]);
    // Only the leader resolves its own collisions (the wall is beyond its own path);
    // member b tunnels through the wall with the shared delta.
    expect(harness.models.a.left).toBe(200);
    expect(harness.models.b.left).toBe(400);
  });

  it('limits the shared displacement to the earliest follower contact in all mode', async () => {
    const harness = mountGroup({
      rects: {
        a: makeRect({ left: 0, top: 0 }),
        b: makeRect({ left: 200, top: 0 })
      },
      selected: ['a', 'b'],
      groupCollision: 'all',
      boxProps: {
        a: {
          collisionEnabled: true,
          snapTargets: [{ id: 'wall', left: 350, top: 0, width: 50, height: 50 }]
        },
        b: {
          collisionEnabled: true,
          snapTargets: [{ id: 'wall', left: 350, top: 0, width: 50, height: 50 }]
        }
      }
    });
    await dragBox(harness, 0, [50, 25], [250, 25]);

    // The shared delta shrinks to the earliest contact: member b's right edge reaches the
    // wall (delta 50), and the whole formation stops together.
    expect(harness.models.b.left).toBe(250);
    expect(harness.models.a.left).toBe(50);
  });

  it('holds the earliest contact across consecutive frames without bouncing', async () => {
    // Regression: the shared-delta sweep once referenced the member's current rectangle,
    // so the second frame swept from the contact position and snapped the group back to
    // its start every other frame.
    const harness = mountGroup({
      rects: {
        a: makeRect({ left: 0, top: 0 }),
        b: makeRect({ left: 200, top: 0 })
      },
      selected: ['a', 'b'],
      groupCollision: 'all',
      boxProps: {
        a: {
          collisionEnabled: true,
          snapTargets: [{ id: 'wall', left: 350, top: 0, width: 50, height: 50 }]
        },
        b: {
          collisionEnabled: true,
          snapTargets: [{ id: 'wall', left: 350, top: 0, width: 50, height: 50 }]
        }
      }
    });
    await harness.boxes()[0].trigger('pointerdown', { clientX: 50, clientY: 25, pointerId: 1 });

    // Frame 1: delta 100. Member b reaches the wall (progress 0.5): both stop at +50.
    document.documentElement.dispatchEvent(pointerEvent('pointermove', 150, 25));
    await flushFrame();
    expect(harness.models.a.left).toBe(50);
    expect(harness.models.b.left).toBe(250);

    // Frame 2: total delta 350 from the drag start. The contact fraction (50/350) keeps
    // the formation at the same spot instead of bouncing back to the start.
    document.documentElement.dispatchEvent(pointerEvent('pointermove', 400, 25));
    await flushFrame();
    expect(harness.models.a.left).toBe(50);
    expect(harness.models.b.left).toBe(250);

    document.documentElement.dispatchEvent(pointerEvent('pointerup', 400, 25));
    await nextTick();
  });

  it('keeps members mutually excluded while resolving group-wide collisions', async () => {
    // Member b's target list includes member a; group filtering must keep the formation
    // from self-blocking in 'all' mode.
    const harness = mountGroup({
      rects: {
        a: makeRect({ left: 0, top: 0 }),
        b: makeRect({ left: 150, top: 0 })
      },
      selected: ['a', 'b'],
      groupCollision: 'all',
      boxProps: {
        a: {
          collisionEnabled: true,
          snapTargets: [{ id: 'a', left: 0, top: 0, width: 100, height: 50 }]
        },
        b: {
          collisionEnabled: true,
          snapTargets: [{ id: 'a', left: 0, top: 0, width: 100, height: 50 }]
        }
      }
    });
    await dragBox(harness, 0, [50, 25], [120, 25]);
    expect(harness.models.a.left).toBe(70);
    expect(harness.models.b.left).toBe(220);
  });

  it('blocks a group escape that trades an overlap for a new collision in all mode', async () => {
    // Regression: the follower escape rule compared overlap totals only, so a shared
    // delta that fully escaped one obstacle while pressing into a previously separated
    // obstacle was accepted because the total decreased.
    const wallTargets = [
      { id: 'wall1', left: 250, top: 0, width: 50, height: 50 },
      { id: 'wall2', left: 375, top: 0, width: 25, height: 50 }
    ];
    const harness = mountGroup({
      rects: {
        a: makeRect({ left: 0, top: 0 }),
        b: makeRect({ left: 200, top: 0 })
      },
      selected: ['a', 'b'],
      groupCollision: 'all',
      boxProps: {
        a: { collisionEnabled: true, snapTargets: wallTargets },
        b: { collisionEnabled: true, snapTargets: wallTargets }
      }
    });
    await dragBox(harness, 0, [50, 25], [150, 25]);

    // Member b starts inside wall1 (2500px²). The +100 delta would leave wall1 entirely
    // but enter wall2 (1250px²) — a new collision under the per-target escape rule, so
    // the shared delta is rejected wholesale instead of being applied.
    expect(harness.models.a.left).toBe(0);
    expect(harness.models.b.left).toBe(200);
  });

  it('stops a precise-mode escape at the first wall the follower would cross', async () => {
    // Regression: the precise escape rule compared endpoints only, so a follower
    // starting inside one obstacle could carry the whole formation across a separated
    // wall whenever a single frame landed the pointer clear on the far side.
    const walls = [
      { id: 'start', left: 250, top: 0, width: 100, height: 50 },
      { id: 'far', left: 450, top: 0, width: 25, height: 50 }
    ];
    const harness = mountGroup({
      rects: { a: makeRect({ left: 0, top: 100 }), b: makeRect({ left: 200, top: 0 }) },
      selected: ['a', 'b'],
      groupCollision: 'all',
      boxProps: {
        a: { collisionEnabled: true, snapTargets: walls },
        b: { collisionEnabled: true, snapTargets: walls }
      }
    });
    // b (200..300) starts inside `start` (250..350); the +300 delta lands it at 500..600,
    // clear of both walls but straight through `far` (450..475). The shared delta must
    // stop at the contact fraction (150/300) instead of jumping the wall in one frame.
    await dragBox(harness, 0, [50, 125], [350, 125]);
    expect(harness.models.a.left).toBe(150);
    expect(harness.models.b.left).toBe(350);
  });

  it('refuses a precise-mode escape whose contact would deepen a follower overlap', async () => {
    // b (200..300) starts inside `start` (250..350) by 50px; the +300 delta exits both
    // walls, but the first contact with `far` (325..350) happens while b is deeper
    // inside `start` than it began. The clamped contact would deepen the penetration,
    // so the shared delta is refused instead of materializing the deeper state.
    const walls = [
      { id: 'start', left: 250, top: 0, width: 100, height: 50 },
      { id: 'far', left: 325, top: 0, width: 25, height: 50 }
    ];
    const harness = mountGroup({
      rects: { a: makeRect({ left: 0, top: 100 }), b: makeRect({ left: 200, top: 0 }) },
      selected: ['a', 'b'],
      groupCollision: 'all',
      boxProps: {
        a: { collisionEnabled: true, snapTargets: walls },
        b: { collisionEnabled: true, snapTargets: walls }
      }
    });
    await dragBox(harness, 0, [50, 125], [350, 125]);
    expect(harness.models.a.left).toBe(0);
    expect(harness.models.b.left).toBe(200);
  });

  it('revalidates the min-mixed landing of an overlapped follower in all mode', async () => {
    // Regression: `limitDeltaByMembers` takes the min of each follower's own safe
    // progress, so a start-overlapped follower that is not the limiter lands on an
    // interior path point its own validation never saw. Here b (90..190) starts inside
    // `startB` (180..280) by 10px; its own wall contact (d=270 of 400) is clear, but c
    // limits the shared delta to d=30 — inside b's deepening window (overlap grows to
    // 40px). The final landing must be revalidated and the deeper state refused.
    const walls = [
      { id: 'startB', left: 180, top: 0, width: 100, height: 50 },
      { id: 'wallB', left: 460, top: 0, width: 20, height: 50 },
      { id: 'wallC', left: 130, top: 100, width: 30, height: 50 }
    ];
    const harness = mountGroup({
      rects: {
        a: makeRect({ left: 0, top: 200 }),
        b: makeRect({ left: 90, top: 0 }),
        c: makeRect({ left: 0, top: 100 })
      },
      selected: ['a', 'b', 'c'],
      groupCollision: 'all',
      boxProps: {
        a: { collisionEnabled: true, snapTargets: walls },
        b: { collisionEnabled: true, snapTargets: walls },
        c: { collisionEnabled: true, snapTargets: walls }
      }
    });
    await dragBox(harness, 0, [50, 225], [450, 225]);
    // Without the landing revalidation the formation moves +30 and b deepens to 2000px².
    expect(harness.models.a.left).toBe(0);
    expect(harness.models.b.left).toBe(90);
    expect(harness.models.c.left).toBe(0);
  });

  it('lets an aabb-mode follower escape an obstacle it starts inside', async () => {
    // Regression: the aabb branch fed the start-overlapping follower to the path
    // interval, whose entry clamps to 0 there, so every shared delta collapsed to zero
    // and the formation could not move in any direction for the whole gesture.
    const wall = [{ id: 'wall', left: 350, top: 0, width: 100, height: 50 }];
    const harness = mountGroup({
      rects: { a: makeRect({ left: 100, top: 0 }), b: makeRect({ left: 300, top: 0 }) },
      selected: ['a', 'b'],
      groupCollision: 'all',
      boxProps: {
        a: { collisionEnabled: true, collisionMode: 'aabb', snapTargets: wall },
        b: { collisionEnabled: true, collisionMode: 'aabb', snapTargets: wall }
      }
    });
    // b (300..400) overlaps the wall (350..450) by 50px; moving left 60 separates it.
    await dragBox(harness, 0, [150, 25], [90, 25]);
    expect(harness.models.a.left).toBe(40);
    expect(harness.models.b.left).toBe(240);
  });

  it('keeps rejecting an aabb-mode shared delta that deepens a follower overlap', async () => {
    const wall = [{ id: 'wall', left: 350, top: 0, width: 100, height: 50 }];
    const harness = mountGroup({
      rects: { a: makeRect({ left: 100, top: 0 }), b: makeRect({ left: 300, top: 0 }) },
      selected: ['a', 'b'],
      groupCollision: 'all',
      boxProps: {
        a: { collisionEnabled: true, collisionMode: 'aabb', snapTargets: wall },
        b: { collisionEnabled: true, collisionMode: 'aabb', snapTargets: wall }
      }
    });
    // Moving right 20 grows b's overlap from 50px to 70px wide: not an escape.
    await dragBox(harness, 0, [150, 25], [170, 25]);
    expect(harness.models.a.left).toBe(100);
    expect(harness.models.b.left).toBe(300);
  });

  it('probes the rotated contour of an aabb-mode follower like its own pipeline', async () => {
    // b is a 100x50 box rotated 90 degrees about its center: its visual AABB spans
    // 225..275 horizontally (not the model's 200..300), so it reaches a wall at 400 only
    // after 125px of travel; the unrotated model would have stopped 25px earlier.
    const wall = [{ id: 'wall', left: 400, top: 0, width: 50, height: 200 }];
    const harness = mountGroup({
      rects: { a: makeRect({ left: 0, top: 100 }), b: makeRect({ left: 200, top: 100 }) },
      selected: ['a', 'b'],
      groupCollision: 'all',
      boxProps: {
        a: { collisionEnabled: true, collisionMode: 'aabb', snapTargets: wall },
        b: { collisionEnabled: true, collisionMode: 'aabb', snapTargets: wall, rotate: 90 }
      }
    });
    await dragBox(harness, 0, [50, 125], [250, 125]);
    expect(harness.models.b.left).toBe(325);
    expect(harness.models.a.left).toBe(125);
  });

  it('clamps a follower to its own bounds before sweeping it for collisions', async () => {
    // b's straight (+120, +60) path clears the sliver at (585..595, 78..80), but its own
    // bounds clamp slides the endpoint from 600 back to 580 — straight into the sliver
    // when the clamp runs after the sweep. Clamping first sweeps b along the (+100, +60)
    // delta it can actually travel and stops it at the contact instead.
    const wall = [{ id: 'wall', left: 585, top: 78, width: 10, height: 2 }];
    const harness = mountGroup({
      rects: {
        a: makeRect({ left: 0, top: 0 }),
        b: makeRect({ left: 480, top: 0, width: 20, height: 20 })
      },
      selected: ['a', 'b'],
      sharedBounds: false,
      groupCollision: 'all',
      boxProps: {
        a: { collisionEnabled: true, snapTargets: wall },
        b: { collisionEnabled: true, snapTargets: wall }
      }
    });
    await dragBox(harness, 0, [50, 25], [170, 85]);
    expect(harness.models.a).toMatchObject({ left: 120, top: 60 });
    // Contact along the clamped delta: bottom edge 20 + 60t = 78 → t ≈ 0.9667.
    expect(harness.models.b.left).toBeCloseTo(576.67, 1);
    expect(harness.models.b.top).toBeCloseTo(58, 1);
    const b = harness.models.b;
    const overlapsWall =
      (b.left as number) < 595 && (b.left as number) + 20 > 585 && (b.top as number) + 20 > 78;
    expect(overlapsWall).toBe(false);
  });

  it('re-sweeps the leader from its start when the formation flattens its delta', async () => {
    // The leader's own pipeline validated the diagonal (+200, +100), which passes above the
    // block at (250..270, 30..40). The union bounds clamp the shared delta to (+200, +20)
    // (b's bottom edge sits 20px from the area's bottom), and that flatter start-based
    // line runs straight into the block at t = 0.75. Without the leader re-sweep, a would
    // be placed at (200, 20) inside it.
    const block = [{ id: 'block', left: 250, top: 30, width: 20, height: 10 }];
    const harness = mountGroup({
      rects: { a: makeRect({ left: 0, top: 0 }), b: makeRect({ left: 300, top: 330 }) },
      selected: ['a', 'b'],
      boxProps: { a: { collisionEnabled: true, snapTargets: block } }
    });
    await dragBox(harness, 0, [50, 25], [250, 125]);
    expect(harness.models.a.left).toBeCloseTo(150, 2);
    expect(harness.models.a.top).toBeCloseTo(15, 2);
    expect(harness.models.b.left).toBeCloseTo(450, 2);
    expect(harness.models.b.top).toBeCloseTo(345, 2);
  });

  it('refuses the leader’s own keyboard nudge while its pointer drag runs', async () => {
    const harness = mountGroup({ boxProps: { b: { keyboardEnabled: true, active: true } } });
    await harness.boxes()[1].trigger('pointerdown', {
      clientX: 200,
      clientY: 25,
      pointerId: 2
    });
    document.documentElement.dispatchEvent(pointerEvent('pointermove', 240, 45, { pointerId: 2 }));
    await flushFrame();
    expect(harness.models.b).toMatchObject({ left: 190, top: 20 });

    // The leader is mid-interaction, so the ordinary keyboard guard (no keyboard while a
    // pointer gesture runs) refuses the nudge before any group arbitration; the formation
    // must stay exactly where the last pointer frame left it.
    await harness.boxes()[1].trigger('keydown', { key: 'ArrowRight' });
    expect(harness.models.b).toMatchObject({ left: 190, top: 20 });
    expect(harness.models.a).toMatchObject({ left: 40, top: 20 });
    document.documentElement.dispatchEvent(pointerEvent('pointerup', 240, 45, { pointerId: 2 }));
    await nextTick();
  });
});

// --- v3.5.1 review fixes: unmount cleanup, session arbitration, lazy area snapshots ---

const mountDynamicGroup = (options: {
  rects: Record<string, TestRect>;
  selected: string[];
  area?: { width: number; height: number };
}) => {
  const { rects, selected, area = { width: 600, height: 400 } } = options;
  const models: Record<string, TestRect> = { ...rects };
  const selectedRef = ref<string[]>([...selected]);
  const hiddenIds = ref<string[]>([]);

  const Host = defineComponent({
    setup(_, { expose }) {
      expose({ models, selectedRef, hiddenIds });
      return () =>
        h('div', { class: 'area' }, [
          h(
            MovableGroup,
            {
              selected: selectedRef.value,
              'onUpdate:selected': (ids: string[]) => {
                selectedRef.value = ids;
              }
            },
            {
              default: () =>
                Object.entries(models)
                  .filter(([id]) => !hiddenIds.value.includes(id))
                  .map(([id, rect]) =>
                    h(MovableBox, {
                      key: id,
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
    hiddenIds,
    group: wrapper.getComponent(MovableGroup),
    boxes: () => wrapper.findAll('.auto-draggable')
  };
};

describe('MovableGroup session integrity', () => {
  it('drops the leader from the selection when it unmounts mid-drag', async () => {
    const harness = mountDynamicGroup({
      rects: { a: makeRect({ left: 0, top: 0 }), b: makeRect({ left: 150, top: 0 }) },
      selected: ['a', 'b']
    });
    await harness.boxes()[1].trigger('pointerdown', {
      clientX: 200,
      clientY: 25,
      pointerId: 1
    });
    document.documentElement.dispatchEvent(pointerEvent('pointermove', 240, 45));
    await flushFrame();

    harness.hiddenIds.value = ['b'];
    await nextTick();

    // The leader's unmount closes the session, and its id must leave the selection
    // instead of lingering as a dead entry in later payloads.
    expect(harness.selectedRef.value).toEqual(['a']);
    expect(harness.group.emitted('update:selected')?.at(-1)?.[0]).toEqual(['a']);
    expect(harness.group.emitted('move-stop')).toBeUndefined();
    expect(harness.models.a).toMatchObject({ left: 40, top: 20 });
    // A dissolved session still terminates the move-start it opened: consumers that
    // locked UI on move-start need the cancel, with members left where they are.
    const cancel = harness.group.emitted('move-cancel')?.at(-1)?.[0] as {
      leaderId: string;
      source: Event | null;
      rects: { id: string; rect: TestRect; startRect: TestRect }[];
    };
    expect(cancel.leaderId).toBe('b');
    expect(cancel.source).toBeNull();
    expect(cancel.rects.map(record => record.id)).toEqual(['a', 'b']);
    expect(cancel.rects[0].rect).toMatchObject({ left: 40, top: 20 });
    expect(cancel.rects[0].startRect).toMatchObject({ left: 0, top: 0 });
  });

  it('emits move-cancel when the leader is force-aborted mid-drag', async () => {
    const disabled = ref(false);
    const models: Record<string, TestRect> = {
      a: makeRect({ left: 0, top: 0 }),
      b: makeRect({ left: 150, top: 0 })
    };
    const Host = defineComponent({
      setup() {
        return () =>
          h('div', { class: 'area' }, [
            h(MovableGroup, { selected: ['a', 'b'] }, {
              default: () =>
                (['a', 'b'] as const).map(id =>
                  h(MovableBox, {
                    key: id,
                    memberId: id,
                    modelValue: models[id],
                    'onUpdate:modelValue': (value: TestRect) => {
                      models[id] = value;
                    },
                    disabled: id === 'b' ? disabled.value : false,
                    limitAreaForParent: true,
                    draggable: true
                  })
                )
            })
          ]);
      }
    });
    const wrapper = mount(Host, { attachTo: document.body });
    const areaElement = wrapper.get('.area').element as HTMLElement;
    Object.defineProperty(areaElement, 'clientWidth', { configurable: true, value: 600 });
    Object.defineProperty(areaElement, 'clientHeight', { configurable: true, value: 400 });
    const group = wrapper.getComponent(MovableGroup);
    await wrapper.findAll('.auto-draggable')[1].trigger('pointerdown', {
      clientX: 200,
      clientY: 25,
      pointerId: 1
    });
    document.documentElement.dispatchEvent(pointerEvent('pointermove', 240, 45));
    await flushFrame();

    disabled.value = true;
    await nextTick();

    const cancel = group.emitted('move-cancel')?.at(-1)?.[0] as {
      leaderId: string;
      source: Event | null;
      rects: { id: string }[];
    };
    expect(cancel.leaderId).toBe('b');
    expect(cancel.source).toBeNull();
    expect(cancel.rects.map(record => record.id)).toEqual(['a', 'b']);
    expect(group.emitted('move-stop')).toBeUndefined();
    // Later pointer frames no longer move the formation.
    document.documentElement.dispatchEvent(pointerEvent('pointermove', 300, 100));
    await flushFrame();
    expect(models.a).toMatchObject({ left: 40, top: 20 });
    document.documentElement.dispatchEvent(pointerEvent('pointerup', 300, 100));
    await nextTick();
    wrapper.unmount();
  });

  it('emits move-cancel when the leader flips initRect mid-drag', async () => {
    // `initRect` runs the same force-abort watcher as `disabled`, but through a
    // sync-flushed watcher path of its own; the session must still dissolve with a
    // move-cancel payload instead of hanging mid-gesture.
    const locked = ref(false);
    const models: Record<string, TestRect> = {
      a: makeRect({ left: 0, top: 0 }),
      b: makeRect({ left: 150, top: 0 })
    };
    const Host = defineComponent({
      setup() {
        return () =>
          h('div', { class: 'area' }, [
            h(MovableGroup, { selected: ['a', 'b'] }, {
              default: () =>
                (['a', 'b'] as const).map(id =>
                  h(MovableBox, {
                    key: id,
                    memberId: id,
                    modelValue: models[id],
                    'onUpdate:modelValue': (value: TestRect) => {
                      models[id] = value;
                    },
                    initRect: id === 'b' ? locked.value : false,
                    limitAreaForParent: true,
                    draggable: true
                  })
                )
            })
          ]);
      }
    });
    const wrapper = mount(Host, { attachTo: document.body });
    const areaElement = wrapper.get('.area').element as HTMLElement;
    Object.defineProperty(areaElement, 'clientWidth', { configurable: true, value: 600 });
    Object.defineProperty(areaElement, 'clientHeight', { configurable: true, value: 400 });
    const group = wrapper.getComponent(MovableGroup);
    await wrapper.findAll('.auto-draggable')[1].trigger('pointerdown', {
      clientX: 200,
      clientY: 25,
      pointerId: 1
    });
    document.documentElement.dispatchEvent(pointerEvent('pointermove', 240, 45));
    await flushFrame();

    locked.value = true;
    await nextTick();

    const cancel = group.emitted('move-cancel')?.at(-1)?.[0] as {
      leaderId: string;
      source: Event | null;
      rects: { id: string }[];
    };
    expect(cancel.leaderId).toBe('b');
    expect(cancel.source).toBeNull();
    expect(cancel.rects.map(record => record.id)).toEqual(['a', 'b']);
    expect(group.emitted('move-stop')).toBeUndefined();
    document.documentElement.dispatchEvent(pointerEvent('pointermove', 300, 100));
    await flushFrame();
    expect(models.a).toMatchObject({ left: 40, top: 20 });
    document.documentElement.dispatchEvent(pointerEvent('pointerup', 300, 100));
    await nextTick();
    wrapper.unmount();
  });

  it('carries the session and the selection over a mid-drag memberId rename', async () => {
    const bId = ref('b');
    const models: Record<string, TestRect> = {
      a: makeRect({ left: 0, top: 0 }),
      b: makeRect({ left: 150, top: 0 })
    };
    const selectedRef = ref<string[]>(['a', 'b']);
    const Host = defineComponent({
      setup() {
        return () =>
          h('div', { class: 'area' }, [
            h(
              MovableGroup,
              {
                selected: selectedRef.value,
                'onUpdate:selected': (ids: string[]) => {
                  selectedRef.value = ids;
                }
              },
              {
                default: () => [
                  h(MovableBox, {
                    key: 'a',
                    memberId: 'a',
                    modelValue: models.a,
                    'onUpdate:modelValue': (value: TestRect) => {
                      models.a = value;
                    },
                    limitAreaForParent: true,
                    draggable: true
                  }),
                  h(MovableBox, {
                    key: 'b',
                    memberId: bId.value,
                    modelValue: models.b,
                    'onUpdate:modelValue': (value: TestRect) => {
                      models.b = value;
                    },
                    limitAreaForParent: true,
                    draggable: true
                  })
                ]
              }
            )
          ]);
      }
    });
    const wrapper = mount(Host, { attachTo: document.body });
    const areaElement = wrapper.get('.area').element as HTMLElement;
    Object.defineProperty(areaElement, 'clientWidth', { configurable: true, value: 600 });
    Object.defineProperty(areaElement, 'clientHeight', { configurable: true, value: 400 });
    const group = wrapper.getComponent(MovableGroup);
    await wrapper.findAll('.auto-draggable')[1].trigger('pointerdown', {
      clientX: 200,
      clientY: 25,
      pointerId: 1
    });
    document.documentElement.dispatchEvent(pointerEvent('pointermove', 240, 45));
    await flushFrame();

    bId.value = 'b2';
    await nextTick();
    expect(selectedRef.value).toEqual(['a', 'b2']);

    document.documentElement.dispatchEvent(pointerEvent('pointermove', 260, 65));
    await flushFrame();
    document.documentElement.dispatchEvent(pointerEvent('pointerup', 260, 65));
    await nextTick();

    // The same instance keeps leading under its new id: no dissolve, followers keep
    // following, and the stop payload reports the new identity.
    expect(group.emitted('move-cancel')).toBeUndefined();
    const stop = group.emitted('move-stop')?.at(-1)?.[0] as {
      leaderId: string;
      rects: { id: string }[];
    };
    expect(stop.leaderId).toBe('b2');
    expect(stop.rects.map(record => record.id)).toEqual(['a', 'b2']);
    expect(models.a).toMatchObject({ left: 60, top: 40 });
    expect(models.b).toMatchObject({ left: 210, top: 40 });
    wrapper.unmount();
  });

  it('removes an unmounted follower from the session and the selection', async () => {
    const harness = mountDynamicGroup({
      rects: { a: makeRect({ left: 0, top: 0 }), b: makeRect({ left: 150, top: 0 }) },
      selected: ['a', 'b']
    });
    await harness.boxes()[1].trigger('pointerdown', {
      clientX: 200,
      clientY: 25,
      pointerId: 1
    });
    document.documentElement.dispatchEvent(pointerEvent('pointermove', 240, 45));
    await flushFrame();

    harness.hiddenIds.value = ['a'];
    await nextTick();
    document.documentElement.dispatchEvent(pointerEvent('pointermove', 260, 65));
    await flushFrame();
    document.documentElement.dispatchEvent(pointerEvent('pointerup', 260, 65));
    await nextTick();

    expect(harness.selectedRef.value).toEqual(['b']);
    const stop = harness.group.emitted('move-stop')?.at(-1)?.[0] as {
      rects: { id: string }[];
    };
    expect(stop.rects.map(record => record.id)).toEqual(['b']);
    expect(harness.models.b).toMatchObject({ left: 210, top: 40 });
  });

  it('blocks a concurrent member resize while a group session is active', async () => {
    const harness = mountGroup();
    await harness.boxes()[1].trigger('pointerdown', {
      clientX: 200,
      clientY: 25,
      pointerId: 2
    });
    document.documentElement.dispatchEvent(pointerEvent('pointermove', 240, 45, { pointerId: 2 }));
    await flushFrame();

    const boxA = harness.wrapper.findAllComponents(MovableBox)[0];
    const before = { ...harness.models.a };
    await harness.boxes()[0].get('.handle-br').trigger('pointerdown', {
      clientX: 90,
      clientY: 40,
      pointerId: 7
    });
    document.documentElement.dispatchEvent(pointerEvent('pointermove', 140, 70, { pointerId: 7 }));
    await flushFrame();
    document.documentElement.dispatchEvent(pointerEvent('pointerup', 140, 70, { pointerId: 7 }));
    await nextTick();

    // The resize is refused instead of fighting the leader's per-frame translateTo.
    expect(boxA.emitted('resize-start')).toBeUndefined();
    expect(harness.models.a).toEqual(before);
    document.documentElement.dispatchEvent(pointerEvent('pointerup', 240, 45, { pointerId: 2 }));
    await nextTick();
  });

  it('blocks a concurrent member rotation while a group session is active', async () => {
    const harness = mountGroup({ boxProps: { a: { rotatable: true } } });
    await harness.boxes()[1].trigger('pointerdown', {
      clientX: 200,
      clientY: 25,
      pointerId: 2
    });
    document.documentElement.dispatchEvent(pointerEvent('pointermove', 240, 45, { pointerId: 2 }));
    await flushFrame();

    const boxA = harness.wrapper.findAllComponents(MovableBox)[0];
    await harness.boxes()[0].get('.rotation-handle').trigger('pointerdown', {
      clientX: 40,
      clientY: -10,
      pointerId: 7
    });
    await nextTick();

    expect(boxA.emitted('rotate-start')).toBeUndefined();
    document.documentElement.dispatchEvent(pointerEvent('pointerup', 240, 45, { pointerId: 2 }));
    await nextTick();
  });

  it('blocks member keyboard moves while a group session is active', async () => {
    const harness = mountGroup({
      boxProps: { a: { keyboardEnabled: true, active: true } }
    });
    await harness.boxes()[1].trigger('pointerdown', {
      clientX: 200,
      clientY: 25,
      pointerId: 2
    });
    document.documentElement.dispatchEvent(pointerEvent('pointermove', 240, 45, { pointerId: 2 }));
    await flushFrame();

    const boxA = harness.wrapper.findAllComponents(MovableBox)[0];
    await harness.boxes()[0].trigger('keydown', { key: 'ArrowRight' });

    // A solo nudge would be snapped back by the leader's next frame, so it is refused.
    expect(boxA.emitted('move')).toBeUndefined();
    expect(harness.models.a).toMatchObject({ left: 40, top: 20 });
    document.documentElement.dispatchEvent(pointerEvent('pointerup', 240, 45, { pointerId: 2 }));
    await nextTick();
  });

  it('blocks member keyboard resizes while a group session is active', async () => {
    const harness = mountGroup({
      boxProps: { a: { keyboardEnabled: true, active: true } }
    });
    await harness.boxes()[1].trigger('pointerdown', {
      clientX: 200,
      clientY: 25,
      pointerId: 2
    });
    document.documentElement.dispatchEvent(pointerEvent('pointermove', 240, 45, { pointerId: 2 }));
    await flushFrame();

    const boxA = harness.wrapper.findAllComponents(MovableBox)[0];
    const before = { ...harness.models.a };
    await harness.boxes()[0].trigger('keydown', { key: 'ArrowRight', shiftKey: true });

    // A solo resize would fight the leader's per-frame translateTo, so it is refused
    // before any layout work — no resize event, no model change.
    expect(boxA.emitted('resize')).toBeUndefined();
    expect(harness.models.a).toEqual(before);
    document.documentElement.dispatchEvent(pointerEvent('pointerup', 240, 45, { pointerId: 2 }));
    await nextTick();
  });

  it('blocks member keyboard rotation while a group session is active', async () => {
    const harness = mountGroup({
      boxProps: { a: { rotatable: true, keyboardEnabled: true, active: true } }
    });
    await harness.boxes()[1].trigger('pointerdown', {
      clientX: 200,
      clientY: 25,
      pointerId: 2
    });
    document.documentElement.dispatchEvent(pointerEvent('pointermove', 240, 45, { pointerId: 2 }));
    await flushFrame();

    const boxA = harness.wrapper.findAllComponents(MovableBox)[0];
    await harness.boxes()[0].get('.rotation-handle').trigger('keydown', { key: 'ArrowRight' });

    // The rotation keys stay consumed (they must not scroll the page instead), but no
    // rotation may start on a formation member mid-session.
    expect(boxA.emitted('rotate-start')).toBeUndefined();
    document.documentElement.dispatchEvent(pointerEvent('pointerup', 240, 45, { pointerId: 2 }));
    await nextTick();
  });

  it('keeps a member running its own resize out of a newly opened session', async () => {
    const harness = mountGroup();
    await harness.boxes()[0].get('.handle-br').trigger('pointerdown', {
      clientX: 95,
      clientY: 45,
      pointerId: 7
    });
    document.documentElement.dispatchEvent(pointerEvent('pointermove', 130, 55, { pointerId: 7 }));
    await flushFrame();

    await harness.boxes()[1].trigger('pointerdown', {
      clientX: 200,
      clientY: 25,
      pointerId: 2
    });
    document.documentElement.dispatchEvent(pointerEvent('pointermove', 240, 45, { pointerId: 2 }));
    await flushFrame();
    document.documentElement.dispatchEvent(pointerEvent('pointerup', 240, 45, { pointerId: 2 }));
    await nextTick();

    // The session forms without the resizing member; the leader's translateTo must not
    // overwrite its in-flight size change.
    const start = harness.group.emitted('move-start')?.at(-1)?.[0] as {
      rects: { id: string }[];
    };
    expect(start.rects.map(record => record.id)).toEqual(['b']);
    expect(harness.models.a.width).toBeGreaterThan(100);
    expect(harness.models.a.left).toBe(0);
    document.documentElement.dispatchEvent(pointerEvent('pointerup', 130, 55, { pointerId: 7 }));
    await nextTick();
  });

  it('captures percent-unit rotated members with a refreshed container snapshot', async () => {
    // Regression: a member that never interacted kept parentWidth = 0, so its rotated
    // visual contour was computed with a 1:1 percent-to-pixel scale and stopped the
    // formation at the wrong edge (27.93 instead of 29.11).
    const harness = mountGroup({
      rects: {
        a: makeRect({ left: 0, top: 0, width: 20, height: 12.5 }),
        b: makeRect({ left: 60, top: 0, width: 10, height: 10 })
      },
      selected: ['a', 'b'],
      boxProps: {
        a: { unitType: '%' },
        b: { unitType: '%', rotate: 45 }
      }
    });
    await dragBox(harness, 0, [60, 25], [660, 25]);

    // b's 45-degree visual (60px by 40px sides on a 600x400 container) spans 11.785% and
    // ends at 70.893%, so the union can only shift by 29.107%.
    expect(harness.models.a.left).toBeCloseTo(29.107, 2);
    expect(harness.models.b.left).toBeCloseTo(89.107, 2);
  });

  it('re-registers a member when its memberId prop changes', async () => {
    const memberId = ref('x');
    const model = makeRect({ left: 0, top: 0 });
    const Host = defineComponent({
      setup() {
        return () =>
          h('div', { class: 'area' }, [
            h(MovableGroup, {}, {
              default: () => [
                h(MovableBox, {
                  memberId: memberId.value,
                  modelValue: model,
                  'onUpdate:modelValue': (value: TestRect) => {
                    Object.assign(model, value);
                  }
                })
              ]
            })
          ]);
      }
    });
    const wrapper = mount(Host, { attachTo: document.body });
    const group = wrapper.getComponent(MovableGroup);
    const exposed = (
      group.vm.$ as unknown as {
        exposed: {
          getSelected: () => string[];
          select: (ids?: string[]) => void;
          getMemberRects: () => { id: string }[];
        };
      }
    ).exposed;
    expect(exposed.getMemberRects().map(member => member.id)).toEqual(['x']);

    memberId.value = 'y';
    await nextTick();
    expect(exposed.getMemberRects().map(member => member.id)).toEqual(['y']);

    // The selection follows the renamed instance instead of dropping it.
    exposed.select(['y']);
    memberId.value = 'z';
    await nextTick();
    expect(exposed.getMemberRects().map(member => member.id)).toEqual(['z']);
    expect(exposed.getSelected()).toEqual(['z']);

    // Renaming onto an id another member owns is refused and keeps the current identity.
    const second = ref('w');
    const Host2 = defineComponent({
      setup() {
        return () =>
          h('div', { class: 'area' }, [
            h(MovableGroup, {}, {
              default: () => [
                h(MovableBox, {
                  memberId: 'z',
                  modelValue: makeRect({ left: 0, top: 0 }),
                  'onUpdate:modelValue': () => {}
                }),
                h(MovableBox, {
                  memberId: second.value,
                  modelValue: makeRect({ left: 150, top: 0 }),
                  'onUpdate:modelValue': () => {}
                })
              ]
            })
          ]);
      }
    });
    const wrapper2 = mount(Host2, { attachTo: document.body });
    const exposed2 = (
      wrapper2.getComponent(MovableGroup).vm.$ as unknown as {
        exposed: { getMemberRects: () => { id: string }[] };
      }
    ).exposed;
    second.value = 'z';
    await nextTick();
    expect(exposed2.getMemberRects().map(member => member.id)).toEqual(['z', 'w']);
    wrapper2.unmount();
    wrapper.unmount();
  });

  it('falls back to an instance identity on duplicate memberIds', async () => {
    const Host = defineComponent({
      setup() {
        return () =>
          h('div', { class: 'area' }, [
            h(MovableGroup, {}, {
              default: () => [
                h(MovableBox, {
                  memberId: 'same',
                  modelValue: makeRect({ left: 0, top: 0 }),
                  'onUpdate:modelValue': () => {}
                }),
                h(MovableBox, {
                  memberId: 'same',
                  modelValue: makeRect({ left: 150, top: 0 }),
                  'onUpdate:modelValue': () => {}
                })
              ]
            })
          ]);
      }
    });
    const wrapper = mount(Host, { attachTo: document.body });
    const ids = (
      wrapper.getComponent(MovableGroup).vm.$ as unknown as {
        exposed: { getMemberRects: () => { id: string }[] };
      }
    ).exposed
      .getMemberRects()
      .map(member => member.id);
    expect(ids[0]).toBe('same');
    expect(ids[1]).toMatch(/^member-/);
    expect(new Set(ids).size).toBe(2);
    wrapper.unmount();
  });
});
