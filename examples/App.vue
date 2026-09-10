<template>
  <div class="demo-container">
    <!-- 控制面板 -->
    <div class="control-panel">
      <h2><DemoIcon name="target" /> VueMovableBox 全功能演示</h2>

      <!-- 画布设置 -->
      <div class="section">
        <h3><DemoIcon name="canvas" /> 画布设置</h3>
        <div class="control-row">
          <label>画布尺寸:</label>
          <select v-model="canvasSize" aria-label="画布尺寸">
            <option value="1280x800">1280 x 800</option>
            <option value="1024x768">1024 x 768</option>
            <option value="800x600">800 x 600</option>
            <option value="1600x900">1600 x 900</option>
          </select>
        </div>
        <div class="control-row">
          <label>缩放比例: {{ scale }}</label>
          <input
            v-model.number="scale"
            type="range"
            min="0.3"
            max="1.5"
            step="0.1"
            aria-label="缩放比例"
          />
        </div>
        <div class="control-row">
          <label>单位类型:</label>
          <button :class="{ active: unitType === 'px' }" @click="unitType = 'px'">px</button>
          <button :class="{ active: unitType === '%' }" @click="unitType = '%'">%</button>
        </div>
        <div class="control-row">
          <label>边界距离:</label>
          <input
            v-model.number="edgeDistance"
            type="number"
            min="0"
            max="100"
            aria-label="边界距离"
          />
        </div>
      </div>

      <!-- 组件属性 -->
      <div class="section">
        <h3><DemoIcon name="settings" /> 基础属性</h3>
        <div class="control-row">
          <label>可拖拽:</label>
          <input v-model="config.draggable" type="checkbox" aria-label="可拖拽" />
        </div>
        <div class="control-row">
          <label>可调整大小:</label>
          <input v-model="config.resizable" type="checkbox" aria-label="可调整大小" />
        </div>
        <div class="control-row">
          <label>限制区域:</label>
          <input v-model="config.limitAreaForParent" type="checkbox" aria-label="限制区域" />
        </div>
        <div class="control-row">
          <label>锁定宽高比:</label>
          <input v-model="config.ratioLock" type="checkbox" aria-label="锁定宽高比" />
        </div>
        <div class="control-row">
          <label>旋转 (选中方框):</label>
          <input
            type="range"
            min="-180"
            max="180"
            step="5"
            aria-label="旋转选中方框"
            :value="Number(selectedBox?.data.rotate ?? 0)"
            @input="onRotateInput"
          />
          <span>{{ Number(selectedBox?.data.rotate ?? 0) }}°</span>
        </div>
        <div class="control-row">
          <label>禁用组件:</label>
          <input v-model="config.disabled" type="checkbox" aria-label="禁用组件" />
        </div>
        <div class="control-row">
          <label>只读模式(initRect):</label>
          <input v-model="config.initRect" type="checkbox" aria-label="只读模式" />
        </div>
        <div class="control-row">
          <label>过渡动画:</label>
          <input v-model="config.enableTransition" type="checkbox" aria-label="过渡动画" />
        </div>
        <div class="control-row">
          <label>键盘控制:</label>
          <input v-model="config.keyboardEnabled" type="checkbox" aria-label="键盘控制" />
        </div>
        <div class="control-row">
          <label>拖拽把手:</label>
          <input v-model="config.useDragHandle" type="checkbox" aria-label="拖拽把手" />
        </div>
        <div class="control-row" v-if="config.useDragHandle">
          <span class="hint">仅可通过标题栏拖拽</span>
        </div>
        <div class="control-row">
          <label>拖拽排除区:</label>
          <input v-model="config.useDragCancel" type="checkbox" aria-label="拖拽排除区" />
        </div>
        <div class="control-row" v-if="config.useDragCancel">
          <span class="hint">内容按钮不会触发拖拽</span>
        </div>
        <div class="control-row">
          <label>拖拽守卫:</label>
          <input v-model="config.useDragGuard" type="checkbox" aria-label="拖拽守卫" />
        </div>
        <div class="control-row" v-if="config.useDragGuard">
          <span class="hint">left &lt; 0 的方块禁止拖拽</span>
        </div>
        <div class="control-row">
          <label>缩放守卫:</label>
          <input v-model="config.useResizeGuard" type="checkbox" aria-label="缩放守卫" />
        </div>
        <div class="control-row" v-if="config.useResizeGuard">
          <span class="hint">宽度小于 160 时禁止缩放</span>
        </div>
      </div>

      <!-- 高级属性 -->
      <div class="section advanced">
        <h3><DemoIcon name="tune" /> 高级属性</h3>
        <div class="control-row">
          <label>网格吸附:</label>
          <input v-model="config.snapToGrid" type="checkbox" aria-label="网格吸附" />
        </div>
        <div class="control-row" v-if="config.snapToGrid">
          <label>网格大小:</label>
          <input
            v-model.number="config.gridSize"
            type="number"
            min="5"
            max="100"
            aria-label="网格大小"
          />
        </div>
        <div class="control-row">
          <label>元素吸附:</label>
          <input v-model="config.snapToElements" type="checkbox" aria-label="元素吸附" />
        </div>
        <div class="control-row">
          <label>碰撞检测:</label>
          <input v-model="config.collisionEnabled" type="checkbox" aria-label="碰撞检测" />
        </div>
        <div class="control-row" v-if="config.collisionEnabled">
          <label>允许重叠:</label>
          <input v-model="config.allowOverlap" type="checkbox" aria-label="允许重叠" />
        </div>
        <div class="control-row">
          <label>保留小数:</label>
          <input v-model="config.isKeepDecimals" type="checkbox" aria-label="保留小数" />
        </div>
        <div class="control-row" v-if="config.isKeepDecimals">
          <label>小数位数:</label>
          <input
            v-model.number="config.decimalPlaces"
            type="number"
            min="0"
            max="5"
            aria-label="小数位数"
          />
        </div>
        <div class="control-row">
          <label>禁止文本选择:</label>
          <input
            v-model="config.disabledUserSelect"
            type="checkbox"
            aria-label="禁止文本选择"
          />
        </div>
      </div>

      <!-- 样式设置 -->
      <div class="section">
        <h3><DemoIcon name="palette" /> 样式设置</h3>
        <div class="control-row">
          <label>主题色:</label>
          <input v-model="themeColor" type="color" aria-label="主题色" />
          <span class="color-value">{{ themeColor }}</span>
        </div>
        <div class="control-row">
          <label>失活颜色:</label>
          <input v-model="inActiveColor" type="color" aria-label="失活颜色" />
        </div>
        <div class="control-row">
          <label>手柄位置:</label>
          <select v-model="handlesMode" aria-label="手柄位置">
            <option value="all">全部 (8个)</option>
            <option value="corners">四角 (4个)</option>
            <option value="edges">四边 (4个)</option>
            <option value="tl-br">左上+右下</option>
            <option value="br">仅右下</option>
            <option value="none">无</option>
          </select>
        </div>
        <div class="control-row">
          <label>拖拽方向:</label>
          <select v-model="dragDirections" aria-label="拖拽方向">
            <option value="all">全方向</option>
            <option value="horizontal">水平</option>
            <option value="vertical">垂直</option>
          </select>
        </div>
        <div class="control-row">
          <label>缩放方向:</label>
          <select v-model="resizeDirections" aria-label="缩放方向">
            <option value="all">全方向</option>
            <option value="horizontal">水平</option>
            <option value="vertical">垂直</option>
            <option value="corners">仅角落</option>
          </select>
        </div>
      </div>

      <!-- 尺寸限制 -->
      <div class="section">
        <h3><DemoIcon name="ruler" /> 尺寸限制</h3>
        <div class="control-row">
          <label>最小宽度:</label>
          <input
            v-model.number="config.minWidth"
            type="number"
            placeholder="50"
            aria-label="最小宽度"
          />
        </div>
        <div class="control-row">
          <label>最小高度:</label>
          <input
            v-model.number="config.minHeight"
            type="number"
            placeholder="50"
            aria-label="最小高度"
          />
        </div>
        <div class="control-row">
          <label>最大宽度:</label>
          <input
            v-model.number="config.maxWidth"
            type="number"
            placeholder="800"
            aria-label="最大宽度"
          />
        </div>
        <div class="control-row">
          <label>最大高度:</label>
          <input
            v-model.number="config.maxHeight"
            type="number"
            placeholder="600"
            aria-label="最大高度"
          />
        </div>
        <div class="control-row">
          <label>边界边距:</label>
          <input
            v-model.number="boundsMargin.top"
            type="number"
            placeholder="上"
            aria-label="上边界边距"
            style="width: 50px"
          />
          <input
            v-model.number="boundsMargin.right"
            type="number"
            placeholder="右"
            aria-label="右边界边距"
            style="width: 50px"
          />
          <input
            v-model.number="boundsMargin.bottom"
            type="number"
            placeholder="下"
            aria-label="下边界边距"
            style="width: 50px"
          />
          <input
            v-model.number="boundsMargin.left"
            type="number"
            placeholder="左"
            aria-label="左边界边距"
            style="width: 50px"
          />
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="section">
        <h3><DemoIcon name="flask" /> 测试操作</h3>
        <div class="action-stack">
          <div class="action-block">
            <span class="action-label">方块管理</span>
            <div class="action-grid action-grid--management">
              <button @click="addBox"><DemoIcon name="plus" /> 添加方块</button>
              <button @click="removeBox"><DemoIcon name="minus" /> 删除选中</button>
              <button @click="duplicateBox"><DemoIcon name="copy" /> 复制选中</button>
            </div>
          </div>
          <div class="action-block">
            <span class="action-label">批量与层级</span>
            <div class="action-grid">
              <button @click="activateAll"><DemoIcon name="check" /> 激活全部</button>
              <button @click="deactivateAll"><DemoIcon name="close" /> 取消激活</button>
              <button @click="bringToFront"><DemoIcon name="up" /> 置于顶层</button>
              <button @click="sendToBack"><DemoIcon name="down" /> 置于底层</button>
            </div>
          </div>
          <div class="action-block">
            <span class="action-label">公开方法</span>
            <div class="action-grid">
              <button class="success" @click="callSetPosition">
                <DemoIcon name="pin" /> setPosition
              </button>
              <button class="success" @click="callSetSize">
                <DemoIcon name="size" /> setSize
              </button>
              <button class="success" @click="callReset"><DemoIcon name="rotate" /> reset</button>
              <button class="warning" @click="callActivate">
                <DemoIcon name="target" /> activate
              </button>
              <button class="warning" @click="callDeactivate">
                <DemoIcon name="moon" /> deactivate
              </button>
              <button class="warning" @click="callGetConfig">
                <DemoIcon name="clipboard" /> getConfig
              </button>
            </div>
          </div>
          <div class="action-block">
            <span class="action-label">交互控制</span>
            <div class="action-grid action-grid--single">
              <button class="danger" @click="callCancelInteraction">
                <DemoIcon name="ban" /> cancelInteraction
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 预设模板 -->
      <div class="section">
        <h3><DemoIcon name="layout" /> 预设模板</h3>
        <div class="preset-grid">
          <button @click="loadTemplate('dashboard')"><DemoIcon name="layout" /> 仪表盘</button>
          <button @click="loadTemplate('gallery')"><DemoIcon name="image" /> 画廊</button>
          <button @click="loadTemplate('form')"><DemoIcon name="file" /> 表单</button>
        </div>
      </div>

      <!-- 事件日志 -->
      <div class="section">
        <h3>
          <DemoIcon name="clipboard" /> 事件日志 <span class="log-count">({{ logs.length }})</span>
        </h3>
        <div class="log-container">
          <div v-for="(log, index) in logs" :key="index" :class="['log-item', log.type]">
            <span class="log-time">{{ log.time }}</span>
            <span class="log-event">{{ log.event }}</span>
            <span class="log-detail">{{ log.detail }}</span>
          </div>
          <div v-if="logs.length === 0" class="log-empty">暂无日志</div>
        </div>
        <button class="clear-btn" @click="logs = []"><DemoIcon name="trash" /> 清空日志</button>
      </div>
    </div>

    <main class="demo-workspace">
      <!-- 画布区域 -->
      <section class="canvas-wrapper primary-canvas-wrapper" aria-label="MovableBox 主演示画布">
        <div class="canvas-container" :style="canvasStyle">
          <div class="canvas" :style="canvasInnerStyle">
          <!-- 可拖拽方块 -->
          <VueMovableBox
            v-for="box in boxes"
            :key="box.uid"
            v-model="box.data"
            :ref="el => setBoxRef(el, box.uid)"
            :scale="scale"
            :active="selectedUid === box.uid"
            :theme="themeColor"
            :in-active-color="inActiveColor"
            :unit-type="unitType"
            :draggable="config.draggable"
            :resizable="config.resizable"
            :limit-area-for-parent="config.limitAreaForParent"
            :ratio-lock="config.ratioLock"
            :disabled="config.disabled"
            :init-rect="config.initRect"
            :is-keep-decimals="config.isKeepDecimals"
            :decimal-places="config.decimalPlaces"
            :min-width="config.minWidth"
            :min-height="config.minHeight"
            :max-width="config.maxWidth"
            :max-height="config.maxHeight"
            :handles="currentHandles"
            :snap-to-grid="config.snapToGrid"
            :grid-size="config.gridSize"
            :snap-to-elements="config.snapToElements"
            :snap-threshold="10"
            :collision-enabled="config.collisionEnabled"
            :allow-overlap="config.allowOverlap"
            :snap-targets="getSnapTargets(box.uid)"
            :edge-distance="edgeDistance"
            :drag-directions="currentDragDirections"
            :resize-directions="currentResizeDirections"
            :drag-handle="config.useDragHandle ? '.box-title' : undefined"
            :drag-cancel="config.useDragCancel ? '.box-actions' : undefined"
            :can-drag="config.useDragGuard ? dragGuard : undefined"
            :can-resize="config.useResizeGuard ? resizeGuard : undefined"
            :enable-transition="config.enableTransition"
            :keyboard-enabled="config.keyboardEnabled"
            :rotate="Number(box.data.rotate ?? 0)"
            rotatable
            :disabled-user-select="config.disabledUserSelect"
            :bounds-margin="boundsMargin"
            @drag-start="onDragStart"
            @drag="onDrag"
            @drag-stop="onDragStop"
            @drag-cancel="onDragCancel"
            @resize-start="onResizeStart"
            @resize="onResize"
            @resize-stop="onResizeStop"
            @resize-cancel="onResizeCancel"
            @update:rotate="onBoxRotate(box, $event)"
            @rotate-start="onRotateStart"
            @rotate-stop="onRotateStop"
            @rotate-cancel="onRotateCancel"
            @active="onActive(box.uid)"
            @inactive="onInactive(box.uid)"
            @dblclick="onDoubleClick"
            @out-of-bounds="onOutOfBounds"
            @snap="onSnap"
            @guides="onGuides"
            @collision="onCollision"
          >
            <div class="box-content">
              <div class="box-title"><DemoIcon name="box" /> {{ box.uid }}</div>
              <div class="box-info">
                <div>
                  位置: {{ Math.round(Number(box.data.left)) }},
                  {{ Math.round(Number(box.data.top)) }}
                </div>
                <div>
                  尺寸: {{ Math.round(Number(box.data.width)) }} ×
                  {{ Math.round(Number(box.data.height)) }}
                </div>
              </div>
              <div class="box-actions">
                <button class="box-btn" @click.stop>内容按钮</button>
              </div>
            </div>
          </VueMovableBox>
          </div>

          <!-- 选中信息 -->
          <div class="selection-info" v-if="selectedBox">
            <h4><DemoIcon name="clipboard" /> {{ selectedBox.uid }} 状态</h4>
            <pre>{{ JSON.stringify(selectedBox.data, null, 2) }}</pre>
          </div>

          <!-- 快捷键提示 -->
          <div class="keyboard-hint" v-if="config.keyboardEnabled">
            <kbd>↑↓←→</kbd> 移动 | <kbd>Shift+↑↓←→</kbd> 缩放 | <kbd>Esc</kbd>
            取消交互/取消激活
          </div>
        </div>
      </section>

      <!-- MovableGroup 多选与组合移动（独立画布，避免影响上方用例） -->
      <section class="group-canvas-wrapper">
      <div class="section">
        <div class="group-demo-header">
          <div>
            <h3><DemoIcon name="users" /> MovableGroup 多选与组合移动</h3>
            <p class="group-hint">
              拖拽选中方框可整体移动；拖拽未选中方框会切换选中，Esc 取消并整体还原。
            </p>
          </div>
          <div class="group-toolbar">
            <button @click="toggleGroupSelectAll">
              <DemoIcon name="shuffle" /> 全选 / 清空
            </button>
            <span class="group-selected-label">
              当前选中: {{ groupSelected.join(', ') || '无' }}
            </span>
          </div>
        </div>
        <div class="canvas group-canvas">
          <MovableGroup
            :selected="groupSelected"
            @update:selected="onGroupSelect"
            @move-start="onGroupMoveStart"
            @move-stop="onGroupMoveStop"
            @move-cancel="onGroupMoveCancel"
          >
            <VueMovableBox
              v-for="(rect, id) in groupBoxes"
              :key="id"
              :member-id="String(id)"
              v-model="groupBoxes[id]"
              :theme="themeColor"
              :limit-area-for-parent="true"
              :draggable="true"
              :resizable="true"
            >
              <div class="box-content">
                <div class="box-title"><DemoIcon name="puzzle" /> {{ id }}</div>
              </div>
            </VueMovableBox>
          </MovableGroup>
        </div>
      </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import DemoIcon from './DemoIcon.vue';
