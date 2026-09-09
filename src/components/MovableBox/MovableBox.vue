<template>
  <div
    ref="movableRef"
    class="auto-draggable"
    :class="{
      'select-none': disabledUserSelect,
      'is-disabled': disabled,
      'is-active': state.active,
      'is-dragging': state.isDragging,
      'is-resizing': state.isResizing,
      'is-readonly': initRect
    }"
    :style="movableStyle"
    tabindex="0"
    @pointerdown="handlePointerDown($event, null)"
    @dblclick="emit('dblclick', $event)"
    @focus="handleBoxFocus"
    @keydown="handleKeyDown"
  >
    <div
      v-for="(guide, index) in guides.vertical"
      :key="`vertical-${index}`"
      class="movable-box-guide movable-box-guide--vertical"
      :style="verticalGuideStyle(guide)"
    ></div>
    <div
      v-for="(guide, index) in guides.horizontal"
      :key="`horizontal-${index}`"
      class="movable-box-guide movable-box-guide--horizontal"
      :style="horizontalGuideStyle(guide)"
    ></div>

    <template v-for="handle in handles" :key="handle">
      <div
        v-show="state.active && isResizable && !disabled && isHandleAllowed(handle)"
        class="handle"
        :class="`handle-${handle}`"
        :style="handleStyle"
        :role="handleRole(handle)"
        :aria-roledescription="handleRoleDescription(handle)"
        :aria-orientation="handleOrientation(handle)"
        :aria-label="handleLabel(handle)"
        :aria-valuenow="handleValue(handle)"
        :aria-valuemin="handleMinimum(handle)"
        :aria-valuemax="handleMaximum(handle)"
        :aria-valuetext="handleValueText(handle)"
        :aria-keyshortcuts="handleKeyShortcuts(handle)"
        :tabindex="keyboardEnabled ? 0 : undefined"
        @pointerdown.stop.prevent="handlePointerDown($event, handle)"
        @focus="focusedHandle = handle"
        @blur="focusedHandle = null"
      ></div>
    </template>

    <slot></slot>
  </div>
</template>

<script setup lang="ts" name="VueMovableBox">
import {
  computed,
  getCurrentInstance,
  inject,
  onMounted,
  onUnmounted,
  reactive,
  ref,
  watch,
  type CSSProperties,
  type PropType
} from 'vue';
import { useCollision, useGrid, useKeyboard, useSnap } from './composables';
import { asNumber, clamp, sameRect } from './core/box-geometry';
import {
  angleToRadians,
  deltaToLocal,
  normalizeAngle,
  resolveTransformOrigin,
  rotatedAABBAt
} from './utils/rotation';
import { GROUP_CONTEXT_KEY, type GroupMemberApi } from '../MovableGroup/context';
import type {
  BoundsMargin,
  CollisionEventPayload,
  DragDirection,
  ExtendsMovableBox,
  GuidesEventPayload,
  HandlePosition,
  HandlesSet,
  MovableBoxExpose,
  SnapStrategy,
  SnapTarget,
  SnapEventPayload
} from '../../types/MovableBox';
import type { SnapAxes, SnapResult } from './utils/snap';
import {
  addEvent,
  deepClone,
  keepDecimalsToNum,
  removeEvent,
  setValUnit,
  valIsNaN
} from './utils';

const props = defineProps({
  theme: { type: String, default: '#409EFD' },
  inActiveColor: { type: String, default: '#666666' },
  unitType: { type: String as PropType<'px' | '%'>, default: 'px' },
  scale: { type: [Number, String] as PropType<number | string>, default: 1 },
  isKeepDecimals: { type: Boolean, default: false },
  decimalPlaces: { type: Number, default: 2 },
  draggable: { type: Boolean, default: true },
  dragHandle: String,
  dragCancel: String,
  canDrag: {
    type: Function as PropType<(value: ExtendsMovableBox) => boolean>,
    default: undefined
  },
  canResize: {
    type: Function as PropType<(value: ExtendsMovableBox, handle: HandlePosition) => boolean>,
    default: undefined
  },
  resizable: { type: Boolean, default: undefined },
  resizeable: { type: Boolean, default: undefined },
  limitAreaForParent: { type: Boolean, default: true },
  limitAreaClass: String,
  modelValue: {
    type: Object as PropType<ExtendsMovableBox>,
    default: () => ({ left: 0, top: 0, width: 200, height: 100, zIndex: 1 })
  },
  maxWidth: [Number, String] as PropType<number | string>,
  maxHeight: [Number, String] as PropType<number | string>,
  minWidth: { type: [Number, String] as PropType<number | string>, default: 0 },
  minHeight: { type: [Number, String] as PropType<number | string>, default: 0 },
  ratioLock: { type: Boolean, default: false },
  active: { type: Boolean, default: false },
  disabledUserSelect: { type: Boolean, default: true },
  handles: {
    type: Array as PropType<HandlePosition[]>,
    default: () => ['tl', 'tm', 'tr', 'mr', 'br', 'bm', 'bl', 'ml'] as HandlesSet
  },
  disabled: { type: Boolean, default: false },
  initRect: { type: Boolean, default: false },
  edgeDistance: { type: Number, default: 0 },
  snapToGrid: { type: Boolean, default: false },
  gridSize: { type: Number, default: 20 },
  dragDirections: {
    type: Array as PropType<DragDirection[]>,
    default: () => ['top', 'bottom', 'left', 'right'] as DragDirection[]
  },
  resizeDirections: {
    type: Array as PropType<HandlePosition[]>,
    default: () => ['tl', 'tm', 'tr', 'mr', 'br', 'bm', 'bl', 'ml'] as HandlePosition[]
  },
  enableTransition: { type: Boolean, default: false },
  keyboardEnabled: { type: Boolean, default: false },
  keyboardStep: { type: Number, default: 1 },
  boundsMargin: {
    type: Object as PropType<BoundsMargin>,
    default: () => ({ top: 0, right: 0, bottom: 0, left: 0 })
  },
  snapToElements: { type: Boolean, default: false },
  snapThreshold: { type: Number, default: 10 },
  /** Return false to exclude a snap target from snapping on the given axis. */
  snapFilter: {
    type: Function as PropType<(target: SnapTarget, axis: 'horizontal' | 'vertical') => boolean>,
    default: undefined
  },
  /** Strategy consultation order per axis. Default: alignment wins over spacing. */
  snapPriority: {
    type: Array as PropType<SnapStrategy[]>,
    default: () => ['alignment', 'spacing']
  },
  collisionEnabled: { type: Boolean, default: false },
  allowOverlap: { type: Boolean, default: false },
  snapTargets: { type: Array as PropType<SnapTarget[]>, default: () => [] },
  /** Stable identifier used by a surrounding MovableGroup; auto-generated when omitted. */
  memberId: String,
  /** Clockwise rotation in degrees; geometry uses the rotated AABB (see README). */
  rotate: { type: [Number, String] as PropType<number | string>, default: 0 },
  /** CSS transform-origin for the rotation, e.g. 'center', 'top left', '50% 50%'. */
  transformOrigin: { type: String, default: 'center' }
});

