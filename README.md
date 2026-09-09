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
- 📱 **Mobile Support** - Pointer Events unify mouse, touch, and pen input
- 🖐️ **Drag Handles** - Configurable drag trigger and cancel areas
- ⌨️ **Keyboard & A11y** - Arrow-key movement, Shift+arrow resizing, focusable handles with focus states
- ↩️ **Cancellation** - Escape or programmatic cancel restores the pre-interaction rectangle
- 🛡️ **Guards** - `canDrag` / `canResize` hooks reject interactions before they start
- 🔒 **Aspect Ratio Lock** - Maintain proportions while scaling
- 🎨 **Customizable Theme** - Flexible theme configuration
- 📏 **Unit Support** - Supports both px and % units
- 🌍 **Boundary Constraints** - Constrain movement within parent element
- 🧲 **Element Snapping** - Edge/center alignment with built-in guides
- 💥 **Collision Control** - Detect overlap or block drag and resize collisions
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
import 'vue-movable-box/style.css'

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
| `dragHandle` | `string` | - | CSS selector restricting where a drag can start; when set, only matching elements inside the box start drags |
| `dragCancel` | `string` | - | CSS selector for elements (e.g. forms, buttons) that must not start a drag |
| `canDrag` | `(value: MovableBoxRect) => boolean` | - | Called before a drag starts; return `false` to reject the interaction without mutating the model |
| `canResize` | `(value: MovableBoxRect, handle: HandlePosition) => boolean` | - | Called before a resize starts; return `false` to reject the interaction without mutating the model |
| `resizable` | `boolean` | `true` | Enable resizing (preferred name) |
| `resizeable` | `boolean` | `true` | Deprecated alias of `resizable` for backward compatibility |
| `limitAreaForParent` | `boolean` | `true` | Limit to parent element |
| `limitAreaClass` | `string` | - | Custom constraint area CSS selector |
| `maxWidth` | `number \| string` | - | Maximum width |
| `maxHeight` | `number \| string` | - | Maximum height |
| `minWidth` | `number \| string` | `0` | Minimum width |
| `minHeight` | `number \| string` | `0` | Minimum height |
| `ratioLock` | `boolean` | `false` | Lock aspect ratio when resizing |
| `active` | `boolean` | `false` | Is active |
| `disabled` | `boolean` | `false` | Completely disabled |
| `disabledUserSelect` | `boolean` | `true` | Disable text selection while dragging |
| `initRect` | `boolean` | `false` | Read-only mode |
| `handles` | `HandlePosition[]` | all 8 | Visible resize handles |
| **Grid & Snap** | | | |
| `snapToGrid` | `boolean` | `false` | Snap to grid |
| `gridSize` | `number` | `20` | Grid size in the active coordinate unit |
| `snapToElements` | `boolean` | `false` | Snap to edges or centers in `snapTargets` |
| `snapThreshold` | `number` | `10` | Element snap threshold |
| `snapTargets` | `SnapTarget[]` | `[]` | Rectangles of other elements; exclude the current box |
| `snapFilter` | `(target, axis) => boolean` | `undefined` | Return false to exclude a target from snapping on `horizontal` / `vertical` |
| `snapPriority` | `('alignment' \| 'spacing')[]` | `['alignment','spacing']` | Strategy consultation order per axis; the first strategy with a candidate inside the threshold wins |
| `collisionEnabled` | `boolean` | `false` | Detect collisions against `snapTargets` |
| `allowOverlap` | `boolean` | `false` | Allow a colliding candidate to be committed |
| **Direction Control** | | | |
| `dragDirections` | `string[]` | `['top','bottom','left','right']` | Allowed drag directions |
| `resizeDirections` | `string[]` | all 8 | Allowed resize directions |
| **Bounds & Margin** | | | |
| `edgeDistance` | `number` | `0` | Shared inset on all sides |
| `boundsMargin` | `Object` | `{top:0,right:0,bottom:0,left:0}` | Per-side inset added to `edgeDistance` |
| **Interaction** | | | |
| `enableTransition` | `boolean` | `false` | Enable transition animation |
| `keyboardEnabled` | `boolean` | `false` | Enable keyboard control |
| `keyboardStep` | `number` | `1` | Step for arrow-key movement and Shift + arrow-key resizing |

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
  left: number | string
  top: number | string
  width: number | string
  height: number | string
  zIndex?: number
}
```

### Events

| Event | Parameters | Description |
|-------|------------|-------------|
| `update:modelValue` | `(value: MovableBoxRect)` | Emitted on v-model update |
| `drag-start` | `(event: PointerEvent, value: MovableBoxRect)` | Drag start |
| `drag` | `(value: MovableBoxRect)` | During drag (throttled) |
| `drag-stop` | `(event: PointerEvent, oldValue: MovableBoxRect, newValue: MovableBoxRect)` | Drag stop |
| `resize-start` | `(event: PointerEvent, value: MovableBoxRect)` | Resize start |
| `resize` | `(value: MovableBoxRect)` | During resize (throttled) |
| `resize-stop` | `(event: PointerEvent, oldValue: MovableBoxRect, newValue: MovableBoxRect)` | Resize stop |
| `drag-cancel` | `(event: Event \| null, oldValue: MovableBoxRect, newValue: MovableBoxRect)` | Drag cancelled (Escape, pointercancel, or `cancelInteraction()`); the rectangle is restored and `newValue` equals `oldValue`. `drag-stop` is not emitted |
| `resize-cancel` | `(event: Event \| null, oldValue: MovableBoxRect, newValue: MovableBoxRect)` | Resize cancelled; same semantics as `drag-cancel` |
| `active` | `(value: MovableBoxRect)` | Component activated |
| `inactive` | `(value: MovableBoxRect)` | Component deactivated |
| `disabled` | `(value: boolean)` | Disabled state changed |
| `dblclick` | `(event: MouseEvent)` | Double click |
| `out-of-bounds` | `(direction: 'left' \| 'top' \| 'right' \| 'bottom')` | Out of bounds |
| `move` | `(value: MovableBoxRect)` | Deprecated alias of `drag` for backward compatibility |
| `snap` | `(value: SnapEventPayload)` | Snap state, point, or target changed |
| `guides` | `(value: GuidesEventPayload)` | Snap target or guide coordinates changed |
| `collision` | `(value: CollisionEventPayload)` | Collision state, direction, or target changed |

Interactive changes are resolved in this order: direction filtering → grid snap → element snap → bounds → collision. Advanced events are emitted only when their state changes. Targets, grid size, thresholds, and insets use the coordinate unit selected by `unitType`; with `unitType="%"`, values are percentage points.

Forced aborts are not cancellations: setting `disabled` or `initRect`, or `active` becoming `false`, ends an in-progress interaction where it stands — the rectangle is not restored and no cancel events are emitted. Only the explicit cancellation paths (Escape, `pointercancel`, lost pointer capture, `cancelInteraction()`) restore the pre-interaction rectangle and emit `drag-cancel` / `resize-cancel`.

```ts
interface SnapEventPayload {
  snapped: boolean
  point?: SnapPoint // deprecated single-point alias
  points?: SnapPoint[]
  targetId?: string
  targetIds?: {
    horizontal?: string
    vertical?: string
  }
}

