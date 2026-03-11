<template>
  <div class="demo-container">
    <!-- 控制面板 -->
    <div class="control-panel">
      <h2>🎯 VueMovableBox 功能演示</h2>
      
      <!-- 基础设置 -->
      <div class="section">
        <h3>📐 画布设置</h3>
        <div class="control-row">
          <label>画布尺寸:</label>
          <select v-model="canvasSize">
            <option value="1280x800">1280 x 800</option>
            <option value="1024x768">1024 x 768</option>
            <option value="800x600">800 x 600</option>
          </select>
        </div>
        <div class="control-row">
          <label>缩放比例: {{ scale }}</label>
          <input type="range" min="0.3" max="1.5" step="0.1" v-model.number="scale" />
        </div>
        <div class="control-row">
          <label>单位类型:</label>
          <button :class="{ active: unitType === 'px' }" @click="unitType = 'px'">px</button>
          <button :class="{ active: unitType === '%' }" @click="unitType = '%'">%</button>
        </div>
      </div>

      <!-- 组件属性 -->
      <div class="section">
        <h3>⚙️ 组件属性</h3>
        <div class="control-row">
          <label>可拖拽:</label>
          <input type="checkbox" v-model="config.draggable" />
        </div>
        <div class="control-row">
          <label>可调整大小:</label>
          <input type="checkbox" v-model="config.resizeable" />
        </div>
        <div class="control-row">
          <label>限制区域:</label>
          <input type="checkbox" v-model="config.limitAreaForParent" />
        </div>
        <div class="control-row">
          <label>锁定宽高比:</label>
          <input type="checkbox" v-model="config.ratioLock" />
        </div>
        <div class="control-row">
          <label>禁用组件:</label>
          <input type="checkbox" v-model="config.disabled" />
        </div>
        <div class="control-row">
          <label>只读模式(initRect):</label>
          <input type="checkbox" v-model="config.initRect" />
        </div>
        <div class="control-row">
          <label>保留小数:</label>
          <input type="checkbox" v-model="config.isKeepDecimals" />
        </div>
      </div>

      <!-- 样式设置 -->
      <div class="section">
        <h3>🎨 样式设置</h3>
        <div class="control-row">
          <label>主题色:</label>
          <input type="color" v-model="themeColor" />
        </div>
        <div class="control-row">
          <label>失活颜色:</label>
          <input type="color" v-model="inActiveColor" />
        </div>
        <div class="control-row">
          <label>手柄位置:</label>
          <select v-model="handlesMode">
            <option value="all">全部 (8个)</option>
            <option value="corners">四角 (4个)</option>
            <option value="edges">四边 (4个)</option>
            <option value="custom">自定义</option>
          </select>
        </div>
      </div>

      <!-- 尺寸限制 -->
      <div class="section">
        <h3>📏 尺寸限制</h3>
        <div class="control-row">
          <label>最小宽度:</label>
          <input type="number" v-model.number="config.minWidth" placeholder="50" />
        </div>
        <div class="control-row">
          <label>最小高度:</label>
          <input type="number" v-model.number="config.minHeight" placeholder="50" />
        </div>
        <div class="control-row">
          <label>最大宽度:</label>
          <input type="number" v-model.number="config.maxWidth" placeholder="800" />
        </div>
        <div class="control-row">
          <label>最大高度:</label>
          <input type="number" v-model.number="config.maxHeight" placeholder="600" />
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="section">
        <h3>🧪 测试操作</h3>
        <div class="btn-group">
          <button @click="addBox">➕ 添加方块</button>
          <button @click="removeBox">➖ 删除选中</button>
          <button @click="activateAll">✅ 激活全部</button>
          <button @click="deactivateAll">❌ 取消激活</button>
        </div>
        <div class="btn-group">
          <button @click="callSetPosition">📍 setPosition</button>
          <button @click="callSetSize">📐 setSize</button>
          <button @click="callReset">🔄 reset</button>
        </div>
      </div>

      <!-- 事件日志 -->
      <div class="section">
        <h3>📋 事件日志</h3>
        <div class="log-container">
          <div v-for="(log, index) in logs" :key="index" :class="['log-item', log.type]">
            <span class="log-time">{{ log.time }}</span>
            <span class="log-event">{{ log.event }}</span>
            <span class="log-detail">{{ log.detail }}</span>
          </div>
        </div>
        <button class="clear-btn" @click="logs = []">🗑️ 清空日志</button>
      </div>
    </div>

    <!-- 画布区域 -->
    <div class="canvas-wrapper">
      <div class="canvas-container" :style="canvasStyle">
        <div class="canvas" :style="canvasInnerStyle">
          
          <!-- 可拖拽方块 -->
          <VueMovableBox
            v-for="box in boxes"
            :key="box.uid"
            v-model="box.data"
            :ref="(el: any) => setBoxRef(el, box.uid)"
            :scale="scale"
            :active="selectedUid === box.uid"
            :theme="themeColor"
            :in-active-color="inActiveColor"
            :unit-type="unitType"
            :draggable="config.draggable"
            :resizeable="config.resizeable"
            :limit-area-for-parent="config.limitAreaForParent"
            :ratio-lock="config.ratioLock"
            :disabled="config.disabled"
            :init-rect="config.initRect"
            :is-keep-decimals="config.isKeepDecimals"
            :min-width="config.minWidth"
            :min-height="config.minHeight"
            :max-width="config.maxWidth"
            :max-height="config.maxHeight"
            :handles="currentHandles"
            @drag-start="onDragStart"
            @drag="onDrag"
            @drag-stop="onDragStop"
            @resize-start="onResizeStart"
            @resize="onResize"
            @resize-stop="onResizeStop"
            @active="onActive"
            @inactive="onInactive"
            @dblclick="onDoubleClick"
          >
            <div class="box-content">
              <div class="box-title">📦 {{ box.uid }}</div>
              <div class="box-info">
                <div>位置: {{ Math.round(Number(box.data.left)) }}, {{ Math.round(Number(box.data.top)) }}</div>
                <div>尺寸: {{ Math.round(Number(box.data.width)) }} x {{ Math.round(Number(box.data.height)) }}</div>
              </div>
            </div>
          </VueMovableBox>

        </div>
      </div>
      
      <!-- 选中信息 -->
      <div class="selection-info" v-if="selectedBox">
        <h4>选中方块信息</h4>
        <pre>{{ JSON.stringify(selectedBox.data, null, 2) }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick } from 'vue';
