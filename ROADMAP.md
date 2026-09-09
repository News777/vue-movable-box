# VueMovableBox Roadmap / 项目规划

This roadmap describes the intended development direction. Version contents may be adjusted based
on implementation findings and user feedback; completed work is recorded in `CHANGELOG.md`.

本规划用于说明项目的预期演进方向。具体版本内容可根据实现验证和用户反馈调整；已经完成的改动以
`CHANGELOG.md` 为准。

## 2.0.0 — Interaction foundation / 交互基础能力

The next release focuses on consistent input behavior and accessibility before expanding the
geometry model.

下一版本优先完善输入一致性和可访问性，为后续多选、组合与旋转能力打好基础。

### Planned scope / 计划范围

- Replace separate mouse and touch interaction paths with Pointer Events.
  使用 Pointer Events 统一鼠标、触摸和触控笔交互。
- Use pointer capture and handle `pointercancel` and lost capture without leaving stale listeners or
  interaction state.
  使用指针捕获，并正确处理取消和捕获丢失，避免残留监听器或交互状态。
- Add configurable drag handles and cancellation areas so interactive content inside a box does not
  start a drag unintentionally.
  增加可配置的拖拽触发区域和排除区域，避免方框内的表单、按钮等内容误触发拖拽。
- Add keyboard resizing, visible focus states, and accessible semantics for resize handles.
  支持键盘调整尺寸、清晰的焦点样式以及调整手柄的无障碍语义。
- Add an explicit interaction cancellation path that restores the pre-interaction rectangle and
  distinguishes cancellation from successful completion.
  增加显式取消交互能力，恢复交互前的矩形，并区分取消与正常完成。
- Add lifecycle guards for drag and resize so applications can reject an interaction before it
  starts without mutating the model.
  增加拖拽与缩放的前置守卫，允许业务在不修改模型的情况下拒绝交互。

### Acceptance criteria / 验收标准

- Existing mouse, touch, grid, snapping, collision, bounds, percentage-unit, and compatibility
  behavior remains covered by regression tests.
  现有鼠标、触摸、网格、吸附、碰撞、边界、百分比单位和兼容行为均有回归测试保护。
- Pointer, keyboard, cancellation, and focus behavior have observable component tests.
  指针、键盘、取消和焦点行为均具备可观察的组件测试。
- Public props, events, exposed methods, README examples, and declarations remain fully typed.
  公开属性、事件、暴露方法、README 示例和声明文件保持完整类型支持。
- `pnpm test`, `pnpm type-check`, and `pnpm build` pass before release.
  发布前通过 `pnpm test`、`pnpm type-check` 和 `pnpm build`。

### Not included / 暂不纳入

Multi-selection, group transforms, and rotation are intentionally deferred so the input refactor
does not also change the component's geometry model.

多选、组合变换和旋转暂不纳入本版本，避免输入层重构与几何模型改造同时进行。

## 2.1.0 — Selection and groups / 多选与组合

> Shipped in v2.1.0 (2026-09-09) via the renderless `MovableGroup` component; see `CHANGELOG.md`.
> Performance baseline recorded with `pnpm bench` (desktop Chromium, 2026-09-09): dragging a
> single box among 1,000 stays at ~60 fps; moving a fully-selected 1,000-member formation commits
> every member per frame and averages ~60 ms/frame — batched DOM writes (transform-based group
> rendering) remain future work for the spatial-index decision.

- Introduce a separate `MovableGroup` or scene-level controller instead of adding group ownership to
  each `MovableBox`.
  通过独立的 `MovableGroup` 或场景控制器实现多选，避免让单个 `MovableBox` 承担组管理职责。
- Support group movement, shared bounds, activation, and immutable batch updates.
  支持组合移动、共享边界、激活状态以及不可变批量更新。
- Define deterministic snapping and collision behavior between groups and individual boxes.
  明确组合与单个方框之间可预测的吸附和碰撞规则。
- Add performance scenarios for 100, 500, and 1,000 boxes before selecting a spatial-index strategy.
  在选择空间索引方案前，建立 100、500 和 1,000 个方框的性能基准。

## 2.2.0 — Advanced snapping / 增强吸附

> Shipped in v2.2.0 (2026-09-09): equal-spacing guides with the `spacing` snap payload,
> per-axis `snapFilter`, and deterministic `snapPriority` strategy ordering; see `CHANGELOG.md`.

- Support equal-spacing guides and configurable snap strategies.
  支持等间距辅助线和可配置吸附策略。
- Allow applications to filter or prioritize snap targets without rebuilding component internals.
  允许业务过滤目标或调整目标优先级，而无需改动组件内部实现。
- Keep guide and snap event payloads deterministic when multiple targets compete.
  多个目标竞争时，保持辅助线与吸附事件载荷稳定、可预测。

## 3.0.0 — Transform model / 变换模型

> Shipped in v3.0.0 (2026-09-09): `rotate` and `transformOrigin` props with AABB-based bounds,
> snapping, and collision semantics for rotated boxes; see `CHANGELOG.md`.

- Add rotation and transform-origin support.
  增加旋转和变换原点支持。
- Replace axis-aligned-only geometry where necessary and define rotated bounds, snapping, and
  collision semantics.
  在必要位置升级仅支持轴对齐矩形的几何模型，并定义旋转后的边界、吸附和碰撞语义。
- Use the major version to contain any unavoidable breaking changes to public geometry or event
  payloads.
  将不可避免的公开几何结构或事件载荷破坏性变更集中到主版本中。

## Planning principles / 规划原则

- Minor releases preserve existing public behavior unless a change is explicitly deprecated first.
  次版本保持现有公开行为，除非相关能力已经明确进入弃用流程。
- Behavior changes require colocated tests and corresponding public documentation updates.
  行为改动必须同时提供就近测试并更新公开文档。
- Generated files under `lib/` are updated through the production build, never by hand.
  `lib/` 下的生成文件只通过生产构建更新，不手工修改。
- Performance work starts with reproducible measurements rather than assumptions.
  性能优化以可复现测量为起点，不凭假设决定实现。
