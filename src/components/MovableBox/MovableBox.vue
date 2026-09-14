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
      'is-rotating': state.isRotating,
      'is-readonly': initRect
    }"
    :style="movableStyle"
    tabindex="0"
    @pointerdown="handlePointerDown($event, null)"
    @dblclick="emit('dblclick', $event)"
    @focus="handleBoxFocus"
    @keydown="handleKeyDown"
  >
    <div class="movable-box-guides-layer" :style="guidesLayerStyle" aria-hidden="true">
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
    </div>

    <div
      v-show="state.active && rotatable && !disabled && !initRect"
      class="rotation-handle-connector"
      :style="rotationHandleStyle"
      aria-hidden="true"
    ></div>
    <div
      v-show="state.active && rotatable && !disabled && !initRect"
      class="rotation-handle"
      :style="rotationHandleStyle"
      role="slider"
      aria-label="Rotation"
      aria-orientation="horizontal"
      :aria-valuenow="rotationAngle"
      aria-valuemin="-180"
      aria-valuemax="180"
      :aria-valuetext="`${rotationAngle} degrees`"
      :aria-keyshortcuts="keyboardEnabled ? 'ArrowLeft ArrowRight Home' : undefined"
      :tabindex="keyboardEnabled ? 0 : undefined"
      @pointerdown.stop.prevent="handleRotationPointerDown"
      @keydown="handleRotationKeyDown"
    >
      <span class="rotation-handle-mark" aria-hidden="true"></span>
    </div>

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
import {
  normalizeKeyboardStep,
  useCollision,
  useGrid,
  useKeyboard,
  useSnap,
  type OrientedCollisionResult
} from './composables';
import { asNumber, clamp, sameRect } from './core/box-geometry';
import {
  angleToRadians,
  deltaToLocal,
  normalizeAngle,
  normalizeTransformOrigin,
  quantizeAngleToward,
  resolveTransformOrigin,
  rotatedAABBAt,
  snapRotationAngle
} from './utils/rotation';
import {
  anchorLocal,
  localToWorld,
  placeAnchorAt,
  resizeWithFixedAnchor
} from './utils/fixed-anchor';
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
  escapeImproves,
  lastSafeProgress,
  orientedAABB,
  orientedOverlap,
  sweepTranslation,
  translateRect,
  type OrientedRect
} from './utils/oriented';
import { findFirstCollisionPathInterval, isValidCollisionTarget } from './utils/collision';
import { addEvent, deepClone, keepDecimalsToNum, removeEvent, setValUnit, valIsNaN } from './utils';

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
  canRotate: {
    type: Function as PropType<(value: ExtendsMovableBox) => boolean>,
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
  /** Resize semantics: incremental local delta (default) or fixed world-space anchor. */
  resizeMode: {
    type: String as PropType<'local-delta' | 'fixed-anchor'>,
    default: 'local-delta'
  },
  /** Snap angles in degrees for rotation; snapping is off when omitted or empty. */
  rotationSnapAngles: { type: Array as PropType<number[]>, default: undefined },
  /** Snap distance in degrees for rotationSnapAngles. */
  rotationSnapThreshold: { type: Number, default: 10 },
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
  /**
   * Collision semantics: 'precise' (default since v3.2.0) resolves against true rotated
   * contours with continuous collision detection; 'aabb' keeps the pre-3.2 behavior.
   */
  collisionMode: {
    type: String as PropType<'precise' | 'aabb'>,
    default: 'precise'
  },
  snapTargets: { type: Array as PropType<SnapTarget[]>, default: () => [] },
  /**
   * Obstacles for collision, separate from snapping. Defaults to snapTargets when
   * omitted; an explicit empty array means there are no collision obstacles.
   */
  collisionTargets: { type: Array as PropType<SnapTarget[]>, default: undefined },
  /** Stable identifier used by a surrounding MovableGroup; auto-generated when omitted. */
  memberId: String,
  /** Clockwise rotation in degrees; geometry uses the rotated AABB (see README). */
  rotate: { type: [Number, String] as PropType<number | string>, default: 0 },
  /** Shows an interactive rotation handle while the box is active. */
  rotatable: { type: Boolean, default: false },
  /** Visual distance in pixels between the box and the rotation handle. */
  rotationHandleOffset: { type: Number, default: 28 },
  /** CSS transform-origin for the rotation, e.g. 'center', 'top left', '50% 50%'. */
  transformOrigin: { type: String, default: 'center' }
});

