<template>
  <div class="stress-scene">
    <div class="stress-canvas" :style="canvasStyle">
      <MovableGroup v-if="grouped" :selected="allIds">
        <VueMovableBox
          v-for="box in boxes"
          :key="box.id"
          :member-id="box.id"
          :model-value="box.rect"
          :theme="'#409EFD'"
        />
      </MovableGroup>
      <template v-else>
        <VueMovableBox
          v-for="box in boxes"
          :key="box.id"
          :model-value="box.rect"
          :theme="'#409EFD'"
        />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, type CSSProperties } from 'vue';
import { MovableBox as VueMovableBox, MovableGroup, type ExtendsMovableBox } from '../src';

const params = new URLSearchParams(window.location.search);
const count = Math.max(1, Number(params.get('count') ?? 100) || 100);
const grouped = params.get('group') === '1';
const columns = 10;
const boxWidth = 160;
const boxHeight = 100;
const gap = 20;

interface StressBox {
  id: string;
  rect: ExtendsMovableBox;
}

const boxes: StressBox[] = Array.from({ length: count }, (_, index) => ({
  id: `stress-${index}`,
  rect: {
    left: (index % columns) * (boxWidth + gap) + gap,
    top: Math.floor(index / columns) * (boxHeight + gap) + gap,
    width: boxWidth,
    height: boxHeight,
    zIndex: 1
  }
}));

const allIds = boxes.map(box => box.id);

const rows = Math.ceil(count / columns);
const canvasStyle = computed<CSSProperties>(() => ({
  position: 'relative',
  width: `${columns * (boxWidth + gap) + gap}px`,
  height: `${rows * (boxHeight + gap) + gap}px`,
  background: '#fff',
  overflow: 'hidden'
}));
</script>
