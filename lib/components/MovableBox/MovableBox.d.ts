import { PropType } from 'vue';
import { BoundsMargin, CollisionEventPayload, DragDirection, ExtendsMovableBox, GuidesEventPayload, HandlesSet, SnapStrategy, SnapTarget, SnapEventPayload } from '../../types/MovableBox';

declare const _default: __VLS_WithTemplateSlots<import('vue').DefineComponent<import('vue').ExtractPropTypes<{
    theme: {
        type: StringConstructor;
        default: string;
    };
    inActiveColor: {
        type: StringConstructor;
        default: string;
    };
    unitType: {
        type: PropType<"px" | "%">;
        default: string;
    };
    scale: {
        type: PropType<string | number>;
        default: number;
    };
    isKeepDecimals: {
        type: BooleanConstructor;
        default: boolean;
    };
    decimalPlaces: {
        type: NumberConstructor;
        default: number;
    };
    draggable: {
        type: BooleanConstructor;
        default: boolean;
    };
    dragHandle: StringConstructor;
    dragCancel: StringConstructor;
    canDrag: {
        type: PropType<(value: ExtendsMovableBox) => boolean>;
        default: undefined;
    };
    canResize: {
        type: PropType<(value: ExtendsMovableBox, handle: "tl" | "tm" | "tr" | "mr" | "br" | "bm" | "bl" | "ml") => boolean>;
        default: undefined;
    };
    canRotate: {
        type: PropType<(value: ExtendsMovableBox) => boolean>;
        default: undefined;
    };
    resizable: {
        type: BooleanConstructor;
        default: undefined;
    };
    resizeable: {
        type: BooleanConstructor;
        default: undefined;
    };
    limitAreaForParent: {
        type: BooleanConstructor;
        default: boolean;
    };
    limitAreaClass: StringConstructor;
    modelValue: {
        type: PropType<ExtendsMovableBox>;
        default: () => {
            left: number;
            top: number;
            width: number;
            height: number;
            zIndex: number;
        };
    };
    maxWidth: PropType<string | number>;
    maxHeight: PropType<string | number>;
    minWidth: {
        type: PropType<string | number>;
        default: number;
    };
    minHeight: {
        type: PropType<string | number>;
        default: number;
    };
    ratioLock: {
        type: BooleanConstructor;
        default: boolean;
    };
    /** Resize semantics: incremental local delta (default) or fixed world-space anchor. */
    resizeMode: {
        type: PropType<"local-delta" | "fixed-anchor">;
        default: string;
    };
    /** Snap angles in degrees for rotation; snapping is off when omitted or empty. */
    rotationSnapAngles: {
        type: PropType<number[]>;
        default: undefined;
    };
    /** Snap distance in degrees for rotationSnapAngles. */
    rotationSnapThreshold: {
        type: NumberConstructor;
        default: number;
    };
    active: {
        type: BooleanConstructor;
        default: boolean;
    };
    disabledUserSelect: {
        type: BooleanConstructor;
        default: boolean;
    };
    handles: {
        type: PropType<("tl" | "tm" | "tr" | "mr" | "br" | "bm" | "bl" | "ml")[]>;
        default: () => HandlesSet;
    };
    disabled: {
        type: BooleanConstructor;
        default: boolean;
    };
    initRect: {
        type: BooleanConstructor;
        default: boolean;
    };
    edgeDistance: {
        type: NumberConstructor;
        default: number;
    };
    snapToGrid: {
        type: BooleanConstructor;
        default: boolean;
    };
    gridSize: {
        type: NumberConstructor;
        default: number;
    };
    dragDirections: {
        type: PropType<DragDirection[]>;
        default: () => DragDirection[];
    };
    resizeDirections: {
        type: PropType<("tl" | "tm" | "tr" | "mr" | "br" | "bm" | "bl" | "ml")[]>;
        default: () => ("tl" | "tm" | "tr" | "mr" | "br" | "bm" | "bl" | "ml")[];
    };
    enableTransition: {
        type: BooleanConstructor;
        default: boolean;
    };
    keyboardEnabled: {
        type: BooleanConstructor;
        default: boolean;
    };
    keyboardStep: {
        type: NumberConstructor;
        default: number;
    };
    boundsMargin: {
        type: PropType<BoundsMargin>;
        default: () => {
            top: number;
            right: number;
            bottom: number;
            left: number;
        };
    };
    snapToElements: {
        type: BooleanConstructor;
        default: boolean;
    };
    snapThreshold: {
        type: NumberConstructor;
        default: number;
    };
    /** Return false to exclude a snap target from snapping on the given axis. */
    snapFilter: {
        type: PropType<(target: SnapTarget, axis: "horizontal" | "vertical") => boolean>;
        default: undefined;
    };
    /** Strategy consultation order per axis. Default: alignment wins over spacing. */
    snapPriority: {
        type: PropType<SnapStrategy[]>;
        default: () => string[];
    };
    collisionEnabled: {
        type: BooleanConstructor;
        default: boolean;
    };
    allowOverlap: {
        type: BooleanConstructor;
        default: boolean;
    };
    /**
     * Collision semantics: 'precise' (default since v3.2.0) resolves against true rotated
     * contours with continuous collision detection; 'aabb' keeps the pre-3.2 behavior.
     */
    collisionMode: {
        type: PropType<"precise" | "aabb">;
        default: string;
    };
    snapTargets: {
        type: PropType<SnapTarget[]>;
        default: () => never[];
    };
    /**
     * Obstacles for collision, separate from snapping. Defaults to snapTargets when
     * omitted; an explicit empty array means there are no collision obstacles.
     */
    collisionTargets: {
        type: PropType<SnapTarget[]>;
        default: undefined;
    };
    /** Stable identifier used by a surrounding MovableGroup; auto-generated when omitted. */
    memberId: StringConstructor;
    /** Clockwise rotation in degrees; geometry uses the rotated AABB (see README). */
    rotate: {
        type: PropType<string | number>;
        default: number;
    };
    /** Shows an interactive rotation handle while the box is active. */
    rotatable: {
        type: BooleanConstructor;
        default: boolean;
    };
    /** Visual distance in pixels between the box and the rotation handle. */
    rotationHandleOffset: {
        type: NumberConstructor;
        default: number;
    };
    /** CSS transform-origin for the rotation, e.g. 'center', 'top left', '50% 50%'. */
    transformOrigin: {
        type: StringConstructor;
        default: string;
    };
}>, {
    getConfig: () => ExtendsMovableBox<object>;
    setPosition: (left: number, top: number) => void;
    setSize: (width: number, height: number) => void;
    reset: () => void;
    activate: () => void;
    deactivate: () => void; /** CSS transform-origin for the rotation, e.g. 'center', 'top left', '50% 50%'. */
    cancelInteraction: (source?: Event | null | undefined) => void;
}, {}, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {
    "update:modelValue": (value: ExtendsMovableBox) => void;
    "update:rotate": (value: number) => void;
    drag: (value: ExtendsMovableBox) => void;
    "drag-start": (source: PointerEvent, value: ExtendsMovableBox) => void;
    "drag-stop": (source: PointerEvent, oldValue: ExtendsMovableBox, newValue: ExtendsMovableBox) => void;
    "resize-start": (source: PointerEvent, value: ExtendsMovableBox) => void;
    "resize-stop": (source: PointerEvent, oldValue: ExtendsMovableBox, newValue: ExtendsMovableBox) => void;
    "drag-cancel": (source: Event | null, oldValue: ExtendsMovableBox, newValue: ExtendsMovableBox) => void;
    "resize-cancel": (source: Event | null, oldValue: ExtendsMovableBox, newValue: ExtendsMovableBox) => void;
    resize: (value: ExtendsMovableBox) => void;
    "rotate-start": (source: Event, value: number) => void;
    rotate: (value: number) => void;
    "rotate-stop": (source: Event, oldValue: number, newValue: number) => void;
    "rotate-cancel": (source: Event | null, oldValue: number, newValue: number) => void;
    move: (value: ExtendsMovableBox) => void;
    active: (value: ExtendsMovableBox) => void;
    inactive: (value: ExtendsMovableBox) => void;
    disabled: (value: boolean) => void;
    dblclick: (source: MouseEvent) => void;
    "out-of-bounds": (direction: DragDirection) => void;
    snap: (result: SnapEventPayload) => void;
    guides: (data: GuidesEventPayload) => void;
    collision: (result: CollisionEventPayload) => void;
}, string, import('vue').PublicProps, Readonly<import('vue').ExtractPropTypes<{
    theme: {
        type: StringConstructor;
        default: string;
    };
    inActiveColor: {
        type: StringConstructor;
        default: string;
    };
    unitType: {
        type: PropType<"px" | "%">;
        default: string;
    };
    scale: {
        type: PropType<string | number>;
        default: number;
    };
    isKeepDecimals: {
        type: BooleanConstructor;
        default: boolean;
    };
    decimalPlaces: {
        type: NumberConstructor;
        default: number;
    };
    draggable: {
        type: BooleanConstructor;
        default: boolean;
    };
    dragHandle: StringConstructor;
    dragCancel: StringConstructor;
    canDrag: {
        type: PropType<(value: ExtendsMovableBox) => boolean>;
        default: undefined;
    };
    canResize: {
        type: PropType<(value: ExtendsMovableBox, handle: "tl" | "tm" | "tr" | "mr" | "br" | "bm" | "bl" | "ml") => boolean>;
        default: undefined;
    };
    canRotate: {
        type: PropType<(value: ExtendsMovableBox) => boolean>;
        default: undefined;
    };
    resizable: {
        type: BooleanConstructor;
        default: undefined;
    };
    resizeable: {
        type: BooleanConstructor;
        default: undefined;
    };
    limitAreaForParent: {
        type: BooleanConstructor;
        default: boolean;
    };
    limitAreaClass: StringConstructor;
    modelValue: {
        type: PropType<ExtendsMovableBox>;
        default: () => {
            left: number;
            top: number;
            width: number;
            height: number;
            zIndex: number;
        };
    };
    maxWidth: PropType<string | number>;
    maxHeight: PropType<string | number>;
    minWidth: {
        type: PropType<string | number>;
        default: number;
    };
    minHeight: {
        type: PropType<string | number>;
        default: number;
    };
    ratioLock: {
        type: BooleanConstructor;
        default: boolean;
    };
    /** Resize semantics: incremental local delta (default) or fixed world-space anchor. */
    resizeMode: {
        type: PropType<"local-delta" | "fixed-anchor">;
        default: string;
    };
    /** Snap angles in degrees for rotation; snapping is off when omitted or empty. */
    rotationSnapAngles: {
        type: PropType<number[]>;
        default: undefined;
    };
    /** Snap distance in degrees for rotationSnapAngles. */
    rotationSnapThreshold: {
        type: NumberConstructor;
        default: number;
    };
    active: {
        type: BooleanConstructor;
        default: boolean;
    };
    disabledUserSelect: {
        type: BooleanConstructor;
        default: boolean;
    };
    handles: {
        type: PropType<("tl" | "tm" | "tr" | "mr" | "br" | "bm" | "bl" | "ml")[]>;
        default: () => HandlesSet;
    };
    disabled: {
        type: BooleanConstructor;
        default: boolean;
    };
    initRect: {
        type: BooleanConstructor;
        default: boolean;
    };
    edgeDistance: {
        type: NumberConstructor;
        default: number;
    };
    snapToGrid: {
        type: BooleanConstructor;
        default: boolean;
    };
    gridSize: {
        type: NumberConstructor;
        default: number;
    };
    dragDirections: {
        type: PropType<DragDirection[]>;
        default: () => DragDirection[];
    };
    resizeDirections: {
        type: PropType<("tl" | "tm" | "tr" | "mr" | "br" | "bm" | "bl" | "ml")[]>;
        default: () => ("tl" | "tm" | "tr" | "mr" | "br" | "bm" | "bl" | "ml")[];
    };
    enableTransition: {
        type: BooleanConstructor;
        default: boolean;
    };
    keyboardEnabled: {
        type: BooleanConstructor;
        default: boolean;
    };
    keyboardStep: {
        type: NumberConstructor;
        default: number;
    };
    boundsMargin: {
        type: PropType<BoundsMargin>;
        default: () => {
            top: number;
            right: number;
            bottom: number;
            left: number;
        };
    };
    snapToElements: {
        type: BooleanConstructor;
        default: boolean;
    };
    snapThreshold: {
        type: NumberConstructor;
        default: number;
    };
    /** Return false to exclude a snap target from snapping on the given axis. */
    snapFilter: {
        type: PropType<(target: SnapTarget, axis: "horizontal" | "vertical") => boolean>;
        default: undefined;
    };
    /** Strategy consultation order per axis. Default: alignment wins over spacing. */
    snapPriority: {
        type: PropType<SnapStrategy[]>;
        default: () => string[];
    };
    collisionEnabled: {
        type: BooleanConstructor;
        default: boolean;
    };
    allowOverlap: {
        type: BooleanConstructor;
        default: boolean;
    };
    /**
     * Collision semantics: 'precise' (default since v3.2.0) resolves against true rotated
     * contours with continuous collision detection; 'aabb' keeps the pre-3.2 behavior.
     */
    collisionMode: {
        type: PropType<"precise" | "aabb">;
        default: string;
    };
    snapTargets: {
        type: PropType<SnapTarget[]>;
        default: () => never[];
    };
    /**
     * Obstacles for collision, separate from snapping. Defaults to snapTargets when
     * omitted; an explicit empty array means there are no collision obstacles.
     */
    collisionTargets: {
        type: PropType<SnapTarget[]>;
        default: undefined;
    };
    /** Stable identifier used by a surrounding MovableGroup; auto-generated when omitted. */
    memberId: StringConstructor;
    /** Clockwise rotation in degrees; geometry uses the rotated AABB (see README). */
    rotate: {
        type: PropType<string | number>;
        default: number;
    };
    /** Shows an interactive rotation handle while the box is active. */
    rotatable: {
        type: BooleanConstructor;
        default: boolean;
    };
    /** Visual distance in pixels between the box and the rotation handle. */
    rotationHandleOffset: {
        type: NumberConstructor;
        default: number;
    };
    /** CSS transform-origin for the rotation, e.g. 'center', 'top left', '50% 50%'. */
    transformOrigin: {
        type: StringConstructor;
        default: string;
    };
}>> & Readonly<{
    onGuides?: ((data: GuidesEventPayload) => any) | undefined;
    onDblclick?: ((source: MouseEvent) => any) | undefined;
    onDrag?: ((value: ExtendsMovableBox) => any) | undefined;
    onResize?: ((value: ExtendsMovableBox) => any) | undefined;
    onActive?: ((value: ExtendsMovableBox) => any) | undefined;
    onDisabled?: ((value: boolean) => any) | undefined;
    onRotate?: ((value: number) => any) | undefined;
    "onUpdate:modelValue"?: ((value: ExtendsMovableBox) => any) | undefined;
    "onUpdate:rotate"?: ((value: number) => any) | undefined;
    "onDrag-start"?: ((source: PointerEvent, value: ExtendsMovableBox) => any) | undefined;
    "onDrag-stop"?: ((source: PointerEvent, oldValue: ExtendsMovableBox, newValue: ExtendsMovableBox) => any) | undefined;
    "onResize-start"?: ((source: PointerEvent, value: ExtendsMovableBox) => any) | undefined;
    "onResize-stop"?: ((source: PointerEvent, oldValue: ExtendsMovableBox, newValue: ExtendsMovableBox) => any) | undefined;
    "onDrag-cancel"?: ((source: Event | null, oldValue: ExtendsMovableBox, newValue: ExtendsMovableBox) => any) | undefined;
    "onResize-cancel"?: ((source: Event | null, oldValue: ExtendsMovableBox, newValue: ExtendsMovableBox) => any) | undefined;
    "onRotate-start"?: ((source: Event, value: number) => any) | undefined;
    "onRotate-stop"?: ((source: Event, oldValue: number, newValue: number) => any) | undefined;
    "onRotate-cancel"?: ((source: Event | null, oldValue: number, newValue: number) => any) | undefined;
    onMove?: ((value: ExtendsMovableBox) => any) | undefined;
    onInactive?: ((value: ExtendsMovableBox) => any) | undefined;
    "onOut-of-bounds"?: ((direction: DragDirection) => any) | undefined;
    onSnap?: ((result: SnapEventPayload) => any) | undefined;
    onCollision?: ((result: CollisionEventPayload) => any) | undefined;
}>, {
    theme: string;
    inActiveColor: string;
    unitType: "px" | "%";
    scale: string | number;
    isKeepDecimals: boolean;
    decimalPlaces: number;
    draggable: boolean;
    canDrag: (value: ExtendsMovableBox) => boolean;
    canResize: (value: ExtendsMovableBox, handle: "tl" | "tm" | "tr" | "mr" | "br" | "bm" | "bl" | "ml") => boolean;
    canRotate: (value: ExtendsMovableBox) => boolean;
    resizable: boolean;
    resizeable: boolean;
    limitAreaForParent: boolean;
    modelValue: ExtendsMovableBox;
    minWidth: string | number;
    minHeight: string | number;
    ratioLock: boolean;
    resizeMode: "local-delta" | "fixed-anchor";
    rotationSnapAngles: number[];
    rotationSnapThreshold: number;
    active: boolean;
    disabledUserSelect: boolean;
    handles: ("tl" | "tm" | "tr" | "mr" | "br" | "bm" | "bl" | "ml")[];
    disabled: boolean;
    initRect: boolean;
    edgeDistance: number;
    snapToGrid: boolean;
    gridSize: number;
    dragDirections: DragDirection[];
    resizeDirections: ("tl" | "tm" | "tr" | "mr" | "br" | "bm" | "bl" | "ml")[];
    enableTransition: boolean;
    keyboardEnabled: boolean;
    keyboardStep: number;
    boundsMargin: BoundsMargin;
    snapToElements: boolean;
    snapThreshold: number;
    snapFilter: (target: SnapTarget, axis: "horizontal" | "vertical") => boolean;
    snapPriority: SnapStrategy[];
    collisionEnabled: boolean;
    allowOverlap: boolean;
    collisionMode: "precise" | "aabb";
    snapTargets: SnapTarget[];
    collisionTargets: SnapTarget[];
    rotate: string | number;
    rotatable: boolean;
    rotationHandleOffset: number;
    transformOrigin: string;
}, {}, {}, {}, string, import('vue').ComponentProvideOptions, true, {}, any>, {
    default?(_: {}): any;
}>;
export default _default;
type __VLS_WithTemplateSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
