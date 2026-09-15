<template>
  <slot></slot>
</template>

<script setup lang="ts" name="MovableGroup">
import { computed, provide, ref, watch, type PropType } from 'vue';
import type { ExtendsMovableBox } from '../../types/MovableBox';
import type {
  GroupMemberMoveRecord,
  GroupMemberRect,
  GroupMoveCancelPayload,
  GroupMovePayload,
  GroupMoveStartPayload,
  GroupMoveStopPayload,
  MovableGroupExpose
} from '../../types/MovableGroup';
import { asNumber, clamp } from '../MovableBox/core/box-geometry';
import { deepClone } from '../MovableBox/utils';
import {
  GROUP_CONTEXT_KEY,
  type GroupAreaEdges,
  type GroupContext,
  type GroupDragSession,
  type GroupMemberApi,
  type GroupVisualRect
} from './context';

const props = defineProps({
  selected: { type: Array as () => string[], default: undefined },
  sharedBounds: { type: Boolean, default: true },
  /**
   * Collision scope for group moves. 'leader' (default) lets the box under the pointer
   * resolve its own collisions; 'all' additionally limits the shared displacement to the
   * earliest contact of any selected member with an external obstacle.
   */
  groupCollision: {
    type: String as PropType<'leader' | 'all'>,
    default: 'leader'
  }
});

const emit = defineEmits<{
  (event: 'update:selected', ids: string[]): void;
  (event: 'move-start', payload: GroupMoveStartPayload): void;
  (event: 'move', payload: GroupMovePayload): void;
  (event: 'move-stop', payload: GroupMoveStopPayload): void;
  (event: 'move-cancel', payload: GroupMoveCancelPayload): void;
}>();

const members = new Map<string, GroupMemberApi>();
const internalSelected = ref<string[]>([]);
const session = ref<GroupDragSession | null>(null);

const usesExternalSelection = computed(() => props.selected !== undefined);
const selectedIds = computed<string[]>({
  get: () => (usesExternalSelection.value ? (props.selected ?? []) : internalSelected.value),
  set: value => {
    internalSelected.value = value;
    emit('update:selected', value);
  }
});

watch(
  () => props.selected,
  value => {
    if (value !== undefined) internalSelected.value = [...value];
  },
  { immediate: true }
);

const cloneRect = (rect: ExtendsMovableBox) => deepClone(rect);

const translate = (rect: ExtendsMovableBox, deltaLeft: number, deltaTop: number) => ({
  ...rect,
  left: asNumber(rect.left) + deltaLeft,
  top: asNumber(rect.top) + deltaTop
});

const unionEdges = (rects: GroupVisualRect[]) =>
  rects.reduce(
    (union, rect) => ({
      minLeft: Math.min(union.minLeft, rect.left),
      minTop: Math.min(union.minTop, rect.top),
      maxRight: Math.max(union.maxRight, rect.left + rect.width),
      maxBottom: Math.max(union.maxBottom, rect.top + rect.height)
    }),
    { minLeft: Infinity, minTop: Infinity, maxRight: -Infinity, maxBottom: -Infinity }
  );

const clampDeltaToEdges = (
  rects: GroupVisualRect[],
  delta: { left: number; top: number },
  edges: GroupAreaEdges
) => {
  const union = unionEdges(rects);
  return {
    left: Math.min(
      Math.max(delta.left, edges.minLeft - union.minLeft),
      edges.maxRight - union.maxRight
    ),
    top: Math.min(
      Math.max(delta.top, edges.minTop - union.minTop),
      edges.maxBottom - union.maxBottom
    )
  };
};

const memberRecords = (startRects: Map<string, ExtendsMovableBox>): GroupMemberMoveRecord[] => {
  const records: GroupMemberMoveRecord[] = [];
  for (const [id, startRect] of startRects) {
    const api = members.get(id);
    if (!api) continue;
    records.push({ id, rect: cloneRect(api.getRect()), startRect: cloneRect(startRect) });
  }
  return records;
};

const toMemberRects = (records: GroupMemberMoveRecord[]): GroupMemberRect[] =>
  records.map(({ id, rect }) => ({ id, rect }));

// In 'all' mode the shared displacement shrinks to the earliest contact of any selected
// member with an external obstacle. The leader resolves its own collisions in its own
// interaction pipeline, so only the followers limit the shared delta here.
const limitDeltaByMembers = (
  current: GroupDragSession,
  leaderId: string,
  delta: { left: number; top: number }
): { left: number; top: number } => {
  if (props.groupCollision !== 'all') return delta;
  let progress = 1;
  for (const [memberId, startRect] of current.startRects) {
    if (memberId === leaderId) continue;
    const member = members.get(memberId);
    if (!member) continue;
    const memberProgress = member.sharedDeltaProgress(startRect, delta);
    if (memberProgress < progress) progress = memberProgress;
  }
  return { left: delta.left * progress, top: delta.top * progress };
};

