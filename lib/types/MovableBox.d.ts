export interface MovableBoxRect {
    left: number | string;
    top: number | string;
    width: number | string;
    height: number | string;
    zIndex?: number;
}
export type MovableBox = MovableBoxRect;
export type ExtendsMovableBox<T extends object = object> = Required<Omit<MovableBoxRect, 'zIndex'>> & T & {
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
}
export interface MovableBoxProps<T extends object = object> {
    theme?: string;
    inActiveColor?: string;
    unitType?: 'px' | '%';
    scale?: number | string;
    isKeepDecimals?: boolean;
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
    collisionEnabled?: boolean;
    allowOverlap?: boolean;
    snapTargets?: SnapTarget[];
}
export interface MovableBoxExpose<T extends object = object> {
    getConfig: () => ExtendsMovableBox<T>;
    setPosition: (left: number, top: number) => void;
    setSize: (width: number, height: number) => void;
    reset: () => void;
    activate: () => void;
    deactivate: () => void;
    /** Cancels an in-progress drag or resize and restores the pre-interaction rectangle. */
    cancelInteraction: (source?: Event | null) => void;
}
