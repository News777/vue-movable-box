# VueMovableBox 更新日志

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.5-beta.1] - 2026-03-10

### Added
- **Project Rename**: 项目重命名为 vue-movable-box
- **Performance Optimization**: 全面优化拖拽性能
  - 使用 requestAnimationFrame 批量处理更新
  - 添加硬件加速 (transform: translateZ(0))
  - 添加 will-change 提示浏览器优化
  - 禁用 transition 避免拖动时卡顿

### Improved
- **Code Structure**: 规范化项目目录结构
  - src/ - 源代码
  - examples/ - 示例代码
  - src/types/ - 类型定义
  - src/components/MovableBox/ - 组件文件
- **NPM Publishing**: 完善 npm 发布配置
  - 添加 LICENSE 文件
  - 优化 package.json exports
  - 添加 TypeScript 类型声明生成
- **Event Emit Optimization**: 优化事件触发频率
  - 移除拖动过程中的 deepClone 调用
  - 使用浅拷贝替代
  - move/resize 事件使用 RAF 节流

### Fixed
- **Activation Bug**: 修复点击无法激活的问题
- **Ratio Lock**: 修复锁定宽高比无效的问题
- **Decimal Places**: 修复保留小数设置不生效的问题
- **Decimal Toggle**: 修复取消保留小數后现有值未取整的问题

---

## [1.1.4] - 2026-03-10

### Known Issues
- 性能存在卡顿问题
- 项目结构需要优化