import {
  MovableBox as VueMovableBox,
  MovableGroup,
  type CollisionEventPayload,
  type DragDirection,
  type ExtendsMovableBox,
  type GroupMoveCancelPayload,
  type GroupMoveStartPayload,
  type GroupMoveStopPayload,
  type GuidesEventPayload,
  type HandlePosition,
  type HandlesSet,
  type MovableBoxExpose,
  type SnapEventPayload,
  type SnapTarget
} from '../src';

interface BoxData {
  uid: string;
  data: {
    left: number;
    top: number;
    width: number;
    height: number;
    zIndex: number;
    rotate?: number;
  };
  color?: string;
}

const asNumber = (value: number | string | undefined, fallback = 0) => Number(value ?? fallback);

// 方块数据
const boxes = ref<BoxData[]>([
  {
    uid: 'Box-1',
    data: { left: 50, top: 50, width: 200, height: 150, zIndex: 1 },
    color: '#409eff'
  },
  {
    uid: 'Box-2',
    data: { left: 300, top: 100, width: 250, height: 200, zIndex: 2 },
    color: '#67c23a'
  },
  {
    uid: 'Box-3',
    data: { left: 600, top: 80, width: 180, height: 180, zIndex: 3 },
    color: '#e6a23c'
  }
]);

// 组件引用
const boxRefs = new Map<string, MovableBoxExpose>();

