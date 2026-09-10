import { App } from 'vue';
import { default as MovableBox } from './components/MovableBox/MovableBox';
import { default as MovableGroup } from './components/MovableGroup/MovableGroup';

export { MovableBox, MovableGroup };
export type { BoundsMargin, CollisionDirection, CollisionEventPayload, DragDirection, ExtendsMovableBox, GuidesEventPayload, HandlePosition, HandlesSet, MovableBoxExpose, MovableBoxProps, MovableBoxRect, SnapEventPayload, SnapPoint, SnapSpacingInfo, SnapStrategy, SnapTarget } from './types/MovableBox';
export type { GroupMemberMoveRecord, GroupMemberRect, GroupMoveCancelPayload, GroupMovePayload, GroupMoveStartPayload, GroupMoveStopPayload, MovableGroupExpose, MovableGroupProps } from './types/MovableGroup';
export declare const name = "VueMovableBox";
export declare const version: string;
export declare const install: (app: App) => void;
declare const _default: {
    name: string;
    version: string;
    install: (app: App<any>) => void;
};
export default _default;
