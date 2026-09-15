export interface MovableBoxRect {
  left: number | string;
  top: number | string;
  width: number | string;
  height: number | string;
  zIndex?: number;
}

export type MovableBox = MovableBoxRect;

export type ExtendsMovableBox<T extends object = object> = Required<
  Omit<MovableBoxRect, 'zIndex'>
> &
  T & {
    zIndex?: number;
  };

export type HandlesSet = ['tl', 'tm', 'tr', 'mr', 'br', 'bm', 'bl', 'ml'];
export type HandlePosition = HandlesSet[number];
export type DragDirection = 'top' | 'bottom' | 'left' | 'right';
export type SnapPoint = 'left' | 'right' | 'top' | 'bottom' | 'center-x' | 'center-y';
export type CollisionDirection = 'left' | 'right' | 'top' | 'bottom';

export interface BoundsMargin {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}

export interface SnapTarget extends MovableBoxRect {
  id?: string;
  /**
   * Clockwise rotation in degrees of the target's true contour. Defaults to 0.
   * Precise collision resolves against the rotated shape; legacy AABB mode ignores it.
   */
  rotate?: number | string;
  /** CSS transform-origin of the target rotation, e.g. 'center', 'top left'. Defaults to 'center'. */
  transformOrigin?: string;
}

/** Snap resolution strategies; consulted in configurable priority order. */
export type SnapStrategy = 'alignment' | 'spacing';

export interface SnapSpacingInfo {
  axis: 'horizontal' | 'vertical';
  /** The equalized gap in the leader's coordinate space. */
  gap: number;
  /** Anchor target ids in pair order; undefined entries mean an unnamed target. */
  targetIds: (string | undefined)[];
  /** Guide line coordinates (perpendicular axis values) marking the two anchor edges. */
  guides: number[];
}

export interface GuidesEventPayload {
  vertical: number[];
  horizontal: number[];
}

export interface SnapEventPayload {
  snapped: boolean;
  /** @deprecated Use points for multi-axis snapping. */
  point?: SnapPoint;
  points?: SnapPoint[];
  targetId?: string;
  targetIds?: {
    horizontal?: string;
    vertical?: string;
  };
  /** Equal-spacing resolutions, ordered [horizontal, vertical]; present only while snapped. */
  spacing?: SnapSpacingInfo[];
}

export interface CollisionEventPayload {
  colliding: boolean;
  direction?: CollisionDirection;
  targetId?: string;
  /**
   * Unit contact normal in container pixel space, pointing from the obstacle toward the
   * moving box. Present in precise collision mode; mapped onto `direction` by its main axis.
   */
  normal?: { x: number; y: number };
}

export interface MovableBoxProps<T extends object = object> {
  theme?: string;
  inActiveColor?: string;
  unitType?: 'px' | '%';
  scale?: number | string;
  /** Whether interaction-produced position, size, and rotation values keep decimals. */
  isKeepDecimals?: boolean;
  /** Decimal places retained for interaction-produced values when isKeepDecimals is true. */
  decimalPlaces?: number;
  draggable?: boolean;
  /** CSS selector restricting where a drag can start. When set, only matching elements inside the box start drags. */
  dragHandle?: string;
  /** CSS selector for elements that must not start a drag. */
  dragCancel?: string;
  /** Called before a drag starts with the current rectangle. Return false to reject the interaction without mutating the model. */
  canDrag?: (value: ExtendsMovableBox<T>) => boolean;
  /** Called before a resize starts with the current rectangle and handle. Return false to reject the interaction without mutating the model. */
  canResize?: (value: ExtendsMovableBox<T>, handle: HandlePosition) => boolean;
  /** Called before a rotation starts with the current rectangle. Return false to reject the interaction without mutating the model. */
  canRotate?: (value: ExtendsMovableBox<T>) => boolean;
  resizable?: boolean;
  /** @deprecated Use resizable. */
  resizeable?: boolean;
  limitAreaForParent?: boolean;
  limitAreaClass?: string;
  modelValue: ExtendsMovableBox<T>;
  maxWidth?: number | string;
  maxHeight?: number | string;
  minWidth?: number | string;
  minHeight?: number | string;
  ratioLock?: boolean;
  /**
   * Resize semantics. 'local-delta' (default) grows the box by the pointer's local-frame
   * delta with the opposite edge anchored; 'fixed-anchor' pins the handle's opposite
   * corner (corner handles) or opposite edge midpoint (edge handles) at its rotated
   * world position and solves the size from the pointer position, which stays stable
   * under rotation.
   */
  resizeMode?: 'local-delta' | 'fixed-anchor';
  /** Snap targets for the rotation angle in degrees; disabled when omitted. */
  rotationSnapAngles?: number[];
  /** Snap distance in degrees for rotationSnapAngles. Default 10 when snapping is on. */
  rotationSnapThreshold?: number;
  active?: boolean;
  disabledUserSelect?: boolean;
  handles?: HandlePosition[];
  disabled?: boolean;
  initRect?: boolean;
  edgeDistance?: number;
  snapToGrid?: boolean;
  gridSize?: number;
  dragDirections?: DragDirection[];
  resizeDirections?: HandlePosition[];
  enableTransition?: boolean;
  keyboardEnabled?: boolean;
  keyboardStep?: number;
  boundsMargin?: BoundsMargin;
  snapToElements?: boolean;
  snapThreshold?: number;
  /** Return false to exclude a snap target from snapping on the given axis. */
  snapFilter?: (target: SnapTarget, axis: 'horizontal' | 'vertical') => boolean;
  /** Strategy consultation order per axis. Default: alignment wins over spacing. */
  snapPriority?: SnapStrategy[];
  /** Clockwise rotation in degrees; bounds, snapping, and collision use the rotated AABB. */
  rotate?: number | string;
  /** Shows an interactive rotation handle while the box is active. */
  rotatable?: boolean;
  /** Non-negative visual distance in pixels between the box and the rotation handle. */
  rotationHandleOffset?: number;
  /** CSS transform-origin for the rotation, e.g. 'center', 'top left', '50% 50%'. */
  transformOrigin?: string;
  /** Stable identifier used by a surrounding MovableGroup; auto-generated when omitted. */
  memberId?: string;
  collisionEnabled?: boolean;
  allowOverlap?: boolean;
  /**
   * Collision resolution semantics. 'precise' (default since v3.2.0) resolves against the
   * true rotated contours of both boxes with continuous collision detection; 'aabb' keeps
   * the pre-3.2 axis-aligned approximation as a migration escape hatch.
   */
  collisionMode?: 'precise' | 'aabb';
  snapTargets?: SnapTarget[];
  /**
   * Obstacles for collision, separate from snapping. Defaults to `snapTargets` when
   * omitted; an explicit empty array means there are no collision obstacles.
   */
  collisionTargets?: SnapTarget[];
}

export interface MovableBoxExpose<T extends object = object> {
  getConfig: () => ExtendsMovableBox<T>;
  setPosition: (left: number, top: number) => void;
  setSize: (width: number, height: number) => void;
  reset: () => void;
  activate: () => void;
  deactivate: () => void;
  /** Cancels an in-progress drag, resize, or rotation and restores its previous value. */
  cancelInteraction: (source?: Event | null) => void;
}
