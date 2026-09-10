<template>
  <div class="diagnose">
    <aside class="panel">
      <h2>碰撞诊断台</h2>
      <p class="hint">拖动或旋转蓝色方框，叠加层会实时显示约束系统看到的几何。</p>

      <fieldset>
        <legend>叠加层</legend>
        <label><input type="checkbox" v-model="showTrueContour" /> 真实旋转轮廓</label>
        <label><input type="checkbox" v-model="showAABB" /> AABB 包围盒</label>
        <label><input type="checkbox" v-model="showNormal" /> 接触法线</label>
        <label><input type="checkbox" v-model="showSafePosition" /> 安全位置（提交矩形）</label>
      </fieldset>

      <fieldset>
        <legend>方框</legend>
        <label>
          旋转角度
          <input type="range" min="-180" max="180" v-model.number="boxAngle" />
          {{ boxAngle }}°
        </label>
        <label>
          collisionMode
          <select v-model="collisionMode">
            <option value="precise">precise（真实轮廓）</option>
            <option value="aabb">aabb（3.2 之前）</option>
          </select>
        </label>
      </fieldset>

      <fieldset>
        <legend>场景 JSON</legend>
        <button type="button" @click="exportScenario">导出当前场景 JSON</button>
        <p class="hint">包含方框、目标、角度与碰撞模式的完整快照，可直接用于回归复现。</p>
      </fieldset>

      <dl class="readout">
        <dt>最近碰撞</dt>
        <dd>{{ collisionSummary }}</dd>
        <dt>提交矩形</dt>
        <dd>{{ committedSummary }}</dd>
      </dl>
    </aside>

    <div class="canvas" ref="canvasRef">
      <!-- 叠加层：真实轮廓与 AABB 按 container 像素坐标绘制，不参与交互 -->
      <div
        v-if="showTrueContour"
        class="overlay overlay-true"
        :style="trueContourStyle(boxRect, boxAngle)"
      ></div>
      <div
        v-if="showAABB"
        class="overlay overlay-aabb"
        :style="aabbStyle(boxRect, boxAngle)"
      ></div>
      <div
        v-if="showSafePosition && safeRect"
        class="overlay overlay-safe"
        :style="trueContourStyle(safeRect, boxAngle)"
      ></div>
      <template v-for="target in targets" :key="target.id">
        <div
          v-if="showTrueContour"
          class="overlay overlay-true overlay-target"
          :style="trueContourStyle(target, targetAngle(target))"
        ></div>
        <div
          v-if="showAABB"
          class="overlay overlay-aabb"
          :style="aabbStyle(target, collisionMode === 'aabb' ? 0 : targetAngle(target))"
        ></div>
      </template>

      <!-- 接触法线：由障碍物指向方框 -->
      <div
        v-if="showNormal && lastCollision && lastCollision.normal"
        class="overlay normal-arrow"
        :style="normalArrowStyle"
      >
        <span>⟶</span>
      </div>

      <VueMovableBox
        v-model="box"
        v-model:rotate="boxAngle"
        rotatable
        :collision-enabled="true"
        :collision-mode="collisionMode"
        :snap-targets="targets"
        :rotation-snap-angles="rotationSnapAngles"
        @collision="onCollision"
        class="diagnose-box"
      >
        <span class="box-label">{{ boxLabel }}</span>
      </VueMovableBox>

      <div
        v-for="target in targets"
        :key="target.id"
        class="obstacle"
        :style="{
          left: `${target.left}px`,
          top: `${target.top}px`,
          width: `${target.width}px`,
          height: `${target.height}px`
        }"
      >
        {{ target.id }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import {
  MovableBox as VueMovableBox,
  type CollisionEventPayload,
  type ExtendsMovableBox,
  type SnapTarget
} from '../src';
import {
  normalizeAngle,
  resolveTransformOrigin,
  rotatedAABBAt
} from '../src/components/MovableBox/utils/rotation';

const showTrueContour = ref(true);
const showAABB = ref(true);
const showNormal = ref(true);
const showSafePosition = ref(false);
const collisionMode = ref<'precise' | 'aabb'>('precise');
const boxAngle = ref(30);

const box = ref<ExtendsMovableBox>({ left: 60, top: 90, width: 120, height: 80, zIndex: 2 });

const rotationSnapAngles = [0, 45, 90, 135, 180, -135, -90, -45];

const targets = ref<SnapTarget[]>([
  { id: 'wall', left: 420, top: 40, width: 60, height: 320 },
  { id: 'diamond', left: 240, top: 260, width: 100, height: 100, rotate: 45 },
  { id: 'block', left: 120, top: 340, width: 140, height: 60 }
]);

const lastCollision = ref<CollisionEventPayload | null>(null);
// The last committed rectangle while separated from every obstacle: the "safe position".
const safeRect = ref<{ left: number; top: number; width: number; height: number } | null>(null);
const onCollision = (payload: CollisionEventPayload) => {
  lastCollision.value = payload;
  if (!payload.colliding) {
    safeRect.value = {
      left: Number(box.value.left),
      top: Number(box.value.top),
      width: Number(box.value.width),
      height: Number(box.value.height)
    };
  }
};

// 切换碰撞模式后，上一次 precise 模式的接触法线不再有语义。
watch(collisionMode, () => {
  lastCollision.value = null;
});

const boxRect = computed(() => ({
  left: Number(box.value.left),
  top: Number(box.value.top),
  width: Number(box.value.width),
  height: Number(box.value.height)
}));

const targetAngle = (target: SnapTarget) => Number(target.rotate ?? 0) || 0;

interface OverlayRect {
  left: number | string;
  top: number | string;
  width: number | string;
  height: number | string;
}

const numericRect = (rect: OverlayRect) => ({
  left: Number(rect.left),
  top: Number(rect.top),
  width: Number(rect.width),
  height: Number(rect.height)
});

// 叠加层几何：按组件同一套公式换算真实轮廓与 AABB。
const trueContourStyle = (raw: OverlayRect, angle: number) => {
  const rect = numericRect(raw);
  const a = normalizeAngle(angle);
  return {
    left: `${rect.left}px`,
    top: `${rect.top}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    transform: a ? `rotate(${a}deg)` : undefined,
    transformOrigin: 'center'
  };
};

const aabbStyle = (raw: OverlayRect, angle: number) => {
  const rect = numericRect(raw);
  const origin = resolveTransformOrigin('center', rect.width, rect.height);
  const box = rotatedAABBAt(rect, angle, origin);
  return {
    left: `${box.left}px`,
    top: `${box.top}px`,
    width: `${box.width}px`,
    height: `${box.height}px`
  };
};

const normalArrowStyle = computed(() => {
  const payload = lastCollision.value;
  if (!payload?.normal) return { display: 'none' };
  const rect = boxRect.value;
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const length = 56;
  return {
    left: `${centerX}px`,
    top: `${centerY}px`,
    width: `${length}px`,
    transform: `rotate(${(Math.atan2(payload.normal.y, payload.normal.x) * 180) / Math.PI}deg)`
  };
});

const boxLabel = computed(
  () => `(${boxRect.value.left}, ${boxRect.value.top}) ${boxRect.value.width}×${boxRect.value.height}`
);
const collisionSummary = computed(() => {
  const payload = lastCollision.value;
  if (!payload || !payload.colliding) return '无';
  const normal = payload.normal
    ? `，normal=(${payload.normal.x}, ${payload.normal.y})`
    : '';
  return `${payload.targetId ?? '未知目标'}，direction=${payload.direction ?? '-'}${normal}`;
});
const committedSummary = computed(() => boxLabel.value);

const exportScenario = () => {
  const scenario = {
    capturedAt: new Date().toISOString(),
    canvas: { width: 640, height: 440 },
    collisionMode: collisionMode.value,
    transformOrigin: 'center',
    box: { ...box.value, rotate: boxAngle.value },
    targets: targets.value.map(target => ({ ...target })),
    rotationSnapAngles,
    lastCollision: lastCollision.value
  };
  const blob = new Blob([JSON.stringify(scenario, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'movable-box-scenario.json';
  anchor.click();
  URL.revokeObjectURL(url);
};
</script>

<style scoped>
.diagnose {
  display: flex;
  gap: 16px;
  padding: 16px;
  font-family: system-ui, sans-serif;
}

.panel {
  width: 260px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.panel fieldset {
  display: flex;
  flex-direction: column;
  gap: 6px;
  border: 1px solid #d0d7de;
  border-radius: 6px;
  padding: 8px;
}

.hint {
  margin: 0;
  color: #57606a;
  font-size: 12px;
}

.readout dt {
  font-weight: 600;
  margin-top: 8px;
}

.readout dd {
  margin: 2px 0 0;
  font-family: ui-monospace, monospace;
  font-size: 12px;
}

.canvas {
  position: relative;
  width: 640px;
  height: 440px;
  background: #fafafa;
  border: 2px dashed #d0d7de;
  overflow: hidden;
  touch-action: none;
}

.overlay {
  position: absolute;
  pointer-events: none;
  box-sizing: border-box;
}

.overlay-safe {
  border: 2px solid rgba(48, 164, 108, 0.95);
}

.overlay-true {
  border: 1.5px solid rgba(64, 158, 253, 0.9);
}

.overlay-target.overlay-true {
  border-color: rgba(219, 171, 9, 0.9);
}

.overlay-aabb {
  border: 1px dashed rgba(160, 160, 160, 0.9);
}

.normal-arrow {
  height: 0;
  border-top: 2px solid rgba(219, 79, 79, 0.95);
  color: rgba(219, 79, 79, 0.95);
  transform-origin: 0 0;
}

.diagnose-box {
  background: rgba(64, 158, 253, 0.12);
}

.box-label {
  font-size: 11px;
  font-family: ui-monospace, monospace;
}

.obstacle {
  position: absolute;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(219, 171, 9, 0.16);
  border: 1.5px solid rgba(219, 171, 9, 0.85);
  color: #7a5d00;
  font-size: 12px;
}
</style>