// 画布设置
const canvasSize = ref('1280x800');
const scale = ref(0.6);
const unitType = ref<'px' | '%'>('px');
const edgeDistance = ref(0);

// 配置
const config = reactive({
  draggable: true,
  resizable: true,
  limitAreaForParent: true,
  ratioLock: false,
  disabled: false,
  initRect: false,
  enableTransition: false,
  keyboardEnabled: false,
  useDragHandle: false,
  useDragCancel: false,
  useDragGuard: false,
  useResizeGuard: false,
  snapToGrid: false,
  gridSize: 20,
  snapToElements: false,
  collisionEnabled: false,
  allowOverlap: false,
  isKeepDecimals: true,
  decimalPlaces: 2,
  disabledUserSelect: true,
  minWidth: 50,
  minHeight: 50,
  maxWidth: 1000,
  maxHeight: 800
});

// 边界边距
const boundsMargin = reactive({
  top: 0,
  right: 0,
  bottom: 0,
  left: 0
});

// 样式
const themeColor = ref('#409eff');
const inActiveColor = ref('#909399');

// 手柄
const handlesMode = ref('all');
const handlesMap: Record<string, Array<HandlesSet[number]>> = {
  all: ['tl', 'tm', 'tr', 'mr', 'br', 'bm', 'bl', 'ml'],
  corners: ['tl', 'tr', 'br', 'bl'],
  edges: ['tm', 'mr', 'bm', 'ml'],
  'tl-br': ['tl', 'br'],
  br: ['br'],
  none: []
};
const currentHandles = computed(() => handlesMap[handlesMode.value]);

