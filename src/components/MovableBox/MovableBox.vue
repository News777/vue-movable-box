<template>
  <div
    ref="autoDraggableRef"
    class="auto-draggable"
    :class="{
      'select-none': disabledUserSelect,
      'is-disabled': disabled,
      'is-active': state.active,
      'is-dragging': state.isDragging,
      'is-resizing': state.isResizing,
      'is-readonly': initRect,
      'is-transition': enableTransition
    }"
    :style="MovableBoxStyle"
    @mousedown="handleMouseDown($event, null)"
    @touchstart.passive="handleTouchStart($event, null)"
    @dblclick="handleDoubleClick"
    @keydown="handleKeyDown"
    tabindex="0"
  >
    <!-- 拖拽手柄 - 根据 resizeDirections 过滤 -->
    <template v-for="handle in handles" :key="handle">
      <div
        v-show="state.active && resizeable && !disabled && isHandleAllowed(handle)"
        class="handle"
        :class="'handle-' + handle"
        :style="HandleStyle"
        @mousedown.stop.prevent="handleMouseDown($event, handle)"
        @touchstart.stop.prevent="handleTouchStart($event, handle)"
      ></div>
    </template>

    <!-- 插槽内容 -->
    <slot></slot>
  </div>
</template>

<script setup lang="ts" name="VueMovableBox">
import { type CSSProperties, computed, ref, reactive, watch, onUnmounted } from 'vue';

// ============ 类型定义 (内联以解决构建问题) ============
type HandlesSet = ['tl', 'tm', 'tr', 'mr', 'br', 'bm', 'bl', 'ml'];
type HandlePosition = HandlesSet[number];

interface MovableBox {
  left: number | string;
  top: number | string;
  width: number | string;
  height: number | string;
  zIndex?: number;
}

type ExtendsMovableBox = Required<Omit<MovableBox, 'zIndex'>> & {
  [key: string]: any;
};

interface MovableBoxProps<T> {
  theme?: string;
  inActiveColor?: string;
  unitType?: 'px' | '%';
  scale?: number | string;
  isKeepDecimals?: boolean;
  decimalPlaces?: number;
  draggable?: boolean;
  resizeable?: boolean;
  limitAreaForParent?: boolean;
  limitAreaClass?: string;
  modelValue: Required<Omit<MovableBox, 'zIndex'>> & T;
  maxWidth?: number | string;
  maxHeight?: number | string;
  minWidth?: number | string;
  minHeight?: number | string;
  ratioLock?: boolean;
  active?: boolean;
  disabledUserSelect?: boolean;
  handles?: Array<HandlePosition>;
  disabled?: boolean;
  initRect?: boolean;
  // 边界与网格
  edgeDistance?: number;
  snapToGrid?: boolean;
  gridSize?: number;
  dragDirections?: string[];
  resizeDirections?: string[];
  enableTransition?: boolean;
  keyboardEnabled?: boolean;
  keyboardStep?: number;
  boundsMargin?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
  // 对齐吸附
  snapToElements?: boolean;
  snapThreshold?: number;
  // 碰撞检测
  collisionEnabled?: boolean;
  allowOverlap?: boolean;
  // 对齐目标元素
  snapTargets?: Array<{ left: number; top: number; width: number; height: number; id?: string }>;
}

interface MovableBoxExpose {
  getConfig: () => ExtendsMovableBox;
  setPosition: (left: number, top: number) => void;
  setSize: (width: number, height: number) => void;
  reset: () => void;
  activate: () => void;
  deactivate: () => void;
}

// ============ 工具函数导入 ============
import {
  figureFinalValue,
  setValUnit,
  valIsNaN,
  addEvent,
  removeEvent,
  restrictToBounds,
  keepDecimalsToNum,
  deepClone,
  getEventCoords
} from './utils';

