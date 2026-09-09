# VueMovableBox 更新日志

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.0.0] - 2026-09-09

> 主要版本：集中收敛几何模型语义变更（见下方旋转语义）。`rotate` 保持 0 的消费者行为与 2.2.0 完全一致，升级无需改动。

### Added
- 新增 `rotate` 属性（顺时针角度，等同 CSS `rotate()`）与 `transformOrigin` 属性（任意 CSS transform-origin），支持方框旋转与变换原点控制
- 旋转下的缩放映射：指针缩放位移自动映射到方框本地坐标系，缩放手柄跟随旋转后的边缘；键盘方向键沿旋转后的手柄轴向缩放
- 新增 `rotate` / `deltaToLocal` / `normalizeAngle` 几何工具（内部使用，含 5 项单元测试）
- `examples` 演示新增"旋转"滑块，实时写入选中方框的自定义 `rotate` 字段并驱动组件

### Changed
- 旋转方框（`rotate ≠ 0`）的几何语义（本次主要版本收敛的破坏性变更）：
  - 边界约束与 `out-of-bounds` 按旋转矩形的轴对齐包围盒（AABB）判定，AABB 计入 `transformOrigin` 偏移，非 center 原点按真实视觉位置钳制
  - 元素吸附（对齐与等间距）在 AABB 上求值，位移 1:1 映射回未旋转矩形并做像素取整
  - 碰撞检测以 AABB 与未旋转 `snapTargets` 求交
  - 网格吸附继续对齐未旋转左上角；平移（拖拽/键盘/组合移动）不受旋转影响
  - 旋转缩放语义：指针与键盘位移映射到本地坐标系后增量缩放（非逆运动学锚定），旋转下缩放结果额外做 AABB 边界钳制
  - 旋转几何假定 `px` 单位，`%` 单位下按百分比空间近似

### Fixed
- `MovableGroup` 的 `sharedBounds=false` 现按文档语义对每个成员以自身矩形独立钳制（此前成员跟随引导方框整体位移、可能被推出自身边界）
- `MovableGroup` 增加会话并发防护：第二个并发指针无法抢占进行中的组合会话，只单独拖动自己的方框
- 旋转缩放在 AABB 超出区域尺寸时按比例收缩到能放入区域的最大尺寸（此前仅平移钳制、无法阻止视觉溢出），指针与键盘路径均生效
- `transformOrigin` 的几何解析支持一到两个关键字/百分比/px token（多余 token 忽略），与探针计算保持一致
- 吸附、碰撞与边界钳制的探针位移回写统一做像素取整，避免旋转映射产生亚像素 left/top
- `memberId` 传入空字符串时回退为自动生成的成员标识，避免组内成员互相覆盖
- `scripts/perf-bench.mjs` 丢弃帧测量首帧（rAF 调度间隔），基准数据更准确

## [2.2.0] - 2026-09-09

### Added
- 等间距吸附辅助线：`snapToElements` 开启时，方框移动到两个目标之间会自动吸附到两侧间距相等的位置，`snap` 事件载荷新增 `spacing: [{ axis, gap, targetIds, guides }]`，并在两个锚点边缘绘制辅助线
- 新增 `snapFilter` 属性：按轴过滤吸附目标（返回 false 即排除），不影响碰撞检测
- 新增 `snapPriority` 属性：配置每根轴的吸附策略咨询顺序（`'alignment' | 'spacing'`，默认 alignment 优先），设为 `['alignment']` 可关闭等间距吸附
- 吸附解析确定性规则：每根轴按 `snapPriority` 顺序咨询策略，策略内取阈值内最近候选，距离相等时按 `snapTargets` 数组顺序取胜；等间距配对按目标数组顺序（前锚 × 后锚）确定性遍历

### Changed
- `snapToElements` 开启时等间距吸附默认参与解析（此前仅有对齐吸附）；需要旧行为的消费者可设置 `snap-priority` 为 `['alignment']`

## [2.1.0] - 2026-09-09