// 拖拽/缩放方向
const dragDirections = ref('all');
const resizeDirections = ref('all');
const dragDirectionMap: Record<string, DragDirection[]> = {
  all: ['top', 'bottom', 'left', 'right'],
  horizontal: ['left', 'right'],
  vertical: ['top', 'bottom']
};
const resizeDirectionMap: Record<string, HandlePosition[]> = {
  all: ['tl', 'tm', 'tr', 'mr', 'br', 'bm', 'bl', 'ml'],
  horizontal: ['ml', 'mr'],
  vertical: ['tm', 'bm'],
  corners: ['tl', 'tr', 'br', 'bl']
};
const currentDragDirections = computed(() => dragDirectionMap[dragDirections.value]);
const currentResizeDirections = computed(() => resizeDirectionMap[resizeDirections.value]);

const getSnapTargets = (uid: string): SnapTarget[] =>
  boxes.value.filter(box => box.uid !== uid).map(box => ({ id: box.uid, ...box.data }));

// 选中状态
const selectedUid = ref<string>('Box-1');
const selectedBox = computed(() => boxes.value.find(b => b.uid === selectedUid.value));

// 旋转演示：滑块与旋转手柄共同更新方框的自定义 rotate 字段
const onRotateInput = (event: Event) => {
  const value = Number((event.target as HTMLInputElement).value);
  const target = selectedBox.value;
  if (!target) return;
  target.data.rotate = value;
  addLog('rotate', `${target.uid} 旋转到 ${value}°`);
};

const onBoxRotate = (box: BoxData, value: number) => {
  box.data.rotate = value;
};

// 日志
interface LogItem {
  time: string;
  event: string;
  detail: string;
  type: string;
}
const logs = ref<LogItem[]>([]);

const addLog = (event: string, detail: string, type: string = 'info') => {
  const time = new Date().toLocaleTimeString();
  logs.value.unshift({ time, event, detail, type });
  if (logs.value.length > 50) logs.value.pop();
};

