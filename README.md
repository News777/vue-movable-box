# VueMovableBox

✨ 一个功能强大的 Vue 3 拖拽和调整大小组件

[![npm version](https://img.shields.io/npm/v/vue-movable-box.svg)](https://www.npmjs.com/package/vue-movable-box)
[![License](https://img.shields.io/github/license/News777/VueDraggable.svg)](LICENSE)
[![Vue 3](https://img.shields.io/badge/Vue-3.x-green.svg)](https://vuejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org)
[![Build](https://img.shields.io/github/actions/workflow/status/News777/VueDraggable/ci.yml)](https://github.com/News777/VueDraggable/actions)

一个高性能、功能丰富的 Vue 3 可拖拽可调整大小的容器组件，适用于构建仪表盘、编辑器、可视化配置等场景。

## 特性

- 🖱️ **拖拽移动** - 自由拖拽元素位置
- 📐 **调整大小** - 8个方向调整元素尺寸
- 📱 **移动端支持** - 完整的触摸事件支持
- 🔒 **比例锁定** - 保持宽高比缩放
- 🎨 **自定义主题** - 灵活的主题配置
- 📏 **单位支持** - 支持 px 和 % 单位
- 🌍 **边界限制** - 限制在父元素内移动
- ♿ **完整事件** - 丰富的事件回调
- 🔧 **TypeScript** - 完整的类型支持
- 🚀 **高性能** - 使用 RAF 优化，硬件加速
- 🧪 **可测试** - 清晰的事件和 API 设计

## 安装

```bash
pnpm add vue-movable-box
# 或
npm install vue-movable-box
```

## 快速开始

```vue
<script setup>
import { ref } from 'vue'
import { MovableBox } from 'vue-movable-box'
import 'vue-movable-box/css'

const boxConfig = ref({
  left: 100,
  top: 100,
  width: 200,
  height: 150,
  zIndex: 1
})
</script>

<template>
  <MovableBox v-model="boxConfig">
    <div class="content">
      拖拽内容区域
    </div>
  </MovableBox>
</template>
```

## 在线演示

```bash
# 克隆项目后
pnpm install
pnpm dev
```

访问 http://localhost:5173 查看交互式演示。

## API

### Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `v-model` | `MovableBoxRect` | 必填 | 绑定位置和尺寸 |
| `theme` | `string` | `#409EFD` | 主题色（激活状态边框色） |
| `inActiveColor` | `string` | `#666666` | 失活状态边框颜色 |
| `unitType` | `'px' \| '%'` | `'px'` | 尺寸单位类型 |
| `scale` | `number \| string` | `1` | 组件整体缩放比例 |
| `isKeepDecimals` | `boolean` | `false` | 是否保留小数 |
| `decimalPlaces` | `number` | `2` | 保留小数位数 |
| `draggable` | `boolean` | `true` | 是否可拖拽 |
| `resizable` | `boolean` | `true` | 是否可调整大小 |
| `limitAreaForParent` | `boolean` | `true` | 是否限制在父元素区域内 |
| `limitAreaClass` | `string` | - | 自定义限制区域的 CSS 选择器 |
| `maxWidth` | `number \| string` | - | 最大宽度 |
| `maxHeight` | `number \| string` | - | 最大高度 |
| `minWidth` | `number \| string` | - | 最小宽度 |
| `minHeight` | `number \| string` | - | 最小高度 |
| `ratioLock` | `boolean` | `false` | 调整大小时是否锁定宽高比 |
| `active` | `boolean` | `false` | 是否处于激活状态 |
| `disabled` | `boolean` | `false` | 是否完全禁用 |
| `disabledUserSelect` | `boolean` | `true` | 拖拽时是否禁止文本选择 |
| `initRect` | `boolean` | `false` | 只读模式（仅展示位置尺寸） |
| `handles` | `HandlePosition[]` | 全部8个 | 允许显示的调整手柄 |
| **网格与吸附** | | | |
| `snapToGrid` | `boolean` | `false` | 是否吸附到网格 |
| `gridSize` | `number` | `20` | 网格大小（像素） |
| **方向控制** | | | |
| `dragDirections` | `string[]` | `['top','bottom','left','right']` | 允许拖拽的方向 |
| `resizeDirections` | `string[]` | 全部8个 | 允许调整的方向 |
| **边界与边距** | | | |
| `edgeDistance` | `number` | `0` | 边界距离限制 |
| `boundsMargin` | `Object` | `{top:0,right:0,bottom:0,left:0}` | 边界边距 |
| **交互** | | | |
| `enableTransition` | `boolean` | `false` | 启用过渡动画 |
| `keyboardEnabled` | `boolean` | `false` | 启用键盘操作 |
| `keyboardStep` | `number` | `1` | 键盘移动步长 |

#### HandlePosition 类型

```ts
type HandlePosition = 'tl' | 'tm' | 'tr' | 'ml' | 'mr' | 'bl' | 'bm' | 'br'
// tl: 左上, tm: 上中, tr: 右上
// ml: 左中, mr: 右中
// bl: 左下, bm: 下中, br: 右下
```

#### MovableBoxRect 类型

```ts
interface MovableBoxRect {
  left: number
  top: number
  width: number
  height: number
  zIndex: number
}
```

### Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
| `update:modelValue` | `(value: MovableBoxRect)` | v-model 更新时触发 |
| `drag-start` | `(event: MouseEvent, value: MovableBoxRect)` | 开始拖拽时触发 |
| `drag` | `(value: MovableBoxRect)` | 拖拽过程中触发（节流） |
| `drag-stop` | `(event: MouseEvent, oldValue: MovableBoxRect, newValue: MovableBoxRect)` | 停止拖拽时触发 |
| `resize-start` | `(event: MouseEvent, value: MovableBoxRect)` | 开始调整大小时触发 |
| `resize` | `(value: MovableBoxRect)` | 调整大小过程中触发（节流） |
| `resize-stop` | `(event: MouseEvent, oldValue: MovableBoxRect, newValue: MovableBoxRect)` | 停止调整大小时触发 |
| `active` | `(value: MovableBoxRect)` | 组件被激活时触发 |
| `inactive` | `(value: MovableBoxRect)` | 组件失去激活时触发 |
| `disabled` | `(value: boolean)` | 禁用状态变化时触发 |
| `dblclick` | `(event: MouseEvent)` | 双击组件时触发 |
| `out-of-bounds` | `(direction: 'left' \| 'top' \| 'right' \| 'bottom')` | 超出边界时触发 |
| `move` | `(value: MovableBoxRect)` | 同 `drag`，已废弃，使用 `drag` |

### Methods

通过 `ref` 调用：

```vue
<template>
  <MovableBox ref="boxRef" v-model="config" />
</template>

<script setup>
const boxRef = ref()

// 获取当前配置
boxRef.value.getConfig()

// 设置位置
boxRef.value.setPosition(100, 100)

// 设置大小
boxRef.value.setSize(300, 200)

// 重置到初始位置
boxRef.value.reset()

// 激活组件
boxRef.value.activate()

// 停用组件
boxRef.value.deactivate()
</script>
```

### Slots

| 插槽名 | 说明 |
|--------|------|
| `default` | 组件内容区域 |

## 高级用法

### 自定义主题色

```vue
<MovableBox 
  v-model="config"
  theme="#ff6b6b"
  inActiveColor="#ccc"
/>
```

### 使用百分比单位

```vue
<MovableBox 
  v-model="config"
  unit-type="%"
  :max-width="100"
  :max-height="100"
/>
```

### 锁定宽高比

```vue
<MovableBox 
  v-model="config"
  :ratio-lock="true"
/>
```

### 自定义调整手柄

```vue
<!-- 只显示右下角手柄 -->
<MovableBox 
  v-model="config"
  :handles="['br']"
/>

<!-- 显示四个角 -->
<MovableBox 
  v-model="config"
  :handles="['tl', 'tr', 'bl', 'br']"
/>
```

### 限制在指定区域内

```vue
<!-- 限制在父元素内（默认） -->
<MovableBox v-model="config" />

<!-- 限制在自定义区域 -->
<div class="custom-area">
  <MovableBox 
    v-model="config"
    limit-area-class="custom-area"
  />
</div>
```

### 网格吸附

```vue
<MovableBox 
  v-model="config"
  :snap-to-grid="true"
  :grid-size="20"
/>
```

### 键盘控制

```vue
<MovableBox 
  v-model="config"
  :keyboard-enabled="true"
  :keyboard-step="5"
/>
<!-- 
  按方向键 ↑↓←→ 移动
  按 Escape 取消激活
-->
```

### 限制拖拽/调整方向

```vue
<!-- 只允许左右拖拽，禁止上下移动 -->
<MovableBox 
  v-model="config"
  drag-directions="['left', 'right']"
/>

<!-- 只显示左右调整手柄 -->
<MovableBox 
  v-model="config"
  resize-directions="['ml', 'mr']"
/>
```

### 边界边距

```vue
<MovableBox 
  v-model="config"
  :edge-distance="20"
  :bounds-margin="{ top: 10, right: 10, bottom: 10, left: 10 }"
/>
```

### 过渡动画

```vue
<MovableBox 
  v-model="config"
  :enable-transition="true"
/>
```

### 事件监听示例

```vue
<script setup>
const handleDragStart = (e, value) => {
  console.log('开始拖拽', value)
}

const handleDragStop = (e, oldVal, newVal) => {
  console.log('停止拖拽', { 旧位置: oldVal, 新位置: newVal })
}

const handleOutOfBounds = (direction) => {
  console.log('超出边界:', direction)
  // direction: 'left' | 'top' | 'right' | 'bottom'
}
</script>

<template>
  <MovableBox
    v-model="config"
    @drag-start="handleDragStart"
    @drag-stop="handleDragStop"
    @out-of-bounds="handleOutOfBounds"
  />
</template>
```

### 多组件协调

```vue
<script setup>
import { ref } from 'vue'

const boxes = ref([
  { id: 1, config: { left: 50, top: 50, width: 200, height: 150, zIndex: 1 }},
  { id: 2, config: { left: 300, top: 100, width: 200, height: 150, zIndex: 2 }}
])

const activeId = ref(null)

const handleActive = (box, rect) => {
  // 点击激活时更新 zIndex
  const maxZ = Math.max(...boxes.value.map(b => b.config.zIndex))
  box.config.zIndex = maxZ + 1
  activeId.value = box.id
}
</script>

<template>
  <div class="container">
    <MovableBox
      v-for="box in boxes"
      :key="box.id"
      v-model="box.config"
      :active="activeId === box.id"
      @active="() => handleActive(box, $event)"
    >
      Box {{ box.id }}
    </MovableBox>
  </div>
</template>
```

## TypeScript

完整 TypeScript 类型支持：

```ts
import { 
  MovableBox, 
  type MovableBoxProps,
  type MovableBoxRect,
  type ExtendsMovableBox,
  type HandlesSet 
} from 'vue-movable-box'

// 使用类型
const config: MovableBoxRect = {
  left: 100,
  top: 100,
  width: 200,
  height: 150,
  zIndex: 1
}
```

## 浏览器支持

| 浏览器 | 最低版本 |
|--------|----------|
| Chrome | >= 88 |
| Firefox | >= 85 |
| Safari | >= 14 |
| Edge | >= 88 |
| iOS Safari | >= 14 |
| Android Chrome | >= 88 |

## 项目结构

```
vue-movable-box/
├── src/
│   ├── index.ts                 # 入口文件
│   ├── types/
│   │   └── MovableBox.ts        # 类型定义
│   └── components/
│       └── MovableBox/
│           ├── MovableBox.vue   # 主组件
│           ├── style.scss       # 样式
│           └── utils.ts         # 工具函数
├── examples/                    # 示例代码
│   ├── App.vue                  # 完整演示
│   └── main.ts
├── lib/                         # 构建输出
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## 相关链接

- [npm 包](https://www.npmjs.com/package/vue-movable-box)
- [GitHub 仓库](https://github.com/News777/VueDraggable)
- [问题反馈](https://github.com/News777/VueDraggable/issues)

## 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 贡献

欢迎贡献代码！请阅读 [CONTRIBUTING.md](CONTRIBUTING.md) 了解如何参与开发。

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送分支 (`git push origin feature/amazing-feature`)
5. 开启 Pull Request

---

Made with ❤️ by News777
