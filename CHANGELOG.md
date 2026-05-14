# 更新记录

## v1.1.0 (2025-05-14)

### 🏗️ 架构重构

- **数据层分离**：`utils/api.js` 拆分为 `repository/`（纯 localStorage 读写）+ `services/`（业务逻辑）
- **状态规范化**：`conversations` 和 `settings` 纳入 AppContext，React state 作为唯一数据源
- **消除 eslint-disable**：所有 `useMemo` 依赖正确声明，不再需要 hack
- **Context 性能优化**：`value` 用 `useMemo` 包装，所有操作函数 `useCallback` 稳定引用
- **派生 agentMap**：列表查找从 O(n) `find()` 变为 O(1) `Map.get()`
- **常量统一**：`STATUS_LABELS` / `MODEL_PRESETS` 等提取到 `src/constants/`，不再各处重复

### 🚀 新功能

- **多协议支持**：OpenAI 兼容 / Anthropic 原生 / Azure OpenAI 三种协议
- **协议适配器架构**：`services/llm/adapters/`，新增协议只需加一个 adapter 文件
- **完整 API 配置字段**：protocol、baseUrl、apiKey、organizationId、apiVersion、customHeaders、timeoutMs、stream
- **流式响应（Streaming）**：SSE 解析 + Chat 逐字渲染 + 停止按钮
- **连接测试按钮**：Settings 和 AgentForm 都可一键测试，返回延迟或错误信息
- **超时可配置**：全局和 Agent 级别均可设置超时毫秒数
- **自定义请求头**：支持添加任意 key-value Header（代理认证等场景）
- **Agent 专属 API 开关**：`useCustomApi` 明确"继承全局 / 使用专属"语义
- **ErrorBoundary**：顶层错误边界，子组件异常不再白屏
- **404 路由**：未匹配路径显示友好提示
- **API Key 安全提示**：Settings 页面显眼警告 + 显示/隐藏切换
- **Chat 增强**：协议标签、流式标签、模拟模式提示、停止生成按钮

### 🔧 改进

- **LLM 调用加 AbortController**：切换页面/卸载组件自动取消请求
- **真实接口超时保护**：默认 60s，可配置
- **ApiConfigFields 复用组件**：Settings 和 AgentForm 共用，保持一致
- **旧数据兼容**：repository 加载时自动补齐新增字段，老用户无缝升级
- **README 更新**：与实际目录结构一致，补充架构说明

### 📁 目录结构变更

```
新增：
  src/repository/          数据访问层
  src/services/            业务逻辑层（LLM 调用、stats 派生）
  src/services/llm/adapters/  协议适配器
  src/constants/           业务常量
  src/components/ErrorBoundary.jsx
  src/components/ApiConfigFields.jsx
  src/components/TestConnectionButton.jsx
  src/pages/NotFound.jsx
  CHANGELOG.md

删除：
  src/utils/               已拆分到 repository + services
```

---

## v1.0.0 (初始版本)

- React 18 + React Router v7 基础架构
- Agent CRUD 管理
- 任务管理
- 模拟 LLM 对话
- localStorage 持久化
- BEM CSS 命名规范