// 画布样式
const canvasStyle = computed(() => {
  const [w, h] = canvasSize.value.split('x').map(Number);
  return { width: `${w * scale.value}px`, height: `${h * scale.value}px` };
});

const canvasInnerStyle = computed(() => {
  const [w, h] = canvasSize.value.split('x').map(Number);
  return {
    width: `${w}px`,
    height: `${h}px`,
    transform: `scale(${scale.value})`,
    transformOrigin: '0 0'
  };
});

// 设置引用
const setBoxRef = (el: unknown, uid: string) => {
  if (el) boxRefs.set(uid, el as MovableBoxExpose);
  else boxRefs.delete(uid);
};

// MovableGroup 多选演示
const groupBoxes = reactive<Record<string, ExtendsMovableBox>>({
  g1: { left: 20, top: 20, width: 140, height: 90, zIndex: 1 },
  g2: { left: 220, top: 70, width: 140, height: 90, zIndex: 2 },
  g3: { left: 120, top: 190, width: 140, height: 90, zIndex: 3 }
});
const groupSelected = ref<string[]>(['g1', 'g2']);
const onGroupSelect = (ids: string[]) => {
  groupSelected.value = ids;
  addLog('group-select', ids.length ? `选中 ${ids.join(', ')}` : '已清空选中');
};
const toggleGroupSelectAll = () => {
  onGroupSelect(
    groupSelected.value.length === Object.keys(groupBoxes).length ? [] : Object.keys(groupBoxes)
  );
};
const onGroupMoveStart = (payload: GroupMoveStartPayload) => {
  addLog(
    'group-move-start',
    `引导方框 ${payload.leaderId}，共 ${payload.rects.length} 个成员一起移动`,
    'drag'
  );
};
const onGroupMoveStop = (payload: GroupMoveStopPayload) => {
  const detail = payload.rects
    .map(
      record =>
        `${record.id}@(${Math.round(Number(record.rect.left))},${Math.round(Number(record.rect.top))})`
    )
    .join(' ');
  addLog('group-move-stop', detail, 'success');
};
const onGroupMoveCancel = (payload: GroupMoveCancelPayload) => {
  addLog('group-move-cancel', `组合已还原（引导方框 ${payload.leaderId}）`, 'warn');
};

// 添加方块
const addBox = () => {
  const uid = `Box-${Date.now().toString().slice(-4)}`;
  const colors = ['#409eff', '#67c23a', '#e6a23c', '#f56c6c', '#909399', '#b37aeb'];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  boxes.value.push({
    uid,
    data: {
      left: 100 + Math.random() * 200,
      top: 100 + Math.random() * 200,
      width: 150 + Math.random() * 100,
      height: 100 + Math.random() * 100,
      zIndex: boxes.value.length + 1
    },
    color: randomColor
  });
  selectedUid.value = uid;
  addLog('add', `添加 ${uid}`, 'success');
};

// 删除选中
const removeBox = () => {
  const idx = boxes.value.findIndex(b => b.uid === selectedUid.value);
  if (idx > -1) {
    const uid = boxes.value[idx].uid;
    boxes.value.splice(idx, 1);
    selectedUid.value = boxes.value[0]?.uid || '';
    addLog('remove', `删除 ${uid}`, 'warn');
  }
};

// 复制选中
const duplicateBox = () => {
  if (!selectedBox.value) return;
  const uid = `Box-${Date.now().toString().slice(-4)}`;
  boxes.value.push({
    uid,
    data: {
      left: asNumber(selectedBox.value.data.left) + 30,
      top: asNumber(selectedBox.value.data.top) + 30,
      width: asNumber(selectedBox.value.data.width),
      height: asNumber(selectedBox.value.data.height),
      zIndex: boxes.value.length + 1
    },
    color: selectedBox.value.color
  });
  selectedUid.value = uid;
  addLog('duplicate', `复制 ${selectedBox.value.uid} 为 ${uid}`, 'success');
};

// 激活全部
const activateAll = () => {
  boxes.value.forEach(box => {
    const ref = boxRefs.get(box.uid);
    ref?.activate?.();
  });
  addLog('batch', '已激活全部方块', 'success');
};

// 取消激活
const deactivateAll = () => {
  boxes.value.forEach(box => {
    const ref = boxRefs.get(box.uid);
    ref?.deactivate?.();
  });
  selectedUid.value = '';
  addLog('batch', '已取消全部激活', 'warn');
};

// 置于顶层
const bringToFront = () => {
  if (!selectedBox.value) return;
  const maxZ = Math.max(...boxes.value.map(b => b.data.zIndex));
  selectedBox.value.data.zIndex = maxZ + 1;
  addLog('zIndex', `置于顶层 (zIndex: ${maxZ + 1})`, 'success');
};

// 置于底层
const sendToBack = () => {
  if (!selectedBox.value) return;
  const minZ = Math.min(...boxes.value.map(b => b.data.zIndex));
  selectedBox.value.data.zIndex = minZ - 1;
  addLog('zIndex', `置于底层 (zIndex: ${minZ - 1})`, 'success');
};

// 调用 setPosition
const callSetPosition = () => {
  const ref = boxRefs.get(selectedUid.value);
  if (ref) {
    ref.setPosition(200, 200);
    addLog('setPosition', `已移动到 (200, 200)`, 'success');
  }
};

// 调用 setSize
const callSetSize = () => {
  const ref = boxRefs.get(selectedUid.value);
  if (ref) {
    ref.setSize(300, 200);
    addLog('setSize', `已设置尺寸为 300 x 200`, 'success');
  }
};

// 调用 reset
const callReset = () => {
  const ref = boxRefs.get(selectedUid.value);
  if (ref) {
    ref.reset?.();
    addLog('reset', '已重置方块', 'success');
  }
};

