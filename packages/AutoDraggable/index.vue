<template>
  <div
    ref="autoDraggableRef"
    class="auto-draggable"
    :style="vueDraggableStyle"
    :class="{ 'select-none': disabledUserSelect }"
    @mousedown="mousedownHandler($event, null)"
  >
    <!-- <template v-for="handle in handles" :key="handle">
      <div
        class="handle"
        :class="'handle-' + handle"
        :style="vueHandleStyle"
        @mousedown.stop.prevent="mousedownHandler($event, handle)"
      ></div>
    </template>
    <slot></slot> -->
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type {
  ElementUnit,
  ModelValue,
  VueDraggable,
  VueDraggableEmits,
} from '@/type';
import { HandlesSet } from 'vue-auto-draggable';
import { judgeUnitHaveExist } from './utils';

defineOptions({
  name: 'VueDraggableComponent',
});

const props = withDefaults(
  defineProps<{
    theme?: string; // 主题色，默认#409EFD
    inActiveColor?: string; // 失活颜色
    unitType?: ElementUnit; // 单位，默认px
    scale?: number | string; // 缩放比例，默认1
    isKeepDecimals?: boolean; // 是否保留小数，默认false
    decimalPlaces?: number; // 保留几位小数,默认2位
    draggable?: boolean; // 是否可以移动，默认true
    resizeable?: boolean; // 是否可以缩放，默认true
    // areaWidth?: number | string; // 父区域width 默认获取父元素width
    // areaHeight?: number | string; // 父区域height 默认获取父元素height
    limitAreaForParent?: boolean; // 限制元素移动区域为父元素内，默认true
    limitAreaClass?: string;
    modelValue: ModelValue;
    maxWidth?: number | string; // 元素最大宽度
    maxHeight?: number | string; // 元素最大高度
    minWidth?: number | string; // 元素最小宽度
    minHeight?: number | string; // 元素最小高度
    ratioLock?: boolean; // 控制等比例锁
    active: boolean; // 该组件是否活跃
    disabledUserSelect?: boolean; // 是否开启选择文本，默认false
    handles?: Array<HandlesSet[number]>; // 控制触点，默认全选
  }>(),
  {
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
  }
);

const emit = defineEmits<VueDraggableEmits>();

const elementInitConfig = ref<VueDraggable>();

const autoDraggable = computed({
  get() {
    return props.modelValue;
  },
  set(value: ModelValue) {
    emit('update:modelValue', value);
  },
});

// 拖动元素的主样式，包括但不限于 x,y w,h zIndex等（用户传入，主要是为了配置单位）
const vueDraggableStyle = computed(() => {
  const attrList: Array<keyof ModelValue> = ['left', 'top', 'width', 'height'];
  // 判断是否填充了单位，若无，则填充
  const list = attrList.reduce((acc, item) => {
    acc[item] = judgeUnitHaveExist(
      autoDraggable.value[item],
      props.unitType,
      'number'
    );
    return acc;
  }, {} as ModelValue);
  return {
    ...props.modelValue,
    ...list,
  };
});

const vueHandleStyle = computed(() => ({}));

//
const mousedownHandler = (event: MouseEvent, handle: string | null) => {};
</script>

<style scoped></style>
