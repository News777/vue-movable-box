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
    <div class="content">Draggable Content Area</div>
  </MovableBox>
</template>
```

## Online Demo

```bash
# After cloning the project (Node.js 18+, pnpm 9)
corepack enable && corepack prepare pnpm@9 --activate   # or: npm install -g pnpm@9
pnpm install --frozen-lockfile
pnpm dev
```

Visit http://localhost:5173 for the interactive demo.

### Running the test suites locally

```bash
pnpm test            # unit tests (Vitest + jsdom)
pnpm type-check      # type check (vue-tsc)
pnpm build           # type check + library build into lib/
pnpm test:package    # tarball consumption check (run after pnpm build)
pnpm test:e2e        # browser e2e tests (Playwright)
```

The browser e2e suite needs the Playwright browsers installed once:

```bash
pnpm exec playwright install chromium firefox webkit
```

On Linux, append `--with-deps` (as CI does) so the required system libraries are installed too.

## API

### Props

| Prop                  | Type                                                         | Default                           | Description                                                                                                  |
| --------------------- | ------------------------------------------------------------ | --------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `v-model`             | `MovableBoxRect`                                             | required                          | Bind position and size                                                                                       |
| `theme`               | `string`                                                     | `#409EFD`                         | Theme color (active border)                                                                                  |
| `inActiveColor`       | `string`                                                     | `#666666`                         | Inactive border color                                                                                        |
| `unitType`            | `'px' \| '%'`                                                | `'px'`                            | Size unit type                                                                                               |
| `scale`               | `number \| string`                                           | `1`                               | Component scale ratio                                                                                        |
| `isKeepDecimals`      | `boolean`                                                    | `false`                           | Keep decimals in interaction-produced position, size, and rotation values                                   |
| `decimalPlaces`       | `number`                                                     | `2`                               | Decimal places retained for interaction-produced values when `isKeepDecimals` is enabled                    |
| `draggable`           | `boolean`                                                    | `true`                            | Enable dragging                                                                                              |
| `dragHandle`          | `string`                                                     | -                                 | CSS selector restricting where a drag can start; when set, only matching elements inside the box start drags |
| `dragCancel`          | `string`                                                     | -                                 | CSS selector for elements (e.g. forms, buttons) that must not start a drag                                   |
| `canDrag`             | `(value: MovableBoxRect) => boolean`                         | -                                 | Called before a drag starts; return `false` to reject the interaction without mutating the model             |
| `canResize`           | `(value: MovableBoxRect, handle: HandlePosition) => boolean` | -                                 | Called before a resize starts; return `false` to reject the interaction without mutating the model           |
| `canRotate`           | `(value: MovableBoxRect) => boolean`                         | -                                 | Called before a rotation starts; return `false` to reject the interaction without mutating the model        |
| `resizable`           | `boolean`                                                    | `true`                            | Enable resizing (preferred name)                                                                             |
| `resizeable`          | `boolean`                                                    | `true`                            | Deprecated alias of `resizable` for backward compatibility                                                   |
| `limitAreaForParent`  | `boolean`                                                    | `true`                            | Limit to parent element                                                                                      |
| `limitAreaClass`      | `string`                                                     | -                                 | Custom constraint area CSS selector                                                                          |
| `maxWidth`            | `number \| string`                                           | -                                 | Maximum width                                                                                                |
| `maxHeight`           | `number \| string`                                           | -                                 | Maximum height                                                                                               |
| `minWidth`            | `number \| string`                                           | `0`                               | Minimum width                                                                                                |
| `minHeight`           | `number \| string`                                           | `0`                               | Minimum height                                                                                               |
| `ratioLock`           | `boolean`                                                    | `false`                           | Lock aspect ratio when resizing                                                                              |
| `resizeMode`          | `'local-delta' \| 'fixed-anchor'`                            | `'local-delta'`                   | `'fixed-anchor'` pins the handle's opposite corner/edge midpoint at its rotated world position while resizing |
| `active`              | `boolean`                                                    | `false`                           | Is active                                                                                                    |
| `disabled`            | `boolean`                                                    | `false`                           | Completely disabled                                                                                          |
| `disabledUserSelect`  | `boolean`                                                    | `true`                            | Disable text selection while dragging                                                                        |
| `initRect`            | `boolean`                                                    | `false`                           | Read-only mode                                                                                               |
| `handles`             | `HandlePosition[]`                                           | all 8                             | Visible resize handles                                                                                       |
| `memberId`            | `string`                                                     | auto-generated                    | Stable identifier used inside `MovableGroup`                                                                 |
| `rotate`              | `number \| string`                                           | `0`                               | Clockwise rotation angle in degrees                                                                          |
| `rotatable`           | `boolean`                                                     | `false`                           | Show an interactive rotation handle while active                                                             |
| `rotationHandleOffset` | `number`                                                    | `28`                              | Non-negative screen-space distance in pixels from the box to the rotation handle                              |
| `transformOrigin`     | `string`                                                     | `center`                          | Transform-origin subset used consistently by CSS and geometry                                                |
| **Grid & Snap**       |                                                              |                                   |                                                                                                              |
| `snapToGrid`          | `boolean`                                                    | `false`                           | Snap to grid                                                                                                 |
| `gridSize`            | `number`                                                     | `20`                              | Grid size in the active coordinate unit                                                                      |
| `snapToElements`      | `boolean`                                                    | `false`                           | Snap to edges or centers in `snapTargets`                                                                    |
| `rotationSnapAngles`  | `number[]`                                                   | -                                 | Snap angles in degrees for rotation; off when omitted                                                      |
| `rotationSnapThreshold` | `number`                                                   | `10`                              | Snap distance in degrees for `rotationSnapAngles`                                                          |
| `collisionTargets`    | `SnapTarget[]`                                               | -                                 | Collision obstacles, separate from snapping. Defaults to `snapTargets`; `[]` disables collision obstacles   |
| `snapThreshold`       | `number`                                                     | `10`                              | Element snap threshold                                                                                       |
| `snapTargets`         | `SnapTarget[]`                                               | `[]`                              | Rectangles of other elements; inside a group, use `id: memberId` so member targets are excluded               |
| `snapFilter`          | `(target, axis) => boolean`                                  | `undefined`                       | Return false to exclude a target from snapping on `horizontal` / `vertical`                                  |
| `snapPriority`        | `('alignment' \| 'spacing')[]`                               | `['alignment','spacing']`         | Strategy consultation order per axis; the first strategy with a candidate inside the threshold wins          |
| `collisionEnabled`    | `boolean`                                                    | `false`                           | Detect collisions against `collisionTargets`, falling back to `snapTargets` when omitted                     |
| `collisionMode`       | `'precise' \| 'aabb'`                                        | `'precise'`                       | `'precise'` resolves against true rotated contours with continuous collision detection; `'aabb'` keeps the pre-3.2 behavior |
| `allowOverlap`        | `boolean`                                                    | `false`                           | Allow a colliding candidate to be committed                                                                  |
| **Direction Control** |                                                              |                                   |                                                                                                              |
| `dragDirections`      | `string[]`                                                   | `['top','bottom','left','right']` | Allowed drag directions                                                                                      |
| `resizeDirections`    | `string[]`                                                   | all 8                             | Allowed resize directions                                                                                    |
| **Bounds & Margin**   |                                                              |                                   |                                                                                                              |
| `edgeDistance`        | `number`                                                     | `0`                               | Shared inset on all sides                                                                                    |
| `boundsMargin`        | `Object`                                                     | `{top:0,right:0,bottom:0,left:0}` | Per-side inset added to `edgeDistance`                                                                       |
| **Interaction**       |                                                              |                                   |                                                                                                              |
| `enableTransition`    | `boolean`                                                    | `false`                           | Enable transition animation                                                                                  |
| `keyboardEnabled`     | `boolean`                                                    | `false`                           | Enable keyboard control                                                                                      |
| `keyboardStep`        | `number`                                                     | `1`                               | Step for arrow-key movement and Shift + arrow-key resizing                                                   |