const props = withDefaults(defineProps<MovableBoxProps<any>>(), {
  theme: '#409EFD',
  inActiveColor: '#666666',
  unitType: 'px',
  scale: 1,
  isKeepDecimals: false,
  decimalPlaces: 2,
  draggable: true,
  resizable: true,
  limitAreaForParent: true,
  disabledUserSelect: true,
  ratioLock: false,
  modelValue: () => ({
    left: 0,
    top: 0,
    width: 200,
    height: 100,
    zIndex: 1
  }),
  minWidth: 0,
  minHeight: 0,
  handles: () => ['tl', 'tm', 'tr', 'mr', 'br', 'bm', 'bl', 'ml'] as HandlesSet,
  disabled: false,
  initRect: false,
  active: false,
  // 新增功能默认值
  edgeDistance: 0,
  snapToGrid: false,
  gridSize: 20,
  dragDirections: () => ['top', 'bottom', 'left', 'right'],
  resizeDirections: () => ['tl', 'tm', 'tr', 'mr', 'br', 'bm', 'bl', 'ml'],
  enableTransition: false,
  keyboardEnabled: false,
  keyboardStep: 1,
  boundsMargin: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
  // 对齐吸附
  snapToElements: false,
  snapThreshold: 10,
  // 碰撞检测
  collisionEnabled: false,
  allowOverlap: false,
  snapTargets: () => []
});

const emit = defineEmits<{
  (event: 'update:modelValue', value: ExtendsMovableBox): void;
  (event: 'drag-start', e: MouseEvent | TouchEvent, value: ExtendsMovableBox): void;
  (
    event: 'drag-stop',
    e: MouseEvent | TouchEvent,
    oldValue: ExtendsMovableBox,
    newValue: ExtendsMovableBox
  ): void;
  (event: 'resize-start', e: MouseEvent | TouchEvent, value: ExtendsMovableBox): void;
  (
    event: 'resize-stop',
    e: MouseEvent | TouchEvent,
    oldValue: ExtendsMovableBox,
    newValue: ExtendsMovableBox
  ): void;
  (event: 'active', value: ExtendsMovableBox): void;
  (event: 'inactive', value: ExtendsMovableBox): void;
  (event: 'disabled', value: boolean): void;
  (event: 'dblclick', e: MouseEvent): void;
  (event: 'out-of-bounds', direction: 'left' | 'top' | 'right' | 'bottom'): void;
  (event: 'move', value: ExtendsMovableBox): void;
  (event: 'resize', value: ExtendsMovableBox): void;
  // 对齐吸附事件
  (event: 'snap', result: { snapped: boolean; point?: string }): void;
  (event: 'guides', data: { vertical: number[]; horizontal: number[] }): void;
  // 碰撞事件
  (event: 'collision', result: { colliding: boolean; direction?: string }): void;
}>();

// 响应式状态
const state = reactive<{
  beforeClickConfig: ExtendsMovableBox;
  initX: number;
  initY: number;
  parentElement: HTMLElement | null;
  parentRectArea: DOMRect | null;
  ele: HTMLElement | null;
  parentInfo: { width: number; height: number };
  active: boolean;
  handle: HandlesSet[number] | null;
  rate: number;
  isDragging: boolean;
  isResizing: boolean;
}>({
  beforeClickConfig: { top: 0, left: 0, width: 0, height: 0 },
  initX: 0,
  initY: 0,
  parentElement: null,
  parentRectArea: null,
  ele: null,
  parentInfo: { width: 0, height: 0 },
  active: props.active,
  handle: null,
  rate: 1,
  isDragging: false,
  isResizing: false
});

// 计算属性
const autoDraggable = computed({
  get() {
    return props.modelValue;
  },
  set(value: ExtendsMovableBox) {
    emit('update:modelValue', value);
  }
});

const autoDraggableRef = ref<HTMLElement>();

// 计算样式
const MovableBoxStyle = computed<CSSProperties>(() => ({
  borderColor: props.disabled
    ? props.inActiveColor
    : state.active
      ? props.theme
      : props.inActiveColor,
  left: setValUnit(autoDraggable.value.left, props.unitType),
  top: setValUnit(autoDraggable.value.top, props.unitType),
  width: setValUnit(autoDraggable.value.width, props.unitType),
  height: setValUnit(autoDraggable.value.height, props.unitType),
  zIndex: autoDraggable.value.zIndex,
  cursor: props.disabled
    ? 'not-allowed'
    : state.isDragging
      ? 'move'
      : state.isResizing
        ? 'nwse-resize'
        : 'default',
  pointerEvents: props.disabled ? 'none' : 'auto',
  opacity: state.active ? 1 : 0.9,
  // 硬件加速
  transform: 'translateZ(0)',
  willChange: state.isDragging || state.isResizing ? 'left, top, width, height' : 'auto',
  // 过渡动画（仅在启用且非拖拽时）
  transition:
    props.enableTransition && !state.isDragging && !state.isResizing
      ? 'left 0.2s ease, top 0.2s ease, width 0.2s ease, height 0.2s ease'
      : 'none'
}));

