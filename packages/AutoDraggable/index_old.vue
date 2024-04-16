<template>
  <div
    ref="autoDraggableRef"
    class="auto-draggable"
    :style="AutoDraggableStyle"
    :class="{ 'select-none': disabledUserSelect }"
    @mousedown="mousedownHandler($event, null)"
  >
    <template v-for="handle in handles" :key="handle">
      <div
        v-show="state.active && resizeable"
        class="handle"
        :class="'handle-' + handle"
        :style="HandleStyle"
        @mousedown.stop.prevent="mousedownHandler($event, handle)"
      ></div>
    </template>
    <slot></slot>
  </div>
</template>

<script setup lang="tsx">
import {
  type CSSProperties,
  computed,
  ref,
  onMounted,
  reactive,
  watch,
} from 'vue';
import type {
  ExtendsAutoDraggable,
  HandlesSet,
  AutoDraggableProps,
  VueDraggableEmits,
} from '@/type';
import {
  figureFinalValue,
  setValUnit,
  valIsNaN,
  addEvent,
  removeEvent,
  restrictToBounds,
} from './utils/util';
import { cloneDeep } from 'lodash-es';
import Decimal from 'decimal.js';

const props = withDefaults(defineProps<AutoDraggableProps<any>>(), {
  theme: '#409EFD', // 默认主题颜色
  inActiveColor: '#666666',
  unitType: 'px',
  scale: 1,
  isKeepDecimals: false,
  decimalPlaces: 2,
  draggable: true,
  resizeable: true,
  limitAreaForParent: true,
  // areaWidth: 0,
  // areaHeight: 0,
  disabledUserSelect: true, // 控制用户是否可以选择文本
  ratioLock: false,
  modelValue: () => ({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    zIndex: 1,
  }),
  minWidth: 0,
  minHeight: 0,
  handles: () => ['tl', 'tm', 'tr', 'mr', 'br', 'bm', 'bl', 'ml'],
});

const emit = defineEmits<VueDraggableEmits>();

const state = reactive<{
  beforeClickConfig: ExtendsAutoDraggable;
  initX: number;
  initY: number;
  parentElement: HTMLElement | null;
  parentRectArea: DOMRect | null;
  ele: HTMLElement | null;
  parentInfo: {
    width: number;
    height: number;
  };
  active: boolean;
  handle: HandlesSet[number] | null;
  rate: number;
}>({
  // 记录点击前当前元素信息
  beforeClickConfig: {
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  },
  initX: 0, // 记录鼠标第一次点击元素位置，下同
  initY: 0,
  parentElement: null, // 父元素
  parentRectArea: null, // 父元素rect
  ele: null, // 主元素监听
  // 父元素宽高
  parentInfo: {
    width: 0,
    height: 0,
  },
  active: props.active, // 是否开启移动
  handle: null, // 触点位置
  rate: 1, // 宽高比，宽高比将会保留小数，故采用props默认的小数位进行保存
});

const autoDraggable = computed({
  get() {
    return props.modelValue;
  },
  set(value: ExtendsAutoDraggable) {
    emit('update:modelValue', value);
  },
});

const autoDraggableRef = ref<HTMLElement>();
// useEvent(autoDraggableRef, autoDraggable, props);
/**
 * --------------------------computed
 */

// 这里采用top、left 而不采用transform，因为有百分比单位，而transform 百分比基于自身
const AutoDraggableStyle = computed<CSSProperties>(() => {
  return {
    borderColor: props.draggable ? props.theme : props.inActiveColor,
    left: setValUnit(autoDraggable.value.left, props.unitType),
    top: setValUnit(autoDraggable.value.top, props.unitType),
    width: setValUnit(autoDraggable.value.width, props.unitType),
    height: setValUnit(autoDraggable.value.height, props.unitType),
    zIndex: autoDraggable.value.zIndex,
  };
});

const HandleStyle = computed<CSSProperties>(() => {
  return {
    borderColor: props.resizeable ? props.theme : props.inActiveColor,
    scale: keepDecimalsToNum(1 / valIsNaN(props.scale, 1)),
  };
});

const isPercent = computed<boolean>(() => props.unitType === '%');

