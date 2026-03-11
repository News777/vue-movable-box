# 贡献指南

欢迎为 VueAutoDraggable 贡献代码！

## 开发环境

### 前置要求
- Node.js >= 18.0.0
- pnpm >= 9.0.0

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
pnpm dev
```

### 构建

```bash
pnpm build
```

## 代码规范

### TypeScript
- 使用严格的 TypeScript 配置
- 避免使用 `any` 类型
- 为所有公共 API 添加类型定义

### Vue 组件
- 使用 `<script setup lang="ts">` 语法
- 为所有 props 和 emits 添加类型定义
- 使用 `defineExpose` 暴露组件方法

### 样式
- 使用 SCSS 预处理器
- 遵循 BEM 命名规范
- 确保响应式和 RTL 支持

### Git 提交

我们使用 Conventional Commits 规范：

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

类型 (type)：
- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建/工具

示例：
```
feat(touch): 添加移动端触摸支持

- 支持 touchstart/touchmove/touchend 事件
- 修复移动端滚动问题

Closes #123
```

## 测试

确保提交前运行：

```bash
pnpm type-check
pnpm build
```

## 文档

- 更新 README.md 中的 API 文档
- 为新功能添加使用示例
- 更新 CHANGELOG.md

## 发布

项目使用手动发布，请更新版本号：
1. 修改 `package.json` 中的 version
2. 更新 CHANGELOG.md
3. 创建 Git tag

---

感谢您的贡献！ 🎉