const HandleStyle = computed<CSSProperties>(() => ({
  borderColor: props.resizeable ? props.theme : props.inActiveColor,
  scale: keepDecimalsToNum(1 / valIsNaN(props.scale, 1), 1)
}));

const isPercent = computed(() => props.unitType === '%');

const eleMaxWidth = computed(() => {
  const maxWidthProp = valIsNaN(props.maxWidth, 0);
  const initValue = props.limitAreaForParent
    ? maxWidthProp > state.parentInfo.width || !maxWidthProp
      ? state.parentInfo.width
      : maxWidthProp
    : Infinity;

  return (isPercent.value && (maxWidthProp ? Math.min(100, maxWidthProp) : 100)) || initValue;
});

const eleMaxHeight = computed(() => {
  const maxHeightProp = valIsNaN(props.maxHeight, 0);
  const initValue = props.limitAreaForParent
    ? maxHeightProp > state.parentInfo.height || !maxHeightProp
      ? state.parentInfo.height
      : maxHeightProp
    : Infinity;

  return (isPercent.value && (maxHeightProp ? Math.min(100, maxHeightProp) : 100)) || initValue;
});

const eleMinWidth = computed(() => (props.limitAreaForParent ? 0 : -Infinity));
const eleMinHeight = computed(() => (props.limitAreaForParent ? 0 : -Infinity));

// 监听 props 变化
watch(
  () => props.active,
  (n, o) => {
    if (n === o) return;
    state.active = n;
    if (n) {
      emit('active', deepClone(autoDraggable.value));
    } else {
      emit('inactive', deepClone(autoDraggable.value));
    }
  }
);

watch(
  () => props.disabled,
  n => {
    emit('disabled', n);
  }
);

// 监听保留小数设置变化 - 关闭时立即取整当前值
watch(
  () => props.isKeepDecimals,
  (n, o) => {
    if (n === o) return;
    // 从 true 变为 false 时，取整所有数值
    if (o === true && n === false) {
      autoDraggable.value.left = Math.round(autoDraggable.value.left);
      autoDraggable.value.top = Math.round(autoDraggable.value.top);
      autoDraggable.value.width = Math.round(autoDraggable.value.width);
      autoDraggable.value.height = Math.round(autoDraggable.value.height);
      // 触发更新
      emit('update:modelValue', deepClone(autoDraggable.value));
    }
  }
);

// 初始化
const getParentAndRect = () => {
  state.ele =
    document.documentElement || autoDraggableRef.value?.parentElement || autoDraggableRef.value;
};

// 数值计算辅助函数
const figureNewVal = (value: string | number, type: 'w' | 'h'): number => {
  const finalVal = isPercent.value
    ? type === 'w'
      ? (valIsNaN(value, 0) / state.parentInfo.width) * 100
      : (valIsNaN(value, 0) / state.parentInfo.height) * 100
    : value;
  return figureFinalValue(finalVal, props.scale, props.isKeepDecimals, props.decimalPlaces);
};

// 检查手柄是否允许
const isHandleAllowed = (handle: string): boolean => {
  return props.resizeDirections.includes(handle as any);
};

// 检查拖拽方向是否允许
const isDragDirectionAllowed = (direction: string): boolean => {
  return props.dragDirections.includes(direction);
};

// 网格吸附
const snapToGridValue = (value: number): number => {
  if (!props.snapToGrid) return value;
  const gridSize = props.gridSize || 20;
  return Math.round(value / gridSize) * gridSize;
};

