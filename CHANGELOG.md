# VueMovableBox 更新日志

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

### Known Issues
- 缺少网格吸附功能
- 缺少键盘支持