### Added
- 新增 `MovableGroup` 无渲染组合组件（含 `MovableGroupProps` / `MovableGroupExpose` 与 `move-start` / `move` / `move-stop` / `move-cancel` 批量事件类型）：拖拽选中成员带动整个选中组合按相同偏移移动，拖拽未选中成员自动切换选中；`v-model:selected` 支持受控选中
- 组合共享边界（`sharedBounds`，默认开启）：以选中矩形并集约束在边界区域内，整个组合一起停在区域边缘；关闭后按成员各自约束
- 确定的组合吸附/碰撞语义：吸附与碰撞仅对引导方框（指针下的方框）求值，组合成员之间互不吸附、互不碰撞
- 不可变批量更新：`move-stop` 载荷包含每个成员的 `rect` 与 `startRect`；引导方框取消时 `move-cancel` 将整个组合还原到交互前矩形，强制中止则与单方框语义一致（不还原）
- `MovableBox` 新增 `memberId` 属性用于组合内标识（缺省自动生成）；未包裹在 `MovableGroup` 内时行为与此前完全一致
- `MovableGroup` 暴露 `getSelected()` / `select(ids?)` / `getMemberRects()` 方法
- `examples` 演示新增多选组合画布；新增 `scripts/perf-bench.mjs`（`pnpm bench`）性能基准，覆盖 100 / 500 / 1000 方框的单框拖拽与全组合移动场景

## [2.0.0] - 2026-09-09

> 正式版本：Pointer Events 迁移、触摸/触控笔兼容性及消费者升级路径已按预发布计划验证完毕。功能范围与 [2.0.0-beta.1] 一致。

## [2.0.0-beta.1] - 2026-08-31

> 预发布版本：用于验证 Pointer Events 迁移、触摸/触控笔兼容性及现有消费者升级。

### Added
- 使用 Pointer Events 统一鼠标、触摸和触控笔交互：单一 `pointerdown` 入口，按 `pointerId` 过滤多指触控，并借助 `setPointerCapture` 与 `lostpointercapture` 保证指针离开窗口后交互不残留监听器
- 新增 `dragHandle` 与 `dragCancel` 属性，可配置拖拽触发区域与排除区域，避免方框内的表单、按钮等内容误触发拖拽；无效选择器按"禁止拖拽"处理而不是抛错
- 新增键盘调整尺寸：`Shift` + 方向键以右下角手柄（或 `resizeDirections` 中第一个允许的手柄）为锚点缩放；聚焦某个缩放手柄后，方向键沿该手柄轴向缩放、`Shift` 反向，复用 `resizeFromHandle`，最小/最大尺寸、比例锁定、边界与碰撞约束继续生效
- 边缘缩放手柄新增 `role="separator"`、方向、当前/最小/最大尺寸与快捷键语义；角落手柄使用 `role="group"` 和双轴缩放描述，所有手柄均提供可访问名称；`keyboardEnabled` 开启时手柄可聚焦，并为方框与手柄增加跟随主题色的 `:focus-visible` 焦点轮廓
- 新增显式取消交互：指针交互进行中按 `Escape`（无需开启 `keyboardEnabled`）、`pointercancel`、丢失指针捕获或调用新增公开方法 `cancelInteraction()`，都会恢复交互前矩形并触发新事件 `drag-cancel` / `resize-cancel`（载荷为 `(source, oldValue, newValue)`，`newValue` 等于 `oldValue`，且不触发 `drag-stop` / `resize-stop`）
- 新增 `canDrag` / `canResize` 前置守卫：交互开始前以当前矩形（及手柄）调用，返回 `false` 即拒绝本次交互——不激活、不发事件、不挂监听、不修改模型
- `examples` 演示新增拖拽把手/排除区、交互守卫、取消交互按钮与键盘提示
- 组件测试迁移为 PointerEvent 模拟并扩充覆盖拖拽触发/排除区域、键盘缩放、手柄无障碍、取消还原、前置守卫、多指过滤与卸载清理；新增 Playwright 浏览器测试，验证原生指针捕获、触摸取消、触控笔、键盘焦点与 RTL 物理边缘行为

### Changed
- 拖拽与缩放事件（`drag-start` / `drag-stop` / `resize-start` / `resize-stop`）的 `source` 参数类型由 `MouseEvent | TouchEvent` 收窄为 `PointerEvent`；`PointerEvent` 继承自 `MouseEvent`，仅影响显式注解为 `TouchEvent` 的回调
- `pointercancel` 由"按正常结束处理"改为"按取消处理"：恢复交互前矩形并触发 `drag-cancel` / `resize-cancel`
- 指针拖拽或缩放进行中时，键盘事件不再介入移动方框，仅 `Escape` 取消生效
- 未激活方框可通过键盘焦点激活；交互式插槽内容中的方向键不再冒泡触发方框移动
- 仅主指针的左键可以开始拖拽或缩放，右键、中键及非主触点不会激活组件或启动交互
- `disabled` / `initRect` / `active` 等属性强制中止交互时保持原有行为（不还原矩形），与显式取消的"还原"语义区分

## [1.1.7] - 2026-08-20

