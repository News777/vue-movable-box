<template>
  <div class="fixture">
    <div class="canvas">
      <!-- mode=collision-rotated: precise collision against a rotated target -->
      <template v-if="mode === 'collision-rotated'">
        <VueMovableBox
          v-model="rotatedBox"
          :collision-enabled="true"
          :snap-targets="rotatedTargets"
          class="probe-box"
        />
        <div class="obstacle" :style="rectStyle({ left: 300, top: 40, width: 110, height: 110 })">diamond</div>
      </template>

      <!-- mode=rotation-snap: keyboard rotation snapping -->
      <template v-else-if="mode === 'rotation-snap'">
        <VueMovableBox
          v-model="snapBox"
          v-model:rotate="snapAngle"
          active
          rotatable
          keyboard-enabled
          :keyboard-step="25"
          :rotation-snap-angles="[0, 45, 90]"
          :rotation-snap-threshold="10"
          class="probe-box"
        />
      </template>

      <!-- mode=fixed-anchor: fixed world-space anchor resize -->
      <template v-else-if="mode === 'fixed-anchor'">
        <VueMovableBox
          v-model="anchorBox"
          active
          :handles="['br']"
          :resize-directions="['br']"
          resize-mode="fixed-anchor"
          class="probe-box"
        />
      </template>

      <!-- mode=group-all: group-wide collision in all mode -->
      <template v-else-if="mode === 'group-all'">
        <MovableGroup :selected="selected" group-collision="all">
          <VueMovableBox
            v-for="member in members"
            :key="member.id"
            :member-id="member.id"
            v-model="member.rect"
            :collision-enabled="true"
            :collision-targets="obstacles"
          />
        </MovableGroup>
        <div
          v-for="obstacle in obstacles"
          :key="obstacle.id"
          class="obstacle"
          :style="rectStyle(obstacle)"
        >
          {{ obstacle.id }}
        </div>
      </template>

      <!-- mode=group-all-aabb-escape: legacy aabb collision, follower starts inside the wall -->
      <template v-else-if="mode === 'group-all-aabb-escape'">
        <MovableGroup :selected="selected" group-collision="all">
          <VueMovableBox
            v-for="member in escapeMembers"
            :key="member.id"
            :member-id="member.id"
            v-model="member.rect"
            :collision-enabled="true"
            collision-mode="aabb"
            :collision-targets="escapeObstacles"
          />
        </MovableGroup>
        <div
          v-for="obstacle in escapeObstacles"
          :key="obstacle.id"
          class="obstacle"
          :style="rectStyle(obstacle)"
        >
          {{ obstacle.id }}
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {
  MovableBox as VueMovableBox,
  MovableGroup,
  type ExtendsMovableBox,
  type SnapTarget
} from '../src';

const params = new URLSearchParams(window.location.search);
const mode = params.get('mode') ?? 'collision-rotated';

const rotatedBox = ref<ExtendsMovableBox>({ left: 60, top: 60, width: 90, height: 60, zIndex: 1 });
const rotatedTargets = ref<SnapTarget[]>([
  // Rotated 45 degrees: its true contour reaches the box earlier than the unrotated
  // rect would suggest, exercising precise collision in a real browser.
  { id: 'diamond', left: 300, top: 40, width: 110, height: 110, rotate: 45 }
]);

const snapBox = ref<ExtendsMovableBox>({ left: 120, top: 120, width: 100, height: 80, zIndex: 1 });
const snapAngle = ref(0);

const anchorBox = ref<ExtendsMovableBox>({ left: 60, top: 60, width: 120, height: 80, zIndex: 1 });

const selected = ref(['m1', 'm2']);
const members = ref(
  ['m1', 'm2'].map((id, index) => ({
    id,
    rect: { left: 20 + index * 160, top: 40, width: 120, height: 80, zIndex: 1 } as ExtendsMovableBox
  }))
);
const obstacles = ref<SnapTarget[]>([
  { id: 'wall', left: 380, top: 20, width: 40, height: 200 }
]);

// m2 (300..420) starts 40px inside the wall (380..480): moving left is an escape the
// formation must be allowed to make, moving right deepens the overlap and is refused.
const escapeMembers = ref(
  ['m1', 'm2'].map((id, index) => ({
    id,
    rect: { left: 100 + index * 200, top: 40, width: 120, height: 80, zIndex: 1 } as ExtendsMovableBox
  }))
);
const escapeObstacles = ref<SnapTarget[]>([
  { id: 'wall', left: 380, top: 20, width: 100, height: 200 }
]);

const rectStyle = (rect: SnapTarget) => ({
  left: `${Number(rect.left)}px`,
  top: `${Number(rect.top)}px`,
  width: `${Number(rect.width)}px`,
  height: `${Number(rect.height)}px`
});
</script>

<style scoped>
.fixture {
  padding: 12px;
  font-family: system-ui, sans-serif;
}

.canvas {
  position: relative;
  width: 600px;
  height: 420px;
  background: #fafafa;
  border: 2px dashed #d0d7de;
  overflow: hidden;
  touch-action: none;
}

.probe-box {
  background: rgba(64, 158, 253, 0.12);
}

.obstacle {
  position: absolute;
  background: rgba(219, 171, 9, 0.16);
  border: 1.5px solid rgba(219, 171, 9, 0.85);
  font-size: 12px;
  color: #7a5d00;
}
</style>
