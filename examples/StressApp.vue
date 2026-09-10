<template>
  <div class="stress-scene">
    <div class="stress-canvas" :style="canvasStyle">
      <MovableGroup v-if="grouped" :selected="allIds" :group-collision="groupCollisionMode">
        <VueMovableBox
          v-for="box in boxes"
          :key="box.id"
          :member-id="box.id"
          :model-value="box.rect"
          :theme="'#409EFD'"
          :snap-to-elements="snapEnabled"
          :collision-enabled="collisionEnabled"
          :snap-targets="targetsFor(box.id)"
          :collision-targets="collisionEnabled ? targetsFor(box.id) : undefined"
          @update:model-value="value => onModelUpdate(box.id, value)"
        />
      </MovableGroup>
      <template v-else>
        <VueMovableBox
          v-for="box in boxes"
          :key="box.id"
          :model-value="box.rect"
          :theme="'#409EFD'"
          :snap-to-elements="snapEnabled"
          :collision-enabled="collisionEnabled"
          :snap-targets="targetsFor(box.id)"
          :collision-targets="collisionEnabled ? targetsFor(box.id) : undefined"
          @update:model-value="value => onModelUpdate(box.id, value)"
        />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, type CSSProperties } from 'vue';
import { MovableBox as VueMovableBox, MovableGroup, type ExtendsMovableBox } from '../src';

const params = new URLSearchParams(window.location.search);
const count = Math.max(1, Number(params.get('count') ?? 100) || 100);
const grouped = params.get('group') === '1';
const snapEnabled = params.get('snap') === '1';
const collisionEnabled = params.get('collision') === '1';
const writeback = params.get('writeback') === '1';
const groupCollisionMode = params.get('gc') === 'all' ? 'all' : 'leader';
const columns = 10;
const boxWidth = 160;
const boxHeight = 100;
const gap = 20;

interface StressBox {
  id: string;
  rect: ExtendsMovableBox;
}

const initialBoxes = () =>
  Array.from({ length: count }, (_, index) => ({
    id: `stress-${index}`,
    rect: {
      left: (index % columns) * (boxWidth + gap) + gap,
      top: Math.floor(index / columns) * (boxHeight + gap) + gap,
      width: boxWidth,
      height: boxHeight,
      zIndex: 1
    }
  }));

// Reactive so the writeback scenario measures the real v-model feedback loop.
const boxes: StressBox[] = reactive(initialBoxes());

const allIds = boxes.map(box => box.id);

// Snap and collision operate on the full target set plus fixed non-member obstacles, so
// group collision modes always have external obstacles to resolve against.
const obstacleCount = 8;
const obstacleTargets = Array.from({ length: obstacleCount }, (_, index) => ({
  id: `obstacle-${index}`,
  left: Math.floor(index / 2) * 900 + 300,
  top: (index % 2) * 500 + 250,
  width: 120,
  height: 80
}));
const interactionTargets =
  snapEnabled || collisionEnabled
    ? [...boxes.map(box => ({ id: box.id, ...box.rect })), ...obstacleTargets]
    : [];
// Each box's own entry is excluded per instance to avoid self-collision noise.
const targetsFor = (excludeId: string) => interactionTargets.filter(t => t.id !== excludeId);

// Business-model write-back: every committed rectangle lands back on the reactive model,
// producing the same prop feedback loop real v-model applications create.
const onModelUpdate = (id: string, value: ExtendsMovableBox) => {
  if (!writeback) return;
  const box = boxes.find(entry => entry.id === id);
  if (box) box.rect = value;
};

// Exposed for the benchmark: reset formation positions between measurement rounds.
if (typeof window !== 'undefined') {
  (window as unknown as { __benchReset?: () => void }).__benchReset = () => {
    Object.assign(boxes, initialBoxes());
  };
}

const rows = Math.ceil(count / columns);
const canvasStyle = computed<CSSProperties>(() => ({
  position: 'relative',
  width: `${columns * (boxWidth + gap) + gap}px`,
  height: `${rows * (boxHeight + gap) + gap}px`,
  background: '#fff',
  overflow: 'hidden'
}));
</script>