// 键盘处理
const handleKeyDown = (event: KeyboardEvent) => {
  if (!props.keyboardEnabled || props.disabled || !state.active) return;

  const step = props.keyboardStep || 1;
  let moved = false;
  let newLeft = autoDraggable.value.left;
  let newTop = autoDraggable.value.top;

  switch (event.key) {
    case 'ArrowUp':
      if (isDragDirectionAllowed('top')) {
        newTop = snapToGridValue(Number(newTop) - step);
        moved = true;
      }
      break;
    case 'ArrowDown':
      if (isDragDirectionAllowed('bottom')) {
        newTop = snapToGridValue(Number(newTop) + step);
        moved = true;
      }
      break;
    case 'ArrowLeft':
      if (isDragDirectionAllowed('left')) {
        newLeft = snapToGridValue(Number(newLeft) - step);
        moved = true;
      }
      break;
    case 'ArrowRight':
      if (isDragDirectionAllowed('right')) {
        newLeft = snapToGridValue(Number(newLeft) + step);
        moved = true;
      }
      break;
    case 'Escape':
      state.active = false;
      break;
    default:
      return;
  }

  if (moved) {
    event.preventDefault();
    // 应用边界检查
    const bounds = getBounds();
    newLeft = Math.max(bounds.minLeft, Math.min(bounds.maxLeft, newLeft as number));
    newTop = Math.max(bounds.minTop, Math.min(bounds.maxTop, newTop as number));

    autoDraggable.value.left = keepDecimalsToNum(newLeft);
    autoDraggable.value.top = keepDecimalsToNum(newTop);
    emit('update:modelValue', { ...autoDraggable.value });
    emit('move', { ...autoDraggable.value });
  }
};

// 获取边界
const getBounds = () => {
  const margin = props.boundsMargin || { top: 0, right: 0, bottom: 0, left: 0 };
  const edge = props.edgeDistance || 0;

  const marginTop = margin.top || 0;
  const marginRight = margin.right || 0;
  const marginBottom = margin.bottom || 0;
  const marginLeft = margin.left || 0;

  let minLeft = marginLeft || edge;
  let maxLeft = isPercent.value
    ? 100 - marginRight - edge - Number(autoDraggable.value.width)
    : state.parentInfo.width - marginRight - edge - Number(autoDraggable.value.width);
  let minTop = marginTop || edge;
  let maxTop = isPercent.value
    ? 100 - marginBottom - edge - Number(autoDraggable.value.height)
    : state.parentInfo.height - marginBottom - edge - Number(autoDraggable.value.height);

  if (props.limitAreaForParent) {
    if (!isPercent.value) {
      minLeft = Math.max(0, marginLeft);
      minTop = Math.max(0, marginTop);
    }
  }

  return { minLeft, maxLeft: Math.max(minLeft, maxLeft), minTop, maxTop: Math.max(minTop, maxTop) };
};

// 鼠标按下处理
const handleMouseDown = (event: MouseEvent, handle: HandlesSet[number] | null = null) => {
  startDrag(event, handle);
};

// 触摸开始处理
const handleTouchStart = (event: TouchEvent, handle: HandlesSet[number] | null = null) => {
  // 防止滚动
  if (event.cancelable) {
    event.preventDefault();
  }
  startDrag(event, handle);
};

// 开始拖拽核心逻辑
const startDrag = (event: MouseEvent | TouchEvent, handle: HandlesSet[number] | null) => {
  // 即使禁用了拖拽/调整，也需要触发 active 事件（点击激活功能）
  if (props.disabled) return;

  // 如果是只读模式，不允许交互
  if (props.initRect) return;

  // 必须是可拖拽或可调整状态
  if (!props.draggable && !props.resizeable) return;

  // 如果没有 handle，必须可拖拽
  if (!handle && !props.draggable) return;
  // 如果有 handle，必须可调整
  if (handle && !props.resizeable) return;

  const { x, y } = getEventCoords(event);

  state.initX = x;
  state.initY = y;
  state.beforeClickConfig = deepClone(autoDraggable.value);

  // 点击时立即激活，不管是否拖动
  if (!state.active) {
    state.active = true;
    emit('active', deepClone(autoDraggable.value));
  }

  if (props.draggable && !handle) {
    state.isDragging = true;
    emit('drag-start', event, state.beforeClickConfig);
  }

  if (props.resizeable && handle) {
    state.isResizing = true;
    emit('resize-start', event, state.beforeClickConfig);
  }

  // 更新父元素信息
  if (props.limitAreaForParent) {
    state.parentElement = props.limitAreaClass
      ? (document.querySelector(props.limitAreaClass) as HTMLElement) ||
        autoDraggableRef.value?.parentElement ||
        null
      : autoDraggableRef.value?.parentElement || null;

    if (state.parentElement) {
      state.parentRectArea = state.parentElement.getBoundingClientRect();
      state.parentInfo.height = state.parentElement?.clientHeight || 0;
      state.parentInfo.width = state.parentElement?.clientWidth || 0;
    }
  }

  state.active = true;
  state.handle = handle;

  // 锁定宽高比
  if (props.ratioLock) {
    state.rate = keepDecimalsToNum(
      valIsNaN(state.beforeClickConfig.width, 1) / valIsNaN(state.beforeClickConfig.height, 1),
      1
    );
  }

  // 添加移动和结束事件
  const eventOptions = { passive: false } as any;
  addEvent(state.ele!, 'mousemove', handleMouseMove as any, eventOptions);
  addEvent(state.ele!, 'mouseup', handleMouseUp as any, eventOptions);
  addEvent(state.ele!, 'touchmove', handleTouchMove as any, eventOptions);
  addEvent(state.ele!, 'touchend', handleTouchEnd as any, eventOptions);
  addEvent(state.ele!, 'mouseleave', handleMouseUp as any, eventOptions);
};