#### HandlePosition Type

```ts
type HandlePosition = 'tl' | 'tm' | 'tr' | 'ml' | 'mr' | 'bl' | 'bm' | 'br';
// tl: top-left, tm: top-middle, tr: top-right
// ml: middle-left, mr: middle-right
// bl: bottom-left, bm: bottom-middle, br: bottom-right
```

#### MovableBoxRect Type

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

| Event               | Parameters                                                                   | Description                                                                                                                                              |
| ------------------- | ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `update:modelValue` | `(value: MovableBoxRect)`                                                    | Emitted on v-model update                                                                                                                                |
| `update:rotate`     | `(value: number)`                                                            | Emitted for `v-model:rotate` while rotating                                                                                                              |
| `drag-start`        | `(event: PointerEvent, value: MovableBoxRect)`                               | Drag start                                                                                                                                               |
| `drag`              | `(value: MovableBoxRect)`                                                    | During drag (throttled)                                                                                                                                  |
| `drag-stop`         | `(event: PointerEvent, oldValue: MovableBoxRect, newValue: MovableBoxRect)`  | Drag stop                                                                                                                                                |
| `resize-start`      | `(event: PointerEvent, value: MovableBoxRect)`                               | Resize start                                                                                                                                             |
| `resize`            | `(value: MovableBoxRect)`                                                    | During resize (throttled)                                                                                                                                |
| `resize-stop`       | `(event: PointerEvent, oldValue: MovableBoxRect, newValue: MovableBoxRect)`  | Resize stop                                                                                                                                              |
| `drag-cancel`       | `(event: Event \| null, oldValue: MovableBoxRect, newValue: MovableBoxRect)` | Drag cancelled (Escape, pointercancel, or `cancelInteraction()`); the rectangle is restored and `newValue` equals `oldValue`. `drag-stop` is not emitted |
| `resize-cancel`     | `(event: Event \| null, oldValue: MovableBoxRect, newValue: MovableBoxRect)` | Resize cancelled; same semantics as `drag-cancel`                                                                                                        |
| `rotate-start`      | `(event: Event, value: number)`                                              | Rotation handle interaction started                                                                                                                      |
| `rotate`            | `(value: number)`                                                            | Rotation angle changed (throttled for pointer input)                                                                                                     |
| `rotate-stop`       | `(event: Event, oldValue: number, newValue: number)`                         | Rotation handle interaction finished                                                                                                                     |
| `rotate-cancel`     | `(event: Event \| null, oldValue: number, newValue: number)`                 | Rotation cancelled; the angle is restored to `oldValue` and `rotate-stop` is not emitted                                                                  |
| `active`            | `(value: MovableBoxRect)`                                                    | Component activated                                                                                                                                      |
| `inactive`          | `(value: MovableBoxRect)`                                                    | Component deactivated                                                                                                                                    |
| `disabled`          | `(value: boolean)`                                                           | Disabled state changed                                                                                                                                   |
| `dblclick`          | `(event: MouseEvent)`                                                        | Double click                                                                                                                                             |
| `out-of-bounds`     | `(direction: 'left' \| 'top' \| 'right' \| 'bottom')`                        | Out of bounds                                                                                                                                            |
| `move`              | `(value: MovableBoxRect)`                                                    | Deprecated alias of `drag` for backward compatibility                                                                                                    |
| `snap`              | `(value: SnapEventPayload)`                                                  | Snap state, point, or target changed                                                                                                                     |
| `guides`            | `(value: GuidesEventPayload)`                                                | Snap target or guide coordinates changed                                                                                                                 |
| `collision`         | `(value: CollisionEventPayload)`                                             | Collision state, direction, or target changed                                                                                                            |