const eleMaxWidth = computed<number>(() => {
  const maxWidthProp = valIsNaN(props.maxWidth, 0);
  const initValue = props.limitAreaForParent
    ? maxWidthProp > state.parentInfo.width || !maxWidthProp
      ? state.parentInfo.width
      : maxWidthProp
    : Infinity;
  // return props.ratioLock && state.rate * eleMaxHeight.value < initValue
  //   ? state.rate * eleMaxHeight.value
  //   : initValue;
  return (
    (isPercent.value && (maxWidthProp ? Math.min(100, maxWidthProp) : 100)) ||
    initValue
  );
});

const eleMaxHeight = computed<number>(() => {
  const maxHeightProp = valIsNaN(props.maxHeight, 0);
  const initValue = props.limitAreaForParent
    ? maxHeightProp > state.parentInfo.height || !maxHeightProp
      ? state.parentInfo.height
      : maxHeightProp
    : Infinity;
  return (
    (isPercent.value && (maxHeightProp ? Math.min(100, maxHeightProp) : 100)) ||
    initValue
  );
});

const eleMinWidth = computed<number>(() => {
  return props.limitAreaForParent ? 0 : -Infinity;
});

const eleMinHeight = computed<number>(() => {
  return props.limitAreaForParent ? 0 : -Infinity;
});

watch(
  () => props.active,
  (n) => {
    state.active = n;
    if (!n) {
      emit('inactive', cloneDeep(autoDraggable.value));
    }
  }
);

onMounted(() => {
  getParentAndRect();
});

/**
 * --------------------------methods
 */
// 获取主元素
const getParentAndRect = () => {
  // 默认以当前绑定元素父元素为主监听事件
  state.ele =
    document.documentElement ||
    autoDraggableRef.value?.parentElement ||
    autoDraggableRef.value;
};

// 二次封装公共util函数
const figureNewVal = (value: string | number, type: 'w' | 'h') => {
  const finalVal = isPercent.value
    ? type === 'w'
      ? (valIsNaN(value, 0) / state.parentInfo.width) * 100
      : (valIsNaN(value, 0) / state.parentInfo.height) * 100
    : value;
  return figureFinalValue(
    finalVal,
    props.scale,
    props.isKeepDecimals,
    props.decimalPlaces
  );
};

const keepDecimalsToNum = (val: number, defaultVal: number = 1) => {
  const newVal = new Decimal(val)
    .toDecimalPlaces(props.decimalPlaces)
    .toNumber();
  return valIsNaN(newVal, defaultVal);
};

const figureRatioMax = (
  wVal: number,
  hVal: number,
  w: number,
  h: number
): number[] => {
  const wRate = wVal / w;
  const hRate = hVal / h;
  if (wRate > hRate) {
    return [keepDecimalsToNum(w * hRate), keepDecimalsToNum(hVal)];
  } else {
    return [keepDecimalsToNum(wVal), keepDecimalsToNum(h * wRate)];
  }
};

const mousedownHandler = (
  event: MouseEvent,
  handle: HandlesSet[number] | null = null
) => {
  if (!(props.draggable || props.resizeable)) return;
  // 获取当前鼠标点击位置
  const { clientX, clientY } = event;
  state.initX = clientX; // 记录鼠标坐标X
  state.initY = clientY; // 记录鼠标坐标Y
  // 获取当前绑定元素的配置
  state.beforeClickConfig = cloneDeep(autoDraggable.value);
  emit('active', cloneDeep(autoDraggable.value));
  if (props.draggable && !handle) {
    emit('drag-start', event, state.beforeClickConfig);
  }
  if (props.resizeable && handle) {
    emit('resize-start', event, state.beforeClickConfig);
  }
  // 判断是否开启限制父区域范围移动，在判断是否给定父区域范围
  if (props.limitAreaForParent) {
    // 更新父元素 - 前提是开启父元素区域限制 以及未给定父元素范围
    state.parentElement = props.limitAreaClass
      ? document.querySelector(props.limitAreaClass) ||
        autoDraggableRef.value!.parentElement!
      : autoDraggableRef.value!.parentElement!;
    state.parentRectArea = state.parentElement.getBoundingClientRect();
    state.parentInfo.height !== state.parentElement?.clientHeight &&
      (state.parentInfo.height = state.parentElement?.clientHeight || 0);
    state.parentInfo.width !== state.parentElement?.clientWidth &&
      (state.parentInfo.width = state.parentElement?.clientWidth || 0);
  }
  !state.active && (state.active = true);
  state.handle = handle;
  props.ratioLock &&
    (state.rate = keepDecimalsToNum(
      valIsNaN(state.beforeClickConfig.width, 1) /
        valIsNaN(state.beforeClickConfig.height, 1),
      1
    ));
  // 监听移动事件
  addEvent(state.ele!, 'mousemove', mousemoveHandler);
  addEvent(state.ele!, 'mouseup', mouseupHandler);
};