interface GuidesEventPayload {
  vertical: number[]
  horizontal: number[]
}

interface CollisionEventPayload {
  colliding: boolean
  direction?: 'left' | 'right' | 'top' | 'bottom'
  targetId?: string
}
```

For multi-axis snapping, `targetId` remains the primary backward-compatible target, while
`targetIds.horizontal` and `targetIds.vertical` identify the target selected on each axis.

### Keyboard & Accessibility

With `keyboardEnabled` enabled, the box and its resize handles are focusable via Tab and show a
focus outline using the theme color:

- Arrow keys move the box by `keyboardStep` (restricted by `dragDirections`).
- `Shift` + arrow keys resize, anchored at the bottom-right handle (or the first handle allowed by
  `resizeDirections`). Arrows indicate the direction the moved edge travels, so `Shift+→` /
  `Shift+↓` grow and `Shift+←` / `Shift+↑` shrink.
- When a resize handle is focused, arrow keys resize along that handle's axes (corner handles
  support both axes) and `Shift` inverts the direction. Edge handles expose `role="separator"`,
  orientation, current/minimum/maximum size, and keyboard shortcuts. Corner handles expose
  `role="group"` with a two-axis resize description. Every handle has a descriptive label.
- `Escape` cancels an in-progress drag or resize — the rectangle is restored to its
  pre-interaction state and `drag-cancel` / `resize-cancel` are emitted instead of
  `drag-stop` / `resize-stop`. When idle and the box is active, `Escape` deactivates it.

Without `keyboardEnabled`, handles stay unfocusable and arrow keys have no effect; `Escape` still
cancels in-progress pointer interactions.

Arrow keys pressed inside interactive slot content (such as buttons, links, and form controls)
remain owned by that control and do not move the box.

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

// Reset to the initial model
boxRef.value.reset()

// Activate
boxRef.value.activate()

// Deactivate
boxRef.value.deactivate()

// Cancel an in-progress drag/resize and restore the pre-interaction rectangle
boxRef.value.cancelInteraction()
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
    limit-area-class=".custom-area"
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

### Element Snap and Collision

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

Each item in `otherBoxes` contains `left`, `top`, `width`, `height`, and an optional `id`.
Alignment guides are rendered automatically. Touching edges are not a collision. With overlap
disabled, dragging or resizing keeps the last valid rectangle; an initially overlapping box may
only move when total overlap decreases. With multiple collisions, the largest overlap determines
`direction` and `targetId`. Enabling `allowOverlap` commits the candidate but still reports it.

#### Equal-Spacing Guides

When `snapToElements` is on and the box travels between two targets, it snaps to the position
where the gaps on both sides are equal. The `snap` payload then carries
`spacing: [{ axis, gap, targetIds, guides }]`, and a guide line is drawn at each anchor edge.
Set `:snap-priority="['alignment']"` to disable spacing, or
`:snap-priority="['spacing', 'alignment']"` to let equal spacing win when both strategies have a
candidate inside the threshold. `snapFilter` drops targets per axis — for example to skip locked
layers:

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

Snap resolution is deterministic: strategies are consulted in `snapPriority` order per axis, the
nearest candidate inside `snapThreshold` wins inside a strategy, and equal distances resolve by
`snapTargets` order.

### Rotation and Transform Origin

```vue
<MovableBox
  v-model="config"
  :rotate="45"
  transform-origin="center"