// 鼠标移动处理
const handleMouseMove = (event: MouseEvent) => {
  doDrag(event);
};

// 触摸移动处理
const handleTouchMove = (event: TouchEvent) => {
  if (event.cancelable) {
    event.preventDefault();
  }
  doDrag(event);
};

// RAF 相关变量
let rafId: number | null = null;
let isDragging = false;

// 执行拖拽核心逻辑 - 使用 RAF 优化
const doDrag = (event: MouseEvent | TouchEvent) => {
  if (!state.active) return;

  // 标记需要更新
  isDragging = true;

  // 如果已有 RAF 请求，跳过
  if (rafId !== null) return;

  // 使用 requestAnimationFrame 节流
  rafId = requestAnimationFrame(() => {
    rafId = null;
    if (!isDragging) return;

    const { x, y } = getEventCoords(event);

    const l = valIsNaN(state.beforeClickConfig.left, 0);
    const t = valIsNaN(state.beforeClickConfig.top, 0);
    const w = valIsNaN(state.beforeClickConfig.width, 0);
    const h = valIsNaN(state.beforeClickConfig.height, 0);

    const deltaX = x - state.initX;
    const deltaY = y - state.initY;

    // 处理移动
    if (state.isDragging) {
      const newLeft = l + figureNewVal(deltaX, 'w');
      const newTop = t + figureNewVal(deltaY, 'h');

      // 检测边界溢出
      checkBounds(newLeft, newTop, w, h);

      // 应用网格吸附
      let finalLeft = keepDecimalsToNum(newLeft);
      let finalTop = keepDecimalsToNum(newTop);

      if (props.snapToGrid) {
        finalLeft = snapToGridValue(finalLeft);
        finalTop = snapToGridValue(finalTop);
      }

      autoDraggable.value.left = restrictToBounds(
        finalLeft,
        eleMinWidth.value,
        isPercent.value ? 100 : state.parentInfo.width - w,
        props.limitAreaForParent
      );

      autoDraggable.value.top = restrictToBounds(
        finalTop,
        eleMinHeight.value,
        isPercent.value ? 100 : state.parentInfo.height - h,
        props.limitAreaForParent
      );

      // 减少 emit 频率，只传递必要数据，不 deepClone
      emit('move', {
        left: autoDraggable.value.left,
        top: autoDraggable.value.top,
        width: autoDraggable.value.width,
        height: autoDraggable.value.height
      } as ExtendsMovableBox);
    }

    // 处理缩放
    if (state.isResizing && state.handle) {
      handleResize(l, t, w, h, deltaX, deltaY);

      // 减少 emit 频率
      emit('resize', {
        left: autoDraggable.value.left,
        top: autoDraggable.value.top,
        width: autoDraggable.value.width,
        height: autoDraggable.value.height
      } as ExtendsMovableBox);
    }

    isDragging = false;
  });
};

