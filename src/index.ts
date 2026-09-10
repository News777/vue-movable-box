/**
 * VueMovableBox - 可拖拽可调整大小的 Vue 3 组件
 * @description A draggable and resizable container component for Vue 3
 * @version Injected from package.json at build time (__MOVABLE_BOX_VERSION__)
 */

import type { App } from 'vue';
import MovableBox from './components/MovableBox/MovableBox.vue';
import MovableGroup from './components/MovableGroup/MovableGroup.vue';

/** Injected from package.json via the Vite `define` option (single version source). */
declare const __MOVABLE_BOX_VERSION__: string;

// 导出组件 (两种命名方式兼容不同使用习惯)
export { MovableBox, MovableGroup };
// VueMovableBox 作为类型导出，避免 dts 生成问题
export type {
  BoundsMargin,
  CollisionDirection,
  CollisionEventPayload,
  DragDirection,
  ExtendsMovableBox,
  GuidesEventPayload,
  HandlePosition,
  HandlesSet,
  MovableBoxExpose,
  MovableBoxProps,
  MovableBoxRect,
  SnapEventPayload,
  SnapPoint,
  SnapSpacingInfo,
  SnapStrategy,
  SnapTarget
} from './types/MovableBox';
export type {
  GroupMemberMoveRecord,
  GroupMemberRect,
  GroupMoveCancelPayload,
  GroupMovePayload,
  GroupMoveStartPayload,
  GroupMoveStopPayload,
  MovableGroupExpose,
  MovableGroupProps
} from './types/MovableGroup';

// 组件名称
export const name = 'VueMovableBox';

// 版本号（与 package.json 保持一致，构建时注入）
export const version = __MOVABLE_BOX_VERSION__;

// 安装函数
export const install = (app: App) => {
  app.component(name, MovableBox);
  app.component('MovableGroup', MovableGroup);
};

// 默认导出
// The version comes from package.json via a build-time define, so the package metadata is
// the single source of truth and can never drift from the runtime export.
export default {
  name,
  version,
  install
};