const emit = defineEmits<{
  (event: 'update:modelValue', value: ExtendsMovableBox): void;
  (event: 'drag', value: ExtendsMovableBox): void;
  (event: 'drag-start', source: PointerEvent, value: ExtendsMovableBox): void;
  (
    event: 'drag-stop',
    source: PointerEvent,
    oldValue: ExtendsMovableBox,
    newValue: ExtendsMovableBox
  ): void;
  (event: 'resize-start', source: PointerEvent, value: ExtendsMovableBox): void;
  (
    event: 'resize-stop',
    source: PointerEvent,
    oldValue: ExtendsMovableBox,
    newValue: ExtendsMovableBox
  ): void;
  (
    event: 'drag-cancel',
    source: Event | null,
    oldValue: ExtendsMovableBox,
    newValue: ExtendsMovableBox
  ): void;
  (
    event: 'resize-cancel',
    source: Event | null,
    oldValue: ExtendsMovableBox,
    newValue: ExtendsMovableBox
  ): void;
  (event: 'resize', value: ExtendsMovableBox): void;
  (event: 'move', value: ExtendsMovableBox): void;
  (event: 'active', value: ExtendsMovableBox): void;
  (event: 'inactive', value: ExtendsMovableBox): void;
  (event: 'disabled', value: boolean): void;
  (event: 'dblclick', source: MouseEvent): void;
  (event: 'out-of-bounds', direction: DragDirection): void;
  (event: 'snap', result: SnapEventPayload): void;
  (event: 'guides', data: GuidesEventPayload): void;
  (event: 'collision', result: CollisionEventPayload): void;
}>();

const cloneRect = (value: ExtendsMovableBox) => deepClone(value);
const movableRef = ref<HTMLElement>();
const internalRect = ref<ExtendsMovableBox>(cloneRect(props.modelValue));
const initialRect = cloneRect(props.modelValue);
const focusedHandle = ref<HandlePosition | null>(null);

const state = reactive({
  active: props.active,
  isDragging: false,
  isResizing: false,
  handle: null as HandlePosition | null,
  initX: 0,
  initY: 0,
  beforeInteraction: cloneRect(props.modelValue),
  parentElement: null as HTMLElement | null,
  parentWidth: 0,
  parentHeight: 0,
  eventElement: null as HTMLElement | null,
  pointerId: null as number | null
});

watch(
  () => props.modelValue,
  value => {
    internalRect.value = cloneRect(value);
  },
  { deep: true }
);

watch(
  () => props.active,
  value => {
    if (!value && (state.isDragging || state.isResizing)) abortInteraction();
    else setActive(value);
  },
  { flush: 'sync' }
);

watch(
  () => props.disabled,
  value => {
    emit('disabled', value);
    if (value) abortInteraction();
  }
);

watch(
  () => props.initRect,
  value => {
    if (value) abortInteraction();
  }
);

watch(
  () => props.isKeepDecimals,
  (value, previous) => {
    if (!value && previous) {
      commitRect({
        ...internalRect.value,
        left: Math.round(asNumber(internalRect.value.left)),
        top: Math.round(asNumber(internalRect.value.top)),
        width: Math.round(asNumber(internalRect.value.width)),
        height: Math.round(asNumber(internalRect.value.height))
      });
    }
  }
);

const isResizable = computed(() => props.resizable ?? props.resizeable ?? true);
const isPercent = computed(() => props.unitType === '%');
const rotationAngle = computed(() => normalizeAngle(props.rotate));

const movableStyle = computed<CSSProperties>(() => ({
  '--movable-box-theme': props.theme,
  borderColor: props.disabled
    ? props.inActiveColor
    : state.active
      ? props.theme
      : props.inActiveColor,
  left: setValUnit(internalRect.value.left, props.unitType),
  top: setValUnit(internalRect.value.top, props.unitType),
  width: setValUnit(internalRect.value.width, props.unitType),
  height: setValUnit(internalRect.value.height, props.unitType),
  zIndex: internalRect.value.zIndex,
  cursor: props.disabled
    ? 'not-allowed'
    : state.isDragging
      ? 'move'
      : state.isResizing
        ? 'nwse-resize'
        : 'default',
  pointerEvents: props.disabled ? 'none' : 'auto',
  opacity: state.active ? 1 : 0.9,
  transform: rotationAngle.value
    ? `rotate(${rotationAngle.value}deg) translateZ(0)`
    : 'translateZ(0)',
  transformOrigin: props.transformOrigin,
  willChange: state.isDragging || state.isResizing ? 'left, top, width, height' : 'auto',
  transition:
    props.enableTransition && !state.isDragging && !state.isResizing
      ? 'left 0.2s ease, top 0.2s ease, width 0.2s ease, height 0.2s ease'
      : 'none'
}));

const handleStyle = computed<CSSProperties>(() => ({
  borderColor: isResizable.value ? props.theme : props.inActiveColor,
  scale: keepDecimalsToNum(1 / valIsNaN(props.scale, 1), 1)
}));

const commitRect = (next: ExtendsMovableBox) => {
  const value = cloneRect(next);
  internalRect.value = value;
  emit('update:modelValue', cloneRect(value));
  return value;
};

function setActive(value: boolean) {
  if (state.active === value) return;
  state.active = value;
  if (value) emit('active', cloneRect(internalRect.value));
  else emit('inactive', cloneRect(internalRect.value));
  if (!value) clearAdvancedState();
}

const refreshArea = () => {
  let selected: HTMLElement | null = null;
  if (props.limitAreaClass) {
    try {
      selected = document.querySelector(props.limitAreaClass) as HTMLElement | null;
    } catch {
      selected = null;
    }
  }
  state.parentElement = selected ?? movableRef.value?.parentElement ?? null;
  state.parentWidth = state.parentElement?.clientWidth ?? 0;
  state.parentHeight = state.parentElement?.clientHeight ?? 0;
};

