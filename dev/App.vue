<template>
  <div class="container">
    <div style="margin-bottom: 20px">
      <select v-model="radio">
        <option value="1280x800">1280x800</option>
        <option value="1024x600">1024x600</option>
      </select>
      <input type="range" min="0.5" max="1" step="0.1" v-model="scale" />
      {{ scale }}

      <button @click="active = !active">改变active</button>
      <button @click="unit = unit === 'px' ? '%' : 'px'">改变单位</button>
    </div>
    <div class="canvas-outsize" :style="outsizeStyle">
      <div class="canvas" :style="style">
        <VueAutoDraggable
          v-for="(item, index) in autoDraggable"
          :key="item.uid"
          v-model="autoDraggable[index]"
          :scale="scale"
          :active="select.uid === item.uid"
          :limit-area-for-parent="true"
          :ratio-lock="true"
          :draggable="true"
          :resizeable="true"
          :unit-type="unit"
          :is-keep-decimals="true"
          @drag-start="dragStart"
          @drag-stop="dragStop"
          @resize-start="resizeStart"
          @resize-stop="resizeStop"
          @active="actived"
          @inactive="inactived"
        />
      </div>
      <div class="canvas"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch, type StyleValue } from 'vue';
import { VueAutoDraggable } from '../packages';
import { ExtendsAutoDraggable } from '../packages/AutoDraggable/type';
const autoDraggable = ref<any>([
  {
    width: 300,
    height: 150,
    top: 0,
    left: 0,
    zIndex: 1,
    uid: '1'
  },
  {
    width: 500,
    height: 450,
    top: 330,
    left: 330,
    zIndex: 1,
    uid: '2'
  }
]);

const select = ref<any>({});

const radio = ref<string>('1280x800');
const context = reactive<{ width: number; height: number }>({
  width: 1280,
  height: 800
});
watch(
  radio,
  newVal => {
    const [width, height] = newVal.split('x').map(Number);
    context.width = width;
    context.height = height;
  },
  {
    immediate: true
  }
);

const scale = ref<number>(0.5);
const unit = ref<'px' | '%'>('px');
const active = ref<boolean>(true);

const outsizeStyle = computed<StyleValue>(() => {
  return {
    width: context.width * scale.value + 'px',
    height: context.height * scale.value + 'px',
    top: '200px',
    left: '200px',
    position: 'absolute'
  };
});
const style = computed(() => {
  return {
    scale: scale.value,
    width: context.width + 'px',
    height: context.height + 'px'
  };
});

const dragStart = (event: MouseEvent, value: ExtendsAutoDraggable) => {
  // console.log(event, value);
};
const dragStop = (
  event: MouseEvent,
  value: ExtendsAutoDraggable,
  newValue: ExtendsAutoDraggable
) => {
  // console.log(event, value, newValue);
};
const resizeStart = (event: MouseEvent, oldValue: ExtendsAutoDraggable) => {
  // console.log(event, oldValue);
};
const resizeStop = (
  event: MouseEvent,
  oldValue: ExtendsAutoDraggable,
  newValue: ExtendsAutoDraggable
) => {
  // console.log(event, oldValue, newValue);
};
const actived = (value: ExtendsAutoDraggable) => {
  select.value = value;
};
const inactived = (value: ExtendsAutoDraggable) => {
  console.log(value);
};
</script>

<style scoped lang="scss">
.container {
  width: 100vh;
  height: 100vh;
  .canvas-outsize {
    width: 500px;
    height: 500px;
    border: 1px solid red;
    .canvas {
      width: 1000px;
      height: 1000px;
      scale: 0.5;
      transform-origin: 0 0;
    }
  }
}
</style>
