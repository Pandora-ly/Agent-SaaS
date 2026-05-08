# Agent SaaS Optimized

基于 React 18 的多 Agent 管理前端平台，支持模块化组件和可扩展多 Agent 界面。

## 技术栈

- React 18 (Hooks)
- CSS (BEM 命名)
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
│   ├── index.jsx              # 入口
│   ├── App.jsx                # 根组件
│   ├── App.css                # 全局样式
│   ├── components/
│   │   ├── AgentList.jsx      # Agent 列表（数据获取 + 状态管理）
│   │   ├── AgentList.css
│   │   ├── AgentSaas.jsx      # Agent 卡片（展示组件）
│   │   └── AgentSaas.css
│   └── utils/
│       └── api.js             # API 工具（支持真实 API / 模拟数据）
├── .eslintrc.json
├── .prettierrc
├── .env.example
└── package.json
```

## 环境变量

复制 `.env.example` 为 `.env` 配置 API 地址：

```bash
cp .env.example .env
```

不配置 `REACT_APP_API_URL` 时自动使用模拟数据。