const normalizedInset = (value: number | undefined) => Math.max(0, Number(value) || 0);
const getInsets = () => {
  const edge = normalizedInset(props.edgeDistance);
  return {
    top: edge + normalizedInset(props.boundsMargin.top),
    right: edge + normalizedInset(props.boundsMargin.right),
    bottom: edge + normalizedInset(props.boundsMargin.bottom),
    left: edge + normalizedInset(props.boundsMargin.left)
  };
};

const getAreaEdges = () => {
  const insets = getInsets();
  const width = isPercent.value ? 100 : state.parentWidth;
  const height = isPercent.value ? 100 : state.parentHeight;
  return {
    minLeft: insets.left,
    maxRight: Math.max(insets.left, width - insets.right),
    minTop: insets.top,
    maxBottom: Math.max(insets.top, height - insets.bottom)
  };
};

const getPositionBounds = (rect: { width: number; height: number }) => {
  const edges = getAreaEdges();
  return {
    minLeft: edges.minLeft,
    maxLeft: Math.max(edges.minLeft, edges.maxRight - rect.width),
    minTop: edges.minTop,
    maxTop: Math.max(edges.minTop, edges.maxBottom - rect.height)
  };
};

const numericPlane = (rect: ExtendsMovableBox) => ({
  left: asNumber(rect.left),
  top: asNumber(rect.top),
  width: asNumber(rect.width),
  height: asNumber(rect.height)
});

// Rotated boxes are probed as their axis-aligned bounding box for bounds, snapping,
// and collision; shifts on the probe map 1:1 back onto the unrotated rectangle.
const geometryProbe = (rect: ExtendsMovableBox) => {
  const plane = numericPlane(rect);
  const angle = rotationAngle.value;
  if (!angle) return plane;
  const origin = resolveTransformOrigin(props.transformOrigin, plane.width, plane.height);
  return rotatedAABBAt(plane, angle, origin);
};

// Shrinks an over-large rotated rectangle so its AABB can fit the area; clamping alone
// could only translate it, leaving part of the box outside the bounds.
const fitRotatedSizeToArea = (candidate: ExtendsMovableBox): ExtendsMovableBox => {
  const angle = rotationAngle.value;
  if (!angle || !props.limitAreaForParent || !state.parentElement) return candidate;
  const edges = getAreaEdges();
  const areaWidth = Math.max(0, edges.maxRight - edges.minLeft);
  const areaHeight = Math.max(0, edges.maxBottom - edges.minTop);
  const rad = angleToRadians(angle);
  const cosA = Math.abs(Math.cos(rad));
  const sinA = Math.abs(Math.sin(rad));
  let width = asNumber(candidate.width);
  let height = asNumber(candidate.height);
  // Two passes: reducing one span relaxes the constraint checked in the other pass.
  for (let pass = 0; pass < 2; pass += 1) {
    if (cosA * width + sinA * height > areaWidth) {
      if (cosA >= sinA) width = Math.max(0, (areaWidth - sinA * height) / (cosA || 1));
      else height = Math.max(0, (areaWidth - cosA * width) / (sinA || 1));
    }
    if (sinA * width + cosA * height > areaHeight) {
      if (sinA >= cosA) width = Math.max(0, (areaHeight - cosA * height) / (sinA || 1));
      else height = Math.max(0, (areaHeight - sinA * width) / (cosA || 1));
    }
  }
  return { ...candidate, width: roundValue(width), height: roundValue(height) };
};

const reportOutOfBounds = (rect: ExtendsMovableBox) => {
  if (!state.parentElement) return;
  const edges = getAreaEdges();
  const probe = geometryProbe(rect);
  const left = probe.left;
  const top = probe.top;
  const right = left + probe.width;
  const bottom = top + probe.height;
  if (left < edges.minLeft) emit('out-of-bounds', 'left');
  if (right > edges.maxRight) emit('out-of-bounds', 'right');
  if (top < edges.minTop) emit('out-of-bounds', 'top');
  if (bottom > edges.maxBottom) emit('out-of-bounds', 'bottom');
};

const clampPosition = (rect: ExtendsMovableBox) => {
  if (!props.limitAreaForParent || !state.parentElement) return rect;
  const probe = geometryProbe(rect);
  const bounds = getPositionBounds(probe);
  const clampedLeft = clamp(probe.left, bounds.minLeft, bounds.maxLeft);
  const clampedTop = clamp(probe.top, bounds.minTop, bounds.maxTop);
  if (!rotationAngle.value) {
    return {
      ...rect,
      left: clampedLeft,
      top: clampedTop
    };
  }
  return {
    ...rect,
    left: roundValue(asNumber(rect.left) + (clampedLeft - probe.left)),
    top: roundValue(asNumber(rect.top) + (clampedTop - probe.top))
  };
};

// --- MovableGroup integration (inert when no MovableGroup surrounds the box) ---
const groupContext = inject(GROUP_CONTEXT_KEY, null);
const memberIdentity =
  props.memberId || `member-${getCurrentInstance()?.uid ?? Math.random().toString(36).slice(2)}`;
let groupDragLeader = false;
const memberApi: GroupMemberApi = {
  getRect: () => cloneRect(internalRect.value),
  translateTo: rect => {
    commitRect(rect);
  },
  getAreaEdges: () => {
    refreshArea();
    return state.parentElement ? getAreaEdges() : null;
  }
};
onMounted(() => groupContext?.registerMember(memberIdentity, memberApi));

const roundValue = (value: number) =>
  props.isKeepDecimals
    ? keepDecimalsToNum(value, 0, props.decimalPlaces)
    : Math.round(value);
const scaledDelta = (value: number, axis: 'horizontal' | 'vertical') => {
  const configuredScale = valIsNaN(props.scale, 1);
  const scaled = value / (configuredScale === 0 ? 1 : configuredScale);
  if (!isPercent.value) return roundValue(scaled);

  const dimension = axis === 'horizontal' ? state.parentWidth : state.parentHeight;
  return dimension > 0 ? roundValue((scaled / dimension) * 100) : 0;
};