const emit = defineEmits<{
  (event: 'update:modelValue', value: ExtendsMovableBox): void;
  (event: 'update:rotate', value: number): void;
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
  (event: 'rotate-start', source: Event, value: number): void;
  (event: 'rotate', value: number): void;
  (event: 'rotate-stop', source: Event, oldValue: number, newValue: number): void;
  (event: 'rotate-cancel', source: Event | null, oldValue: number, newValue: number): void;
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
const internalRotation = ref(normalizeAngle(props.rotate));
const initialRect = cloneRect(props.modelValue);
const focusedHandle = ref<HandlePosition | null>(null);
type InteractionMode = 'idle' | 'drag' | 'resize' | 'rotate';
type HandleEdges = Record<'left' | 'right' | 'top' | 'bottom', boolean>;
const HANDLE_EDGES: Record<HandlePosition, HandleEdges> = {
  tl: { left: true, right: false, top: true, bottom: false },
  tm: { left: false, right: false, top: true, bottom: false },
  tr: { left: false, right: true, top: true, bottom: false },
  ml: { left: true, right: false, top: false, bottom: false },
  mr: { left: false, right: true, top: false, bottom: false },
  bl: { left: true, right: false, top: false, bottom: true },
  bm: { left: false, right: false, top: false, bottom: true },
  br: { left: false, right: true, top: false, bottom: true }
};

const state = reactive({
  active: props.active,
  interactionMode: 'idle' as InteractionMode,
  get isDragging() {
    return this.interactionMode === 'drag';
  },
  get isResizing() {
    return this.interactionMode === 'resize';
  },
  get isRotating() {
    return this.interactionMode === 'rotate';
  },
  get isInteracting() {
    return this.interactionMode !== 'idle';
  },
  handle: null as HandlePosition | null,
  initX: 0,
  initY: 0,
  beforeInteraction: cloneRect(props.modelValue),
  beforeRotation: normalizeAngle(props.rotate),
  rotationStartPointerAngle: 0,
  rotationOriginX: 0,
  rotationOriginY: 0,
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
  () => props.rotate,
  value => {
    internalRotation.value = normalizeAngle(value);
  }
);

watch(
  () => props.active,
  value => {
    if (!value && state.isInteracting) abortInteraction();
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
const rotationAngle = computed(() => internalRotation.value);
const transformOriginStyle = computed(() => normalizeTransformOrigin(props.transformOrigin));

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
        : state.isRotating
          ? 'grabbing'
          : 'default',
  pointerEvents: props.disabled ? 'none' : 'auto',
  opacity: state.active ? 1 : 0.9,
  transform: rotationAngle.value
    ? `rotate(${rotationAngle.value}deg) translateZ(0)`
    : 'translateZ(0)',
  transformOrigin: transformOriginStyle.value,
  willChange:
    state.isDragging || state.isResizing
      ? 'left, top, width, height'
      : state.isRotating
        ? 'transform'
        : 'auto',
  transition:
    props.enableTransition && !state.isInteracting
      ? 'left 0.2s ease, top 0.2s ease, width 0.2s ease, height 0.2s ease'
      : 'none'
}));

const handleStyle = computed<CSSProperties>(() => ({
  borderColor: isResizable.value ? props.theme : props.inActiveColor,
  scale: keepDecimalsToNum(1 / valIsNaN(props.scale, 1), 1)
}));

const rotationHandleStyle = computed<CSSProperties>(() => {
  const scale = Math.abs(valIsNaN(props.scale, 1)) || 1;
  const configuredOffset = Number.isFinite(props.rotationHandleOffset)
    ? Math.max(0, props.rotationHandleOffset)
    : 28;
  return {
    '--rotation-handle-offset': `${configuredOffset / scale}px`,
    '--rotation-handle-scale': keepDecimalsToNum(1 / scale, 3),
    borderColor: props.theme,
    color: props.theme
  };
});

const commitRect = (next: ExtendsMovableBox) => {
  const value = cloneRect(next);
  internalRect.value = value;
  emit('update:modelValue', cloneRect(value));
  return value;
};

const commitRotation = (next: number) => {
  const value = normalizeAngle(roundValue(normalizeAngle(next)));
  internalRotation.value = value;
  emit('update:rotate', value);
  emit('rotate', value);
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

const getPlaneScale = () => ({
  x: isPercent.value && state.parentWidth > 0 ? state.parentWidth / 100 : 1,
  y: isPercent.value && state.parentHeight > 0 ? state.parentHeight / 100 : 1
});

// Rotated boxes are probed as their axis-aligned bounding box for bounds, snapping,
// and collision; shifts on the probe map 1:1 back onto the unrotated rectangle.
const geometryProbe = (rect: ExtendsMovableBox) => {
  const plane = numericPlane(rect);
  const angle = rotationAngle.value;
  if (!angle) return plane;
  const scale = getPlaneScale();
  const pixelPlane = {
    left: plane.left * scale.x,
    top: plane.top * scale.y,
    width: plane.width * scale.x,
    height: plane.height * scale.y
  };
  const origin = resolveTransformOrigin(props.transformOrigin, pixelPlane.width, pixelPlane.height);
  const pixelProbe = rotatedAABBAt(pixelPlane, angle, origin);
  return {
    left: pixelProbe.left / scale.x,
    top: pixelProbe.top / scale.y,
    width: pixelProbe.width / scale.x,
    height: pixelProbe.height / scale.y
  };
};

// --- Precise collision geometry (collisionMode="precise") ---
// Oriented rectangles live in container pixel space so both boxes and targets with mixed
// px/% models resolve against one true geometric shape.

const orientedFromPlane = (
  plane: { left: number; top: number; width: number; height: number },
  angle: number,
  originSpec: string
): OrientedRect => {
  const scale = getPlaneScale();
  const left = plane.left * scale.x;
  const top = plane.top * scale.y;
  const width = plane.width * scale.x;
  const height = plane.height * scale.y;
  return {
    left,
    top,
    width,
    height,
    angle,
    origin: resolveTransformOrigin(originSpec, width, height)
  };
};

const selfOriented = (rect: ExtendsMovableBox, angle = rotationAngle.value): OrientedRect =>
  orientedFromPlane(numericPlane(rect), angle, props.transformOrigin);

// Target geometry depends on the target's own fields (position, size, angle, origin) and
// on the container dimensions when unitType is percent. The version counter invalidates
// the cache on any of those changes; unresolved entries are recomputed on demand.
let targetGeometryVersion = 0;
let targetGeometryCache: WeakMap<SnapTarget, OrientedRect> | null = null;
// Bumping the version drops every cached entry lazily on next access; the WeakMap is
// rebuilt once per generation so stale geometry can never be served after invalidation.
const invalidateTargetGeometry = () => {
  targetGeometryVersion += 1;
  targetGeometryCache = null;
};
watch(
  () => [props.snapTargets, props.collisionTargets, props.transformOrigin],
  invalidateTargetGeometry,
  { deep: true }
);
watch(() => [state.parentWidth, state.parentHeight, props.unitType], invalidateTargetGeometry);

const computeOrientedTarget = (target: SnapTarget): OrientedRect => {
  if (targetGeometryCache === null) {
    targetGeometryCache = new WeakMap();
  }
  const cached = targetGeometryCache.get(target);
  if (cached) return cached;
  const scale = getPlaneScale();
  const plane = {
    left: asNumber(target.left) * scale.x,
    top: asNumber(target.top) * scale.y,
    width: asNumber(target.width) * scale.x,
    height: asNumber(target.height) * scale.y
  };
  const oriented: OrientedRect = {
    ...plane,
    id: target.id,
    angle: normalizeAngle(target.rotate ?? 0),
    origin: resolveTransformOrigin(target.transformOrigin ?? 'center', plane.width, plane.height)
  };
  targetGeometryCache.set(target, oriented);
  return oriented;
};

const orientedSnapTarget = (target: SnapTarget): OrientedRect => computeOrientedTarget(target);

const orientedSnapTargets = (): OrientedRect[] =>
  collisionObstacles().filter(isValidCollisionTarget).map(orientedSnapTarget);

/** Snap targets described by their visual (rotated AABB) contour, back in model units. */
const visualSnapTargets = () => {
  if (!props.snapToElements) return externalSnapTargets();
  const scale = getPlaneScale();
  return externalSnapTargets().map(target => {
    if (!normalizeAngle(target.rotate ?? 0)) return target;
    const box = orientedAABB(orientedSnapTarget(target));
    return {
      left: box.left / scale.x,
      top: box.top / scale.y,
      width: box.width / scale.x,
      height: box.height / scale.y,
      id: target.id
    };
  });
};

const collisionConstrains = () =>
  props.collisionEnabled && !props.allowOverlap && isPreciseCollision.value;

// Rounding a resolved contact back onto the model grid can leave a sub-unit penetration.
// Re-verify the rounded rectangle and retreat toward the previous rect until it is safe;
// if nothing in between is safe, keep the last safe state. When the previous rect already
// overlapped a target, "safe" means a strictly smaller overlap (gradual escape) instead
// of full separation.
const roundedSafeRect = (
  resolved: ExtendsMovableBox,
  previous: ExtendsMovableBox,
  targets: OrientedRect[]
): ExtendsMovableBox => {
  const overlapTotal = (rect: ExtendsMovableBox) => {
    const oriented = selfOriented(rect);
    let total = 0;
    for (const target of targets) {
      const overlap = orientedOverlap(oriented, target);
      if (overlap.overlapping) total += overlap.overlapArea;
    }
    return total;
  };
  const previousArea = overlapTotal(previous);
  const verify = (rect: ExtendsMovableBox) => escapeImproves(previousArea, overlapTotal(rect));
  if (verify(resolved)) return resolved;
  // Retreat the position only: shrinking width/height here could drop the rectangle
  // below its configured minimum sizes, which position retreat avoids.
  for (let fraction = 0.8; fraction > 0.01; fraction -= 0.2) {
    const retreated = {
      ...resolved,
      left: roundValue(
        asNumber(previous.left) + (asNumber(resolved.left) - asNumber(previous.left)) * fraction
      ),
      top: roundValue(
        asNumber(previous.top) + (asNumber(resolved.top) - asNumber(previous.top)) * fraction
      )
    };
    if (verify(retreated)) return retreated;
  }
  return previous;
};

const resolveCollisionPrecise = (
  candidate: ExtendsMovableBox,
  previous: ExtendsMovableBox,
  resolution: 'path' | 'slide'
) => {
  const targets = orientedSnapTargets();
  const from = selfOriented(previous);
  const to = selfOriented(candidate);
  const result =
    resolution === 'slide'
      ? collision.resolveOrientedTranslation(from, to, targets)
      : collision.resolveOrientedChange(from, to, targets);
  publishCollision(result);
  if (!result.accepted) return null;
  const scale = getPlaneScale();
  const resolved = {
    ...candidate,
    left: roundValue(result.rect.left / scale.x),
    top: roundValue(result.rect.top / scale.y),
    width: roundValue(result.rect.width / scale.x),
    height: roundValue(result.rect.height / scale.y)
  };
  if (!collisionConstrains()) return resolved;
  return roundedSafeRect(resolved, previous, targets);
};

// --- Rotation constraints (precise mode) ---
// Pointer and keyboard rotation walk the whole angle path: bounds use the visual AABB and
// collisions use the true rotated contour, so a rotation cannot swing through obstacles.

const rotationCollides = () =>
  props.collisionEnabled && !props.allowOverlap && isPreciseCollision.value;

const rotationOutOfBoundsAt = (angle: number): boolean => {
  if (!props.limitAreaForParent || !state.parentElement) return false;
  const edges = getAreaEdges();
  const box = orientedAABB(selfOriented(internalRect.value, angle));
  // The oriented box lives in pixel space; area edges use model units (px or %).
  const scale = getPlaneScale();
  const left = box.left / scale.x;
  const top = box.top / scale.y;
  const width = box.width / scale.x;
  const height = box.height / scale.y;
  const epsilon = 1e-7;
  return (
    left < edges.minLeft - epsilon ||
    left + width > edges.maxRight + epsilon ||
    top < edges.minTop - epsilon ||
    top + height > edges.maxBottom + epsilon
  );
};

// Targets are resolved once per rotation so sampling (48 steps + bisection) does not
// rebuild the oriented geometry for every sample.
const rotationViolatesAt = (angle: number, targets: OrientedRect[]): boolean => {
  if (rotationOutOfBoundsAt(angle)) return true;
  if (!rotationCollides() || targets.length === 0) return false;
  const oriented = selfOriented(internalRect.value, angle);
  return targets.some(target => orientedOverlap(oriented, target).overlapping);
};

// Sample at most every two degrees so even large pointer swings cannot step over an obstacle.
const rotationStepCount = (from: number, to: number): number =>
  Math.max(48, Math.ceil(Math.abs(to - from) / 2));

// Walks the angle path with uniform sampling plus bisection refinement and returns the
// largest safe angle. Start and end being safe does not imply the path is: a corner can
// sweep through an obstacle mid-rotation and come out clear on the other side.
const lastSafeRotationAngle = (from: number, to: number, targets: OrientedRect[]): number => {
  const progress = lastSafeProgress(
    step => rotationViolatesAt(from + (to - from) * step, targets),
    rotationStepCount(from, to)
  );
  // An unblocked path returns the requested angle verbatim so the commit stays bit-exact.
  return progress === 1 ? to : from + (to - from) * progress;
};

const constrainRotation = (from: number, to: number): number => {
  if (Math.abs(to - from) < 1e-9) return normalizeAngle(to);
  const constrainsBounds = props.limitAreaForParent && Boolean(state.parentElement);
  const targets = rotationCollides() ? orientedSnapTargets() : [];
  if (!constrainsBounds && targets.length === 0) return normalizeAngle(to);
  const decimalPlaces = props.isKeepDecimals ? props.decimalPlaces : 0;
  if (rotationViolatesAt(from, targets)) {
    // Already violating (out of bounds or overlapping): scan toward the requested angle
    // for the first fully safe angle so the interaction can recover instead of locking.
    const steps = rotationStepCount(from, to);
    for (let index = 1; index <= steps; index += 1) {
      const angle = from + ((to - from) * index) / steps;
      if (!rotationViolatesAt(angle, targets)) {
        const recovered = normalizeAngle(quantizeAngleToward(to, angle, decimalPlaces));
        if (!rotationViolatesAt(recovered, targets)) return recovered;
      }
    }
    return normalizeAngle(from);
  }
  const lastSafe = lastSafeRotationAngle(from, to, targets);
  return normalizeAngle(quantizeAngleToward(from, lastSafe, decimalPlaces));
};

// Shrinks an over-large rotated rectangle so its AABB fits the area; clamping alone
// could only translate it, leaving part of the box outside the bounds. Reductions
// prefer the dragged axis (edge handles shrink only that axis), while corner handles
// and ratioLock shrink along the drag ray with one uniform factor. When a
// minWidth/minHeight floor conflicts with fitting, the floor wins and the residual
// overflow is reported through out-of-bounds.
const fitRotatedSizeToArea = (
  candidate: ExtendsMovableBox,
  handle: HandlePosition | null
): ExtendsMovableBox => {
  const angle = rotationAngle.value;
  if (
    (!angle && props.resizeMode !== 'fixed-anchor') ||
    !props.limitAreaForParent ||
    !state.parentElement
  ) {
    return candidate;
  }
  const edges = getAreaEdges();
  const areaWidth = Math.max(0, edges.maxRight - edges.minLeft);
  const areaHeight = Math.max(0, edges.maxBottom - edges.minTop);
  const rad = angleToRadians(angle);
  // Exact right angles leave ~1e-17 residues; zero them so the coefficient guards below
  // treat 90/180-degree spans as truly decoupled.
  const cosA = Math.abs(Math.cos(rad)) < 1e-9 ? 0 : Math.abs(Math.cos(rad));
  const sinA = Math.abs(Math.sin(rad)) < 1e-9 ? 0 : Math.abs(Math.sin(rad));
  const scale = getPlaneScale();
  const horizontalWidthFactor = cosA;
  const horizontalHeightFactor = sinA * (scale.y / scale.x);
  const verticalWidthFactor = sinA * (scale.x / scale.y);
  const verticalHeightFactor = cosA;
  const width = asNumber(candidate.width);
  const height = asNumber(candidate.height);
  const handleEdges = handle ? HANDLE_EDGES[handle] : null;
  const anchorRight = asNumber(candidate.left) + width;
  const anchorBottom = asNumber(candidate.top) + height;
  const withAnchoredSize = (nextWidth: number, nextHeight: number): ExtendsMovableBox => ({
    ...candidate,
    left: handleEdges?.left ? roundValue(anchorRight - nextWidth) : candidate.left,
    top: handleEdges?.top ? roundValue(anchorBottom - nextHeight) : candidate.top,
    width: nextWidth,
    height: nextHeight
  });
  const withContinuousAnchoredSize = (
    nextWidth: number,
    nextHeight: number
  ): ExtendsMovableBox => ({
    ...candidate,
    left: handleEdges?.left ? anchorRight - nextWidth : candidate.left,
    top: handleEdges?.top ? anchorBottom - nextHeight : candidate.top,
    width: nextWidth,
    height: nextHeight
  });
  const spanWidth = horizontalWidthFactor * width + horizontalHeightFactor * height;
  const spanHeight = verticalWidthFactor * width + verticalHeightFactor * height;
  const minWidth = Math.max(0, valIsNaN(props.minWidth, 0));
  const minHeight = Math.max(0, valIsNaN(props.minHeight, 0));
  const affectsWidth = handle === null || Boolean(handleEdges?.left || handleEdges?.right);
  const affectsHeight = handle === null || Boolean(handleEdges?.top || handleEdges?.bottom);
  const anchorsRight = handleEdges?.left ?? false;
  const anchorsBottom = handleEdges?.top ?? false;

  // A left/top handle must keep its opposite local edge fixed. Span fitting alone only
  // proves that the AABB can fit somewhere; a later positional clamp could otherwise
  // translate the rectangle and move that fixed edge. Because supported transform origins
  // are linear in width/height, every relevant AABB edge is linear along this shrink path.
  const fitAtAnchoredEdges = (fitted: ExtendsMovableBox, uniform: boolean) => {
    if (!anchorsRight && !anchorsBottom) return fitted;
    const fittedWidth = asNumber(fitted.width);
    const fittedHeight = asNumber(fitted.height);
    const floorFactor = uniform
      ? Math.min(
          1,
          Math.max(
            fittedWidth > 0 ? minWidth / fittedWidth : 0,
            fittedHeight > 0 ? minHeight / fittedHeight : 0
          )
        )
      : 0;
    const startWidth = uniform
      ? fittedWidth * floorFactor
      : anchorsRight
        ? Math.min(fittedWidth, minWidth)
        : fittedWidth;
    const startHeight = uniform
      ? fittedHeight * floorFactor
      : anchorsBottom
        ? Math.min(fittedHeight, minHeight)
        : fittedHeight;
    const dimensionsAt = (progress: number) => ({
      width: startWidth + (fittedWidth - startWidth) * progress,
      height: startHeight + (fittedHeight - startHeight) * progress
    });
    const continuousRectAt = (progress: number) => {
      const dimensions = dimensionsAt(progress);
      return withContinuousAnchoredSize(dimensions.width, dimensions.height);
    };
    const quantizedRectAt = (progress: number) => {
      const dimensions = dimensionsAt(progress);
      const quantize = props.isKeepDecimals ? roundValue : Math.floor;
      return withAnchoredSize(
        Math.max(minWidth, quantize(dimensions.width)),
        Math.max(minHeight, quantize(dimensions.height))
      );
    };
    const fitsAnchors = (rect: ExtendsMovableBox) => {
      const probe = geometryProbe(rect);
      const epsilon = 1e-7;
      return (
        (!anchorsRight ||
          (probe.left >= edges.minLeft - epsilon &&
            probe.left + probe.width <= edges.maxRight + epsilon)) &&
        (!anchorsBottom ||
          (probe.top >= edges.minTop - epsilon &&
            probe.top + probe.height <= edges.maxBottom + epsilon))
      );
    };
    if (fitsAnchors(fitted)) return fitted;

    const startProbe = geometryProbe(continuousRectAt(0));
    const endProbe = geometryProbe(continuousRectAt(1));
    let lower = 0;
    let upper = 1;
    let feasible = true;
    const constrainMinimum = (start: number, end: number, bound: number) => {
      const delta = end - start;
      if (Math.abs(delta) < 1e-9) {
        if (start < bound) feasible = false;
        return;
      }
      const threshold = (bound - start) / delta;
      if (delta > 0) lower = Math.max(lower, threshold);
      else upper = Math.min(upper, threshold);
    };
    const constrainMaximum = (start: number, end: number, bound: number) => {
      const delta = end - start;
      if (Math.abs(delta) < 1e-9) {
        if (start > bound) feasible = false;
        return;
      }
      const threshold = (bound - start) / delta;
      if (delta > 0) upper = Math.min(upper, threshold);
      else lower = Math.max(lower, threshold);
    };
    if (anchorsRight) {
      constrainMinimum(startProbe.left, endProbe.left, edges.minLeft);
      constrainMaximum(
        startProbe.left + startProbe.width,
        endProbe.left + endProbe.width,
        edges.maxRight
      );
    }
    if (anchorsBottom) {
      constrainMinimum(startProbe.top, endProbe.top, edges.minTop);
      constrainMaximum(
        startProbe.top + startProbe.height,
        endProbe.top + endProbe.height,
        edges.maxBottom
      );
    }
    lower = Math.max(0, lower);
    upper = Math.min(1, upper);
    if (!feasible || lower > upper) return quantizedRectAt(0);

    const result = quantizedRectAt(upper);
    if (fitsAnchors(result)) return result;
    // Quantization can round a boundary value back outside by one unit. Retreat along
    // the same anchored path until the largest representable fitting value is found.
    let fittingProgress = lower;
    let overflowingProgress = upper;
    if (!fitsAnchors(quantizedRectAt(fittingProgress))) return quantizedRectAt(0);
    for (let index = 0; index < 32; index += 1) {
      const middle = (fittingProgress + overflowingProgress) / 2;
      if (fitsAnchors(quantizedRectAt(middle))) fittingProgress = middle;
      else overflowingProgress = middle;
    }
    return quantizedRectAt(fittingProgress);
  };

  if (props.ratioLock || (affectsWidth && affectsHeight)) {
    const factor = Math.min(
      1,
      spanWidth > areaWidth ? areaWidth / spanWidth : 1,
      spanHeight > areaHeight ? areaHeight / spanHeight : 1
    );
    // Lift the factor so fitted sizes keep at least the configured floors; the floors
    // may reintroduce a bounded overflow, which reportOutOfBounds then reports.
    const lifted = Math.max(
      factor,
      width > 0 ? minWidth / width : 0,
      height > 0 ? minHeight / height : 0
    );
    const fitted = Math.min(lifted, 1);
    if (fitted >= 1) return fitAtAnchoredEdges(candidate, true);
    // Re-clamp after flooring: float round-off or fractional floors could otherwise
    // land a pixel below minWidth/minHeight.
    return fitAtAnchoredEdges(
      withAnchoredSize(
        Math.max(minWidth, Math.floor(width * fitted)),
        Math.max(minHeight, Math.floor(height * fitted))
      ),
      true
    );
  }

  // Solve each span constraint for the dragged dimension; a span without a width (or
  // height) term at this angle imposes no limit on that axis. Floor the solved limits
  // so rounding cannot leave a sub-pixel overflow behind.
  const widthLimit = Math.floor(
    Math.min(
      horizontalWidthFactor > 0
        ? (areaWidth - horizontalHeightFactor * height) / horizontalWidthFactor
        : Infinity,
      verticalWidthFactor > 0
        ? (areaHeight - verticalHeightFactor * height) / verticalWidthFactor
        : Infinity
    )
  );
  const heightLimit = Math.floor(
    Math.min(
      horizontalHeightFactor > 0
        ? (areaWidth - horizontalWidthFactor * width) / horizontalHeightFactor
        : Infinity,
      verticalHeightFactor > 0
        ? (areaHeight - verticalWidthFactor * width) / verticalHeightFactor
        : Infinity
    )
  );
  const nextWidth = affectsWidth ? Math.max(minWidth, Math.min(width, widthLimit)) : width;
  const nextHeight = affectsHeight ? Math.max(minHeight, Math.min(height, heightLimit)) : height;
  if (nextWidth === width && nextHeight === height) {
    return fitAtAnchoredEdges(candidate, false);
  }
  return fitAtAnchoredEdges(withAnchoredSize(nextWidth, nextHeight), false);
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
// Progress values are quantized to six decimals (floored, never above the true entry) so
// the shared group delta lands on the contact position without sweep float residue and
// without rounding into the obstacle.
const quantizeProgress = (progress: number) => Math.max(0, Math.floor(progress * 1e6) / 1e6);

const memberApi: GroupMemberApi = {
  getRect: () => cloneRect(internalRect.value),
  getVisualRect: () => geometryProbe(cloneRect(internalRect.value)),
  translateTo: rect => {
    commitRect(rect);
  },
  // The group constraint loop runs per frame, so re-resolving layout on every call would
  // dominate group drags. Resolve the area lazily once per member, then reuse the
  // snapshot (refreshed at each interaction start by the box itself).
  getAreaEdges: () => {
    if (!state.parentElement) refreshArea();
    return state.parentElement ? getAreaEdges() : null;
  },
  // Largest fraction of a shared group delta this box can absorb without colliding,
  // swept from the member's drag-start rectangle: the group re-applies the limited delta
  // to the start rectangle on every frame, so both sides must reference the same origin.
  // A start position already overlapping an obstacle only permits escape motions that
  // strictly shrink the overlap, matching the interaction pipeline's escape rule.
  sharedDeltaProgress: (startRect, delta) => {
    if (!props.collisionEnabled || props.allowOverlap) return 1;
    const scale = getPlaneScale();
    if (isPreciseCollision.value) {
      const targets = orientedSnapTargets();
      const fromOriented = selfOriented(startRect);
      const deltaPx = { x: delta.left * scale.x, y: delta.top * scale.y };
      const overlapAt = (rect: OrientedRect) => {
        let total = 0;
        for (const target of targets) total += orientedOverlap(rect, target).overlapArea;
        return total;
      };
      const fromOverlap = overlapAt(fromOriented);
      if (fromOverlap > 0) {
        return escapeImproves(fromOverlap, overlapAt(translateRect(fromOriented, deltaPx))) ? 1 : 0;
      }
      const sweep = sweepTranslation(fromOriented, deltaPx, targets);
      if (!sweep) return 1;
      return quantizeProgress(sweep.interval.entry);
    }
    const fromPlane = numericPlane(startRect);
    const toPlane = {
      ...fromPlane,
      left: fromPlane.left + delta.left,
      top: fromPlane.top + delta.top
    };
    const interval = findFirstCollisionPathInterval(fromPlane, toPlane, collisionObstacles());
    if (!interval) return 1;
    return quantizeProgress(interval.entry);
  }
};
onMounted(() => {
  groupContext?.registerMember(memberIdentity, memberApi);
  // Container resizes mid-interaction must reach the target-geometry cache and the area
  // snapshot; jsdom and older environments without ResizeObserver fall back to this.
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', refreshArea);
  }
});

const externalSnapTargets = () =>
  groupContext
    ? props.snapTargets.filter(target => !groupContext.hasMember(target.id))
    : props.snapTargets;

// Collision obstacles: collisionTargets when provided (an explicit empty array disables
// collision), otherwise the snap targets. Group members never obstruct each other.
const collisionObstacles = (): SnapTarget[] => {
  const list = props.collisionTargets === undefined ? props.snapTargets : props.collisionTargets;
  return groupContext ? list.filter(target => !groupContext.hasMember(target.id)) : list;
};

const roundValue = (value: number) =>
  props.isKeepDecimals ? keepDecimalsToNum(value, 0, props.decimalPlaces) : Math.round(value);
// Converts a pointer displacement that is already expressed in unscaled canvas pixels
// into model units for one axis.
const scaledPixelToModel = (pixels: number, axis: 'horizontal' | 'vertical') => {
  if (!isPercent.value) return roundValue(pixels);
  const dimension = axis === 'horizontal' ? state.parentWidth : state.parentHeight;
  return dimension > 0 ? roundValue((pixels / dimension) * 100) : 0;
};
const scaledDelta = (value: number, axis: 'horizontal' | 'vertical') => {
  const configuredScale = valIsNaN(props.scale, 1);
  const scaled = value / (configuredScale === 0 ? 1 : configuredScale);
  return scaledPixelToModel(scaled, axis);
};

const grid = useGrid(() => ({ snapToGrid: props.snapToGrid, gridSize: props.gridSize }));
const snap = useSnap(() => ({
  enabled: props.snapToElements,
  threshold: props.snapThreshold,
  filter: props.snapFilter,
  priority: props.snapPriority
}));
const isPreciseCollision = computed(() => props.collisionMode !== 'aabb');
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

const publishCollision = (result: { dominant: OrientedCollisionResult | null }) => {
  const dominant = result.dominant;
  const payload: CollisionEventPayload = dominant
    ? {
        colliding: true,
        direction: dominant.direction,
        targetId: dominant.targetId,
        normal: dominant.normal ? { ...dominant.normal } : undefined
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
  if (isPreciseCollision.value) {
    return resolveCollisionPrecise(candidate, previous, resolution);
  }
  const candidateProbe = geometryProbe(candidate);
  const result = collision.resolveCandidate(
    candidateProbe,
    geometryProbe(previous),
    collisionObstacles(),
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
    if (resolution === 'path' && result.progress !== undefined) {
      const progress = clamp(result.progress, 0, 1);
      const previousPlane = numericPlane(previous);
      const candidatePlane = numericPlane(candidate);
      return {
        ...candidate,
        left: roundValue(
          previousPlane.left + (candidatePlane.left - previousPlane.left) * progress
        ),
        top: roundValue(previousPlane.top + (candidatePlane.top - previousPlane.top) * progress),
        width: roundValue(
          previousPlane.width + (candidatePlane.width - previousPlane.width) * progress
        ),
        height: roundValue(
          previousPlane.height + (candidatePlane.height - previousPlane.height) * progress
        )
      };
    }
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
    snapResult = snap.resolveSnap(probe, visualSnapTargets(), axes);
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
    const resolvedProbe = geometryProbe(next);
    const horizontalChanged = roundValue(resolvedProbe.left) !== roundValue(snapResult.left);
    const verticalChanged = roundValue(resolvedProbe.top) !== roundValue(snapResult.top);
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

// Solves a resize candidate from a pixel-space pointer delta, dispatching between the
// incremental local-delta model and the fixed world-space anchor model.
const resolveResizeCandidate = (
  start: ExtendsMovableBox,
  handle: HandlePosition,
  rawPx: { x: number; y: number }
): ExtendsMovableBox => {
  if (props.resizeMode !== 'fixed-anchor') {
    const localPx = deltaToLocal(rawPx.x, rawPx.y, rotationAngle.value);
    const localDelta = {
      x: scaledPixelToModel(localPx.x, 'horizontal'),
      y: scaledPixelToModel(localPx.y, 'vertical')
    };
    return resizeFromHandle(start, handle, localDelta.x, localDelta.y);
  }
  const scale = getPlaneScale();
  const startWidth = asNumber(start.width);
  const startHeight = asNumber(start.height);
  // Size limits are configured in model units and must be solved in pixel space;
  // non-positive maxima mean unlimited, matching the local-delta path.
  const minWidthProp = Math.max(0, valIsNaN(props.minWidth, 0));
  const minHeightProp = Math.max(0, valIsNaN(props.minHeight, 0));
  const maxWidthProp = valIsNaN(props.maxWidth, Infinity);
  const maxHeightProp = valIsNaN(props.maxHeight, Infinity);
  const candidatePx = resizeWithFixedAnchor({
    start: {
      left: asNumber(start.left) * scale.x,
      top: asNumber(start.top) * scale.y,
      width: startWidth * scale.x,
      height: startHeight * scale.y
    },
    angle: rotationAngle.value,
    originSpec: props.transformOrigin,
    handle,
    pointerDelta: rawPx,
    minWidth: minWidthProp * scale.x,
    minHeight: minHeightProp * scale.y,
    maxWidth: maxWidthProp > 0 ? maxWidthProp * scale.x : Infinity,
    maxHeight: maxHeightProp > 0 ? maxHeightProp * scale.y : Infinity,
    ratio:
      props.ratioLock && startWidth > 0 && startHeight > 0
        ? (startWidth * scale.x) / (startHeight * scale.y)
        : null
  });
  return {
    ...start,
    left: roundValue(candidatePx.left / scale.x),
    top: roundValue(candidatePx.top / scale.y),
    width: roundValue(candidatePx.width / scale.x),
    height: roundValue(candidatePx.height / scale.y)
  };
};

// Restores the fixed-anchor world position after bounds fitting and clamping moved the
// rectangle. Bounds take priority: the restored placement is only kept when it stays
// inside the bounds area.
const applyFixedAnchorPlacement = (
  start: ExtendsMovableBox,
  candidate: ExtendsMovableBox,
  handle: HandlePosition
): ExtendsMovableBox => {
  const scale = getPlaneScale();
  const angle = rotationAngle.value;
  const startPx = {
    left: asNumber(start.left) * scale.x,
    top: asNumber(start.top) * scale.y,
    width: asNumber(start.width) * scale.x,
    height: asNumber(start.height) * scale.y
  };
  const anchorWorld = localToWorld(
    startPx,
    angle,
    props.transformOrigin,
    anchorLocal(handle, startPx.width, startPx.height)
  );
  const placedPx = placeAnchorAt(
    {
      left: asNumber(candidate.left) * scale.x,
      top: asNumber(candidate.top) * scale.y,
      width: asNumber(candidate.width) * scale.x,
      height: asNumber(candidate.height) * scale.y
    },
    angle,
    props.transformOrigin,
    handle,
    anchorWorld
  );
  const restored = {
    ...candidate,
    left: roundValue(placedPx.left / scale.x),
    top: roundValue(placedPx.top / scale.y)
  };
  if (!props.limitAreaForParent || !state.parentElement) return restored;
  const edges = getAreaEdges();
  const fitsBounds = (rect: ExtendsMovableBox) => {
    const probe = geometryProbe(rect);
    const epsilon = 1e-7;
    return (
      probe.left >= edges.minLeft - epsilon &&
      probe.left + probe.width <= edges.maxRight + epsilon &&
      probe.top >= edges.minTop - epsilon &&
      probe.top + probe.height <= edges.maxBottom + epsilon
    );
  };
  if (fitsBounds(restored)) return restored;

  // A positional clamp can keep the requested size by moving the whole rectangle,
  // which breaks the defining fixed-anchor invariant. When a smaller anchored size can
  // fit, walk back along the same resize ray before falling back to bounds priority.
  const width = asNumber(candidate.width);
  const height = asNumber(candidate.height);
  const minWidth = Math.max(0, valIsNaN(props.minWidth, 0));
  const minHeight = Math.max(0, valIsNaN(props.minHeight, 0));
  const effectiveMinWidth = Math.min(width, minWidth);
  const effectiveMinHeight = Math.min(height, minHeight);
  const handleEdges = HANDLE_EDGES[handle];
  const affectsWidth = handleEdges.left || handleEdges.right;
  const affectsHeight = handleEdges.top || handleEdges.bottom;
  const uniform = props.ratioLock || (affectsWidth && affectsHeight);
  const floorFactor = uniform
    ? Math.min(
        1,
        Math.max(
          width > 0 ? effectiveMinWidth / width : 0,
          height > 0 ? effectiveMinHeight / height : 0
        )
      )
    : 0;
  const floorWidth = uniform ? width * floorFactor : affectsWidth ? effectiveMinWidth : width;
  const floorHeight = uniform ? height * floorFactor : affectsHeight ? effectiveMinHeight : height;
  const anchoredRectAt = (progress: number): ExtendsMovableBox => {
    const quantize = props.isKeepDecimals ? roundValue : Math.floor;
    const nextWidth = Math.max(
      effectiveMinWidth,
      quantize(floorWidth + (width - floorWidth) * progress)
    );
    const nextHeight = Math.max(
      effectiveMinHeight,
      quantize(floorHeight + (height - floorHeight) * progress)
    );
    const positioned = placeAnchorAt(
      {
        left: 0,
        top: 0,
        width: nextWidth * scale.x,
        height: nextHeight * scale.y
      },
      angle,
      props.transformOrigin,
      handle,
      anchorWorld
    );
    return {
      ...candidate,
      left: roundValue(positioned.left / scale.x),
      top: roundValue(positioned.top / scale.y),
      width: nextWidth,
      height: nextHeight
    };
  };

  const floorRect = anchoredRectAt(0);
  if (!fitsBounds(floorRect)) return candidate;
  let fittingProgress = 0;
  let overflowingProgress = 1;
  for (let index = 0; index < 40; index += 1) {
    const middle = (fittingProgress + overflowingProgress) / 2;
    if (fitsBounds(anchoredRectAt(middle))) fittingProgress = middle;
    else overflowingProgress = middle;
  }
  return anchoredRectAt(fittingProgress);
};

const resizeFromHandle = (
  start: ExtendsMovableBox,
  handle: HandlePosition,
  deltaX: number,
  deltaY: number
): ExtendsMovableBox => {
  const handleEdges = HANDLE_EDGES[handle];
  const startLeft = asNumber(start.left);
  const startTop = asNumber(start.top);
  const startWidth = asNumber(start.width);
  const startHeight = asNumber(start.height);
  let left = startLeft;
  let right = startLeft + startWidth;
  let top = startTop;
  let bottom = startTop + startHeight;

  if (handleEdges.left) left += deltaX;
  if (handleEdges.right) right += deltaX;
  if (handleEdges.top) top += deltaY;
  if (handleEdges.bottom) bottom += deltaY;

  const horizontalCenter = (left + right) / 2;
  const verticalCenter = (top + bottom) / 2;
  let width = Math.max(0, right - left);
  let height = Math.max(0, bottom - top);
  const ratio = startWidth > 0 && startHeight > 0 ? startWidth / startHeight : 1;

  const setWidth = (value: number) => {
    width = value;
    if (handleEdges.left) left = right - width;
    else if (handleEdges.right) right = left + width;
    else {
      left = horizontalCenter - width / 2;
      right = horizontalCenter + width / 2;
    }
  };
  const setHeight = (value: number) => {
    height = value;
    if (handleEdges.top) top = bottom - height;
    else if (handleEdges.bottom) bottom = top + height;
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
  // Rotated rectangles are constrained later through their visual AABB. Applying local
  // left/right/top/bottom limits here would reject sizes that still fit after rotation.
  const constrainToArea =
    props.limitAreaForParent && Boolean(state.parentElement) && rotationAngle.value === 0;
  const availableWidth = !constrainToArea
    ? Infinity
    : handleEdges.left
      ? Math.max(0, right - edges.minLeft)
      : handleEdges.right
        ? Math.max(0, edges.maxRight - left)
        : Math.max(
            0,
            2 * Math.min(horizontalCenter - edges.minLeft, edges.maxRight - horizontalCenter)
          );
  const availableHeight = !constrainToArea
    ? Infinity
    : handleEdges.top
      ? Math.max(0, bottom - edges.minTop)
      : handleEdges.bottom
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

const pointerAngleFromOrigin = (source: PointerEvent, originX: number, originY: number) =>
  (Math.atan2(source.clientY - originY, source.clientX - originX) * 180) / Math.PI + 90;

const processInteraction = (source: PointerEvent) => {
  if (props.disabled || props.initRect || !state.isInteracting) return;

  if (state.isRotating) {
    const pointerAngle = pointerAngleFromOrigin(
      source,
      state.rotationOriginX,
      state.rotationOriginY
    );
    const delta = normalizeAngle(pointerAngle - state.rotationStartPointerAngle);
    const snapped = snapRotationAngle(
      state.beforeRotation + delta,
      props.rotationSnapAngles ?? [],
      props.rotationSnapThreshold
    );
    commitRotation(constrainRotation(state.beforeRotation, snapped));
    return;
  }

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
    // Resize deltas rotate in pixel space first and only then map onto model units:
    // rotating raw percent values would conflate the width-based and height-based axes.
    const configuredScale = valIsNaN(props.scale, 1);
    const divisor = configuredScale === 0 ? 1 : configuredScale;
    const rawPx = {
      x: (source.clientX - state.initX) / divisor,
      y: (source.clientY - state.initY) / divisor
    };
    let candidate = resolveResizeCandidate(state.beforeInteraction, state.handle, rawPx);
    // Unrotated local-delta boxes are constrained against local edges in
    // resizeFromHandle. Rotated boxes and fixed-anchor resizes instead fit their visual
    // box into the area and then clamp that box.
    if (rotationAngle.value || props.resizeMode === 'fixed-anchor') {
      candidate = fitRotatedSizeToArea(candidate, state.handle);
      candidate = clampPosition(candidate);
      if (props.resizeMode === 'fixed-anchor') {
        candidate = applyFixedAnchorPlacement(state.beforeInteraction, candidate, state.handle);
      }
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
  if (state.isInteracting) cancelInteraction(source);
};
const handleInteractionKeyDown = (source: KeyboardEvent) => {
  if (source.key !== 'Escape') return;
  if (!state.isInteracting) return;
  source.preventDefault();
  source.stopPropagation();
  cancelInteraction(source);
};

const addInteractionListeners = () => {
  const element = state.eventElement;
  if (!element) return;
  const options = { passive: false };
  addEvent(element, 'pointermove', handlePointerMove, options);
  addEvent(element, 'pointerup', handlePointerUp, options);
  addEvent(element, 'pointercancel', handlePointerCancel, options);
  addEvent(element, 'keydown', handleInteractionKeyDown, true);
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
  removeEvent(element, 'keydown', handleInteractionKeyDown, true);
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
  state.interactionMode = 'idle';
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
  const wasRotating = state.isRotating;
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
  if (wasRotating) {
    internalRotation.value = state.beforeRotation;
    emit('update:rotate', state.beforeRotation);
    emit('rotate-cancel', source, state.beforeRotation, state.beforeRotation);
  }
  finalizeInteraction();
}

function deactivateComponent() {
  abortInteraction();
  setActive(false);
}

const startInteraction = (source: PointerEvent, handle: HandlePosition | null) => {
  if (props.disabled || props.initRect) return;
  if (state.isInteracting) return;
  if (handle && (!isResizable.value || !isHandleAllowed(handle))) return;
  if (!handle && !props.draggable) return;

  const currentRect = cloneRect(internalRect.value);
  if (handle) {
    if (props.canResize?.(currentRect, handle) === false) return;
  } else if (props.canDrag?.(currentRect) === false) {
    return;
  }

  groupDragLeader = false;
  if (!handle && groupContext) {
    const disposition = groupContext.beginDrag(memberIdentity, source);
    if (disposition === 'blocked') return;
    groupDragLeader = disposition === 'group';
  }

  refreshArea();
  state.pointerId = typeof source.pointerId === 'number' ? source.pointerId : null;
  state.initX = source.clientX;
  state.initY = source.clientY;
  state.beforeInteraction = cloneRect(internalRect.value);
  state.handle = handle;
  state.interactionMode = handle ? 'resize' : 'drag';
  setActive(true);

  if (state.isDragging) emit('drag-start', source, cloneRect(state.beforeInteraction));
  if (state.isResizing) emit('resize-start', source, cloneRect(state.beforeInteraction));
  state.eventElement = document.documentElement;
  addInteractionListeners();
  capturePointer();
};

const rotationOriginInViewport = () => {
  const element = movableRef.value;
  if (!element) return null;
  const rect = element.getBoundingClientRect();
  const width = element.offsetWidth || asNumber(internalRect.value.width);
  const height = element.offsetHeight || asNumber(internalRect.value.height);
  if (!width || !height) return null;

  const radians = angleToRadians(rotationAngle.value);
  const cosine = Math.cos(radians);
  const sine = Math.sin(radians);
  const aabbWidth = Math.abs(cosine) * width + Math.abs(sine) * height;
  const aabbHeight = Math.abs(sine) * width + Math.abs(cosine) * height;
  const measuredScales = [
    aabbWidth ? rect.width / aabbWidth : 0,
    aabbHeight ? rect.height / aabbHeight : 0
  ].filter(value => Number.isFinite(value) && value > 0);
  const fallbackScale = Math.abs(valIsNaN(props.scale, 1)) || 1;
  const scale = measuredScales.length
    ? measuredScales.reduce((sum, value) => sum + value, 0) / measuredScales.length
    : fallbackScale;
  const origin = resolveTransformOrigin(props.transformOrigin, width, height);
  const originX = origin.x * scale;
  const originY = origin.y * scale;
  const corners = [
    [-originX, -originY],
    [width * scale - originX, -originY],
    [width * scale - originX, height * scale - originY],
    [-originX, height * scale - originY]
  ].map(([x, y]) => ({
    x: x * cosine - y * sine,
    y: x * sine + y * cosine
  }));
  return {
    x: rect.left - Math.min(...corners.map(point => point.x)),
    y: rect.top - Math.min(...corners.map(point => point.y))
  };
};

const handleRotationPointerDown = (source: PointerEvent) => {
  if (!source.isPrimary || source.button !== 0) return;
  if (props.disabled || props.initRect || !props.rotatable) return;
  if (state.isInteracting) return;
  if (props.canRotate?.(cloneRect(internalRect.value)) === false) return;
  refreshArea();
  const origin = rotationOriginInViewport();
  if (!origin) return;

  state.pointerId = typeof source.pointerId === 'number' ? source.pointerId : null;
  state.beforeRotation = internalRotation.value;
  state.rotationOriginX = origin.x;
  state.rotationOriginY = origin.y;
  state.rotationStartPointerAngle = pointerAngleFromOrigin(source, origin.x, origin.y);
  state.interactionMode = 'rotate';
  setActive(true);
  emit('rotate-start', source, state.beforeRotation);
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
  if (state.isRotating) {
    emit('rotate-stop', source, state.beforeRotation, internalRotation.value);
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
  const accepted = applyInteractivePosition(
    candidate,
    previous,
    props.snapToElements,
    {
      horizontal: direction === 'left' || direction === 'right',
      vertical: direction === 'top' || direction === 'bottom'
    },
    previous
  );
  if (accepted) {
    const value = commitRect(accepted);
    emit('move', cloneRect(value));
  }
};

const resizeWithKeyboard = (handle: HandlePosition, direction: DragDirection, distance: number) => {
  if (!isResizable.value || !isHandleAllowed(handle)) return;
  refreshArea();
  const previous = cloneRect(internalRect.value);
  if (props.canResize?.(cloneRect(previous), handle) === false) return;
  const deltaX = direction === 'left' ? -distance : direction === 'right' ? distance : 0;
  const deltaY = direction === 'top' ? -distance : direction === 'bottom' ? distance : 0;
  const keyboardPx = { x: toPixelX(deltaX), y: toPixelY(deltaY) };
  // A focused handle exposes its own local resize axis (for example, ArrowRight on
  // `mr`) even after the box rotates. Convert that local step to screen space before
  // the shared resolver maps it back. Shift+Arrow on the box itself remains a
  // screen-space command, preserving the existing keyboard contract.
  const rawPx = (() => {
    if (focusedHandle.value !== handle || rotationAngle.value === 0) return keyboardPx;
    const radians = angleToRadians(rotationAngle.value);
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);
    return {
      x: keyboardPx.x * cos - keyboardPx.y * sin,
      y: keyboardPx.x * sin + keyboardPx.y * cos
    };
  })();
  let candidate = resolveResizeCandidate(previous, handle, rawPx);
  if (rotationAngle.value || props.resizeMode === 'fixed-anchor') {
    candidate = fitRotatedSizeToArea(candidate, handle);
    candidate = clampPosition(candidate);
    if (props.resizeMode === 'fixed-anchor') {
      candidate = applyFixedAnchorPlacement(previous, candidate, handle);
    }
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
  return asNumber(handleUsesWidth(handle) ? internalRect.value.width : internalRect.value.height);
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
  // Rotation owns its angle keys, but Escape must bubble into the shared cancellation path.
  if (target.closest('.rotation-handle')) return event.key !== 'Escape';
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
    interacting: state.isInteracting
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

const handleRotationKeyDown = (event: KeyboardEvent) => {
  if (!props.keyboardEnabled || props.disabled || props.initRect || !props.rotatable) return;
  if (!['ArrowLeft', 'ArrowRight', 'Home'].includes(event.key)) return;
  if (props.canRotate?.(cloneRect(internalRect.value)) === false) return;
  event.preventDefault();
  event.stopPropagation();
  refreshArea();
  const oldValue = internalRotation.value;
  const step = normalizeKeyboardStep(props.keyboardStep) * (event.shiftKey ? 10 : 1);
  const raw = event.key === 'Home' ? 0 : oldValue + (event.key === 'ArrowLeft' ? -step : step);
  // Home is an explicit reset command; angle snapping must not redirect it to a
  // configured candidate away from zero. Bounds and collision constraints still apply.
  const next =
    event.key === 'Home'
      ? raw
      : snapRotationAngle(raw, props.rotationSnapAngles ?? [], props.rotationSnapThreshold);
  emit('rotate-start', event, oldValue);
  const value = commitRotation(constrainRotation(oldValue, next));
  emit('rotate-stop', event, oldValue, value);
};

const toPixelX = (value: number) => (isPercent.value ? (value / 100) * state.parentWidth : value);
const toPixelY = (value: number) => (isPercent.value ? (value / 100) * state.parentHeight : value);
// Guides render in a presentation layer that spans the area and counter-rotates against
// the box, so lines stay aligned with the container's axes while the box rotates. Guide
// coordinates are container-space positions; the layer is offset by the box's left/top
// and rotated about the box's transform origin, which cancels the box rotation exactly.
const guidesLayerStyle = computed<CSSProperties>(() => {
  const offsetLeft = toPixelX(asNumber(internalRect.value.left));
  const offsetTop = toPixelY(asNumber(internalRect.value.top));
  const style: CSSProperties = {
    left: `${-offsetLeft}px`,
    top: `${-offsetTop}px`,
    width: `${state.parentWidth}px`,
    height: `${state.parentHeight}px`
  };
  const angle = rotationAngle.value;
  if (angle) {
    const scale = getPlaneScale();
    const origin = resolveTransformOrigin(
      props.transformOrigin,
      asNumber(internalRect.value.width) * scale.x,
      asNumber(internalRect.value.height) * scale.y
    );
    style.transform = `rotate(${-angle}deg)`;
    style.transformOrigin = `${origin.x + offsetLeft}px ${origin.y + offsetTop}px`;
  }
  return style;
});
const verticalGuideStyle = (value: number): CSSProperties => ({
  left: `${toPixelX(value)}px`,
  top: '0px',
  height: `${state.parentHeight}px`,
  borderColor: props.theme
});
const horizontalGuideStyle = (value: number): CSSProperties => ({
  top: `${toPixelY(value)}px`,
  left: '0px',
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
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', refreshArea);
  }
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
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    opacity 0.2s ease;
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
.auto-draggable.is-readonly .handle,
.auto-draggable.is-disabled .rotation-handle,
.auto-draggable.is-disabled .rotation-handle-connector,
.auto-draggable.is-readonly .rotation-handle,
.auto-draggable.is-readonly .rotation-handle-connector {
  display: none !important;
}

.auto-draggable.is-active {
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.auto-draggable:focus-visible,
.handle:focus-visible,
.rotation-handle:focus-visible {
  outline: 2px solid var(--movable-box-theme, #409efd);
  outline-offset: 1px;
}

.auto-draggable.is-dragging,
.auto-draggable.is-resizing,
.auto-draggable.is-rotating {
  opacity: 0.95;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.auto-draggable.is-rotating {
  cursor: grabbing !important;
}

.auto-draggable.is-dragging {
  cursor: move !important;
  z-index: 9999 !important;
}

.movable-box-guides-layer {
  position: absolute;
  z-index: 10000;
  pointer-events: none !important;
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
  transition:
    transform 0.15s ease,
    background-color 0.15s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
}

.handle:hover {
  transform: scale(1.2);
  background-color: #f0f9ff;
}

.rotation-handle-connector {
  position: absolute;
  z-index: 9998;
  top: calc(-1 * var(--rotation-handle-offset));
  left: 50%;
  width: 0;
  height: var(--rotation-handle-offset);
  border-left: 1px solid;
  pointer-events: none !important;
}

.rotation-handle {
  position: absolute;
  z-index: 9999;
  top: calc(-1 * var(--rotation-handle-offset));
  left: 50%;
  box-sizing: border-box;
  width: 18px;
  height: 18px;
  padding: 0;
  color: inherit;
  background: #fff;
  border: 2px solid;
  border-radius: 50%;
  cursor: grab;
  scale: var(--rotation-handle-scale);
  translate: -50% -50%;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.18);
  transition:
    background-color 0.15s ease,
    box-shadow 0.15s ease;
}

.rotation-handle:hover {
  background: #f0f9ff;
  box-shadow: 0 3px 7px rgba(0, 0, 0, 0.22);
}

.rotation-handle:active {
  cursor: grabbing;
}

.rotation-handle-mark {
  position: absolute;
  inset: 3px;
  box-sizing: border-box;
  border: 1.5px solid currentColor;
  border-left-color: transparent;
  border-radius: 50%;
  pointer-events: none !important;
}

.rotation-handle-mark::after {
  position: absolute;
  top: -2px;
  left: -1px;
  width: 0;
  height: 0;
  border-top: 2.5px solid transparent;
  border-right: 4px solid currentColor;
  border-bottom: 2.5px solid transparent;
  content: '';
  rotate: -18deg;
}

.handle-tl {
  top: -5px;
  left: -5px;
  cursor: nw-resize;
}
.handle-tm {
  top: -5px;
  left: 50%;
  transform: translateX(-50%);
  cursor: n-resize;
}
.handle-tr {
  top: -5px;
  right: -5px;
  cursor: ne-resize;
}
.handle-ml {
  top: 50%;
  left: -5px;
  transform: translateY(-50%);
  cursor: w-resize;
}
.handle-mr {
  top: 50%;
  right: -5px;
  transform: translateY(-50%);
  cursor: e-resize;
}
.handle-bl {
  bottom: -5px;
  left: -5px;
  cursor: sw-resize;
}
.handle-bm {
  bottom: -5px;
  left: 50%;
  transform: translateX(-50%);
  cursor: s-resize;
}
.handle-br {
  bottom: -5px;
  right: -5px;
  cursor: se-resize;
}

.handle-tm:hover,
.handle-bm:hover {
  transform: translateX(-50%) scale(1.2);
}
.handle-ml:hover,
.handle-mr:hover {
  transform: translateY(-50%) scale(1.2);
}

.select-none {
  user-select: none;
  -webkit-user-select: none;
}

/* Handle names and resize geometry use physical edges, so they stay fixed in RTL layouts. */
</style>
