export interface AutoDraggable {
  left: number | string;
  top: number | string;
  width: number | string;
  height: number | string;
  zIndex?: number;
}

export type ExtendsAutoDraggable = Required<Omit<AutoDraggable, 'zIndex'>> & {
  [key: string]: any;
};

export interface AutoDraggableProps<T> {
  theme?: string; // 主题色，默认#409EFD
  inActiveColor?: string; // 失活颜色
  unitType?: 'px' | '%'; // 单位，默认px
  scale?: number | string; // 缩放比例，默认1
  isKeepDecimals?: boolean; // 是否保留小数，默认false
  decimalPlaces?: number; // 保留几位小数,默认2位
  draggable?: boolean; // 是否可以移动，默认true
  resizeable?: boolean; // 是否可以缩放，默认true
  // areaWidth?: number | string; // 父区域width 默认获取父元素width
  // areaHeight?: number | string; // 父区域height 默认获取父元素height
  limitAreaForParent?: boolean; // 限制元素移动区域为父元素内，默认true
  limitAreaClass?: string;
  modelValue: Required<Omit<AutoDraggable, 'zIndex'>> & T;
  maxWidth?: number | string;
  maxHeight?: number | string;
  minWidth?: number | string;
  minHeight?: number | string;
  ratioLock?: boolean;
  active: boolean; // 该组件是否活跃
  disabledUserSelect?: boolean; // 是否开启选择文本，默认false
  handles?: Array<HandlesSet[number]>; // 控制触点，默认全选
}

export interface VueDraggableEmits {
  (event: 'update:modelValue', value: ExtendsAutoDraggable): void;
  (event: 'drag-start', e: MouseEvent, value: ExtendsAutoDraggable): void;
  (
    event: 'drag-stop',
    e: MouseEvent,
    oldValue: ExtendsAutoDraggable,
    newValue: ExtendsAutoDraggable
  ): void;
  (event: 'resize-start', e: MouseEvent, value: ExtendsAutoDraggable): void;
  (
    event: 'resize-stop',
    e: MouseEvent,
    oldValu: ExtendsAutoDraggable,
    newValue: ExtendsAutoDraggable
  ): void;
  (event: 'active', value: ExtendsAutoDraggable): void;
  (event: 'inactive', value: ExtendsAutoDraggable): void;
}

export type HandlesSet = ['tl', 'tm', 'tr', 'mr', 'br', 'bm', 'bl', 'ml'];
