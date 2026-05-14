# Agent SaaS Optimized

基于 React 18 的多 Agent 管理前端平台，支持模块化组件和可扩展多 Agent 界面。

## 技术栈

- React 18 (Hooks)
- React Router v7
- Context API
- localStorage 持久化
- ESLint + Prettier

## 快速开始

```bash
npm install
npm start
```

## 可用脚本

| 命令 | 说明 |
|------|------|
| `npm start` | 启动开发服务器 |
| `npm run build` | 生产构建 |
| `npm test` | 运行测试 |
| `npm run lint` | ESLint 检查 |
| `npm run format` | Prettier 格式化 |

## 项目结构

```
agent-saas-optimized/
├── public/
│   └── index.html
├── src/
│   ├── index.jsx                # 入口
│   ├── App.jsx                  # 根组件 + 路由
│   ├── App.css                  # 全局样式
│   ├── components/              # 通用组件
│   │   ├── Layout.jsx
│   │   ├── Sidebar.jsx
│   │   ├── StatCard.jsx
│   │   └── ErrorBoundary.jsx
│   ├── pages/                   # 页面组件
│   │   ├── Dashboard.jsx
│   │   ├── AgentList.jsx
│   │   ├── AgentDetail.jsx
│   │   ├── AgentForm.jsx
│   │   ├── Chat.jsx
│   │   ├── TaskList.jsx
│   │   ├── TaskForm.jsx
│   │   ├── Settings.jsx
│   │   └── NotFound.jsx
│   ├── context/
│   │   └── AppContext.jsx       # 全局状态（agents/tasks/conversations/settings）
│   ├── repository/              # 数据访问层（localStorage）
│   │   ├── index.js             # 加载快照、持久化接口
│   │   ├── storage.js           # 底层封装
│   │   └── defaults.js          # 初始数据
│   ├── services/                # 业务逻辑层
│   │   ├── stats.js             # 派生统计指标
│   │   └── llm/
│   │       ├── index.js         # LLM 统一入口
│   │       ├── realLlm.js       # OpenAI 兼容真实接口
│   │       └── mockLlm.js       # 无 API 时的模拟响应
│   └── constants/               # 业务常量与映射
│       ├── agent.js
│       └── task.js
├── .eslintrc.json
├── .prettierrc
└── package.json
```

## 架构说明

### 数据流

```
localStorage  ←→  repository/  ←→  AppContext  ←→  pages/components
                                       │
                                services/  (LLM 调用、stats 派生)
```

- **repository**：纯 storage 读写，不含业务逻辑
- **AppContext**：单一数据源，启动时 `loadSnapshot()` 一次性加载，state 变更后自动写回 localStorage
- **services**：基于 Context state 派生数据或调用外部接口
- **pages**：通过 `useApp()` 消费状态，不直接访问 localStorage

### 状态管理要点

- `AppContext` 的 value 用 `useMemo` 包装，避免无谓重渲染
- 派生 `agentMap`（id → agent），列表中查找避免 O(n) `find()`
- 所有 mutation 操作返回闭包稳定函数（`useCallback`），允许子组件 memo 化

### LLM 调用

- 有 `apiBaseUrl` + `apiKey` 时调用真实接口（OpenAI 兼容）
- 否则使用模拟响应
- 支持 `AbortController`：切换页面或卸载组件时自动取消请求
- 真实接口默认 60s 超时，失败时回退到模拟响应

## 安全提示

API Key 仅保存在浏览器 localStorage 中。请勿在公共设备使用，生产环境建议通过后端代理转发。