Interactive changes are resolved in this order: direction filtering → grid snap → element snap → bounds → collision. Advanced events are emitted only when their state changes. Targets, grid size, thresholds, and insets use the coordinate unit selected by `unitType`; with `unitType="%"`, values are percentage points.

Forced aborts are not cancellations: setting `disabled` or `initRect`, or `active` becoming `false`, ends an in-progress interaction where it stands — values are not restored and no cancel events are emitted. Only the explicit cancellation paths (Escape, `pointercancel`, lost pointer capture, `cancelInteraction()`) restore the pre-interaction value and emit `drag-cancel`, `resize-cancel`, or `rotate-cancel`.

```ts
interface SnapEventPayload {
  snapped: boolean;
  point?: SnapPoint; // deprecated single-point alias
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
  /** Unit normal in container pixel space pointing from the obstacle to the box (precise mode). */
  normal?: { x: number; y: number };
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
- When the rotation handle is focused, Left/Right rotate by `keyboardStep`, Shift uses a 10x
  step, and Home resets the angle to 0°.
- `Escape` cancels an in-progress drag, resize, or rotation — the previous value is restored and
  the matching cancel event is emitted instead of its stop event. When idle and the box is
  active, `Escape` deactivates it.

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
const boxRef = ref();

// Get current config
boxRef.value.getConfig();

// Set position
boxRef.value.setPosition(100, 100);

// Set size
boxRef.value.setSize(300, 200);

// Reset to the initial model
boxRef.value.reset();

// Activate
boxRef.value.activate();

// Deactivate
boxRef.value.deactivate();

// Cancel an in-progress drag/resize/rotation and restore its previous value
boxRef.value.cancelInteraction();
</script>
```

