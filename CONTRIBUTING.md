# 贡献指南

欢迎为 VueMovableBox 贡献代码！

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

访问 http://localhost:5173 查看演示。

### 构建

```bash
# 构建并检查类型
pnpm build

# 仅类型检查
pnpm type-check

# 仅构建
pnpm build-only
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
- 遵循组件样式最佳实践
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
- `perf`: 性能优化
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
# 类型检查
pnpm type-check

# 构建
pnpm build
```

## 文档

- 更新 README.md 中的 API 文档
- 为新功能添加使用示例
- 更新 CHANGELOG.md

## 发布流程

1. 更新版本号（package.json）
2. 更新 CHANGELOG.md
3. 构建: `pnpm build`
4. 发布到 npm:
   ```bash
   npm publish --tag beta  # 测试版
   npm publish              # 正式版
   ```

---

感谢您的贡献！ 🎉