/>
```

`rotate` accepts degrees (clockwise, CSS `rotate()` semantics) and `transformOrigin` accepts any
CSS transform-origin (`'center'`, `'top left'`, `'50% 50%'`). Resizing under rotation maps
pointer and keyboard deltas into the box's local space (rotation by the inverse angle), so a
handle grows or shrinks along its rotated edge. The handle itself follows an incremental
local-space model rather than an exact inverse-kinematic anchor: with large rotations the handle
can drift slightly from the cursor while min/max, ratio lock, bounds, and collision constraints
stay exact.

Rotated geometry semantics (defined in 3.0.0):

- **Bounds clamping** keeps the axis-aligned bounding box (AABB) of the rotated rectangle inside
  the bounds area; `out-of-bounds` fires against the AABB as well. The AABB honors
  `transformOrigin`, so non-center origins clamp at their true visual position.
- **Element snapping** (alignment and equal spacing) evaluates the AABB; the resulting shift is
  applied 1:1 to the unrotated rectangle.
- **Collision** checks the AABB against the unrotated `snapTargets` rectangles.
- **Grid snapping** continues to align the unrotated top-left corner.
- Translation (pointer drag, keyboard move, group movement) is unaffected by rotation.
- Snap guides render inside the box element and rotate with it, so with `rotate != 0` the dashed
  guide lines may not sit exactly on the target edges.
- Rotation geometry assumes `px` units; with `%` units the AABB math operates in percentage space
  as an approximation.

Boxes with `rotate: 0` behave exactly as in 2.x; upgrade requires no action.

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
  :drag-directions="['left', 'right']"
/>

<!-- Show only horizontal resize handles -->
<MovableBox 
  v-model="config"
  :resize-directions="['ml', 'mr']"
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

### Group Selection and Movement

`MovableGroup` is a renderless wrapper that coordinates multiple `MovableBox` children. Dragging
one selected member moves the whole selection by the same offset; dragging an unselected member
replaces the selection. Give each member a stable `memberId`.

```vue
<script setup>
import { ref } from 'vue'
import { MovableBox, MovableGroup } from 'vue-movable-box'

const rects = ref({
  a: { left: 20, top: 20, width: 140, height: 90 },
  b: { left: 220, top: 70, width: 140, height: 90 }
})
const selected = ref(['a', 'b'])

const onMoveStop = (payload) => {
  // Immutable batch payload: apply the whole formation atomically.
  for (const record of payload.rects) {
    console.log(record.id, record.startRect, '->', record.rect)
  }
}
</script>

<template>
  <div class="canvas">
    <MovableGroup v-model:selected="selected" @move-stop="onMoveStop">
      <MovableBox
        v-for="(rect, id) in rects"
        :key="id"
        :member-id="id"
        v-model="rects[id]"
      />
    </MovableGroup>
  </div>
</template>
```

Group semantics:

- **Shared bounds** (default): the union of the selected rectangles is clamped to the bounds
  area, so the formation stops at the area edge together. Set `:shared-bounds="false"` to clamp
  every member individually.
- **Snapping and collision are evaluated for the leader only** — the box under the pointer.
  Group members neither snap to nor collide with each other, which keeps payloads deterministic.
- During a move every member emits its own `update:modelValue`; the group additionally emits
  `move-start` / `move` / `move-stop` with batch payloads (`{ leaderId, source, rects }`), and
  `move-cancel` restores the whole formation when the leader cancels.
- Forced aborts (e.g. `disabled` toggled mid-drag) end the session without restore, matching
  single-box semantics; the same applies when the leader unmounts mid-drag — other members keep
  their current position.
- A second concurrent pointer cannot hijack an active session: it drags its own box solo and the
  running formation is untouched.
- Exposed methods: `getSelected()`, `select(ids?)`, `getMemberRects()`.

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
- [Project Roadmap](ROADMAP.md)

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