// 处理调整大小
const handleResize = (
  l: number,
  t: number,
  w: number,
  h: number,
  deltaX: number,
  deltaY: number
) => {
  // 计算原始宽高比
  const ratio = w / h || 1;

  const handleMap: Record<string, () => void> = {
    tl: () => {
      if (props.ratioLock) {
        // tl 手柄: 计算新的右下角位置，然后按比例约束尺寸
        const deltaW = figureNewVal(deltaX, 'w');
        const deltaH = figureNewVal(deltaY, 'h');

        // 目标右下角（未约束比例）
        let newRight = l + w - deltaW;
        let newBottom = t + h - deltaH;

        // 计算目标尺寸
        let newWidth = newRight - l;
        let newHeight = newBottom - t;

        // 按比例约束
        if (newWidth / newHeight > ratio) {
          newWidth = newHeight * ratio;
        } else {
          newHeight = newWidth / ratio;
        }

        // 应用最小/最大约束
        newWidth = Math.max(
          valIsNaN(props.minWidth, 20),
          Math.min(newWidth, eleMaxWidth.value - l)
        );
        newHeight = Math.max(
          valIsNaN(props.minHeight, 20),
          Math.min(newHeight, eleMaxHeight.value - t)
        );

        updateWidth(keepDecimalsToNum(newWidth), eleMaxWidth.value - l);
        updateHeight(keepDecimalsToNum(newHeight), eleMaxHeight.value - t);
        updateLeft(l + w - autoDraggable.value.width);
        updateTop(t + h - autoDraggable.value.height);
      } else {
        updateWidth(w - figureNewVal(deltaX, 'w'), l + w);
        updateHeight(h - figureNewVal(deltaY, 'h'), t + h);
        updateLeft(l + figureNewVal(deltaX, 'w'));
        updateTop(t + figureNewVal(deltaY, 'h'));
      }
    },
    tm: () => {
      if (props.ratioLock) {
        // tm: 只调整高度，宽度固定（按比例计算）
        const deltaH = figureNewVal(deltaY, 'h');
        let newHeight = h - deltaH;

        // 按比例约束
        newHeight = Math.max(
          valIsNaN(props.minHeight, 20),
          Math.min(newHeight, eleMaxHeight.value - t)
        );
        const constrainedWidth = newHeight * ratio;

        updateHeight(keepDecimalsToNum(newHeight), eleMaxHeight.value - t);
        updateWidth(keepDecimalsToNum(constrainedWidth), eleMaxWidth.value - l);
        updateTop(t + h - autoDraggable.value.height);
      } else {
        updateHeight(h - figureNewVal(deltaY, 'h'), t + h);
        updateTop(t + figureNewVal(deltaY, 'h'));
      }
    },
    tr: () => {
      if (props.ratioLock) {
        const deltaW = figureNewVal(deltaX, 'w');
        const deltaH = figureNewVal(deltaY, 'h');

        let newWidth = w + deltaW;
        let newHeight = h - deltaH;

        // 按比例约束
        if (newWidth / newHeight > ratio) {
          newWidth = newHeight * ratio;
        } else {
          newHeight = newWidth / ratio;
        }

        newWidth = Math.max(
          valIsNaN(props.minWidth, 20),
          Math.min(newWidth, eleMaxWidth.value - l)
        );
        newHeight = Math.max(
          valIsNaN(props.minHeight, 20),
          Math.min(newHeight, eleMaxHeight.value - t)
        );

        updateWidth(keepDecimalsToNum(newWidth), eleMaxWidth.value - l);
        updateHeight(keepDecimalsToNum(newHeight), eleMaxHeight.value - t);
        updateTop(t + h - autoDraggable.value.height);
      } else {
        updateHeight(h - figureNewVal(deltaY, 'h'), t + h);
        updateTop(t + figureNewVal(deltaY, 'h'));
        updateWidth(w + figureNewVal(deltaX, 'w'), eleMaxWidth.value - l);
      }
    },
    mr: () => {
      if (props.ratioLock) {
        const deltaW = figureNewVal(deltaX, 'w');
        let newWidth = w + deltaW;

        // 按比例约束高度
        newWidth = Math.max(
          valIsNaN(props.minWidth, 20),
          Math.min(newWidth, eleMaxWidth.value - l)
        );
        const constrainedHeight = newWidth / ratio;

        updateWidth(keepDecimalsToNum(newWidth), eleMaxWidth.value - l);
        updateHeight(keepDecimalsToNum(constrainedHeight), eleMaxHeight.value - t);
      } else {
        updateWidth(w + figureNewVal(deltaX, 'w'), eleMaxWidth.value - l);
      }
    },
    br: () => {
      if (props.ratioLock) {
        const deltaW = figureNewVal(deltaX, 'w');
        const deltaH = figureNewVal(deltaY, 'h');

        let newWidth = w + deltaW;
        let newHeight = h + deltaH;

        // 按比例约束
        if (newWidth / newHeight > ratio) {
          newWidth = newHeight * ratio;
        } else {
          newHeight = newWidth / ratio;
        }

        newWidth = Math.max(
          valIsNaN(props.minWidth, 20),
          Math.min(newWidth, eleMaxWidth.value - l)
        );
        newHeight = Math.max(
          valIsNaN(props.minHeight, 20),
          Math.min(newHeight, eleMaxHeight.value - t)
        );

        updateWidth(keepDecimalsToNum(newWidth), eleMaxWidth.value - l);
        updateHeight(keepDecimalsToNum(newHeight), eleMaxHeight.value - t);
      } else {
        updateWidth(w + figureNewVal(deltaX, 'w'), eleMaxWidth.value - l);
        updateHeight(h + figureNewVal(deltaY, 'h'), eleMaxHeight.value - t);
      }
    },
    bm: () => {
      if (props.ratioLock) {
        const deltaH = figureNewVal(deltaY, 'h');
        let newHeight = h + deltaH;

        // 按比例约束
        newHeight = Math.max(
          valIsNaN(props.minHeight, 20),
          Math.min(newHeight, eleMaxHeight.value - t)
        );
        const constrainedWidth = newHeight * ratio;

        updateHeight(keepDecimalsToNum(newHeight), eleMaxHeight.value - t);
        updateWidth(keepDecimalsToNum(constrainedWidth), eleMaxWidth.value - l);
      } else {
        updateHeight(h + figureNewVal(deltaY, 'h'), eleMaxHeight.value - t);
      }
    },
    bl: () => {
      if (props.ratioLock) {
        const deltaW = figureNewVal(deltaX, 'w');
        const deltaH = figureNewVal(deltaY, 'h');

        let newWidth = w - deltaW;
        let newHeight = h + deltaH;

        // 按比例约束
        if (newWidth / newHeight > ratio) {
          newWidth = newHeight * ratio;
        } else {
          newHeight = newWidth / ratio;
        }

        newWidth = Math.max(valIsNaN(props.minWidth, 20), Math.min(newWidth, w + l));
        newHeight = Math.max(
          valIsNaN(props.minHeight, 20),
          Math.min(newHeight, eleMaxHeight.value - t)
        );

        updateWidth(keepDecimalsToNum(newWidth), w + l);
        updateLeft(l + w - autoDraggable.value.width);
        updateHeight(keepDecimalsToNum(newHeight), eleMaxHeight.value - t);
      } else {
        updateWidth(w - figureNewVal(deltaX, 'w'), w + l);
        updateLeft(l + figureNewVal(deltaX, 'w'));
        updateHeight(h + figureNewVal(deltaY, 'h'), eleMaxHeight.value - t);
      }
    },
    ml: () => {
      if (props.ratioLock) {
        const deltaW = figureNewVal(deltaX, 'w');
        let newWidth = w - deltaW;

        // 按比例约束
        newWidth = Math.max(valIsNaN(props.minWidth, 20), Math.min(newWidth, w + l));
        const constrainedHeight = newWidth / ratio;

        updateWidth(keepDecimalsToNum(newWidth), w + l);
        updateLeft(l + w - autoDraggable.value.width);
        updateHeight(keepDecimalsToNum(constrainedHeight), eleMaxHeight.value - t);
      } else {
        updateWidth(w - figureNewVal(deltaX, 'w'), w + l);
        updateLeft(l + figureNewVal(deltaX, 'w'));
      }
    }
  };

  handleMap[state.handle!]?.();
  emit('resize', deepClone(autoDraggable.value));
};

