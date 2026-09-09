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
    snapTargets: {
        type: PropType<SnapTarget[]>;
        default: () => never[];
    };
    /** Stable identifier used by a surrounding MovableGroup; auto-generated when omitted. */
    memberId: StringConstructor;
}>, {
    getConfig: () => ExtendsMovableBox<object>;
    setPosition: (left: number, top: number) => void;
    setSize: (width: number, height: number) => void;
    reset: () => void;
    activate: () => void;
    deactivate: () => void;
    cancelInteraction: (source?: Event | null | undefined) => void;
}, {}, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {
    "update:modelValue": (value: ExtendsMovableBox) => void;
    drag: (value: ExtendsMovableBox) => void;
    "drag-start": (source: PointerEvent, value: ExtendsMovableBox) => void;
    "drag-stop": (source: PointerEvent, oldValue: ExtendsMovableBox, newValue: ExtendsMovableBox) => void;
    "resize-start": (source: PointerEvent, value: ExtendsMovableBox) => void;
    "resize-stop": (source: PointerEvent, oldValue: ExtendsMovableBox, newValue: ExtendsMovableBox) => void;
    "drag-cancel": (source: Event | null, oldValue: ExtendsMovableBox, newValue: ExtendsMovableBox) => void;
    "resize-cancel": (source: Event | null, oldValue: ExtendsMovableBox, newValue: ExtendsMovableBox) => void;
    resize: (value: ExtendsMovableBox) => void;
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
    snapTargets: {
        type: PropType<SnapTarget[]>;
        default: () => never[];
    };
    /** Stable identifier used by a surrounding MovableGroup; auto-generated when omitted. */
    memberId: StringConstructor;
}>> & Readonly<{
    onGuides?: ((data: GuidesEventPayload) => any) | undefined;
    onDblclick?: ((source: MouseEvent) => any) | undefined;
    onDrag?: ((value: ExtendsMovableBox) => any) | undefined;
    onResize?: ((value: ExtendsMovableBox) => any) | undefined;
    onActive?: ((value: ExtendsMovableBox) => any) | undefined;
    onDisabled?: ((value: boolean) => any) | undefined;
    "onUpdate:modelValue"?: ((value: ExtendsMovableBox) => any) | undefined;
    "onDrag-start"?: ((source: PointerEvent, value: ExtendsMovableBox) => any) | undefined;
    "onDrag-stop"?: ((source: PointerEvent, oldValue: ExtendsMovableBox, newValue: ExtendsMovableBox) => any) | undefined;
    "onResize-start"?: ((source: PointerEvent, value: ExtendsMovableBox) => any) | undefined;
    "onResize-stop"?: ((source: PointerEvent, oldValue: ExtendsMovableBox, newValue: ExtendsMovableBox) => any) | undefined;
    "onDrag-cancel"?: ((source: Event | null, oldValue: ExtendsMovableBox, newValue: ExtendsMovableBox) => any) | undefined;
    "onResize-cancel"?: ((source: Event | null, oldValue: ExtendsMovableBox, newValue: ExtendsMovableBox) => any) | undefined;
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
    resizable: boolean;
    resizeable: boolean;
    limitAreaForParent: boolean;
    modelValue: ExtendsMovableBox;
    minWidth: string | number;
    minHeight: string | number;
    ratioLock: boolean;
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
    snapTargets: SnapTarget[];
}, {}, {}, {}, string, import('vue').ComponentProvideOptions, true, {}, any>, {
    default?(_: {}): any;
}>;
export default _default;
type __VLS_WithTemplateSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