const mousemoveHandler = (event: MouseEvent) => {
  //  对元素left初始值进行判断转化，若为NaN，则为0
  const l = valIsNaN(state.beforeClickConfig.left, 0);
  //  对元素top初始值进行判断转化，若为NaN，则为0
  const t = valIsNaN(state.beforeClickConfig.top, 0);
  //  对元素width初始值进行判断转化，若为NaN，则为0
  const w = valIsNaN(state.beforeClickConfig.width, 0);
  //  对元素left初始值进行判断转化，若为NaN，则为0
  const h = valIsNaN(state.beforeClickConfig.height, 0);
  // 超出父元素区域则失焦
  // if (
  //   props.limitAreaForParent &&
  //   (event.clientX < state.parentRectArea!.left ||
  //     event.clientX >
  //       state.parentRectArea!.width + state.parentRectArea!.left ||
  //     event.clientY < state.parentRectArea!.top ||
  //     event.clientY > state.parentRectArea!.height + state.parentRectArea!.top)
  // ) {
  //   // state.active = false;
  // }
  const _l = (
    min?: number,
    max?: number,
    special?: boolean,
    specialMin?: number,
    specialMax?: number
  ) => {
    //  移动中实时变化的left值
    const currentL = l + figureNewVal(event.clientX - state.initX, 'w');
    if (
      valIsNaN(autoDraggable.value.width, 0) > 0 &&
      (!state.handle ||
        valIsNaN(autoDraggable.value.width, 0) < eleMaxWidth.value)
    ) {
      autoDraggable.value.left = restrictToBounds(
        keepDecimalsToNum(currentL),
        min || eleMinWidth.value,
        max ||
          (isPercent.value ? 100 : state.parentInfo.width) -
            valIsNaN(autoDraggable.value.width, 0),
        props.limitAreaForParent
      );
    }
    if (special) {
      autoDraggable.value.top = restrictToBounds(
        keepDecimalsToNum(
          t + figureNewVal(event.clientX - state.initX, 'w') / state.rate
        ),
        specialMin!,
        specialMax!,
        props.limitAreaForParent
      );
    }
  };
  const _t = (min?: number, max?: number) => {
    //  移动中实时变化的top值
    const currentT = t + figureNewVal(event.clientY - state.initY, 'h');
    if (
      valIsNaN(autoDraggable.value.height, 0) > 0 &&
      (!state.handle ||
        valIsNaN(autoDraggable.value.height, 0) < eleMaxHeight.value)
    ) {
      autoDraggable.value.top = restrictToBounds(
        keepDecimalsToNum(currentT),
        min || eleMinHeight.value,
        max ||
          (isPercent.value ? 100 : state.parentInfo.height) -
            valIsNaN(autoDraggable.value.height, 0),
        props.limitAreaForParent
      );
    }
  };
  const _w = (
    operator: 'add' | 'sub' = 'add',
    max: number = eleMaxWidth.value,
    ratioMax?: number
  ) => {
    const valueAfterMove = figureNewVal(event.clientX - state.initX, 'w');
    const currentW =
      operator === 'add' ? w + valueAfterMove : w - valueAfterMove;
    autoDraggable.value.width = restrictToBounds(
      keepDecimalsToNum(currentW),
      valIsNaN(props.minWidth, eleMinWidth.value),
      max,
      props.limitAreaForParent
    );
    if (props.ratioLock && ratioMax) {
      const currentH =
        operator === 'add'
          ? h + valueAfterMove / state.rate
          : h - valueAfterMove / state.rate;
      autoDraggable.value.height = restrictToBounds(
        keepDecimalsToNum(currentH),
        valIsNaN(props.minHeight, eleMinHeight.value),
        ratioMax,
        props.limitAreaForParent
      );
    }
  };
  const _h = (
    operator: 'add' | 'sub' = 'add',
    max: number = eleMaxHeight.value,
    ratioMax?: number
  ) => {
    const valueAfterMove = figureNewVal(event.clientY - state.initY, 'h');
    const currentH =
      operator === 'add' ? h + valueAfterMove : h - valueAfterMove;
    autoDraggable.value.height = restrictToBounds(
      keepDecimalsToNum(currentH),
      valIsNaN(props.minHeight, eleMinHeight.value),
      max,
      props.limitAreaForParent
    );
    if (props.ratioLock && ratioMax) {
      const currentW =
        operator === 'add'
          ? w + keepDecimalsToNum(valueAfterMove * state.rate)
          : w - keepDecimalsToNum(valueAfterMove * state.rate);
      autoDraggable.value.width = restrictToBounds(
        keepDecimalsToNum(currentW),
        valIsNaN(props.minWidth, eleMinWidth.value),
        ratioMax,
        props.limitAreaForParent
      );
    }
  };
  if (state.active) {
    if (props.draggable && !state.handle) {
      _t(), _l();
    }
    if (props.resizeable && state.handle) {
      const map = {
        tl: () => {
          if (props.ratioLock) {
            const value = figureRatioMax(l + w, t + h, w, h);
            _w('sub', value[0], value[1]);
            // _t(t - (value[0] - w) / state.rate, t + h);
            _l(
              Math.max(0, l - (value[1] - h) * state.rate),
              l + w,
              true,
              t - (value[1] - h),
              t + h
            );
          } else _w('sub', l + w), _h('sub', t + h), _t(), _l();
        },
        tm: () => {
          if (props.ratioLock) {
            const value = figureRatioMax(eleMaxWidth.value - l, t + h, w, h);
            _h('sub', value[1], value[0]);
            _t(t - (value[0] - w) / state.rate, t + h);
          } else _h('sub', t + h), _t();
        },
        tr: () => {
          if (props.ratioLock) {
            const value = figureRatioMax(eleMaxWidth.value - l, t + h, w, h);
            _h('sub', value[1], value[0]);
            _t(t - (value[0] - w) / state.rate, t + h);
          } else _h('sub', t + h), _w('add', eleMaxWidth.value - l), _t();
        },
        // done
        br: () => {
          if (props.ratioLock) {
            _w(
              'add',
              ...figureRatioMax(
                eleMaxWidth.value - l,
                eleMaxHeight.value - t,
                w,
                h
              )
            );
          } else
            _w('add', eleMaxWidth.value - l), _h('add', eleMaxHeight.value - t);
        },
        // done
        bm: () => {
          if (props.ratioLock) {
            const value = figureRatioMax(
              eleMaxWidth.value - l,
              eleMaxHeight.value - t,
              w,
              h
            );

            _h('add', value[1], value[0]);
          } else _h('add', eleMaxHeight.value - t);
        },
        // done
        bl: () => {
          if (props.ratioLock) {
            const value = figureRatioMax(w + l, eleMaxHeight.value - t, w, h);
            _w('sub', ...value);
            _l(l + w - value[0]);
          } else {
            _w('sub', w + l), _h('add', eleMaxHeight.value - t);
            _l();
          }
        },
        // done
        mr: () => {
          if (props.ratioLock) {
            const value = figureRatioMax(
              eleMaxWidth.value - l,
              eleMaxHeight.value - t,
              w,
              h
            );
            _w('add', ...value);
          } else _w('add', eleMaxWidth.value - l);
        },
        // done
        ml: () => {
          if (props.ratioLock) {
            const value = figureRatioMax(w + l, eleMaxHeight.value - t, w, h);
            _w('sub', ...value);
            _l(l + w - value[0]);
          } else _w('sub', w + l), _l();
        },
      };
      map[state.handle!]();
    }
  }
};

const mouseupHandler = (event: MouseEvent) => {
  if (props.draggable && !state.handle) {
    emit(
      'drag-stop',
      event,
      state.beforeClickConfig,
      cloneDeep(autoDraggable.value)
    );
  }
  if (props.resizeable && state.handle) {
    emit(
      'resize-stop',
      event,
      state.beforeClickConfig,
      cloneDeep(autoDraggable.value)
    );
  }
  !props.active && (state.active = false);
  state.handle = null;
  removeEvent(state.ele!, 'mousemove', mousemoveHandler);
  removeEvent(state.ele!, 'mouseup', mouseupHandler);
};
</script>

<style scoped lang="scss">
@import url('./styles/auto-draggable.scss');
</style>
