/**
 * VueMovableBox - 可拖拽可调整大小的 Vue 3 组件
 * @description A draggable and resizable container component for Vue 3
 * @version 1.1.5-beta.1
 */

import type { App, Component } from 'vue';
import MovableBox from './components/MovableBox/MovableBox.vue';
import type { MovableBoxProps, ExtendsMovableBox, MovableBoxExpose, HandlesSet } from './types/MovableBox';

// 导出组件 (两种命名方式兼容不同使用习惯)
export { MovableBox };
// VueMovableBox 作为类型导出，避免 dts 生成问题
export type { MovableBoxProps, ExtendsMovableBox, MovableBoxExpose, HandlesSet };

// 组件名称
export const name = 'VueMovableBox';

// 安装函数
const install = (app: App) => {
  app.component(name, MovableBox);
};

// 默认导出
export default {
  name,
  version: '1.1.5-beta.1',
  install
};

// 如果是 UMD 构建，暴露全局对象
if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use({ install });
}

declare global {
  interface Window {
    Vue: {
      use: (plugin: { install: (app: App) => void }) => void;
    };
  }
}