### Changed
- 更新发布版本为 `1.1.7`
- 将主组件样式改为原生 CSS，避免发布构建依赖 Sass 编译

### Fixed
- 将网格、键盘、元素吸附和碰撞能力接入统一交互流程，修复此前仅声明参数但未生效的问题
- 修复直接修改 `modelValue`、方向限制仅对键盘生效、边界间距计算不一致和触摸最后一帧丢失问题
- 修复碰撞阻止整帧回退导致组件在目标边缘前残留 1–2px 间隙的问题
- 修复元素贴合后因指针轻微斜向抖动而难以沿碰撞边缘滑动的问题
- 修复快速拖拽或大步长键盘移动可穿过碰撞目标的问题
- 修复斜向快速拖拽穿透目标及扫掠碰撞方向错误的问题
- 修复吸附坐标变化漏发事件及单轴碰撞错误清空另一轴辅助线的问题
- 修复交互过程中切换禁用/只读状态后仍继续移动，以及零高度比例锁定产生非有限尺寸的问题
- 修复发布包缺少 Vue 组件声明文件的问题

### Added
- 增加元素对齐辅助线、状态化吸附事件、拖拽/缩放碰撞阻止以及初始重叠逃逸行为
- 扩充到 58 项组件、工具和公共类型测试，覆盖触摸、键盘、百分比单位、边界、吸附、碰撞、公开方法和兼容别名
- 新增项目路线图，明确交互基础、多选、增强吸附与变换模型的演进方向和验收原则

---

## [1.1.6] - 2026-08-19

### Changed
- 调整发布版本为 `1.1.6`
- 统一版本声明与包信息，确保发布内容与源码一致

### Fixed
- 统一了公开 API：`resizable` 为首选名称，`resizeable` 仍保留兼容别名
- 修正类型和示例代码中的数值计算问题，避免字符串/数字混用导致的 TS 报错
- 清理了 sass 相关 warning，并移除无用的 Sass 依赖
- 调整了构建输出和文档状态，保证发布包与源码一致

### Added
- 加入 Vitest + Vue Test Utils 的真实交互测试，覆盖拖拽与缩放基础行为
- 增加基础发布前校验脚本，确保 `test` + `build` 运行顺序清晰

---

## [1.1.5-beta.3] - 2026-03-10

### Added
- **代码重构**: 模块化拆分，更好的可维护性
  - `utils/snap.ts` - 对齐吸附逻辑
  - `utils/collision.ts` - 碰撞检测逻辑
  - `composables/useKeyboard.ts` - 键盘控制
  - `composables/useGrid.ts` - 网格吸附
  - `composables/useSnap.ts` - 对齐吸附 composable
  - `composables/useCollision.ts` - 碰撞检测 composable
  - `types.ts` - 类型定义独立文件

### New Features
- **对齐吸附**: 拖拽时自动对齐到其他元素边缘
  - `snapToElements` - 启用对齐
  - `snapThreshold` - 吸附阈值
  - `snapTargets` - 对齐目标元素
  - `@snap` 事件 - 吸附时触发
  - `@guides` 事件 - 辅助线数据

- **碰撞检测**: 防止元素重叠
  - `collisionEnabled` - 启用碰撞检测
  - `allowOverlap` - 允许重叠
  - `@collision` 事件 - 碰撞时触发

---

## [1.1.5-beta.2] - 2026-03-10

### Added
- **网格吸附**: 新增 `snapToGrid` 和 `gridSize` 属性，支持拖拽时自动吸附到网格
- **方向控制**: 新增 `dragDirections` 和 `resizeDirections` 属性，可限制拖拽/调整方向
- **边界边距**: 新增 `edgeDistance` 和 `boundsMargin` 属性，更灵活控制边界
- **键盘支持**: 新增 `keyboardEnabled` 和 `keyboardStep` 属性，支持键盘方向键移动
- **过渡动画**: 新增 `enableTransition` 属性，支持平滑过渡动画
- **GitHub Actions CI**: 自动构建和发布工作流
- **CSS 变量**: 支持通过 CSS 变量自定义主题

### Improved
- **性能优化**: 使用 requestAnimationFrame 批量处理更新，硬件加速
- **代码结构**: 规范化项目目录结构
- **文档完善**: 完整的 API 文档和使用示例

### Fixed
- **Activation Bug**: 修复点击无法激活的问题
- **Ratio Lock**: 修复锁定宽高比无效的问题
- **TypeScript**: 完善的类型定义支持

---

## [1.1.5-beta.1] - 2026-03-10