const grid = useGrid(() => ({ snapToGrid: props.snapToGrid, gridSize: props.gridSize }));
const snap = useSnap(() => ({
  enabled: props.snapToElements,
  threshold: props.snapThreshold,
  filter: props.snapFilter,
  priority: props.snapPriority
}));
const collision = useCollision(() => ({
  enabled: props.collisionEnabled,
  allowOverlap: props.allowOverlap
}));
const guides = snap.guides;

let lastSnapKey = 'clear';
let lastGuidesKey = 'clear';
let lastCollisionKey = 'clear';
const horizontalSnapPoints = new Set(['left', 'right', 'center-x']);
const verticalSnapPoints = new Set(['top', 'bottom', 'center-y']);

const publishSnap = (result: SnapResult) => {
  const targetIds = {
    horizontal: result.points.some(point => horizontalSnapPoints.has(point))
      ? result.targetIds.horizontal
      : undefined,
    vertical: result.points.some(point => verticalSnapPoints.has(point))
      ? result.targetIds.vertical
      : undefined
  };
  const spacing = result.snapped ? deepClone(result.spacing ?? []) : [];
  const payload: SnapEventPayload = result.snapped
    ? {
        snapped: true,
        point: result.snapPoint,
        points: result.points,
        targetId: result.targetId,
        targetIds,
        spacing: spacing.length > 0 ? spacing : undefined
      }
    : { snapped: false };
  const snapKey = JSON.stringify({
    payload,
    left: result.points.some(point => horizontalSnapPoints.has(point)) ? result.left : undefined,
    top: result.points.some(point => verticalSnapPoints.has(point)) ? result.top : undefined
  });
  if (snapKey !== lastSnapKey) {
    if (result.snapped || lastSnapKey !== 'clear') emit('snap', payload);
    lastSnapKey = result.snapped ? snapKey : 'clear';
  }

  const guideKey = JSON.stringify({ guides: result.guides, targetIds });
  if (guideKey !== lastGuidesKey) {
    if (result.snapped || lastGuidesKey !== 'clear') emit('guides', deepClone(result.guides));
    lastGuidesKey = result.snapped ? guideKey : 'clear';
  }
};

const publishCollision = (result: ReturnType<typeof collision.resolveCandidate>) => {
  const dominant = result.dominant;
  const payload: CollisionEventPayload = dominant
    ? {
        colliding: true,
        direction: dominant.direction,
        targetId: dominant.targetId
      }
    : { colliding: false };
  const key = JSON.stringify(payload);
  if (key !== lastCollisionKey) {
    if (dominant || lastCollisionKey !== 'clear') emit('collision', payload);
    lastCollisionKey = dominant ? key : 'clear';
  }
};

const clearAdvancedState = () => {
  if (lastSnapKey !== 'clear') emit('snap', { snapped: false });
  if (lastGuidesKey !== 'clear') emit('guides', { vertical: [], horizontal: [] });
  if (lastCollisionKey !== 'clear') emit('collision', { colliding: false });
  lastSnapKey = 'clear';
  lastGuidesKey = 'clear';
  lastCollisionKey = 'clear';
  snap.clearGuides();
  collision.clearCollisions();
};

const resolveCollision = (
  candidate: ExtendsMovableBox,
  previous: ExtendsMovableBox,
  resolution: 'path' | 'slide' = 'path'
) => {
  const candidateProbe = geometryProbe(candidate);
  const result = collision.resolveCandidate(
    candidateProbe,
    geometryProbe(previous),
    props.snapTargets,
    rect => ({
      left: roundValue(rect.left),
      top: roundValue(rect.top),
      width: roundValue(rect.width),
      height: roundValue(rect.height)
    }),
    resolution
  );
  publishCollision(result);
  if (!result.accepted) return null;
  if (rotationAngle.value) {
    return {
      ...candidate,
      left: roundValue(asNumber(candidate.left) + (result.rect.left - candidateProbe.left)),
      top: roundValue(asNumber(candidate.top) + (result.rect.top - candidateProbe.top))
    };
  }
  return { ...candidate, ...result.rect } as ExtendsMovableBox;
};

const applyInteractivePosition = (
  candidate: ExtendsMovableBox,
  previous: ExtendsMovableBox,
  useElementSnap: boolean,
  axes: SnapAxes,
  directionOrigin?: ExtendsMovableBox
) => {
  let next = cloneRect(candidate);
  if (axes.horizontal) next.left = grid.snapValue(asNumber(candidate.left));
  if (axes.vertical) next.top = grid.snapValue(asNumber(candidate.top));
  let snapResult: SnapResult = {
    ...numericPlane(next),
    snapped: false,
    points: [],
    targetIds: {},
    guides: { vertical: [], horizontal: [] },
    spacing: []
  };

  if (useElementSnap) {
    const probe = geometryProbe(next);
    snapResult = snap.resolveSnap(probe, props.snapTargets, axes);
    if (rotationAngle.value) {
      next = {
        ...next,
        left: roundValue(asNumber(next.left) + (snapResult.left - probe.left)),
        top: roundValue(asNumber(next.top) + (snapResult.top - probe.top))
      };
    } else {
      next = { ...next, left: snapResult.left, top: snapResult.top };
    }
  } else {
    snap.clearGuides();
  }

  if (directionOrigin) {
    const originLeft = asNumber(directionOrigin.left);
    const originTop = asNumber(directionOrigin.top);
    if (!props.dragDirections.includes('left')) {
      next.left = Math.max(originLeft, asNumber(next.left));
    }
    if (!props.dragDirections.includes('right')) {
      next.left = Math.min(originLeft, asNumber(next.left));
    }
    if (!props.dragDirections.includes('top')) {
      next.top = Math.max(originTop, asNumber(next.top));
    }
    if (!props.dragDirections.includes('bottom')) {
      next.top = Math.min(originTop, asNumber(next.top));
    }
  }

  reportOutOfBounds(next);
  next = clampPosition(next);

  const collisionResolved = resolveCollision(next, previous, 'slide');
  if (!collisionResolved) {
    publishSnap({
      ...snapResult,
      snapped: false,
      points: [],
      guides: { vertical: [], horizontal: [] }
    });
    snap.clearGuides();
    return null;
  }
  next = collisionResolved;

  if (snapResult.snapped) {
    const horizontalChanged = asNumber(next.left) !== snapResult.left;
    const verticalChanged = asNumber(next.top) !== snapResult.top;
    const points = snapResult.points.filter(point => {
      if (horizontalSnapPoints.has(point)) return !horizontalChanged;
      if (verticalSnapPoints.has(point)) return !verticalChanged;
      return false;
    });
    const keepsHorizontal = points.some(point => horizontalSnapPoints.has(point));
    const keepsVertical = points.some(point => verticalSnapPoints.has(point));
    const spacing = snapResult.spacing.filter(info =>
      info.axis === 'horizontal' ? !horizontalChanged : !verticalChanged
    );
    const spacingGuides = {
      vertical: spacing.flatMap(info => (info.axis === 'horizontal' ? info.guides : [])),
      horizontal: spacing.flatMap(info => (info.axis === 'vertical' ? info.guides : []))
    };
    snapResult = {
      ...snapResult,
      left: asNumber(next.left),
      top: asNumber(next.top),
      snapped: points.length > 0 || spacing.length > 0,
      snapPoint: points[0],
      points,
      targetId: keepsHorizontal
        ? snapResult.targetIds.horizontal
        : keepsVertical
          ? snapResult.targetIds.vertical
          : undefined,
      targetIds: {
        horizontal: keepsHorizontal ? snapResult.targetIds.horizontal : undefined,
        vertical: keepsVertical ? snapResult.targetIds.vertical : undefined
      },
      guides: {
        vertical: keepsHorizontal ? snapResult.guides.vertical : spacingGuides.vertical,
        horizontal: keepsVertical ? snapResult.guides.horizontal : spacingGuides.horizontal
      },
      spacing
    };
    if (snapResult.snapped) snap.setGuides(snapResult.guides);
    else snap.clearGuides();
  }
  publishSnap(snapResult);
  return next;
};