// 调用 activate
const callActivate = () => {
  const ref = boxRefs.get(selectedUid.value);
  if (ref) {
    ref.activate?.();
    addLog('activate', `已激活 ${selectedUid.value}`, 'success');
  }
};

// 调用 deactivate
const callDeactivate = () => {
  const ref = boxRefs.get(selectedUid.value);
  if (ref) {
    ref.deactivate?.();
    selectedUid.value = '';
    addLog('deactivate', '已取消激活', 'warn');
  }
};

// 调用 getConfig
const callGetConfig = () => {
  const ref = boxRefs.get(selectedUid.value);
  if (ref) {
    const cfg = ref.getConfig?.();
    addLog('getConfig', JSON.stringify(cfg).substring(0, 40) + '...', 'info');
  }
};

// 调用 cancelInteraction
const callCancelInteraction = () => {
  const ref = boxRefs.get(selectedUid.value);
  if (ref) {
    ref.cancelInteraction?.();
    addLog('cancelInteraction', '已取消当前交互并还原矩形', 'warn');
  }
};

// 交互守卫：返回 false 时本次交互不会开始，也不会修改模型
const dragGuard = (value: ExtendsMovableBox) => {
  const allowed = asNumber(value.left) >= 0;
  if (!allowed) addLog('canDrag', `${selectedUid.value} 已越界，拒绝拖拽`, 'warn');
  return allowed;
};

const resizeGuard = (value: ExtendsMovableBox) => {
  const allowed = asNumber(value.width) >= 160;
  if (!allowed) addLog('canResize', `${selectedUid.value} 宽度小于 160，拒绝缩放`, 'warn');
  return allowed;
};

// 预设模板
const loadTemplate = (type: string) => {
  const [w, h] = canvasSize.value.split('x').map(Number);

  if (type === 'dashboard') {
    boxes.value = [
      {
        uid: 'Sidebar',
        data: { left: 0, top: 0, width: 200, height: h, zIndex: 1 },
        color: '#2c3e50'
      },
      {
        uid: 'Header',
        data: { left: 200, top: 0, width: w - 200, height: 60, zIndex: 2 },
        color: '#34495e'
      },
      {
        uid: 'Chart1',
        data: { left: 220, top: 80, width: 300, height: 200, zIndex: 3 },
        color: '#409eff'
      },
      {
        uid: 'Chart2',
        data: { left: 540, top: 80, width: 300, height: 200, zIndex: 4 },
        color: '#67c23a'
      },
      {
        uid: 'Table',
        data: { left: 220, top: 300, width: 620, height: 300, zIndex: 5 },
        color: '#e6a23c'
      }
    ];
  } else if (type === 'gallery') {
    boxes.value = Array.from({ length: 6 }, (_, i) => ({
      uid: `Image-${i + 1}`,
      data: {
        left: 50 + (i % 3) * 250,
        top: 50 + Math.floor(i / 3) * 200,
        width: 200,
        height: 150,
        zIndex: i + 1
      },
      color: ['#409eff', '#67c23a', '#e6a23c', '#f56c6c', '#909399', '#b37aeb'][i]
    }));
  } else if (type === 'form') {
    boxes.value = [
      {
        uid: 'Title',
        data: { left: 50, top: 50, width: 400, height: 50, zIndex: 1 },
        color: '#fff'
      },
      {
        uid: 'Input-1',
        data: { left: 50, top: 120, width: 400, height: 40, zIndex: 2 },
        color: '#fff'
      },
      {
        uid: 'Input-2',
        data: { left: 50, top: 180, width: 400, height: 40, zIndex: 3 },
        color: '#fff'
      },
      {
        uid: 'Textarea',
        data: { left: 50, top: 240, width: 400, height: 100, zIndex: 4 },
        color: '#fff'
      },
      {
        uid: 'Button',
        data: { left: 50, top: 360, width: 120, height: 40, zIndex: 5 },
        color: '#409eff'
      }
    ];
  }

  selectedUid.value = boxes.value[0].uid;
  addLog('template', `加载 ${type} 模板`, 'success');
};

// 事件处理
const onDragStart = (_event: PointerEvent, _value: ExtendsMovableBox) => {
  addLog('drag-start', `开始拖拽: ${selectedUid.value}`, 'drag');
};

const onDrag = (_value: ExtendsMovableBox) => {
  // 实时拖拽事件，频繁触发
};

const onDragStop = (
  _event: PointerEvent,
  _oldValue: ExtendsMovableBox,
  _newValue: ExtendsMovableBox
) => {
  addLog('drag-stop', `拖拽结束: ${selectedUid.value}`, 'success');
};

const onDragCancel = (
  _event: Event | null,
  _oldValue: ExtendsMovableBox,
  _newValue: ExtendsMovableBox
) => {
  addLog('drag-cancel', `拖拽已取消并还原: ${selectedUid.value}`, 'warn');
};

const onResizeStart = (_event: PointerEvent, _value: ExtendsMovableBox) => {
  addLog('resize-start', `开始调整: ${selectedUid.value}`, 'resize');
};

const onResize = (_value: ExtendsMovableBox) => {
  // 实时调整事件
};

const onResizeStop = (
  _event: PointerEvent,
  _oldValue: ExtendsMovableBox,
  _newValue: ExtendsMovableBox
) => {
  addLog('resize-stop', `调整结束: ${selectedUid.value}`, 'success');
};

const onResizeCancel = (
  _event: Event | null,
  _oldValue: ExtendsMovableBox,
  _newValue: ExtendsMovableBox
) => {
  addLog('resize-cancel', `缩放已取消并还原: ${selectedUid.value}`, 'warn');
};

const onRotateStart = (_event: Event, value: number) => {
  addLog('rotate-start', `开始旋转: ${selectedUid.value} (${Math.round(value)}°)`, 'resize');
};

