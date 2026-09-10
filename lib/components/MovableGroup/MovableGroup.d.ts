import { PropType } from 'vue';
import { GroupMemberRect, GroupMoveCancelPayload, GroupMovePayload, GroupMoveStartPayload, GroupMoveStopPayload } from '../../types/MovableGroup';

declare const _default: __VLS_WithTemplateSlots<import('vue').DefineComponent<import('vue').ExtractPropTypes<{
    selected: {
        type: () => string[];
        default: undefined;
    };
    sharedBounds: {
        type: BooleanConstructor;
        default: boolean;
    };
    /**
     * Collision scope for group moves. 'leader' (default) lets the box under the pointer
     * resolve its own collisions; 'all' additionally limits the shared displacement to the
     * earliest contact of any selected member with an external obstacle.
     */
    groupCollision: {
        type: PropType<"all" | "leader">;
        default: string;
    };
}>, {
    getSelected: () => string[];
    select: (ids?: string[] | undefined) => void;
    getMemberRects: () => GroupMemberRect<object>[];
}, {}, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {
    "update:selected": (ids: string[]) => void;
    "move-start": (payload: GroupMoveStartPayload<object>) => void;
    move: (payload: GroupMovePayload<object>) => void;
    "move-stop": (payload: GroupMoveStopPayload<object>) => void;
    "move-cancel": (payload: GroupMoveCancelPayload<object>) => void;
}, string, import('vue').PublicProps, Readonly<import('vue').ExtractPropTypes<{
    selected: {
        type: () => string[];
        default: undefined;
    };
    sharedBounds: {
        type: BooleanConstructor;
        default: boolean;
    };
    /**
     * Collision scope for group moves. 'leader' (default) lets the box under the pointer
     * resolve its own collisions; 'all' additionally limits the shared displacement to the
     * earliest contact of any selected member with an external obstacle.
     */
    groupCollision: {
        type: PropType<"all" | "leader">;
        default: string;
    };
}>> & Readonly<{
    onMove?: ((payload: GroupMovePayload<object>) => any) | undefined;
    "onUpdate:selected"?: ((ids: string[]) => any) | undefined;
    "onMove-start"?: ((payload: GroupMoveStartPayload<object>) => any) | undefined;
    "onMove-stop"?: ((payload: GroupMoveStopPayload<object>) => any) | undefined;
    "onMove-cancel"?: ((payload: GroupMoveCancelPayload<object>) => any) | undefined;
}>, {
    selected: string[];
    sharedBounds: boolean;
    groupCollision: "all" | "leader";
}, {}, {}, {}, string, import('vue').ComponentProvideOptions, true, {}, any>, {
    default?(_: {}): any;
}>;
export default _default;
type __VLS_WithTemplateSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
