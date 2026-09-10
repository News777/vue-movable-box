<template>
  <div class="integration">
    <h1>VueMovableBox 完整接入示例</h1>
    <p class="intro">
      四个典型接入场景。所有示例的方框与目标共用同一个父容器坐标系（px），目标数据直接来自
      业务模型数组——这是 <code>collisionTargets</code> / <code>snapTargets</code> 的坐标约定。
    </p>

    <section>
      <h2>1. 普通布局（受控 v-model）</h2>
      <p>
        方框位置由业务状态驱动；直接改状态即可移动方框，拖拽结果通过
        <code>update:modelValue</code> 写回。
      </p>
      <div class="canvas">
        <VueMovableBox v-model="plainBox" :max-width="360" :max-height="240">
          <span class="tag">受控方框</span>
        </VueMovableBox>
      </div>
      <pre>plainBox = {{ plainBox }}</pre>
    </section>

    <section>
      <h2>2. 旋转碰撞</h2>
      <p>
        旋转 45° 的方框 + 声明了 <code>rotate</code> 的目标：precise 模式按双方真实轮廓判定。
        目标数据要求：目标坐标与方框同一坐标系，<code>rotate</code> 为顺时针角度，
        <code>transformOrigin</code> 与方框的 CSS 变换原点一致。
      </p>
      <div class="canvas">
        <VueMovableBox
          v-model="rotatedBox"
          v-model:rotate="rotatedAngle"
          rotatable
          :collision-enabled="true"
          :snap-targets="rotatedTargets"
        />
      </div>
      <pre>rotatedBox = {{ rotatedBox }}；rotate = {{ rotatedAngle }}°</pre>
    </section>

    <section>
      <h2>3. 组合移动（groupCollision='all'）</h2>
      <p>
        全选成员一起移动；任一成员接触外部障碍物时整组停下。
        组内成员相互排除，障碍物由 <code>collisionTargets</code> 单独提供；
        本例不需要元素吸附，<code>snapTargets</code> 留空。
      </p>
      <div class="canvas">
        <MovableGroup :selected="selectedIds" group-collision="all">
          <VueMovableBox
            v-for="member in members"
            :key="member.id"
            :member-id="member.id"
            v-model="member.rect"
            :collision-enabled="true"
            :collision-targets="groupObstacles"
          />
        </MovableGroup>
      </div>
      <pre>members = {{ membersRects }}</pre>
    </section>

    <section>
      <h2>4. 受控数据回写（v-model 直接驱动业务状态）</h2>
      <p>
        多方框绑定到同一个业务状态对象：拖拽产生的每次提交都会写回 <code>sceneState</code>，
        模拟真实编辑器保存流程。目标列表包含所有方框，因此需要用
        <code>snapFilter</code> 排除方框自身，否则小位移会被吸回原位。
      </p>
      <div class="canvas">
        <VueMovableBox
          v-for="scene in sceneState"
          :key="scene.id"
          v-model="scene.rect"
          :snap-to-elements="true"
          :snap-targets="sceneTargets"
          :snap-filter="target => target.id !== scene.id"
        />
      </div>
      <pre>sceneState = {{ sceneRects }}</pre>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import {
  MovableBox as VueMovableBox,
  MovableGroup,
  type ExtendsMovableBox,
  type SnapTarget
} from '../src';

// 1. 普通布局：业务状态直接驱动
const plainBox = ref<ExtendsMovableBox>({ left: 20, top: 20, width: 180, height: 90, zIndex: 1 });

// 2. 旋转碰撞：目标携带真实旋转信息
const rotatedBox = ref<ExtendsMovableBox>({ left: 40, top: 20, width: 110, height: 70, zIndex: 1 });
const rotatedAngle = ref(0);
const rotatedTargets = ref<SnapTarget[]>([
  { id: 'diamond', left: 300, top: 40, width: 110, height: 110, rotate: 45 },
  { id: 'wall', left: 20, top: 220, width: 420, height: 50 }
]);

// 3. 组合移动：selected 覆盖全部成员，障碍物独立配置
const selectedIds = ref<string[]>(['m1', 'm2', 'm3']);
const members = ref(
  (['m1', 'm2', 'm3'] as const).map((id, index) => ({
    id,
    rect: { left: 20 + index * 140, top: 20, width: 120, height: 80, zIndex: 1 } as ExtendsMovableBox
  }))
);
const groupObstacles = ref<SnapTarget[]>([
  { id: 'obstacle-right', left: 480, top: 10, width: 60, height: 120 }
]);

// 4. 受控回写：场景状态是唯一数据源
const sceneState = ref(
  [
    { id: 's1', left: 20, top: 20, width: 140, height: 90 },
    { id: 's2', left: 200, top: 60, width: 140, height: 90 },
    { id: 's3', left: 380, top: 30, width: 140, height: 90 }
  ].map(entry => ({ id: entry.id, rect: { ...entry, zIndex: 1 } as ExtendsMovableBox }))
);
const sceneTargets = computed<SnapTarget[]>(() =>
  sceneState.value.map(scene => ({ id: scene.id, ...scene.rect }))
);

const membersRects = computed(() =>
  Object.fromEntries(members.value.map(member => [member.id, member.rect]))
);
const sceneRects = computed(() =>
  Object.fromEntries(sceneState.value.map(scene => [scene.id, scene.rect]))
);
</script>

<style scoped>
.integration {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  font-family: system-ui, sans-serif;
  max-width: 720px;
}

.intro {
  margin: 0;
  color: #57606a;
}

section h2 {
  margin: 0 0 6px;
  font-size: 16px;
}

section p {
  margin: 0 0 8px;
  font-size: 13px;
  color: #57606a;
}

.canvas {
  position: relative;
  width: 560px;
  height: 300px;
  background: #fafafa;
  border: 2px dashed #d0d7de;
  overflow: hidden;
  margin-bottom: 8px;
  touch-action: none;
}

pre {
  margin: 0;
  padding: 8px;
  background: #f6f8fa;
  border-radius: 6px;
  font-size: 12px;
  font-family: ui-monospace, monospace;
  white-space: pre-wrap;
}

.tag {
  font-size: 12px;
  color: #409efd;
}
</style>