const onRotateStop = (_event: Event, _oldValue: number, newValue: number) => {
  addLog('rotate-stop', `旋转结束: ${selectedUid.value} (${Math.round(newValue)}°)`, 'success');
};

const onRotateCancel = (_event: Event | null, oldValue: number) => {
  addLog('rotate-cancel', `旋转已取消并还原: ${selectedUid.value} (${Math.round(oldValue)}°)`, 'warn');
};

const onActive = (uid: string) => {
  selectedUid.value = uid;
  addLog('active', `激活: ${uid}`, 'success');
};

const onInactive = (uid: string) => {
  if (selectedUid.value === uid) selectedUid.value = '';
  addLog('inactive', `取消激活: ${uid}`, 'warn');
};

const onDoubleClick = (_event: MouseEvent) => {
  addLog('dblclick', `双击: ${selectedUid.value}`, 'info');
};

const onOutOfBounds = (direction: 'left' | 'top' | 'right' | 'bottom') => {
  addLog('out-of-bounds', `超出边界: ${direction}`, 'warn');
};

const onSnap = (data: SnapEventPayload) => {
  addLog('snap', data.snapped ? `吸附到 ${data.targetId ?? '目标'}` : '离开吸附', 'info');
};

const onGuides = (data: GuidesEventPayload) => {
  if (data.vertical.length || data.horizontal.length) {
    addLog('guides', `垂直 ${data.vertical.length} / 水平 ${data.horizontal.length}`, 'info');
  }
};

const onCollision = (data: CollisionEventPayload) => {
  addLog(
    'collision',
    data.colliding ? `碰撞 ${data.targetId ?? '目标'} (${data.direction ?? '-'})` : '离开碰撞',
    data.colliding ? 'warn' : 'info'
  );
};
</script>

<style scoped lang="scss">
.demo-container {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background: #1e1e1e;
  color: #fff;
  font-family: 'Segoe UI', sans-serif;
}

.control-panel {
  width: 340px;
  background: #252526;
  padding: 20px;
  overflow-y: auto;
  border-right: 1px solid #3c3c3c;

  h2 {
    margin: 0 0 20px;
    font-size: 18px;
    color: #409eff;
  }
}

.section {
  margin-bottom: 20px;
  padding: 15px;
  background: #2d2d2d;
  border-radius: 8px;

  h3 {
    margin: 0 0 12px;
    font-size: 12px;
    color: #aaa;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  &.advanced {
    border: 1px solid rgba(230, 162, 60, 0.45);
  }
}

.control-row {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  font-size: 13px;
  flex-wrap: wrap;
  gap: 5px;

  label {
    width: 100px;
    color: #ccc;
    flex-shrink: 0;
  }

  input[type='text'],
  input[type='number'] {
    flex: 1;
    min-width: 60px;
    padding: 4px 8px;
    background: #3c3c3c;
    border: 1px solid #555;
    border-radius: 4px;
    color: #fff;
    font-size: 12px;
  }

  input[type='checkbox'] {
    width: 18px;
    height: 18px;
    cursor: pointer;
  }

  input[type='color'] {
    width: 35px;
    height: 28px;
    border: none;
    cursor: pointer;
    background: none;
    padding: 0;
  }

  input[type='range'] {
    flex: 1;
  }

  select {
    flex: 1;
    min-width: 80px;
    padding: 4px;
    background: #3c3c3c;
    border: 1px solid #555;
    border-radius: 4px;
    color: #fff;
    font-size: 12px;
  }

  button {
    padding: 4px 10px;
    margin: 0;
    background: #3c3c3c;
    border: 1px solid #555;
    border-radius: 4px;
    color: #ccc;
    cursor: pointer;
    font-size: 11px;
    transition: all 0.2s;

    &.active {
      background: #409eff;
      border-color: #409eff;
      color: #fff;
    }

    &.success {
      background: #67c23a;
      border-color: #67c23a;
      color: #fff;
    }

    &.warning {
      background: #e6a23c;
      border-color: #e6a23c;
      color: #fff;
    }

    &:hover {
      background: #4a4a4a;
    }
  }

  .color-value {
    font-size: 11px;
    color: #888;
    margin-left: 5px;
  }

  .hint {
    font-size: 11px;
    color: #909399;
  }
}

.btn-group {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-bottom: 8px;
}

.action-stack {
  display: grid;
  gap: 12px;
}

.action-block {
  display: grid;
  gap: 6px;
}

.action-label {
  color: #8f8f8f;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.04em;
}

.action-grid,
.preset-grid {
  display: grid;
  gap: 6px;
}

.action-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));

  &--management button:last-child {
    grid-column: 1 / -1;
  }

  &--single {
    grid-template-columns: minmax(0, 1fr);
  }
}

.preset-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.btn-group,
.action-grid,
.preset-grid,
.group-toolbar {

  button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    min-width: 0;
    min-height: 40px;
    padding: 6px 8px;
    font-size: 11px;
    line-height: 1.2;
    background: #0e639c;
    border: none;
    border-radius: 4px;
    color: #fff;
    cursor: pointer;
    transition:
      background-color 0.2s ease,
      box-shadow 0.2s ease;

    &:hover {
      background: #1177bb;
    }

    &:focus-visible {
      outline: 2px solid #8dcfff;
      outline-offset: 2px;
    }

    &.success {
      background: #67c23a;
      &:hover {
        background: #5daf34;
      }
    }

    &.warning {
      background: #e6a23c;
      &:hover {
        background: #cf9236;
      }
    }

    &.danger {
      background: #f56c6c;
      &:hover {
        background: #dd5c5c;
      }
    }
  }
}

.log-container {
  max-height: 150px;
  overflow-y: auto;
  background: #1e1e1e;
  border-radius: 4px;
  padding: 8px;
  margin-bottom: 10px;
}