const isHandleAllowed = (handle: HandlePosition) => props.resizeDirections.includes(handle);

const resizeFromHandle = (
  start: ExtendsMovableBox,
  handle: HandlePosition,
  deltaX: number,
  deltaY: number
): ExtendsMovableBox => {
  const startLeft = asNumber(start.left);
  const startTop = asNumber(start.top);
  const startWidth = asNumber(start.width);
  const startHeight = asNumber(start.height);
  let left = startLeft;
  let right = startLeft + startWidth;
  let top = startTop;
  let bottom = startTop + startHeight;

  if (handle.includes('l')) left += deltaX;
  if (handle.includes('r')) right += deltaX;
  if (handle.includes('t')) top += deltaY;
  if (handle.includes('b')) bottom += deltaY;

  const horizontalCenter = (left + right) / 2;
  const verticalCenter = (top + bottom) / 2;
  let width = Math.max(0, right - left);
  let height = Math.max(0, bottom - top);
  const ratio = startWidth > 0 && startHeight > 0 ? startWidth / startHeight : 1;

  const setWidth = (value: number) => {
    width = value;
    if (handle.includes('l')) left = right - width;
    else if (handle.includes('r')) right = left + width;
    else {
      left = horizontalCenter - width / 2;
      right = horizontalCenter + width / 2;
    }
  };
  const setHeight = (value: number) => {
    height = value;
    if (handle.includes('t')) top = bottom - height;
    else if (handle.includes('b')) bottom = top + height;
    else {
      top = verticalCenter - height / 2;
      bottom = verticalCenter + height / 2;
    }
  };

  if (props.ratioLock) {
    const widthChange = Math.abs(width - startWidth);
    const heightChange = Math.abs(height - startHeight) * ratio;
    if (handle === 'tm' || handle === 'bm' || heightChange > widthChange) setWidth(height * ratio);
    else setHeight(width / ratio);
  }

  const edges = getAreaEdges();
  const constrainToArea = props.limitAreaForParent && Boolean(state.parentElement);
  const availableWidth = !constrainToArea
    ? Infinity
    : handle.includes('l')
      ? Math.max(0, right - edges.minLeft)
      : handle.includes('r')
        ? Math.max(0, edges.maxRight - left)
        : Math.max(
            0,
            2 * Math.min(horizontalCenter - edges.minLeft, edges.maxRight - horizontalCenter)
          );
  const availableHeight = !constrainToArea
    ? Infinity
    : handle.includes('t')
      ? Math.max(0, bottom - edges.minTop)
      : handle.includes('b')
        ? Math.max(0, edges.maxBottom - top)
        : Math.max(
            0,
            2 * Math.min(verticalCenter - edges.minTop, edges.maxBottom - verticalCenter)
          );
  const minWidth = Math.max(0, valIsNaN(props.minWidth, 0));
  const minHeight = Math.max(0, valIsNaN(props.minHeight, 0));
  const maxWidthProp = valIsNaN(props.maxWidth, Infinity);
  const maxHeightProp = valIsNaN(props.maxHeight, Infinity);
  let maxWidth = Math.min(maxWidthProp > 0 ? maxWidthProp : Infinity, availableWidth);
  let maxHeight = Math.min(maxHeightProp > 0 ? maxHeightProp : Infinity, availableHeight);

  if (props.ratioLock) {
    maxWidth = Math.min(maxWidth, maxHeight * ratio);
    const constrainedMinWidth = Math.max(minWidth, minHeight * ratio);
    setWidth(clamp(width, constrainedMinWidth, maxWidth));
    setHeight(width / ratio);
  } else {
    setWidth(clamp(width, Math.min(minWidth, maxWidth), maxWidth));
    setHeight(clamp(height, Math.min(minHeight, maxHeight), maxHeight));
  }

  return {
    ...start,
    left: roundValue(left),
    top: roundValue(top),
    width: roundValue(right - left),
    height: roundValue(bottom - top)
  };
};

let rafId: number | null = null;
let pendingEvent: PointerEvent | null = null;