### Slots

| Slot      | Description            |
| --------- | ---------------------- |
| `default` | Component content area |

## Advanced Usage

### Custom Theme Color

```vue
<MovableBox v-model="config" theme="#ff6b6b" inActiveColor="#ccc" />
```

### Using Percentage Units

```vue
<MovableBox v-model="config" unit-type="%" :max-width="100" :max-height="100" />
```

### Lock Aspect Ratio

```vue
<MovableBox v-model="config" :ratio-lock="true" />
```

### Custom Resize Handles

```vue
<!-- Show only bottom-right handle -->
<MovableBox v-model="config" :handles="['br']" />

<!-- Show four corners only -->
<MovableBox v-model="config" :handles="['tl', 'tr', 'bl', 'br']" />
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
<MovableBox v-model="config" :snap-to-grid="true" :grid-size="20" />
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

Each item in `otherBoxes` contains `left`, `top`, `width`, `height`, an optional `id`, and —
since 3.2.0 — optional `rotate` and `transformOrigin` describing the target's true rotated
contour. Alignment guides are rendered automatically. Touching edges are not a collision. With
overlap disabled, dragging or resizing keeps the last valid rectangle; an initially overlapping
box may only move when total overlap decreases. With multiple collisions, the largest overlap
determines `direction`, `normal`, and `targetId`. Enabling `allowOverlap` commits the candidate
but still reports it.

Since 3.2.0, collisions default to `collisionMode="precise"`: both boxes participate with their
true rotated rectangles (position, size, angle, transform origin), translation uses continuous
collision detection along the whole motion segment (fast drags cannot tunnel through a target),
and drags blocked by a rotated edge keep sliding along that edge's tangent. Rotation and resize
paths are checked throughout the entire change, so a corner cannot sweep through an obstacle
mid-rotation. The payload's `normal` is the unit contact normal in container pixel space pointing
from the obstacle toward the box; `direction` maps onto the normal's main axis. Set
`collision-mode="aabb"` to restore the pre-3.2 axis-aligned approximation as a migration escape
hatch — in that mode targets' angles are ignored and `normal` is not reported.

> **Breaking change in 3.2.0:** precise collision is the default and supersedes the AABB
> approximation of earlier 3.x releases. Results differ wherever a rotated shape's true contour
> differs from its AABB. Use `collision-mode="aabb"` for the old behavior while migrating.

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
<MovableBox v-model="config" v-model:rotate="angle" rotatable transform-origin="center" />
```

`rotate` accepts degrees (clockwise, CSS `rotate()` semantics). `transformOrigin` accepts a CSS
transform-origin subset: valid one- or two-token positions using keywords (`left` / `center` / `right` /
`top` / `bottom`), percentages, or `px` lengths (e.g. `'center'`,
`'top left'`, `'50% 25%'`, `'10px 20px'`). Extra tokens and unparsable values such as
`calc()` are invalid and fall back to the center. Resizing under rotation maps pointer and
keyboard deltas into the box's local space (rotation by the inverse angle), so a handle grows or shrinks
along its rotated edge. The handle itself follows an incremental local-space model rather than
an exact inverse-kinematic anchor: with large rotations the on-screen handle displacement
differs from the pointer path, while min/max, ratio lock, bounds, and collision constraints
keep their documented meaning.

Set `rotatable` to show the rotation handle. Dragging it updates `v-model:rotate`; with
`keyboardEnabled`, focus the handle and use Left/Right to rotate by `keyboardStep`, Shift for a
10x step, or Home to reset to 0°. Pointer and keyboard rotation outputs follow
`isKeepDecimals`/`decimalPlaces`; configured snap angles are quantized the same way before they are
emitted. Parent-provided `rotate` values remain authoritative and are only normalized, so precision
settings take effect on the next interaction instead of causing a corrective prop update.

Rotated geometry semantics (defined in 3.0.0):

- **Bounds clamping** keeps the axis-aligned bounding box (AABB) of the rotated rectangle inside
  the bounds area; `out-of-bounds` fires against the AABB as well. The AABB honors
  `transformOrigin`, so non-center origins clamp at their true visual position. When a resize
  grows the AABB beyond the area, the rectangle is shrunk — edge handles shrink only their
  dragged axis, corner handles and `ratioLock` shrink uniformly along the drag ray — until its
  AABB fits, and is then clamped into position. minWidth/minHeight floors win over fitting;
  residual overflow is reported through `out-of-bounds`.
