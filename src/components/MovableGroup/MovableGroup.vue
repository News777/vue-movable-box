<template>
  <slot></slot>
</template>

<script setup lang="ts" name="MovableGroup">
import { computed, provide, ref, watch } from 'vue';
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
  type GroupMemberApi
} from './context';

const props = defineProps({
  selected: { type: Array as () => string[], default: undefined },
  sharedBounds: { type: Boolean, default: true }
});

const emit = defineEmits<{
  (event: 'update:selected', ids: string[]): void;
  (event: 'move-start', payload: GroupMoveStartPayload): void;
  (event: 'move', payload: GroupMovePayload): void;
  (
    event: 'move-stop',
    payload: GroupMoveStopPayload
  ): void;
  (event: 'move-cancel', payload: GroupMoveCancelPayload): void;
}>();

const members = new Map<string, GroupMemberApi>();
const internalSelected = ref<string[]>([]);
const session = ref<GroupDragSession | null>(null);

const usesExternalSelection = computed(() => props.selected !== undefined);
const selectedIds = computed<string[]>({
  get: () => (usesExternalSelection.value ? props.selected ?? [] : internalSelected.value),
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

const unionEdges = (rects: ExtendsMovableBox[]) =>
  rects.reduce(
    (union, rect) => ({
      minLeft: Math.min(union.minLeft, asNumber(rect.left)),
      minTop: Math.min(union.minTop, asNumber(rect.top)),
      maxRight: Math.max(union.maxRight, asNumber(rect.left) + asNumber(rect.width)),
      maxBottom: Math.max(union.maxBottom, asNumber(rect.top) + asNumber(rect.height))
    }),
    { minLeft: Infinity, minTop: Infinity, maxRight: -Infinity, maxBottom: -Infinity }
  );

const clampDeltaToEdges = (
  startRects: Map<string, ExtendsMovableBox>,
  delta: { left: number; top: number },
  edges: GroupAreaEdges
) => {
  const union = unionEdges([...startRects.values()]);
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

const setSelection = (ids: string[]) => {
  const next = ids.filter(id => members.has(id));
  const current = selectedIds.value;
  if (current.length === next.length && current.every((id, index) => id === next[index])) return;
  selectedIds.value = next;
};

const context: GroupContext = {
  registerMember: (id, api) => {
    members.set(id, api);
  },
  unregisterMember: id => {
    members.delete(id);
    if (session.value?.leaderId === id) {
      session.value = null;
      return;
    }
    if (session.value) session.value.startRects.delete(id);
    if (selectedIds.value.includes(id)) {
      setSelection(selectedIds.value.filter(memberId => memberId !== id));
    }
  },
  beginDrag: (id, source) => {
    // One formation at a time: a second concurrent pointer is ignored for group movement
    // (it still drags its own box solo through the normal box interaction).
    if (session.value && session.value.leaderId !== id) return;
    if (!members.has(id)) return;
    if (!selectedIds.value.includes(id)) setSelection([id]);
    const startRects = new Map<string, ExtendsMovableBox>();
    for (const memberId of selectedIds.value) {
      const api = members.get(memberId);
      if (api) startRects.set(memberId, cloneRect(api.getRect()));
    }
    session.value = { leaderId: id, startRects };
    const rects: GroupMemberRect[] = [];
    for (const [memberId, rect] of startRects) rects.push({ id: memberId, rect: cloneRect(rect) });
    emit('move-start', { leaderId: id, source, rects });
  },
  constrainPosition: (id, candidate) => {
    const current = session.value;
    const leaderStart = current?.startRects.get(id);
    if (!current || !leaderStart || !members.has(id)) return candidate;
    const deltaLeft = asNumber(candidate.left) - asNumber(leaderStart.left);
    const deltaTop = asNumber(candidate.top) - asNumber(leaderStart.top);
    const edges = members.get(id)?.getAreaEdges();

    if (props.sharedBounds) {
      let delta = { left: deltaLeft, top: deltaTop };
      if (edges) delta = clampDeltaToEdges(current.startRects, delta, edges);
      for (const [memberId, startRect] of current.startRects) {
        if (memberId === id) continue;
        members.get(memberId)?.translateTo(translate(startRect, delta.left, delta.top));
      }
      return translate(leaderStart, delta.left, delta.top);
    }

    // Without shared bounds every member clamps against its own start rectangle, so
    // members stop individually at the area edge while the leader keeps moving.
    if (edges) {
      for (const [memberId, startRect] of current.startRects) {
        if (memberId === id) continue;
        const target = translate(startRect, deltaLeft, deltaTop);
        const maxLeft = Math.max(edges.minLeft, edges.maxRight - asNumber(startRect.width));
        const maxTop = Math.max(edges.minTop, edges.maxBottom - asNumber(startRect.height));
        target.left = clamp(asNumber(target.left), edges.minLeft, maxLeft);
        target.top = clamp(asNumber(target.top), edges.minTop, maxTop);
        members.get(memberId)?.translateTo(target);
      }
    }
    return candidate;
  },
  notifyMoved: (id, leaderRect) => {
    const current = session.value;
    if (!current || current.leaderId !== id) return;
    const rects: GroupMemberRect[] = toMemberRects(memberRecords(current.startRects)).map(
      record => (record.id === id ? { id, rect: cloneRect(leaderRect) } : record)
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
    if (session.value?.leaderId === id) session.value = null;
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