const processInteraction = (source: PointerEvent) => {
  if (props.disabled || props.initRect || (!state.isDragging && !state.isResizing)) return;
  const deltaX = scaledDelta(source.clientX - state.initX, 'horizontal');
  const deltaY = scaledDelta(source.clientY - state.initY, 'vertical');
  const previous = cloneRect(internalRect.value);

  if (state.isDragging) {
    const start = state.beforeInteraction;
    let left = asNumber(start.left) + deltaX;
    let top = asNumber(start.top) + deltaY;
    const axes = {
      horizontal:
        (deltaX < 0 && props.dragDirections.includes('left')) ||
        (deltaX > 0 && props.dragDirections.includes('right')),
      vertical:
        (deltaY < 0 && props.dragDirections.includes('top')) ||
        (deltaY > 0 && props.dragDirections.includes('bottom'))
    };
    if (!axes.horizontal) left = asNumber(start.left);
    if (!axes.vertical) top = asNumber(start.top);

    const candidate = {
      ...start,
      left: roundValue(left),
      top: roundValue(top)
    };
    let accepted = applyInteractivePosition(candidate, previous, props.snapToElements, axes, start);
    if (accepted && groupDragLeader) {
      accepted = groupContext?.constrainPosition(memberIdentity, accepted) ?? null;
    }
    if (accepted) {
      const value = commitRect(accepted);
      emit('move', cloneRect(value));
      emit('drag', cloneRect(value));
      if (groupDragLeader) groupContext?.notifyMoved(memberIdentity, cloneRect(value));
    }
  }

  if (state.isResizing && state.handle) {
    publishSnap({
      ...numericPlane(previous),
      snapped: false,
      points: [],
      targetIds: {},
      guides: { vertical: [], horizontal: [] },
      spacing: []
    });
    snap.clearGuides();
    const localDelta = deltaToLocal(deltaX, deltaY, rotationAngle.value);
    let candidate = resizeFromHandle(
      state.beforeInteraction,
      state.handle,
      localDelta.x,
      localDelta.y
    );
    // resizeFromHandle constrains sizes against local edges; rotated boxes additionally
    // fit their AABB into the area and get it clamped into position.
    if (rotationAngle.value) {
      candidate = fitRotatedSizeToArea(candidate);
      candidate = clampPosition(candidate);
    }
    reportOutOfBounds(candidate);
    const collisionResolved = resolveCollision(candidate, previous);
    if (collisionResolved) {
      const value = commitRect(collisionResolved);
      emit('resize', cloneRect(value));
    }
  }
};

const queueInteraction = (source: PointerEvent) => {
  if (!state.active || props.disabled || props.initRect) return;
  pendingEvent = source;
  if (rafId !== null) return;
  rafId = requestAnimationFrame(() => {
    rafId = null;
    const event = pendingEvent;
    pendingEvent = null;
    if (event) processInteraction(event);
  });
};

const isOwnedPointer = (source: PointerEvent) =>
  state.pointerId === null || source.pointerId === state.pointerId;

const handlePointerMove = (source: PointerEvent) => {
  if (!isOwnedPointer(source)) return;
  queueInteraction(source);
};
const handlePointerUp = (source: PointerEvent) => {
  if (!isOwnedPointer(source)) return;
  endInteraction(source);
};
const handlePointerCancel = (source: PointerEvent) => {
  if (!isOwnedPointer(source)) return;
  cancelInteraction(source);
};
const handleLostPointerCapture = (source: PointerEvent) => {
  if (!isOwnedPointer(source)) return;
  if (state.isDragging || state.isResizing) cancelInteraction(source);
};

const addInteractionListeners = () => {
  const element = state.eventElement;
  if (!element) return;
  const options = { passive: false };
  addEvent(element, 'pointermove', handlePointerMove, options);
  addEvent(element, 'pointerup', handlePointerUp, options);
  addEvent(element, 'pointercancel', handlePointerCancel, options);
  const captureTarget = movableRef.value;
  if (captureTarget) {
    addEvent(captureTarget, 'lostpointercapture', handleLostPointerCapture, options);
  }
};

const removeInteractionListeners = () => {
  const element = state.eventElement;
  if (!element) return;
  removeEvent(element, 'pointermove', handlePointerMove, false);
  removeEvent(element, 'pointerup', handlePointerUp, false);
  removeEvent(element, 'pointercancel', handlePointerCancel, false);
  const captureTarget = movableRef.value;
  if (captureTarget) {
    removeEvent(captureTarget, 'lostpointercapture', handleLostPointerCapture, false);
  }
  state.eventElement = null;
};

const capturePointer = () => {
  const target = movableRef.value;
  if (!target || state.pointerId === null) return;
  try {
    target.setPointerCapture(state.pointerId);
  } catch {
    // Pointer capture is unavailable in some environments (e.g. jsdom)
  }
};

const releasePointer = () => {
  const target = movableRef.value;
  const pointerId = state.pointerId;
  state.pointerId = null;
  if (!target || pointerId === null) return;
  try {
    if (target.hasPointerCapture(pointerId)) target.releasePointerCapture(pointerId);
  } catch {
    // Capture may already be lost
  }
};

function dropPendingFrame() {
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
  pendingEvent = null;
}

function closeInteraction() {
  state.isDragging = false;
  state.isResizing = false;
  state.handle = null;
  groupDragLeader = false;
  removeInteractionListeners();
  releasePointer();
}

// Emits 'inactive' when the box is internally active but props.active is still false.
function finalizeInteraction() {
  clearAdvancedState();
  if (!props.active) setActive(false);
}

function teardownInteraction() {
  closeInteraction();
  finalizeInteraction();
}

function abortInteraction() {
  dropPendingFrame();
  if (groupDragLeader) groupContext?.abortDrag(memberIdentity);
  teardownInteraction();
}

function cancelInteraction(source: Event | null = null) {
  const wasDragging = state.isDragging;
  const wasResizing = state.isResizing;
  const wasGroupDrag = groupDragLeader;
  dropPendingFrame();
  closeInteraction();
  if (wasDragging || wasResizing) {
    const oldValue = cloneRect(state.beforeInteraction);
    commitRect(oldValue);
    if (wasDragging) emit('drag-cancel', source, oldValue, cloneRect(oldValue));
    else emit('resize-cancel', source, oldValue, cloneRect(oldValue));
    if (wasDragging && wasGroupDrag) groupContext?.cancelDrag(memberIdentity, source);
  }
  finalizeInteraction();
}

function deactivateComponent() {
  abortInteraction();
  setActive(false);
}