.log-item {
  display: flex;
  gap: 8px;
  padding: 3px 0;
  font-size: 11px;
  border-bottom: 1px solid #333;

  .log-time {
    color: #666;
    min-width: 60px;
  }
  .log-event {
    color: #4fc3f7;
    min-width: 80px;
  }
  .log-detail {
    color: #ccc;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &.success .log-event {
    color: #66bb6a;
  }
  &.warn .log-event {
    color: #ffa726;
  }
  &.error .log-event {
    color: #ef5350;
  }
  &.drag .log-event {
    color: #b388ff;
  }
  &.resize .log-event {
    color: #4dd0e1;
  }
}

.log-empty {
  color: #666;
  text-align: center;
  padding: 20px;
  font-size: 12px;
}

.group-canvas-wrapper {
  min-width: 0;

  .group-canvas {
    position: relative;
    width: 100%;
    max-width: none;
    height: 320px;
    background: #fff;
    border: 1px dashed #cbd5e1;
    border-radius: 8px;
    overflow: hidden;

    .box-title {
      color: #334155;
    }
  }

  .group-selected-label {
    display: inline-flex;
    align-items: center;
    min-height: 40px;
    padding: 0 10px;
    box-sizing: border-box;
    background: #242424;
    border-radius: 4px;
    font-size: 12px;
    color: #c5c5c5;
    white-space: nowrap;
  }

  .group-hint {
    margin: 4px 0 0;
    font-size: 12px;
    color: #9a9a9a;
  }
}

.group-demo-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 12px;

  h3 {
    margin-bottom: 0;
  }
}

.group-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.log-count {
  font-weight: normal;
  color: #666;
}

.clear-btn {
  width: 100%;
  padding: 6px;
  background: #3c3c3c;
  border: none;
  border-radius: 4px;
  color: #ccc;
  cursor: pointer;
  font-size: 12px;

  &:hover {
    background: #4a4a4a;
  }
}

.demo-workspace {
  flex: 1;
  min-width: 0;
  height: 100vh;
  padding: 20px;
  box-sizing: border-box;
  display: grid;
  grid-auto-rows: max-content;
  align-content: start;
  gap: 20px;
  overflow: auto;
}

.canvas-wrapper {
  position: relative;
  min-width: 0;
}

.primary-canvas-wrapper {
  padding: 16px;
  box-sizing: border-box;
  background: #252526;
  border: 1px solid #3c3c3c;
  border-radius: 8px;
  overflow: auto;
}

.canvas-container {
  margin: 0;
  background: #2d2d30;
  border: 2px dashed #555;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
}

@media (max-width: 900px) {
  .control-panel {
    width: 300px;
    padding: 16px;
  }

  .demo-workspace {
    padding: 12px;
    gap: 12px;
  }

  .primary-canvas-wrapper {
    padding: 12px;
  }

  .group-demo-header {
    flex-direction: column;
  }
}

@media (max-width: 720px) {
  .demo-container {
    height: auto;
    min-height: 100vh;
    flex-direction: column;
    overflow: visible;
  }

  .control-panel {
    width: 100%;
    max-height: 48vh;
    box-sizing: border-box;
    border-right: 0;
    border-bottom: 1px solid #3c3c3c;
  }

  .demo-workspace {
    width: 100%;
    height: auto;
    overflow: visible;
  }

  .group-toolbar {
    width: 100%;
    flex-wrap: wrap;
  }
}

.canvas {
  position: relative;
  background:
    linear-gradient(45deg, #333 25%, transparent 25%),
    linear-gradient(-45deg, #333 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #333 75%),
    linear-gradient(-45deg, transparent 75%, #333 75%);
  background-size: 20px 20px;
  background-position:
    0 0,
    0 10px,
    10px -10px,
    -10px 0px;
  background-color: #2a2a2a;
}

.selection-info {
  position: absolute;
  bottom: 20px;
  right: 20px;
  width: 220px;
  max-height: 180px;
  background: rgba(0, 0, 0, 0.85);
  border-radius: 8px;
  padding: 12px;
  overflow: auto;
  border: 1px solid #444;

  h4 {
    margin: 0 0 10px;
    color: #409eff;
    font-size: 13px;
  }

  pre {
    margin: 0;
    font-size: 10px;
    color: #4fc3f7;
    white-space: pre-wrap;
  }
}

.keyboard-hint {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.7);
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 12px;
  color: #aaa;

  kbd {
    background: #333;
    padding: 2px 6px;
    border-radius: 3px;
    border: 1px solid #555;
    font-family: monospace;
  }
}

@media (max-width: 720px) {
  .selection-info {
    right: auto;
    left: 12px;
    bottom: 12px;
    width: 200px;
  }

  .keyboard-hint {
    right: auto;
    left: 12px;
    transform: none;
  }
}

// 方块样式
:deep(.vue-movable-box) {
  background: rgba(64, 158, 255, 0.15);
  border: 2px solid #409eff;
  border-radius: 8px;
  transition: box-shadow 0.2s;

  &.active {
    box-shadow: 0 0 20px rgba(64, 158, 255, 0.5);
  }
}

.box-content {
  width: 100%;
  height: 100%;
  padding: 10px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;

  .box-title {
    font-size: 14px;
    font-weight: bold;
    color: #fff;
    margin-bottom: 8px;
  }

  .box-info {
    font-size: 11px;
    color: #aaa;

    div {
      margin: 2px 0;
    }
  }

  .box-actions {
    margin-top: 8px;
  }

  .box-btn {
    padding: 2px 10px;
    font-size: 11px;
    border: 1px solid rgba(255, 255, 255, 0.4);
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.15);
    color: #fff;
    cursor: pointer;
  }
}
</style>