// 辅助更新函数
const updateWidth = (value: number, max: number) => {
  autoDraggable.value.width = restrictToBounds(
    keepDecimalsToNum(value),
    valIsNaN(props.minWidth, eleMinWidth.value),
    max,
    props.limitAreaForParent
  );
};

const updateHeight = (value: number, max: number) => {
  autoDraggable.value.height = restrictToBounds(
    keepDecimalsToNum(value),
    valIsNaN(props.minHeight, eleMinHeight.value),
    max,
    props.limitAreaForParent
  );
};

const updateLeft = (value: number) => {
  autoDraggable.value.left = restrictToBounds(
    keepDecimalsToNum(value),
    eleMinWidth.value,
    isPercent.value ? 100 : state.parentInfo.width - valIsNaN(autoDraggable.value.width, 0),
    props.limitAreaForParent
  );
};

const updateTop = (value: number) => {
  autoDraggable.value.top = restrictToBounds(
    keepDecimalsToNum(value),
    eleMinHeight.value,
    isPercent.value ? 100 : state.parentInfo.height - valIsNaN(autoDraggable.value.height, 0),
    props.limitAreaForParent
  );
};

// 边界检测
const checkBounds = (left: number, top: number, width: number, height: number) => {
  const maxLeft = isPercent.value ? 100 : state.parentInfo.width - width;
  const maxTop = isPercent.value ? 100 : state.parentInfo.height - height;

  if (left < 0) emit('out-of-bounds', 'left');
  if (top < 0) emit('out-of-bounds', 'top');
  if (left > maxLeft) emit('out-of-bounds', 'right');
  if (top > maxTop) emit('out-of-bounds', 'bottom');
};