import { MovableBox as VueMovableBox, type ExtendsMovableBox, type HandlesSet } from '../src';

interface BoxData {
  uid: string;
  data: ExtendsMovableBox;
}

// 方块数据
const boxes = ref<BoxData[]>([
  { uid: 'Box-1', data: { left: 50, top: 50, width: 200, height: 150, zIndex: 1 }},
  { uid: 'Box-2', data: { left: 300, top: 100, width: 250, height: 200, zIndex: 2 }},
  { uid: 'Box-3', data: { left: 600, top: 80, width: 180, height: 180, zIndex: 3 }},
]);

// 组件引用
const boxRefs = new Map<string, any>();

// 画布设置
const canvasSize = ref('1280x800');
const scale = ref(0.6);
const unitType = ref<'px' | '%'>('px');

// 配置
const config = reactive({
  draggable: true,
  resizeable: true,
  limitAreaForParent: true,
  ratioLock: false,
  disabled: false,
  initRect: false,
  isKeepDecimals: true,
  minWidth: 50,
  minHeight: 50,
  maxWidth: 1000,
  maxHeight: 800,
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
  custom: ['tl', 'br'],
};
const currentHandles = computed(() => handlesMap[handlesMode.value]);

// 选中状态
const selectedUid = ref<string>('Box-1');
const selectedBox = computed(() => boxes.value.find(b => b.uid === selectedUid.value));

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
const setBoxRef = (el: any, uid: string) => {
  if (el) boxRefs.set(uid, el);
};

// 添加方块
const addBox = () => {
  const uid = `Box-${Date.now().toString().slice(-4)}`;
  boxes.value.push({
    uid,
    data: { 
      left: 100 + Math.random() * 200, 
      top: 100 + Math.random() * 200, 
      width: 150 + Math.random() * 100, 
      height: 100 + Math.random() * 100, 
      zIndex: boxes.value.length + 1 
    }
  });
  selectedUid.value = uid;
};

// 删除选中
const removeBox = () => {
  const idx = boxes.value.findIndex(b => b.uid === selectedUid.value);
  if (idx > -1) {
    boxes.value.splice(idx, 1);
    selectedUid.value = boxes.value[0]?.uid || '';
  }
};

// 激活全部
const activateAll = () => {
  boxes.value.forEach(box => {
    const ref = boxRefs.get(box.uid);
    ref?.activate?.();
  });
  addLog('批量操作', '已激活全部方块', 'success');
};

// 取消激活
const deactivateAll = () => {
  boxes.value.forEach(box => {
    const ref = boxRefs.get(box.uid);
    ref?.deactivate?.();
  });
  selectedUid.value = '';
  addLog('批量操作', '已取消全部激活', 'warn');
};

// 调用 setPosition
const callSetPosition = () => {
  const ref = boxRefs.get(selectedUid.value);
  if (ref) {
    ref.setPosition?.(200 as any, 200 as any);
    addLog('setPosition', `已移动到 (200, 200)`, 'success');
  }
};

// 调用 setSize
const callSetSize = () => {
  const ref = boxRefs.get(selectedUid.value);
  if (ref) {
    ref.setSize?.(300 as any, 200 as any);
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

// 事件处理
const onDragStart = (event: MouseEvent | TouchEvent, value: ExtendsMovableBox) => {
  addLog('drag-start', `开始拖拽: ${selectedUid.value}`, 'info');
};

const onDrag = (value: ExtendsMovableBox) => {
  // 实时拖拽事件，频繁触发
};

const onDragStop = (event: MouseEvent | TouchEvent, oldValue: ExtendsMovableBox, newValue: ExtendsMovableBox) => {
  addLog('drag-stop', `拖拽结束: ${selectedUid.value}`, 'success');
};

const onResizeStart = (event: MouseEvent | TouchEvent, value: ExtendsMovableBox) => {
  addLog('resize-start', `开始调整: ${selectedUid.value}`, 'info');
};

const onResize = (value: ExtendsMovableBox) => {
  // 实时调整事件
};

const onResizeStop = (event: MouseEvent | TouchEvent, oldValue: ExtendsMovableBox, newValue: ExtendsMovableBox) => {
  addLog('resize-stop', `调整结束: ${selectedUid.value}`, 'success');
};

const onActive = (value: any) => {
  // 通过比较 value 和 box.data 来找到对应的 uid
  const found = boxes.value.find(b => 
    b.data.left === value.left && 
    b.data.top === value.top && 
    b.data.width === value.width && 
    b.data.height === value.height
  );
  if (found) {
    selectedUid.value = found.uid;
  }
  addLog('active', `激活: ${selectedUid.value}`, 'success');
};

const onInactive = (value: any) => {
  // 只有当没有其他盒子被激活时才记录
  if (!selectedUid.value) {
    addLog('inactive', `取消激活`, 'warn');
  }
};

const onDoubleClick = (event: MouseEvent | TouchEvent) => {
  addLog('dblclick', `双击: ${selectedUid.value}`, 'info');
};
</script>

<style scoped lang="scss">
.demo-container {
  display: flex;
  height: 100vh;
  background: #1e1e1e;
  color: #fff;
  font-family: 'Segoe UI', sans-serif;
}

.control-panel {
  width: 320px;
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
    font-size: 14px;
    color: #aaa;
  }
}

.control-row {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-size: 13px;
  
  label {
    width: 100px;
    color: #ccc;
  }
  
  input[type="text"],
  input[type="number"] {
    flex: 1;
    padding: 4px 8px;
    background: #3c3c3c;
    border: 1px solid #555;
    border-radius: 4px;
    color: #fff;
  }
  
  input[type="checkbox"] {
    width: 18px;
    height: 18px;
  }
  
  input[type="color"] {
    width: 40px;
    height: 30px;
    border: none;
    cursor: pointer;
  }
  
  input[type="range"] {
    flex: 1;
  }
  
  select {
    flex: 1;
    padding: 4px;
    background: #3c3c3c;
    border: 1px solid #555;
    border-radius: 4px;
    color: #fff;
  }
  
  button {
    padding: 4px 12px;
    margin-right: 5px;
    background: #3c3c3c;
    border: 1px solid #555;
    border-radius: 4px;
    color: #ccc;
    cursor: pointer;
    
    &.active {
      background: #409eff;
      border-color: #409eff;
      color: #fff;
    }
    
    &:hover {
      background: #4a4a4a;
    }
  }
}

.btn-group {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  
  button {
    padding: 6px 10px;
    font-size: 12px;
    background: #0e639c;
    border: none;
    border-radius: 4px;
    color: #fff;
    cursor: pointer;
    
    &:hover {
      background: #1177bb;
    }
  }
}

.log-container {
  max-height: 150px;
  overflow-y: auto;
  background: #1e1e1e;
  border-radius: 4px;
  padding: 5px;
  margin-bottom: 10px;
}

.log-item {
  display: flex;
  gap: 8px;
  padding: 3px 0;
  font-size: 11px;
  border-bottom: 1px solid #333;
  
  .log-time { color: #666; }
  .log-event { color: #4fc3f7; min-width: 80px; }
  .log-detail { color: #ccc; }
  
  &.success .log-event { color: #66bb6a; }
  &.warn .log-event { color: #ffa726; }
  &.error .log-event { color: #ef5350; }
}

.clear-btn {
  width: 100%;
  padding: 6px;
  background: #3c3c3c;
  border: none;
  border-radius: 4px;
  color: #ccc;
  cursor: pointer;
}

.canvas-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.canvas-container {
  flex: 1;
  margin: 20px;
  background: #2d2d30;
  border: 2px dashed #555;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
}

.canvas {
  position: relative;
  background: 
    linear-gradient(45deg, #333 25%, transparent 25%),
    linear-gradient(-45deg, #333 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #333 75%),
    linear-gradient(-45deg, transparent 75%, #333 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
  background-color: #2a2a2a;
}

.selection-info {
  position: absolute;
  bottom: 20px;
  right: 20px;
  width: 250px;
  max-height: 200px;
  background: rgba(0,0,0,0.8);
  border-radius: 8px;
  padding: 15px;
  overflow: auto;
  
  h4 {
    margin: 0 0 10px;
    color: #409eff;
  }
  
  pre {
    margin: 0;
    font-size: 11px;
    color: #4fc3f7;
  }
}

// 方块样式
:deep(.vue-movable-box) {
  background: rgba(64, 158, 255, 0.2);
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
}
</style>