- **Element snapping** (alignment and equal spacing) evaluates the AABB; the resulting shift is
  applied 1:1 to the unrotated rectangle.
- **Collision** (default since 3.2.0, `collisionMode="precise"`) resolves against the true
  rotated contours of the box and of targets that declare `rotate` / `transformOrigin`, with
  continuous collision detection for translation and full-path checks for resize and rotation.
  `collisionMode="aabb"` keeps the previous approximation: the box's AABB against unrotated
  target rectangles.
- **Grid snapping** continues to align the unrotated top-left corner.
- Translation (pointer drag, keyboard move, group movement) is unaffected by rotation.
- Snap guides render in a presentation layer that counter-rotates against the box, so the
  dashed lines stay aligned with the container axes at the exact target positions even when
  the box is rotated (fixed in 3.2.0; they previously rotated with the box).
- With `unitType="%"`, geometry converts the rectangle and px transform origin to the parent's
  pixel space before converting results back to percentage points. Since 3.2.0, rotated resize
  deltas are also rotated in pixel space first and only then mapped onto the per-axis percentage
  units, so diagonal handle drags distribute width/height correctly.

Boxes with `rotate: 0` behave exactly as in 2.x; upgrade requires no action.

#### Resize Modes (3.3.0)

`resizeMode="local-delta"` (default) grows the box by the pointer's local-frame delta with the opposite edge anchored, matching pre-3.3 behavior. `resizeMode="fixed-anchor"` pins the handle's opposite corner (corner handles) or the opposite edge midpoint (edge handles) at its rotated world position and solves the size from the pointer position, so the anchor stays visually stable under rotation. Ratio lock, min/max sizes, bounds, snapping, and collision all keep their documented meaning in both modes.

#### Rotation Guards and Snapping (3.3.0)

`canRotate` mirrors `canDrag`/`canResize`: returning `false` rejects a pointer or keyboard rotation before activation, model mutation, or any event. `rotationSnapAngles` lists candidate angles in degrees; a candidate within `rotationSnapThreshold` degrees wins, and the snapped angle still passes bounds and collision constraints, so snapping cannot swing the box through an obstacle.

#### Separate Collision Targets (3.3.0)

`collisionTargets` configures obstacles independently of snapping. When omitted the snap targets act as obstacles; an explicit empty array disables collision obstacles while snapping keeps working.

`MovableGroup` accepts `groupCollision` (`'leader'` default, `'all'`): in `'all'` mode the shared group displacement shrinks to the earliest contact of any selected member with an external obstacle, while members stay mutually excluded. The leader's own collisions are resolved by its own interaction pipeline in both modes.

### Keyboard Control

```vue
<MovableBox v-model="config" :keyboard-enabled="true" :keyboard-step="5" />
<!-- 
  Arrow keys ↑↓←→ to move
  Escape to deactivate
-->
```

### Limit Drag/Resize Directions

```vue
<!-- Horizontal drag only, no vertical -->
<MovableBox v-model="config" :drag-directions="['left', 'right']" />

<!-- Show only horizontal resize handles -->
<MovableBox v-model="config" :resize-directions="['ml', 'mr']" />
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
<MovableBox v-model="config" :enable-transition="true" />
```

### Event Listeners Example

```vue
<script setup>
const handleDragStart = (e, value) => {
  console.log('Drag started', value);
};

const handleDragStop = (e, oldVal, newVal) => {
  console.log('Drag stopped', { old: oldVal, new: newVal });
};

const handleOutOfBounds = direction => {
  console.log('Out of bounds:', direction);
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

### Multiple Components Coordination

```vue
<script setup>
import { ref } from 'vue';

const boxes = ref([
  { id: 1, config: { left: 50, top: 50, width: 200, height: 150, zIndex: 1 } },
  { id: 2, config: { left: 300, top: 100, width: 200, height: 150, zIndex: 2 } }
]);

const activeId = ref(null);