const setSelection = (ids: string[]) => {
  const next = ids.filter(id => members.has(id));
  const current = selectedIds.value;
  if (current.length === next.length && current.every((id, index) => id === next[index])) return;
  selectedIds.value = next;
};

const context: GroupContext = {
  registerMember: (id, api) => {
    // A duplicate id from a different instance must not hijack the existing member:
    // sessions and selection would silently start addressing the wrong box.
    if (members.has(id) && members.get(id) !== api) return false;
    members.set(id, api);
    return true;
  },
  renameMember: (oldId, newId, api) => {
    if (members.get(oldId) !== api) return false;
    if (oldId === newId) return true;
    if (members.has(newId) && members.get(newId) !== api) return false;
    members.delete(oldId);
    members.set(newId, api);
    // The session and the selection address members by id, so both follow the same
    // component instance to its new identity instead of dissolving or dropping it.
    const current = session.value;
    if (current) {
      if (current.leaderId === oldId) current.leaderId = newId;
      if (current.startRects.has(oldId)) {
        current.startRects.set(newId, current.startRects.get(oldId)!);
        current.startRects.delete(oldId);
      }
      if (current.startVisuals.has(oldId)) {
        current.startVisuals.set(newId, current.startVisuals.get(oldId)!);
        current.startVisuals.delete(oldId);
      }
    }
    if (selectedIds.value.includes(oldId)) {
      setSelection(selectedIds.value.map(id => (id === oldId ? newId : id)));
    }
    return true;
  },
  unregisterMember: id => {
    // Capture the records before the leader's api leaves the map, so its rectangle is
    // part of the dissolve payload like any other cancel.
    const current = session.value;
    const records = current && current.leaderId === id ? memberRecords(current.startRects) : null;
    members.delete(id);
    if (records) {
      session.value = null;
      emit('move-cancel', { leaderId: id, source: null, rects: records });
    } else if (session.value) {
      session.value.startRects.delete(id);
      session.value.startVisuals.delete(id);
    }
    // Selection must drop the member on every unmount path; the previous early return
    // for a leader unmount left a dead id behind that later selections carried forward.
    if (selectedIds.value.includes(id)) {
      setSelection(selectedIds.value.filter(memberId => memberId !== id));
    }
  },
  hasMember: id => id !== undefined && members.has(id),
  beginDrag: (id, source) => {
    // A member outside the active formation may still drag solo. A selected member is
    // blocked so a second pointer cannot deform the formation owned by the first leader.
    if (session.value && session.value.leaderId !== id) {
      return session.value.startRects.has(id) ? 'blocked' : 'solo';
    }
    if (!members.has(id)) return 'solo';
    const nextSelection = selectedIds.value.includes(id) ? [...selectedIds.value] : [id];
    if (!selectedIds.value.includes(id)) setSelection(nextSelection);
    const startRects = new Map<string, ExtendsMovableBox>();
    const startVisuals = new Map<string, GroupVisualRect>();
    for (const memberId of nextSelection) {
      const api = members.get(memberId);
      // A member running its own resize/rotate keeps that gesture; joining it into the
      // formation would let the leader's per-frame translateTo overwrite the change.
      if (!api || api.isInteracting()) continue;
      startRects.set(memberId, cloneRect(api.getRect()));
      startVisuals.set(memberId, { ...api.getVisualRect() });
    }
    session.value = { leaderId: id, startRects, startVisuals };
    const rects: GroupMemberRect[] = [];
    for (const [memberId, rect] of startRects) rects.push({ id: memberId, rect: cloneRect(rect) });
    emit('move-start', { leaderId: id, source, rects });
    return 'group';
  },
  // A non-drag gesture on a formation member would be overwritten by the leader's
  // per-frame translateTo, so members of an active session (leader included) are blocked.
  beginMemberInteraction: id => {
    const current = session.value;
    if (!current) return true;
    return current.leaderId !== id && !current.startRects.has(id);
  },
  constrainPosition: (id, candidate) => {
    const current = session.value;
    const leaderStart = current?.startRects.get(id);
    if (!current || current.leaderId !== id || !leaderStart) return candidate;
    const leader = members.get(id);
    if (!leader) return candidate;
    const deltaLeft = asNumber(candidate.left) - asNumber(leaderStart.left);
    const deltaTop = asNumber(candidate.top) - asNumber(leaderStart.top);
    const edges = leader.getAreaEdges();

    if (props.sharedBounds) {
      // Shared bounds clamp the union of the members' visual (rotated AABB) contours so a
      // rotated member cannot swing outside the area while the formation keeps its shape.
      let delta = { left: deltaLeft, top: deltaTop };
      if (edges) delta = clampDeltaToEdges([...current.startVisuals.values()], delta, edges);
      delta = limitDeltaByMembers(current, id, delta);
      // The leader's pipeline validated only this frame's segment (previous → candidate).
      // Once the formation alters the delta, the start-based leader position leaves that
      // segment — after a pointer direction change it can land inside an obstacle the
      // leader had already steered around — so sweep the leader from its start as well.
      // An unaltered delta keeps the leader's own (slide-aware) resolution untouched.
      if (delta.left !== deltaLeft || delta.top !== deltaTop) {
        const leaderProgress = leader.sharedDeltaProgress(leaderStart, delta);
        delta = { left: delta.left * leaderProgress, top: delta.top * leaderProgress };
        // The min across members (and the leader re-sweep above) can land a
        // start-overlapped follower on an interior path point its own validation never
        // saw — escape overlap is not monotone along the path. Re-ask every member
        // with the final delta: validating the shrunk endpoint is exactly validating
        // the landing point, so a deeper landing collapses the delta to zero.
        delta = limitDeltaByMembers(current, id, delta);
      }
      for (const [memberId, startRect] of current.startRects) {
        if (memberId === id) continue;
        members.get(memberId)?.translateTo(translate(startRect, delta.left, delta.top));
      }
      return translate(leaderStart, delta.left, delta.top);
    }

    // Without shared bounds every member clamps against its own visual contour, so
    // members stop individually at the area edge while the leader keeps moving. The
    // visual rect of a rotated member is offset from its model rect by a constant, so
    // the clamp bounds translate back onto the model axis with that offset. The bounds
    // clamp runs before the collision sweep (the same order as the shared-bounds path):
    // clamping a swept position afterwards would slide it off the validated segment,
    // possibly into an obstacle. The trade-off: a member that already starts outside its
    // bounds (area shrank under it) is pulled back only by the swept fraction of the
    // clamped delta instead of being pinned to the edge — a degenerate configuration
    // whose fix belongs to the bounds resolution, not to this per-frame sweep.
    for (const [memberId, startRect] of current.startRects) {
      if (memberId === id) continue;
      const member = members.get(memberId);
      if (!member) continue;
      const visual = current.startVisuals.get(memberId);
      const memberDelta = { left: deltaLeft, top: deltaTop };
      const memberEdges = member.getAreaEdges();
      if (memberEdges && visual) {
        const startLeft = asNumber(startRect.left);
        const startTop = asNumber(startRect.top);
        const visualOffsetLeft = visual.left - startLeft;
        const visualOffsetTop = visual.top - startTop;
        const minLeft = memberEdges.minLeft - visualOffsetLeft;
        const maxLeft = Math.max(minLeft, memberEdges.maxRight - visualOffsetLeft - visual.width);
        const minTop = memberEdges.minTop - visualOffsetTop;
        const maxTop = Math.max(minTop, memberEdges.maxBottom - visualOffsetTop - visual.height);
        // Clamp the delta itself so an unclamped axis keeps the exact shared value.
        memberDelta.left = clamp(deltaLeft, minLeft - startLeft, maxLeft - startLeft);
        memberDelta.top = clamp(deltaTop, minTop - startTop, maxTop - startTop);
      }
      const progress =
        props.groupCollision === 'all' ? member.sharedDeltaProgress(startRect, memberDelta) : 1;
      member.translateTo(
        translate(startRect, memberDelta.left * progress, memberDelta.top * progress)
      );
    }
    return candidate;
  },
  notifyMoved: (id, leaderRect) => {
    const current = session.value;
    if (!current || current.leaderId !== id) return;
    const rects: GroupMemberRect[] = toMemberRects(memberRecords(current.startRects)).map(record =>
      record.id === id ? { id, rect: cloneRect(leaderRect) } : record
    );
    emit('move', { leaderId: id, rects });
  },
  endDrag: (id, source) => {
    const current = session.value;
    if (!current || current.leaderId !== id) return;
    const records = memberRecords(current.startRects);
    session.value = null;
    emit('move-stop', { leaderId: id, source, rects: records });
  },
  cancelDrag: (id, source) => {
    const current = session.value;
    if (!current || current.leaderId !== id) return;
    for (const [memberId, startRect] of current.startRects) {
      if (memberId !== id) members.get(memberId)?.translateTo(cloneRect(startRect));
    }
    const records = memberRecords(current.startRects);
    session.value = null;
    emit('move-cancel', { leaderId: id, source, rects: records });
  },
  abortDrag: id => {
    const current = session.value;
    if (!current || current.leaderId !== id) return;
    // Members stay where the last frame left them (no restore), but consumers that
    // locked UI on move-start still need a terminating event.
    const records = memberRecords(current.startRects);
    session.value = null;
    emit('move-cancel', { leaderId: id, source: null, rects: records });
  }
};

provide(GROUP_CONTEXT_KEY, context);

defineExpose<MovableGroupExpose>({
  getSelected: () => [...selectedIds.value],
  select: ids => setSelection(ids ?? [...members.keys()]),
  getMemberRects: () =>
    [...members.entries()].map(([id, api]) => ({ id, rect: cloneRect(api.getRect()) }))
});
</script>