// 鼠标释放处理
const handleMouseUp = (event: MouseEvent) => {
  endDrag(event);
};

// 触摸结束处理
const handleTouchEnd = (event: TouchEvent) => {
  endDrag(event);
};

// 结束拖拽
const endDrag = (event: MouseEvent | TouchEvent) => {
  // 取消待处理的 RAF
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
  isDragging = false;

  if (props.draggable && state.isDragging) {
    emit('drag-stop', event, state.beforeClickConfig, { ...autoDraggable.value });
  }

  if (props.resizeable && state.isResizing) {
    emit('resize-stop', event, state.beforeClickConfig, { ...autoDraggable.value });
  }

  if (!props.active) {
    state.active = false;
    emit('inactive', { ...autoDraggable.value });
  }

  state.handle = null;
  state.isDragging = false;
  state.isResizing = false;

  // 移除事件监听
  const eventOptions = { passive: false } as any;
  removeEvent(state.ele!, 'mousemove', handleMouseMove as any, eventOptions);
  removeEvent(state.ele!, 'mouseup', handleMouseUp as any, eventOptions);
  removeEvent(state.ele!, 'touchmove', handleTouchMove as any, eventOptions);
  removeEvent(state.ele!, 'touchend', handleTouchEnd as any, eventOptions);
  removeEvent(state.ele!, 'mouseleave', handleMouseUp as any, eventOptions);
};

// 双击处理
const handleDoubleClick = (event: MouseEvent) => {
  emit('dblclick', event);
};

// 暴露方法和属性
defineExpose<MovableBoxExpose>({
  getConfig: () => deepClone(autoDraggable.value),
  setPosition: (left: number, top: number) => {
    autoDraggable.value.left = left;
    autoDraggable.value.top = top;
  },
  setSize: (width: number, height: number) => {
    autoDraggable.value.width = width;
    autoDraggable.value.height = height;
  },
  reset: () => {
    autoDraggable.value = {
      left: 0,
      top: 0,
      width: 200,
      height: 100,
      zIndex: 1
    };
  },
  activate: () => {
    state.active = true;
  },
  deactivate: () => {
    state.active = false;
  }
});

// 组件卸载时清理
onUnmounted(() => {
  // 清理 RAF
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }

  if (state.ele) {
    const eventOptions = { passive: false } as any;
    removeEvent(state.ele, 'mousemove', handleMouseMove as any, eventOptions);
    removeEvent(state.ele, 'mouseup', handleMouseUp as any, eventOptions);
    removeEvent(state.ele, 'touchmove', handleTouchMove as any, eventOptions);
    removeEvent(state.ele, 'touchend', handleTouchEnd as any, eventOptions);
    removeEvent(state.ele, 'mouseleave', handleMouseUp as any, eventOptions);
  }
});

// 初始化
getParentAndRect();
</script>

<style scoped lang="scss">
@import url('./style.scss');
</style>
