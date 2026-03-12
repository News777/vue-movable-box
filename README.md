# VueMovableBox

✨ A powerful Vue 3 draggable and resizable component

**[中文](./README.zh-CN.md)** | English

[![npm version](https://img.shields.io/npm/v/vue-movable-box.svg)](https://www.npmjs.com/package/vue-movable-box)
[![License](https://img.shields.io/github/license/News777/VueDraggable.svg)](LICENSE)
[![Vue 3](https://img.shields.io/badge/Vue-3.x-green.svg)](https://vuejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org)
[![Build](https://img.shields.io/github/actions/workflow/status/News777/VueDraggable/ci.yml)](https://github.com/News777/VueDraggable/actions)

A high-performance, feature-rich Vue 3 container component for drag-and-drop and resizing. Perfect for building dashboards, editors, and visual configuration tools.

## Features

- 🖱️ **Draggable** - Freely move elements anywhere
- 📐 **Resizable** - 8-direction resize handles
- 📱 **Mobile Support** - Full touch event support
- 🔒 **Aspect Ratio Lock** - Maintain proportions while scaling
- 🎨 **Customizable Theme** - Flexible theme configuration
- 📏 **Unit Support** - Supports both px and % units
- 🌍 **Boundary Constraints** - Constrain movement within parent element
- ♿ **Rich Events** - Comprehensive event callbacks
- 🔧 **TypeScript** - Full type support
- 🚀 **High Performance** - RAF optimization with hardware acceleration
- 🧪 **Testable** - Clear events and API design

## Installation

```bash
pnpm add vue-movable-box
# or
npm install vue-movable-box
```

## Quick Start

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
      Draggable Content Area
    </div>
  </MovableBox>
</template>
```

## Online Demo

```bash
# After cloning the project
pnpm install
pnpm dev
```

Visit http://localhost:5173 for the interactive demo.

## API

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `v-model` | `MovableBoxRect` | required | Bind position and size |
| `theme` | `string` | `#409EFD` | Theme color (active border) |
| `inActiveColor` | `string` | `#666666` | Inactive border color |
| `unitType` | `'px' \| '%'` | `'px'` | Size unit type |
| `scale` | `number \| string` | `1` | Component scale ratio |
| `isKeepDecimals` | `boolean` | `false` | Keep decimal places |
| `decimalPlaces` | `number` | `2` | Decimal places to keep |
| `draggable` | `boolean` | `true` | Enable dragging |
| `resizable` | `boolean` | `true` | Enable resizing |
| `limitAreaForParent` | `boolean` | `true` | Limit to parent element |
| `limitAreaClass` | `string` | - | Custom constraint area CSS selector |
| `maxWidth` | `number \| string` | - | Maximum width |
| `maxHeight` | `number \| string` | - | Maximum height |
| `minWidth` | `number \| string` | - | Minimum width |
| `minHeight` | `number \| string` | - | Minimum height |
| `ratioLock` | `boolean` | `false` | Lock aspect ratio when resizing |
| `active` | `boolean` | `false` | Is active |
| `disabled` | `boolean` | `false` | Completely disabled |
| `disabledUserSelect` | `boolean` | `true` | Disable text selection while dragging |
| `initRect` | `boolean` | `false` | Read-only mode |
| `handles` | `HandlePosition[]` | all 8 | Visible resize handles |
| **Grid & Snap** | | | |
| `snapToGrid` | `boolean` | `false` | Snap to grid |
| `gridSize` | `number` | `20` | Grid size in pixels |
| **Direction Control** | | | |
| `dragDirections` | `string[]` | `['top','bottom','left','right']` | Allowed drag directions |
| `resizeDirections` | `string[]` | all 8 | Allowed resize directions |
| **Bounds & Margin** | | | |
| `edgeDistance` | `number` | `0` | Edge distance constraint |
| `boundsMargin` | `Object` | `{top:0,right:0,bottom:0,left:0}` | Boundary margin |
| **Interaction** | | | |
| `enableTransition` | `boolean` | `false` | Enable transition animation |
| `keyboardEnabled` | `boolean` | `false` | Enable keyboard control |
| `keyboardStep` | `number` | `1` | Keyboard movement step |

#### HandlePosition Type

```ts
type HandlePosition = 'tl' | 'tm' | 'tr' | 'ml' | 'mr' | 'bl' | 'bm' | 'br'
// tl: top-left, tm: top-middle, tr: top-right
// ml: middle-left, mr: middle-right
// bl: bottom-left, bm: bottom-middle, br: bottom-right
```

#### MovableBoxRect Type

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

| Event | Parameters | Description |
|-------|------------|-------------|
| `update:modelValue` | `(value: MovableBoxRect)` | Emitted on v-model update |
| `drag-start` | `(event: MouseEvent, value: MovableBoxRect)` | Drag start |
| `drag` | `(value: MovableBoxRect)` | During drag (throttled) |
| `drag-stop` | `(event: MouseEvent, oldValue: MovableBoxRect, newValue: MovableBoxRect)` | Drag stop |
| `resize-start` | `(event: MouseEvent, value: MovableBoxRect)` | Resize start |
| `resize` | `(value: MovableBoxRect)` | During resize (throttled) |
| `resize-stop` | `(event: MouseEvent, oldValue: MovableBoxRect, newValue: MovableBoxRect)` | Resize stop |
| `active` | `(value: MovableBoxRect)` | Component activated |
| `inactive` | `(value: MovableBoxRect)` | Component deactivated |
| `disabled` | `(value: boolean)` | Disabled state changed |
| `dblclick` | `(event: MouseEvent)` | Double click |
| `out-of-bounds` | `(direction: 'left' \| 'top' \| 'right' \| 'bottom')` | Out of bounds |
| `move` | `(value: MovableBoxRect)` | Same as `drag`, deprecated |

### Methods

Called via `ref`:

```vue
<template>
  <MovableBox ref="boxRef" v-model="config" />
</template>

<script setup>
const boxRef = ref()

// Get current config
boxRef.value.getConfig()

// Set position
boxRef.value.setPosition(100, 100)

// Set size
boxRef.value.setSize(300, 200)

// Reset to initial position
boxRef.value.activate()

// Deactivate
boxRef.value.deactivate()
</script>
```

### Slots

| Slot | Description |
|------|-------------|
| `default` | Component content area |

## Advanced Usage

### Custom Theme Color

```vue
<MovableBox 
  v-model="config"
  theme="#ff6b6b"
  inActiveColor="#ccc"
/>
```

### Using Percentage Units

```vue
<MovableBox 
  v-model="config"
  unit-type="%"
  :max-width="100"
  :max-height="100"
/>
```

### Lock Aspect Ratio

```vue
<MovableBox 
  v-model="config"
  :ratio-lock="true"
/>
```

### Custom Resize Handles

```vue
<!-- Show only bottom-right handle -->
<MovableBox 
  v-model="config"
  :handles="['br']"
/>

<!-- Show four corners only -->
<MovableBox 
  v-model="config"
  :handles="['tl', 'tr', 'bl', 'br']"
/>
```

### Constrain to Custom Area

```vue
<!-- Constrain to parent (default) -->
<MovableBox v-model="config" />

<!-- Constrain to custom area -->
<div class="custom-area">
  <MovableBox 
    v-model="config"
    limit-area-class="custom-area"
  />
</div>
```

### Grid Snap

```vue
<MovableBox 
  v-model="config"
  :snap-to-grid="true"
  :grid-size="20"
/>
```

### Keyboard Control

```vue
<MovableBox 
  v-model="config"
  :keyboard-enabled="true"
  :keyboard-step="5"
/>
<!-- 
  Arrow keys ↑↓←→ to move
  Escape to deactivate
-->
```

### Limit Drag/Resize Directions

```vue
<!-- Horizontal drag only, no vertical -->
<MovableBox 
  v-model="config"
  drag-directions="['left', 'right']"
/>

<!-- Show only horizontal resize handles -->
<MovableBox 
  v-model="config"
  resize-directions="['ml', 'mr']"
/>
```

### Boundary Margin

```vue
<MovableBox 
  v-model="config"
  :edge-distance="20"
  :bounds-margin="{ top: 10, right: 10, bottom: 10, left: 10 }"
/>
```

### Transition Animation

```vue
<MovableBox 
  v-model="config"
  :enable-transition="true"
/>
```

### Event Listeners Example

```vue
<script setup>
const handleDragStart = (e, value) => {
  console.log('Drag started', value)
}

const handleDragStop = (e, oldVal, newVal) => {
  console.log('Drag stopped', { old: oldVal, new: newVal })
}

const handleOutOfBounds = (direction) => {
  console.log('Out of bounds:', direction)
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

### Multiple Components Coordination

```vue
<script setup>
import { ref } from 'vue'

const boxes = ref([
  { id: 1, config: { left: 50, top: 50, width: 200, height: 150, zIndex: 1 }},
  { id: 2, config: { left: 300, top: 100, width: 200, height: 150, zIndex: 2 }}
])

const activeId = ref(null)

const handleActive = (box, rect) => {
  // Update zIndex on activation
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

Full TypeScript type support:

```ts
import { 
  MovableBox, 
  type MovableBoxProps,
  type MovableBoxRect,
  type ExtendsMovableBox,
  type HandlesSet 
} from 'vue-movable-box'

// Use types
const config: MovableBoxRect = {
  left: 100,
  top: 100,
  width: 200,
  height: 150,
  zIndex: 1
}
```

## Browser Support

| Browser | Minimum Version |
|---------|----------------|
| Chrome | >= 88 |
| Firefox | >= 85 |
| Safari | >= 14 |
| Edge | >= 88 |
| iOS Safari | >= 14 |
| Android Chrome | >= 88 |

## Project Structure

```
vue-movable-box/
├── src/
│   ├── index.ts                 # Entry file
│   ├── types/
│   │   └── MovableBox.ts        # Type definitions
│   └── components/
│       └── MovableBox/
│           ├── MovableBox.vue   # Main component
│           ├── style.scss       # Styles
│           └── utils.ts         # Utility functions
├── examples/                    # Example code
│   ├── App.vue                  # Full demo
│   └── main.ts
├── lib/                         # Build output
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## Related Links

- [npm Package](https://www.npmjs.com/package/vue-movable-box)
- [GitHub Repository](https://github.com/News777/VueDraggable)
- [Issue Tracker](https://github.com/News777/VueDraggable/issues)

## License

MIT License - See [LICENSE](LICENSE) file

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

Made with ❤️ by News777
