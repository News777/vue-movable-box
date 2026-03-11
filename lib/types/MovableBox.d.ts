/**
 * MovableBox 类型定义
 * 提供拖拽组件的所有类型支持
 */
export interface MovableBox {
    left: number | string;
    top: number | string;
    width: number | string;
    height: number | string;
    zIndex?: number;
}
export type ExtendsMovableBox = Required<Omit<MovableBox, 'zIndex'>> & {
    [key: string]: any;
};
export interface MovableBoxProps<T> {
    /** 主题色 */
    theme?: string;
    /** 失活颜色 */
    inActiveColor?: string;
    /** 单位类型: px 或 % */
    unitType?: 'px' | '%';
    /** 缩放比例 */
    scale?: number | string;
    /** 是否保留小数 */
    isKeepDecimals?: boolean;
    /** 保留小数位数 */
    decimalPlaces?: number;
    /** 是否可拖拽 */
    draggable?: boolean;
    /** 是否可调整大小 */
    resizeable?: boolean;
    /** 是否限制在父元素内 */
    limitAreaForParent?: boolean;
    /** 限制区域的选择器 */
    limitAreaClass?: string;
    /** v-model 绑定值 */
    modelValue: Required<Omit<MovableBox, 'zIndex'>> & T;
    /** 最大宽度 */
    maxWidth?: number | string;
    /** 最大高度 */
    maxHeight?: number | string;
    /** 最小宽度 */
    minWidth?: number | string;
    /** 最小高度 */
    minHeight?: number | string;
    /** 是否锁定宽高比 */
    ratioLock?: boolean;
    /** 是否激活 */
    active?: boolean;
    /** 是否禁用文本选择 */
    disabledUserSelect?: boolean;
    /** 拖拽手柄位置 */
    handles?: Array<HandlesSet[number]>;
    /** 是否禁用组件 */
    disabled?: boolean;
    /** 初始位置（只读，用于只读模式） */
    initRect?: boolean;
}
export type HandlesSet = ['tl', 'tm', 'tr', 'mr', 'br', 'bm', 'bl', 'ml'];
export type HandlePosition = HandlesSet[number];
export type DragDirection = 'horizontal' | 'vertical' | 'both';
export interface DragEventPayload {
    event: MouseEvent | TouchEvent;
    value: ExtendsMovableBox;
}
export interface DragStopEventPayload extends DragEventPayload {
    oldValue: ExtendsMovableBox;
    newValue: ExtendsMovableBox;
}
export interface MovableBoxExpose {
    /** 获取当前配置 */
    getConfig: () => ExtendsMovableBox;
    /** 设置位置 */
    setPosition: (left: number, top: number) => void;
    /** 设置大小 */
    setSize: (width: number, height: number) => void;
    /** 重置大小 */
    reset: () => void;
    /** 激活拖拽 */
    activate: () => void;
    /** 停用拖拽 */
    deactivate: () => void;
}
