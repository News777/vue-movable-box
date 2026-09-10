# VueMovableBox

✨ 一个功能强大的 Vue 3 拖拽和调整大小组件

**[English](./README.md)** | 中文

[![npm version](https://img.shields.io/npm/v/vue-movable-box.svg)](https://www.npmjs.com/package/vue-movable-box)
[![License](https://img.shields.io/github/license/News777/VueDraggable.svg)](LICENSE)
[![Vue 3](https://img.shields.io/badge/Vue-3.x-green.svg)](https://vuejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org)
[![Build](https://img.shields.io/github/actions/workflow/status/News777/VueDraggable/ci.yml)](https://github.com/News777/VueDraggable/actions)

一个高性能、功能丰富的 Vue 3 可拖拽可调整大小的容器组件，适用于构建仪表盘、编辑器、可视化配置等场景。

## 特性

- 🖱️ **拖拽移动** - 自由拖拽元素位置
- 📐 **调整大小** - 8个方向调整元素尺寸
- 📱 **移动端支持** - Pointer Events 统一鼠标、触摸和触控笔
- 🖐️ **拖拽把手** - 可配置拖拽触发区域与排除区域
- ⌨️ **键盘与无障碍** - 方向键移动、Shift+方向键缩放、可聚焦手柄与焦点样式
- ↩️ **取消交互** - Escape 或编程取消，自动恢复交互前矩形
- 🛡️ **交互守卫** - `canDrag` / `canResize` 在交互开始前拒绝操作
- 🔒 **比例锁定** - 保持宽高比缩放
- 🎨 **自定义主题** - 灵活的主题配置
- 📏 **单位支持** - 支持 px 和 % 单位
- 🌍 **边界限制** - 限制在父元素内移动
- 🧲 **元素吸附** - 边缘、中心对齐与内置辅助线
- 💥 **碰撞控制** - 检测重叠或阻止拖拽与缩放碰撞
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
import { ref } from 'vue';
import { MovableBox } from 'vue-movable-box';
import 'vue-movable-box/style.css';

const boxConfig = ref({
  left: 100,
  top: 100,
  width: 200,
  height: 150,
  zIndex: 1
});
</script>

<template>
  <MovableBox v-model="boxConfig">
    <div class="content">拖拽内容区域</div>
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

| 属性                 | 类型                                                         | 默认值                            | 说明                                                                  |
| -------------------- | ------------------------------------------------------------ | --------------------------------- | --------------------------------------------------------------------- |
| `v-model`            | `MovableBoxRect`                                             | 必填                              | 绑定位置和尺寸                                                        |
| `theme`              | `string`                                                     | `#409EFD`                         | 主题色（激活状态边框色）                                              |
| `inActiveColor`      | `string`                                                     | `#666666`                         | 失活状态边框颜色                                                      |
| `unitType`           | `'px' \| '%'`                                                | `'px'`                            | 尺寸单位类型                                                          |
| `scale`              | `number \| string`                                           | `1`                               | 组件整体缩放比例                                                      |
| `isKeepDecimals`     | `boolean`                                                    | `false`                           | 是否保留小数                                                          |
| `decimalPlaces`      | `number`                                                     | `2`                               | 保留小数位数                                                          |
| `draggable`          | `boolean`                                                    | `true`                            | 是否可拖拽                                                            |
| `dragHandle`         | `string`                                                     | -                                 | 拖拽触发区域的 CSS 选择器；设置后仅方框内命中该选择器的元素可发起拖拽 |
| `dragCancel`         | `string`                                                     | -                                 | 拖拽排除区域的 CSS 选择器；命中元素（如表单、按钮）不会触发拖拽       |
| `canDrag`            | `(value: MovableBoxRect) => boolean`                         | -                                 | 拖拽前置守卫；返回 `false` 时拒绝本次拖拽，且不修改模型               |
| `canResize`          | `(value: MovableBoxRect, handle: HandlePosition) => boolean` | -                                 | 缩放前置守卫；返回 `false` 时拒绝本次缩放，且不修改模型               |
| `resizable`          | `boolean`                                                    | `true`                            | 是否可调整大小（推荐名称）                                            |
| `resizeable`         | `boolean`                                                    | `true`                            | `resizable` 的兼容旧别名，已废弃                                      |
| `limitAreaForParent` | `boolean`                                                    | `true`                            | 是否限制在父元素区域内                                                |
| `limitAreaClass`     | `string`                                                     | -                                 | 自定义限制区域的 CSS 选择器                                           |
| `maxWidth`           | `number \| string`                                           | -                                 | 最大宽度                                                              |
| `maxHeight`          | `number \| string`                                           | -                                 | 最大高度                                                              |
| `minWidth`           | `number \| string`                                           | `0`                               | 最小宽度                                                              |
| `minHeight`          | `number \| string`                                           | `0`                               | 最小高度                                                              |
| `ratioLock`          | `boolean`                                                    | `false`                           | 调整大小时是否锁定宽高比                                              |
| `active`             | `boolean`                                                    | `false`                           | 是否处于激活状态                                                      |
| `disabled`           | `boolean`                                                    | `false`                           | 是否完全禁用                                                          |
| `disabledUserSelect` | `boolean`                                                    | `true`                            | 拖拽时是否禁止文本选择                                                |
| `initRect`           | `boolean`                                                    | `false`                           | 只读模式（仅展示位置尺寸）                                            |
| `handles`            | `HandlePosition[]`                                           | 全部8个                           | 允许显示的调整手柄                                                    |
| `memberId`           | `string`                                                     | 自动生成                          | `MovableGroup` 中使用的稳定成员标识                                   |
| `rotate`             | `number \| string`                                           | `0`                               | 顺时针旋转角度（度）                                                  |
| `rotatable`          | `boolean`                                                    | `false`                           | 激活时显示交互式旋转手柄                                              |
| `rotationHandleOffset` | `number`                                                  | `28`                              | 方框与旋转手柄之间的非负屏幕像素距离                                  |
| `transformOrigin`    | `string`                                                     | `center`                          | CSS 与几何计算统一使用的 transform-origin 子集                        |
| **网格与吸附**       |                                                              |                                   |                                                                       |
| `snapToGrid`         | `boolean`                                                    | `false`                           | 是否吸附到网格                                                        |
| `gridSize`           | `number`                                                     | `20`                              | 网格大小（当前坐标单位）                                              |
| `snapToElements`     | `boolean`                                                    | `false`                           | 吸附到 `snapTargets` 的边缘或中心                                     |
| `snapThreshold`      | `number`                                                     | `10`                              | 元素吸附阈值                                                          |
| `snapTargets`        | `SnapTarget[]`                                               | `[]`                              | 其他元素的矩形数据；组合内请使用 `id: memberId` 以排除成员目标          |
| `snapFilter`         | `(target, axis) => boolean`                                  | `undefined`                       | 返回 false 可在对应轴（`horizontal` / `vertical`）上排除该吸附目标    |
| `snapPriority`       | `('alignment' \| 'spacing')[]`                               | `['alignment','spacing']`         | 每个轴的策略咨询顺序；阈值内首个产出候选的策略生效                    |
| `collisionEnabled`   | `boolean`                                                    | `false`                           | 对 `snapTargets` 启用碰撞检测                                         |
| `collisionMode`      | `'precise' \| 'aabb'`                                        | `'precise'`                       | `'precise'` 按双方真实旋转矩形做连续碰撞检测；`'aabb'` 保留 3.2 之前的近似行为 |
| `allowOverlap`       | `boolean`                                                    | `false`                           | 检测到碰撞时是否仍允许重叠                                            |
| **方向控制**         |                                                              |                                   |                                                                       |
| `dragDirections`     | `string[]`                                                   | `['top','bottom','left','right']` | 允许拖拽的方向                                                        |
| `resizeDirections`   | `string[]`                                                   | 全部8个                           | 允许调整的方向                                                        |
| **边界与边距**       |                                                              |                                   |                                                                       |
| `edgeDistance`       | `number`                                                     | `0`                               | 四边统一边距                                                          |
| `boundsMargin`       | `Object`                                                     | `{top:0,right:0,bottom:0,left:0}` | 每侧附加边距，与 `edgeDistance` 相加                                  |
| **交互**             |                                                              |                                   |                                                                       |
| `enableTransition`   | `boolean`                                                    | `false`                           | 启用过渡动画                                                          |
| `keyboardEnabled`    | `boolean`                                                    | `false`                           | 启用键盘操作                                                          |
| `keyboardStep`       | `number`                                                     | `1`                               | 方向键移动步长；配合 Shift 键作为缩放步长                             |

#### HandlePosition 类型

```ts
type HandlePosition = 'tl' | 'tm' | 'tr' | 'ml' | 'mr' | 'bl' | 'bm' | 'br';
// tl: 左上, tm: 上中, tr: 右上
// ml: 左中, mr: 右中
// bl: 左下, bm: 下中, br: 右下
```

#### MovableBoxRect 类型

```ts
interface MovableBoxRect {
  left: number | string;
  top: number | string;
  width: number | string;
  height: number | string;
  zIndex?: number;
}
```

### Events

| 事件名              | 参数                                                                         | 说明                                                                                                                                         |
| ------------------- | ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `update:modelValue` | `(value: MovableBoxRect)`                                                    | v-model 更新时触发                                                                                                                           |
| `update:rotate`     | `(value: number)`                                                            | 旋转时为 `v-model:rotate` 触发更新                                                                                                           |
| `drag-start`        | `(event: PointerEvent, value: MovableBoxRect)`                               | 开始拖拽时触发                                                                                                                               |
| `drag`              | `(value: MovableBoxRect)`                                                    | 拖拽过程中触发（节流）                                                                                                                       |
| `drag-stop`         | `(event: PointerEvent, oldValue: MovableBoxRect, newValue: MovableBoxRect)`  | 停止拖拽时触发                                                                                                                               |
| `resize-start`      | `(event: PointerEvent, value: MovableBoxRect)`                               | 开始调整大小时触发                                                                                                                           |
| `resize`            | `(value: MovableBoxRect)`                                                    | 调整大小过程中触发（节流）                                                                                                                   |
| `resize-stop`       | `(event: PointerEvent, oldValue: MovableBoxRect, newValue: MovableBoxRect)`  | 停止调整大小时触发                                                                                                                           |
| `drag-cancel`       | `(event: Event \| null, oldValue: MovableBoxRect, newValue: MovableBoxRect)` | 拖拽被取消（Escape、pointercancel 或 `cancelInteraction()`）时触发；矩形恢复到交互前状态，`newValue` 等于 `oldValue`，且不会触发 `drag-stop` |
| `resize-cancel`     | `(event: Event \| null, oldValue: MovableBoxRect, newValue: MovableBoxRect)` | 缩放被取消时触发；语义与 `drag-cancel` 相同                                                                                                  |
| `rotate-start`      | `(event: Event, value: number)`                                              | 开始操作旋转手柄时触发                                                                                                                       |
| `rotate`            | `(value: number)`                                                            | 旋转角度变化时触发（指针输入会节流）                                                                                                         |
| `rotate-stop`       | `(event: Event, oldValue: number, newValue: number)`                         | 旋转结束时触发                                                                                                                               |
| `rotate-cancel`     | `(event: Event \| null, oldValue: number, newValue: number)`                 | 旋转取消时触发；角度恢复为 `oldValue`，且不触发 `rotate-stop`                                                                                 |
| `active`            | `(value: MovableBoxRect)`                                                    | 组件被激活时触发                                                                                                                             |
| `inactive`          | `(value: MovableBoxRect)`                                                    | 组件失去激活时触发                                                                                                                           |
| `disabled`          | `(value: boolean)`                                                           | 禁用状态变化时触发                                                                                                                           |
| `dblclick`          | `(event: MouseEvent)`                                                        | 双击组件时触发                                                                                                                               |
| `out-of-bounds`     | `(direction: 'left' \| 'top' \| 'right' \| 'bottom')`                        | 超出边界时触发                                                                                                                               |
| `move`              | `(value: MovableBoxRect)`                                                    | `drag` 的兼容旧别名，已废弃                                                                                                                  |
| `snap`              | `(value: SnapEventPayload)`                                                  | 吸附状态、吸附点或目标发生变化时触发                                                                                                         |
| `guides`            | `(value: GuidesEventPayload)`                                                | 吸附目标或辅助线坐标发生变化时触发                                                                                                           |
| `collision`         | `(value: CollisionEventPayload)`                                             | 进入、改变或离开碰撞状态时触发                                                                                                               |

交互处理顺序为：方向限制 → 网格吸附 → 元素吸附 → 边界限制 → 碰撞校验。高级事件只在状态变化时触发，不会在每个相同的拖拽帧重复触发。目标矩形、网格、阈值和边距均使用 `unitType` 对应的坐标单位；`unitType="%"` 时数值代表百分点。

强制中止不等于取消：设置 `disabled` 或 `initRect`、或 `active` 变为 `false` 时，进行中的交互会就地结束——值不会还原，也不会触发取消事件。只有显式取消路径（Escape、`pointercancel`、指针捕获丢失、`cancelInteraction()`）才会恢复交互前的值，并触发 `drag-cancel`、`resize-cancel` 或 `rotate-cancel`。

```ts
interface SnapEventPayload {
  snapped: boolean;
  point?: SnapPoint; // 已废弃的单吸附点兼容字段
  points?: SnapPoint[];
  targetId?: string;
  targetIds?: {
    horizontal?: string;
    vertical?: string;
  };
}

interface GuidesEventPayload {
  vertical: number[];
  horizontal: number[];
}

interface CollisionEventPayload {
  colliding: boolean;
  direction?: 'left' | 'right' | 'top' | 'bottom';
  targetId?: string;
  /** 容器像素坐标系中由障碍物指向当前方框的单位法线（precise 模式） */
  normal?: { x: number; y: number };
}
```

双轴同时吸附时，`targetId` 保留为兼容旧用法的主要目标；`targetIds.horizontal` 和
`targetIds.vertical` 分别表示两个坐标轴选中的目标。

### 键盘与无障碍

开启 `keyboardEnabled` 后，组件支持完整的键盘操作（方框与缩放手柄均可通过 Tab 聚焦，并显示与主题色一致的焦点轮廓）：

- 方向键：按 `keyboardStep` 移动方框（受 `dragDirections` 限制）。
- `Shift` + 方向键：以右下角手柄（或 `resizeDirections` 中第一个允许的手柄）为锚点调整大小，方向键指示被拖动边缘的移动方向，因此 `Shift+→`/`Shift+↓` 放大、`Shift+←`/`Shift+↑` 缩小。
- 聚焦某个缩放手柄后，方向键沿该手柄的轴向调整大小（角手柄支持两个轴向），按住 `Shift` 反向；边缘手柄提供 `role="separator"`、方向、当前/最小/最大尺寸与快捷键语义，角落手柄提供 `role="group"` 和双轴缩放描述，所有手柄都有可访问名称。
- 聚焦旋转手柄后，左右方向键按 `keyboardStep` 调节角度，Shift 使用 10 倍步长，Home 将角度归零。
- `Escape`：指针拖拽、缩放或旋转进行中时取消本次交互——恢复交互前的值，并触发对应的 cancel 事件而不是 stop 事件；空闲且方框激活时则取消激活。

不开启 `keyboardEnabled` 时，手柄不可聚焦、方向键不生效，但 `Escape` 仍可取消进行中的指针交互。

在按钮、链接、表单控件等交互式插槽内容中按方向键时，按键仍由该控件自身处理，不会移动方框。

### Methods

通过 `ref` 调用：

```vue
<template>
  <MovableBox ref="boxRef" v-model="config" />
</template>

<script setup>
const boxRef = ref();

// 获取当前配置
boxRef.value.getConfig();

// 设置位置
boxRef.value.setPosition(100, 100);

// 设置大小
boxRef.value.setSize(300, 200);

// 重置到初始位置
boxRef.value.reset();

// 激活组件
boxRef.value.activate();

// 停用组件
boxRef.value.deactivate();

// 取消进行中的拖拽/缩放/旋转，恢复交互前的值
boxRef.value.cancelInteraction();
</script>
```

### Slots

| 插槽名    | 说明         |
| --------- | ------------ |
| `default` | 组件内容区域 |

## 高级用法

### 自定义主题色

```vue
<MovableBox v-model="config" theme="#ff6b6b" inActiveColor="#ccc" />
```

### 使用百分比单位

```vue
<MovableBox v-model="config" unit-type="%" :max-width="100" :max-height="100" />
```

### 锁定宽高比

```vue
<MovableBox v-model="config" :ratio-lock="true" />
```

### 自定义调整手柄

```vue
<!-- 只显示右下角手柄 -->
<MovableBox v-model="config" :handles="['br']" />

<!-- 显示四个角 -->
<MovableBox v-model="config" :handles="['tl', 'tr', 'bl', 'br']" />
```

### 限制在指定区域内

```vue
<!-- 限制在父元素内（默认） -->
<MovableBox v-model="config" />

<!-- 限制在自定义区域 -->
<div class="custom-area">
  <MovableBox 
    v-model="config"
    limit-area-class=".custom-area"
  />
</div>
```

### 网格吸附

```vue
<MovableBox v-model="config" :snap-to-grid="true" :grid-size="20" />
```

### 元素吸附与碰撞

```vue
<MovableBox
  v-model="current"
  :snap-to-elements="true"
  :collision-enabled="true"
  :allow-overlap="false"
  :snap-targets="otherBoxes"
  @snap="handleSnap"
  @collision="handleCollision"
/>
```

`otherBoxes` 中的每项包含 `left`、`top`、`width`、`height`、可选 `id`，自 3.2.0 起还可选
`rotate` 与 `transformOrigin` 描述目标真实旋转轮廓。组件会自动显示对齐辅助线。边缘接触不算碰撞；
关闭重叠时，拖拽或缩放保持在最后一个合法矩形，初始已重叠的元素只允许向总重叠面积减小的方向移动。
多目标碰撞以重叠面积最大的目标决定 `direction`、`normal` 和 `targetId`；开启 `allowOverlap`
会提交候选矩形，但仍会上报碰撞。

自 3.2.0 起，碰撞默认采用 `collisionMode="precise"`：双方都以真实旋转矩形（位置、尺寸、角度、
变换原点）参与计算；平移沿整段运动路径做连续碰撞检测（高速拖拽无法穿过目标）；被旋转边缘挡住
的拖拽会沿该边缘的切线继续滑动；缩放与旋转路径全程检测，角点无法在中途扫过障碍物。碰撞载荷的
`normal` 是容器像素坐标系中由障碍物指向当前方框的单位法线，`direction` 按法线主轴映射。设置
`collision-mode="aabb"` 可退回 3.2 之前的轴对齐近似行为作为迁移入口——该模式忽略目标的旋转
角度，也不上报 `normal`。

> **3.2.0 破坏性变更：**precise 碰撞成为默认行为，取代此前 3.x 的 AABB 近似。凡是旋转轮廓与
> AABB 有差异的场景，结果都会不同。迁移期间可用 `collision-mode="aabb"` 获得旧行为。

#### 等间距辅助线

开启 `snapToElements` 后，当方框移动到两个目标之间，会自动吸附到两侧间距相等的位置，
`snap` 载荷携带 `spacing: [{ axis, gap, targetIds, guides }]`，并在两个锚点边缘绘制辅助线。
传入 `:snap-priority="['alignment']"` 可关闭等间距吸附；传入
`:snap-priority="['spacing', 'alignment']"` 可让等间距在两种策略同时命中阈值时优先生效。
`snapFilter` 可按轴排除目标，例如跳过锁定图层：

```vue
<MovableBox
  v-model="current"
  :snap-to-elements="true"
  :snap-targets="otherBoxes"
  :snap-filter="(target, axis) => !lockedIds.has(target.id)"
  :snap-priority="['alignment', 'spacing']"
  @snap="handleSnap"
/>
```

吸附解析是确定的：每根轴按 `snapPriority` 顺序咨询策略，策略内取阈值内最近候选，
距离相等时按 `snapTargets` 数组顺序取胜。

### 旋转与变换原点

```vue
<MovableBox v-model="config" v-model:rotate="angle" rotatable transform-origin="center" />
```

`rotate` 接受角度（顺时针，等同 CSS `rotate()`）。`transformOrigin` 支持 CSS transform-origin
的一个子集：由关键字（`left` / `center` / `right` / `top` / `bottom`）、百分比或 `px`
长度组成的合法一到两个 token 位置组合（如 `'center'`、`'top left'`、`'50% 25%'`、
`'10px 20px'`）。多余 token 和无法解析的值（如 `calc()`）均视为非法并回退到 center。旋转下的
缩放会把指针与键盘位移映射到方框的本地坐标系（按逆角度旋转），手柄沿旋转后的边缘放大或缩小。
手柄本身采用"本地坐标系增量缩放"
模型，而非精确的逆运动学锚定：大角度下手柄的屏幕位移与指针路径不一致，但最小/最大尺寸、
比例锁定、边界与碰撞约束仍按文档语义执行。

设置 `rotatable` 后，激活方框会显示旋转手柄，拖动手柄会更新 `v-model:rotate`。同时开启
`keyboardEnabled` 时，聚焦旋转手柄后可用左右方向键按 `keyboardStep` 调节角度，按住 Shift
以 10 倍步长调节，按 Home 归零。

旋转几何语义（在 3.0.0 中定义）：

- **边界约束**以旋转后矩形的轴对齐包围盒（AABB）为准；`out-of-bounds` 同样按 AABB 判定。
  AABB 会考虑 `transformOrigin`，非 center 原点也按真实视觉位置钳制。缩放使 AABB 超出区域时，
  边手柄只收缩被拖拽的轴，角手柄与 `ratioLock` 沿拖拽射线等比收缩，直到 AABB 能放入区域，再
  钳制到区域内；`minWidth` / `minHeight` 下限优先于收缩，残余溢出通过 `out-of-bounds` 上报。
- **元素吸附**（对齐与等间距）在 AABB 上求值，吸附位移按 1:1 映射回未旋转矩形。
- **碰撞**（自 3.2.0 起默认 `collisionMode="precise"`）按当前方框与声明了 `rotate` /
  `transformOrigin` 的目标的真实旋转轮廓求解，平移使用连续碰撞检测，缩放与旋转全程检测路径。
  `collisionMode="aabb"` 保留旧的近似行为：当前方框 AABB 与未旋转目标矩形求交。
- **网格吸附**继续对齐未旋转的左上角。
- 平移（指针拖拽、键盘移动、组合移动）不受旋转影响。
- 吸附辅助线渲染在随方框逆旋转的呈现层中，`rotate ≠ 0` 时虚线仍与容器坐标轴对齐、精确落在
  目标位置上（3.2.0 修复；此前辅助线随方框一起旋转）。
- `unitType="%"` 时，几何计算会先把矩形和 px 变换原点换算到父容器像素空间，完成计算后再
  转回百分点。自 3.2.0 起，旋转缩放的输入位移也先在像素空间完成旋转变换，再映射到按轴区分的
  百分点单位，斜向手柄拖动的宽高分配不再混淆两轴。

`rotate: 0` 的方框与 2.x 行为完全一致，升级无需改动。

### 键盘控制

```vue
<MovableBox v-model="config" :keyboard-enabled="true" :keyboard-step="5" />
<!-- 
  按方向键 ↑↓←→ 移动
  按 Escape 取消激活
-->
```

### 限制拖拽/调整方向

```vue
<!-- 只允许左右拖拽，禁止上下移动 -->
<MovableBox v-model="config" :drag-directions="['left', 'right']" />

<!-- 只显示左右调整手柄 -->
<MovableBox v-model="config" :resize-directions="['ml', 'mr']" />
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
<MovableBox v-model="config" :enable-transition="true" />
```

### 事件监听示例

```vue
<script setup>
const handleDragStart = (e, value) => {
  console.log('开始拖拽', value);
};

const handleDragStop = (e, oldVal, newVal) => {
  console.log('停止拖拽', { 旧位置: oldVal, 新位置: newVal });
};

const handleOutOfBounds = direction => {
  console.log('超出边界:', direction);
  // direction: 'left' | 'top' | 'right' | 'bottom'
};
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
import { ref } from 'vue';

const boxes = ref([
  { id: 1, config: { left: 50, top: 50, width: 200, height: 150, zIndex: 1 } },
  { id: 2, config: { left: 300, top: 100, width: 200, height: 150, zIndex: 2 } }
]);

const activeId = ref(null);

const handleActive = (box, rect) => {
  // 点击激活时更新 zIndex
  const maxZ = Math.max(...boxes.value.map(b => b.config.zIndex));
  box.config.zIndex = maxZ + 1;
  activeId.value = box.id;
};
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

### 多选与组合移动

`MovableGroup` 是无渲染的包裹组件，用于协调多个 `MovableBox` 子组件。拖拽任一选中的成员，
整个选中组合按相同偏移一起移动；拖拽未选中的成员会切换选中。请为每个成员提供稳定的
`memberId`。

```vue
<script setup>
import { ref } from 'vue';
import { MovableBox, MovableGroup } from 'vue-movable-box';

const rects = ref({
  a: { left: 20, top: 20, width: 140, height: 90 },
  b: { left: 220, top: 70, width: 140, height: 90 }
});
const selected = ref(['a', 'b']);

const onMoveStop = payload => {
  // 不可变批量载荷：整个组合一次性应用。
  for (const record of payload.rects) {
    console.log(record.id, record.startRect, '->', record.rect);
  }
};
</script>

<template>
  <div class="canvas">
    <MovableGroup v-model:selected="selected" @move-stop="onMoveStop">
      <MovableBox v-for="(rect, id) in rects" :key="id" :member-id="id" v-model="rects[id]" />
    </MovableGroup>
  </div>
</template>
```

组合语义：

- **共享边界**（默认开启）：选中矩形的并集会被约束在边界区域内，整个组合一起停在区域边缘。
  传入 `:shared-bounds="false"` 可改为每个成员各自约束。
- **吸附与碰撞只对引导方框生效**（即指针下的方框）。组合成员之间互不吸附、互不碰撞，
  保证事件载荷确定可预测。
- 移动过程中每个成员照常触发各自的 `update:modelValue`；组合额外触发 `move-start` /
  `move` / `move-stop` 批量事件（载荷为 `{ leaderId, source, rects }`）。引导方框取消时触发
  `move-cancel`，整个组合还原到交互前的矩形。
- 强制中止（例如拖拽中切换 `disabled`）会直接结束会话、不还原，与单方框语义一致；引导方框
  在拖拽中被卸载同理，其余成员停留在当前位置。
- 第二个并发指针无法抢占进行中的会话：未选成员仍可单独拖动；已在活动组合中的成员会拒绝第二次
  交互，确保进行中的组合不被改变。
- 组几何使用未旋转的成员矩形：成员 `rotate ≠ 0` 时按未旋转形态约束，其视觉 AABB 可能因旋转
  外扩而超出区域边缘。
- 暴露方法：`getSelected()`、`select(ids?)`、`getMemberRects()`。

## TypeScript

完整 TypeScript 类型支持：

```ts
import {
  MovableBox,
  type MovableBoxProps,
  type MovableBoxRect,
  type ExtendsMovableBox,
  type HandlesSet
} from 'vue-movable-box';

// 使用类型
const config: MovableBoxRect = {
  left: 100,
  top: 100,
  width: 200,
  height: 150,
  zIndex: 1
};
```

## 浏览器支持

| 浏览器         | 最低版本 |
| -------------- | -------- |
| Chrome         | >= 88    |
| Firefox        | >= 85    |
| Safari         | >= 14    |
| Edge           | >= 88    |
| iOS Safari     | >= 14    |
| Android Chrome | >= 88    |

## 项目结构

```
vue-movable-box/
├── src/
│   ├── index.ts                 # 入口文件
│   ├── types/
│   │   └── MovableBox.ts        # 类型定义
│   └── components/
│       └── MovableBox/
│           ├── MovableBox.vue   # 主组件与 scoped 样式
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
- [项目规划](ROADMAP.md)

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