const startInteraction = (source: PointerEvent, handle: HandlePosition | null) => {
  if (props.disabled || props.initRect) return;
  if (state.isDragging || state.isResizing) return;
  if (handle && (!isResizable.value || !isHandleAllowed(handle))) return;
  if (!handle && !props.draggable) return;

  const currentRect = cloneRect(internalRect.value);
  if (handle) {
    if (props.canResize?.(currentRect, handle) === false) return;
  } else if (props.canDrag?.(currentRect) === false) {
    return;
  }

  groupDragLeader = !handle && groupContext !== null;
  if (groupDragLeader) groupContext?.beginDrag(memberIdentity, source);

  refreshArea();
  state.pointerId = typeof source.pointerId === 'number' ? source.pointerId : null;
  state.initX = source.clientX;
  state.initY = source.clientY;
  state.beforeInteraction = cloneRect(internalRect.value);
  state.handle = handle;
  state.isDragging = !handle;
  state.isResizing = Boolean(handle);
  setActive(true);

  if (state.isDragging) emit('drag-start', source, cloneRect(state.beforeInteraction));
  if (state.isResizing) emit('resize-start', source, cloneRect(state.beforeInteraction));
  state.eventElement = document.documentElement;
  addInteractionListeners();
  capturePointer();
};

const isDragAllowedFrom = (target: EventTarget | null) => {
  if (!(target instanceof Element)) return true;
  const root = movableRef.value;
  if (!root) return true;
  const closestInBox = (selector: string) => {
    try {
      const matched = target.closest(selector);
      return {
        valid: true,
        matched: matched instanceof Element && root.contains(matched)
      };
    } catch {
      return { valid: false, matched: false };
    }
  };
  if (props.dragCancel) {
    const result = closestInBox(props.dragCancel);
    if (!result.valid || result.matched) return false;
  }
  if (props.dragHandle) {
    const result = closestInBox(props.dragHandle);
    return result.valid && result.matched;
  }
  return true;
};

const handlePointerDown = (source: PointerEvent, handle: HandlePosition | null) => {
  if (!source.isPrimary || source.button !== 0) return;
  if (!handle && !isDragAllowedFrom(source.target)) return;
  startInteraction(source, handle);
};

function endInteraction(source: PointerEvent) {
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
  if (pendingEvent) {
    processInteraction(pendingEvent);
    pendingEvent = null;
  }

  if (state.isDragging) {
    emit('drag-stop', source, cloneRect(state.beforeInteraction), cloneRect(internalRect.value));
    if (groupDragLeader) groupContext?.endDrag(memberIdentity, source);
  }
  if (state.isResizing) {
    emit('resize-stop', source, cloneRect(state.beforeInteraction), cloneRect(internalRect.value));
  }

  teardownInteraction();
}

const moveWithKeyboard = (direction: DragDirection, distance: number) => {
  refreshArea();
  const previous = cloneRect(internalRect.value);
  if (props.canDrag?.(cloneRect(previous)) === false) return;
  const candidate = cloneRect(previous);
  if (direction === 'left') candidate.left = asNumber(candidate.left) - distance;
  if (direction === 'right') candidate.left = asNumber(candidate.left) + distance;
  if (direction === 'top') candidate.top = asNumber(candidate.top) - distance;
  if (direction === 'bottom') candidate.top = asNumber(candidate.top) + distance;
  const accepted = applyInteractivePosition(candidate, previous, props.snapToElements, {
    horizontal: direction === 'left' || direction === 'right',
    vertical: direction === 'top' || direction === 'bottom'
  }, previous);
  if (accepted) {
    const value = commitRect(accepted);
    emit('move', cloneRect(value));
  }
};

const resizeWithKeyboard = (
  handle: HandlePosition,
  direction: DragDirection,
  distance: number
) => {
  if (!isResizable.value || !isHandleAllowed(handle)) return;
  refreshArea();
  const previous = cloneRect(internalRect.value);
  if (props.canResize?.(cloneRect(previous), handle) === false) return;
  const deltaX = direction === 'left' ? -distance : direction === 'right' ? distance : 0;
  const deltaY = direction === 'top' ? -distance : direction === 'bottom' ? distance : 0;
  const localDelta = deltaToLocal(deltaX, deltaY, rotationAngle.value);
  let candidate = resizeFromHandle(previous, handle, localDelta.x, localDelta.y);
  if (rotationAngle.value) {
    candidate = fitRotatedSizeToArea(candidate);
    candidate = clampPosition(candidate);
  }
  reportOutOfBounds(candidate);
  const collisionResolved = resolveCollision(candidate, previous);
  if (!collisionResolved || sameRect(collisionResolved, previous)) return;
  const value = commitRect(collisionResolved);
  emit('resize', cloneRect(value));
};

const HANDLE_LABELS: Record<HandlePosition, string> = {
  tl: 'top left',
  tm: 'top middle',
  tr: 'top right',
  ml: 'middle left',
  mr: 'middle right',
  bl: 'bottom left',
  bm: 'bottom middle',
  br: 'bottom right'
};
const CORNER_HANDLES = new Set<HandlePosition>(['tl', 'tr', 'bl', 'br']);
const isCornerHandle = (handle: HandlePosition) => CORNER_HANDLES.has(handle);
const handleRole = (handle: HandlePosition) => (isCornerHandle(handle) ? 'group' : 'separator');
const handleRoleDescription = (handle: HandlePosition) =>
  isCornerHandle(handle) ? 'two-axis resize handle' : undefined;
const handleLabel = (handle: HandlePosition) => `Resize ${HANDLE_LABELS[handle]}`;
const handleOrientation = (handle: HandlePosition) => {
  if (isCornerHandle(handle)) return undefined;
  if (handle === 'ml' || handle === 'mr') return 'vertical';
  return 'horizontal';
};
const handleUsesWidth = (handle: HandlePosition) => handle === 'ml' || handle === 'mr';
const handleValue = (handle: HandlePosition) => {
  if (isCornerHandle(handle)) return undefined;
  return asNumber(
    handleUsesWidth(handle) ? internalRect.value.width : internalRect.value.height
  );
};
const handleMinimum = (handle: HandlePosition) => {
  if (isCornerHandle(handle)) return undefined;
  return asNumber(handleUsesWidth(handle) ? props.minWidth : props.minHeight);
};
const handleMaximum = (handle: HandlePosition) => {
  if (isCornerHandle(handle)) return undefined;
  const configured = handleUsesWidth(handle) ? props.maxWidth : props.maxHeight;
  if (configured === undefined) return undefined;
  const value = asNumber(configured);
  return Number.isFinite(value) ? value : undefined;
};
const handleValueText = (handle: HandlePosition) => {
  const value = handleValue(handle);
  if (value === undefined) return undefined;
  return props.unitType === '%' ? `${value} percent` : `${value} pixels`;
};
const handleKeyShortcuts = (handle: HandlePosition) => {
  if (!props.keyboardEnabled) return undefined;
  if (isCornerHandle(handle)) return 'ArrowUp ArrowDown ArrowLeft ArrowRight';
  return handleUsesWidth(handle) ? 'ArrowLeft ArrowRight' : 'ArrowUp ArrowDown';
};