const handleActive = (box, rect) => {
  // Update zIndex on activation
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

### Group Selection and Movement

`MovableGroup` is a renderless wrapper that coordinates multiple `MovableBox` children. Dragging
one selected member moves the whole selection by the same offset; dragging an unselected member
replaces the selection. Give each member a stable `memberId`.

While a group drag session is active, resize/rotate/keyboard gestures on the selected members are
refused instead of fighting the leader's per-frame updates (the leader's own keyboard is refused
too, by the ordinary "no keyboard during an interaction" rule), and a member that is already running
its own gesture stays out of a newly opened session. Imperative calls (`setPosition`, `setSize`,
`reset` via template refs) are not arbitrated: they are explicit programmatic writes and may be
overwritten by the leader's next frame during an active session. Changing a member's `memberId`
moves its registration in place: an active session role and the selection follow the same
instance to the new id. A `memberId` that another mounted member already owns is refused (the box
keeps its current identity and does not retry later; when two members mount with the same id the
second one falls back to an instance identity), so no member can silently take over another one's
registration.

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
  // Immutable batch payload: apply the whole formation atomically.
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
  single-box semantics; the same applies when the leader unmounts mid-drag (including a host
  teardown that unmounts the whole tree) — other members keep their current position. Both paths
  emit `move-cancel` with `source: null` so a `move-start` always gets a terminating event. Note
  that `source` is null whenever no DOM event was involved — the imperative `cancelInteraction()`
  on the leader also reports null while still restoring the formation — so the payload alone
  cannot tell a dissolve from a restore; dissolved records keep the last applied rectangle (equal
  to `startRect` only if nothing had moved yet), restored records always equal `startRect`.
- A selected member that is running its own resize/rotate when a session opens stays in the
  selection but is left out of that session's payloads (`rects` omit it).
- A second concurrent pointer cannot hijack an active session. An unselected member may drag
  solo; a member already in the active formation rejects the second interaction so the formation
  remains untouched.
- Group geometry uses each member's rotated visual AABB: shared bounds clamp the union of the
  members' visual contours, and with `sharedBounds: false` every member clamps against its own
  visual rectangle, so a rotated member never swings outside the area while the formation keeps
  its shape.
- Exposed methods: `getSelected()`, `select(ids?)`, `getMemberRects()`.

### Migration from v3.1.x

Upgrading from 3.1.x to 3.5.0 touches four areas. Boxes with `rotate: 0`, no
`collisionEnabled`, and no custom entry imports behave identically to 3.1.x.

1. **Precise collision is the default.** With `collisionEnabled`, collisions now resolve
   against the true rotated contours of both boxes, use continuous collision detection for
   drags, and report a `normal` in the `collision` payload. Snap/collision candidates that
   the old AABB approximation accepted or rejected may differ wherever a rotated shape's
   contour differs from its AABB. Set `collision-mode="aabb"` per box for the exact 3.1
   behavior while migrating.
2. **Package entries.** `require()`/`main` now resolve to a real CommonJS bundle
   (`lib/vue-movable-box.cjs`); `import`/`module` still resolve to
   `lib/vue-movable-box.es.js`, and the UMD file address `lib/vue-movable-box.umd.js` is
   unchanged. CDN consumers should use the `unpkg`/`jsdelivr` fields.
3. **Browser global install.** The UMD bundle no longer auto-installs via
   `window.Vue.use(...)` (Vue 3 global builds have no `Vue.use`). Register explicitly:
   `Vue.createApp({ ... }).use(VueMovableBox)`.
4. **Version export.** The default export's `version` now mirrors `package.json` exactly
   (3.1.0 shipped `version: '3.0.0'`); the named exports `version` and `install` were
   added in 3.2.0.

## TypeScript

Full TypeScript type support:

```ts
import {
  MovableBox,
  type MovableBoxProps,
  type MovableBoxRect,
  type ExtendsMovableBox,
  type HandlesSet
} from 'vue-movable-box';

// Use types
const config: MovableBoxRect = {
  left: 100,
  top: 100,
  width: 200,
  height: 150,
  zIndex: 1
};
```

## Browser Support

| Browser        | Minimum Version |
| -------------- | --------------- |
| Chrome         | >= 88           |
| Firefox        | >= 85           |
| Safari         | >= 14           |
| Edge           | >= 88           |
| iOS Safari     | >= 14           |
| Android Chrome | >= 88           |

## Project Structure

```
vue-movable-box/
├── src/
│   ├── index.ts                 # Entry file
│   ├── types/
│   │   └── MovableBox.ts        # Type definitions
│   └── components/
│       └── MovableBox/
│           ├── MovableBox.vue   # Main component and scoped styles
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
