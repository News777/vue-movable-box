# VueMovableBox

✨ 一个功能强大的 Vue 3 拖拽和调整大小组件

[![npm version](https://img.shields.io/npm/v/vue-movable-box.svg)](https://www.npmjs.com/package/vue-movable-box)
[![License](https://img.shields.io/github/license/News777/VueDraggable.svg)](LICENSE)
[![Vue 3](https://img.shields.io/badge/Vue-3.x-green.svg)](https://vuejs.org)

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
- 🌐 **RTL 支持** - 从右到左布局支持

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
import { VueMovableBox } from 'vue-movable-box'
import 'vue-movable-box/css'

const draggableProps = ref({
  left: 100,
  top: 100,
  width: 200,
  height: 150,
  zIndex: 1
})
</script>

<template>
  <VueMovableBox v-model="draggableProps">
    <div class="content">
      拖拽内容区域
    </div>
  </VueMovableBox>
</template>
```

## API

### Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `v-model` | `Object` | 必填 | 绑定位置和尺寸 `{ left, top, width, height, zIndex }` |
| `theme` | `string` | `#409EFD` | 主题色 |
| `inActiveColor` | `string` | `#666666` | 失活颜色 |
| `unitType` | `'px' \| '%'` | `'px'` | 单位类型 |
| `scale` | `number \| string` | `1` | 缩放比例 |
| `isKeepDecimals` | `boolean` | `false` | 是否保留小数 |
| `decimalPlaces` | `number` | `2` | 小数位数 |
| `draggable` | `boolean` | `true` | 是否可拖拽 |
| `resizeable` | `boolean` | `true` | 是否可调整大小 |
| `limitAreaForParent` | `boolean` | `true` | 是否限制在父元素内 |
| `limitAreaClass` | `string` | - | 指定限制区域的 CSS 选择器 |
| `maxWidth` | `number \| string` | - | 最大宽度 |
| `maxHeight` | `number \| string` | - | 最大高度 |
| `minWidth` | `number \| string` | - | 最小宽度 |
| `minHeight` | `number \| string` | - | 最小高度 |
| `ratioLock` | `boolean` | `false` | 是否锁定宽高比 |
| `active` | `boolean` | `false` | 是否激活 |
| `disabled` | `boolean` | `false` | 是否禁用 |
| `disabledUserSelect` | `boolean` | `true` | 是否禁用文本选择 |
| `initRect` | `boolean` | `false` | 只读模式 |
| `handles` | `string[]` | `['tl','tm','tr','mr','br','bm','bl','ml']` | 可用的调整手柄 |

### Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
| `update:modelValue` | `(value: Object)` | v-model 更新 |
| `drag-start` | `(event, value)` | 开始拖拽 |
| `drag-stop` | `(event, oldValue, newValue)` | 停止拖拽 |
| `resize-start` | `(event, value)` | 开始调整大小 |
| `resize-stop` | `(event, oldValue, newValue)` | 停止调整大小 |
| `active` | `(value)` | 组件激活 |
| `inactive` | `(value)` | 组件停用 |
| `disabled` | `(value)` | 禁用状态变化 |
| `dblclick` | `(event)` | 双击事件 |
| `out-of-bounds` | `(direction)` | 超出边界 |
| `move` | `(value)` | 移动中（节流） |
| `resize` | `(value)` | 调整中（节流） |

### Methods

通过 `ref` 访问：

```vue
<template>
  <VueMovableBox ref="draggableRef" v-model="config" />
</template>

<script setup>
const draggableRef = ref()

// 获取当前配置
draggableRef.value.getConfig()

// 设置位置
draggableRef.value.setPosition(100, 100)

// 设置大小
draggableRef.value.setSize(300, 200)

// 重置
draggableRef.value.reset()

// 激活
draggableRef.value.activate()

// 停用
draggableRef.value.deactivate()
</script>
```

## 高级用法

### 自定义主题

```vue
<VueAutoDraggable 
  v-model="config"
  theme="#ff6b6b"
  inActiveColor="#ccc"
/>
```

### 百分比单位

```vue
<VueAutoDraggable 
  v-model="config"
  unitType="%"
  :maxWidth="100"
  :maxHeight="100"
/>
```

### 比例锁定

```vue
<VueAutoDraggable 
  v-model="config"
  :ratioLock="true"
/>
```

### 限制区域

```vue
<!-- 使用父元素 -->
<VueAutoDraggable v-model="config" />

<!-- 使用指定区域 -->
<VueAutoDraggable 
  v-model="config"
  limitAreaClass=".custom-area"
/>
```

### 事件监听

```vue
<script setup>
const handleDragStart = (e, value) => {
  console.log('开始拖拽', value)
}

const handleDragStop = (e, oldVal, newVal) => {
  console.log('停止拖拽', { oldVal, newVal })
}

const handleOutOfBounds = (direction) => {
  console.log('超出边界:', direction)
}
</script>

<template>
  <VueAutoDraggable
    v-model="config"
    @drag-start="handleDragStart"
    @drag-stop="handleDragStop"
    @out-of-bounds="handleOutOfBounds"
  />
</template>
```

## 类型定义

完整 TypeScript 支持，所有类型定义已包含在内：

```ts
import type { 
  MovableBox,
  ExtendsMovableBox, 
  MovableBoxProps,
  HandlesSet,
  MovableBoxExpose
} from 'vue-movable-box'
```

## 浏览器支持

- Chrome >= 88
- Firefox >= 85
- Safari >= 14
- Edge >= 88

## 项目结构

```
VueDraggable/
├── packages/
│   └── AutoDraggable/
│       ├── index.vue        # 主组件
│       ├── type.ts          # 类型定义
│       ├── utils/
│       │   └── util.ts      # 工具函数
│       └── styles/
│           └── auto-draggable.scss
├── dev/                     # 开发示例
├── package.json
└── vite.config.ts
```

## 许可证

MIT License - 见 [LICENSE](LICENSE) 文件

## 贡献

欢迎贡献！请阅读 [CONTRIBUTING.md](CONTRIBUTING.md) 了解如何参与开发。

---

Made with ❤️ by News777