const handleBoxFocus = (event: FocusEvent) => {
  if (event.target !== movableRef.value) return;
  if (props.keyboardEnabled && !props.disabled && !props.initRect) setActive(true);
};

const INTERACTIVE_CONTENT_SELECTOR = [
  'a[href]',
  'button',
  'input',
  'select',
  'textarea',
  '[contenteditable]:not([contenteditable="false"])',
  '[role="button"]',
  '[role="link"]',
  '[role="textbox"]',
  '[role="checkbox"]',
  '[role="radio"]',
  '[role="slider"]',
  '[role="spinbutton"]',
  '[role="switch"]',
  '[role="combobox"]',
  '[tabindex]:not([tabindex="-1"])'
].join(',');

const isKeyboardEventFromInteractiveContent = (event: KeyboardEvent) => {
  const target = event.target;
  const root = movableRef.value;
  if (!(target instanceof Element) || !root || target === root) return false;
  if (target.closest('.handle')) return false;
  const interactive = target.closest(INTERACTIVE_CONTENT_SELECTOR);
  return interactive !== null && interactive !== root && root.contains(interactive);
};

const keyboard = useKeyboard(
  () => ({
    enabled: props.keyboardEnabled,
    step: props.keyboardStep,
    disabled: props.disabled,
    readOnly: props.initRect,
    active: state.active,
    dragDirections: props.dragDirections,
    resizeDirections: props.resizeDirections,
    focusedHandle: focusedHandle.value,
    interacting: state.isDragging || state.isResizing
  }),
  {
    move: moveWithKeyboard,
    resize: resizeWithKeyboard,
    deactivate: deactivateComponent,
    cancel: source => cancelInteraction(source)
  }
);
const handleKeyDown = (event: KeyboardEvent) => {
  if (isKeyboardEventFromInteractiveContent(event)) return;
  keyboard.handleKeyDown(event);
};

const toPixelX = (value: number) => (isPercent.value ? (value / 100) * state.parentWidth : value);
const toPixelY = (value: number) => (isPercent.value ? (value / 100) * state.parentHeight : value);
const verticalGuideStyle = (value: number): CSSProperties => ({
  left: `${toPixelX(value) - toPixelX(asNumber(internalRect.value.left))}px`,
  top: `${-toPixelY(asNumber(internalRect.value.top))}px`,
  height: `${state.parentHeight}px`,
  borderColor: props.theme
});
const horizontalGuideStyle = (value: number): CSSProperties => ({
  top: `${toPixelY(value) - toPixelY(asNumber(internalRect.value.top))}px`,
  left: `${-toPixelX(asNumber(internalRect.value.left))}px`,
  width: `${state.parentWidth}px`,
  borderColor: props.theme
});

defineExpose<MovableBoxExpose>({
  getConfig: () => cloneRect(internalRect.value),
  setPosition: (left, top) => commitRect({ ...internalRect.value, left, top }),
  setSize: (width, height) => commitRect({ ...internalRect.value, width, height }),
  reset: () => commitRect(cloneRect(initialRect)),
  activate: () => setActive(true),
  deactivate: deactivateComponent,
  cancelInteraction: (source: Event | null = null) => cancelInteraction(source)
});

onUnmounted(() => {
  dropPendingFrame();
  closeInteraction();
  groupContext?.unregisterMember(memberIdentity);
  // Skip finalizeInteraction during unmount: setActive(false) would emit 'inactive' while tearing down.
  clearAdvancedState();
});
</script>

<style scoped>
.auto-draggable {
  touch-action: none;
  position: absolute;
  box-sizing: border-box;
  border: 1px solid;
  outline: none;
  user-select: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
}

.auto-draggable :deep(img),
.auto-draggable :deep(video) {
  pointer-events: none;
}

.auto-draggable :deep(*) {
  pointer-events: auto;
}

.auto-draggable.is-disabled {
  cursor: not-allowed !important;
  opacity: 0.6;
}

.auto-draggable.is-disabled .handle,
.auto-draggable.is-readonly .handle {
  display: none !important;
}

.auto-draggable.is-active {
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.auto-draggable:focus-visible,
.handle:focus-visible {
  outline: 2px solid var(--movable-box-theme, #409efd);
  outline-offset: 1px;
}

.auto-draggable.is-dragging,
.auto-draggable.is-resizing {
  opacity: 0.95;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.auto-draggable.is-dragging {
  cursor: move !important;
  z-index: 9999 !important;
}

.movable-box-guide {
  position: absolute;
  z-index: 10000;
  pointer-events: none !important;
  box-sizing: border-box;
}

.movable-box-guide--vertical {
  width: 0;
  border-left: 1px dashed;
}

.movable-box-guide--horizontal {
  height: 0;
  border-top: 1px dashed;
}

.handle {
  box-sizing: border-box;
  position: absolute;
  width: 10px;
  height: 10px;
  background: #fff;
  border: 2px solid;
  border-radius: 50%;
  z-index: 9999;
  transition: transform 0.15s ease, background-color 0.15s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
}

.handle:hover {
  transform: scale(1.2);
  background-color: #f0f9ff;
}

.handle-tl { top: -5px; left: -5px; cursor: nw-resize; }
.handle-tm { top: -5px; left: 50%; transform: translateX(-50%); cursor: n-resize; }
.handle-tr { top: -5px; right: -5px; cursor: ne-resize; }
.handle-ml { top: 50%; left: -5px; transform: translateY(-50%); cursor: w-resize; }
.handle-mr { top: 50%; right: -5px; transform: translateY(-50%); cursor: e-resize; }
.handle-bl { bottom: -5px; left: -5px; cursor: sw-resize; }
.handle-bm { bottom: -5px; left: 50%; transform: translateX(-50%); cursor: s-resize; }
.handle-br { bottom: -5px; right: -5px; cursor: se-resize; }

.handle-tm:hover,
.handle-bm:hover { transform: translateX(-50%) scale(1.2); }
.handle-ml:hover,
.handle-mr:hover { transform: translateY(-50%) scale(1.2); }

.select-none {
  user-select: none;
  -webkit-user-select: none;
}

/* Handle names and resize geometry use physical edges, so they stay fixed in RTL layouts. */
</style>
