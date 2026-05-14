// 全局设置默认值
export const DEFAULT_SETTINGS = {
  protocol: 'openai', // 'openai' | 'anthropic' | 'azure'
  apiBaseUrl: 'https://api.openai.com/v1',
  apiKey: '',
  defaultModel: 'gpt-4',
  organizationId: '', // OpenAI 可选
  apiVersion: '', // Azure 必填，例 2024-02-15-preview
  customHeaders: [], // [{ key, value }]
  timeoutMs: 60000,
  stream: true,
};

// Agent 级 API 配置默认值（仅 useCustomApi=true 时生效）
export const DEFAULT_AGENT_API = {
  useCustomApi: false,
  protocol: 'openai',
  apiBaseUrl: '',
  apiKey: '',
  organizationId: '',
  apiVersion: '',
  customHeaders: [],
  timeoutMs: 60000,
  stream: true,
};

export const DEFAULT_AGENTS = [
  {
    id: 'agent_1',
    name: '数据分析师',
    description: '专注于数据分析和可视化，能快速处理数据集并生成洞察报告',
    model: 'gpt-4',
    modelName: 'gpt-4',
    systemPrompt:
      '你是一个专业的数据分析师，擅长数据处理、统计分析和数据可视化。请用清晰的结构回复，包含关键数据指标。',
    temperature: 0.3,
    maxTokens: 2048,
    status: 'idle',
    createdAt: Date.now() - 86400000 * 3,
    ...DEFAULT_AGENT_API,
  },
  {
    id: 'agent_2',
    name: '内容创作者',
    description: '负责文案撰写、内容策划和创意输出',
    model: 'claude-3-5-sonnet-20241022',
    modelName: 'claude-3-5-sonnet-20241022',
    systemPrompt:
      '你是一个资深内容创作者，擅长撰写各类文案、文章和营销内容。注重文字的感染力和可读性。',
    temperature: 0.7,
    maxTokens: 4096,
    status: 'running',
    createdAt: Date.now() - 86400000 * 2,
    ...DEFAULT_AGENT_API,
  },
  {
    id: 'agent_3',
    name: '任务调度器',
    description: '管理和分配任务，优化工作流程和资源调度',
    model: 'gpt-4',
    modelName: 'gpt-4',
    systemPrompt:
      '你是一个智能任务调度器，负责任务分配、优先级排序和工作流优化。回复要简洁明确，包含时间估算。',
    temperature: 0.2,
    maxTokens: 1024,
    status: 'idle',
    createdAt: Date.now() - 86400000,
    ...DEFAULT_AGENT_API,
  },
];

export const DEFAULT_TASKS = [
  {
    id: 'task_1',
    title: 'Q1 销售数据分析',
    description: '分析第一季度销售数据，找出增长趋势和异常点',
    agentId: 'agent_1',
    priority: 'high',
    status: 'completed',
    createdAt: Date.now() - 86400000 * 2,
    completedAt: Date.now() - 86400000,
  },
  {
    id: 'task_2',
    title: '产品发布文案',
    description: '撰写新产品发布的营销文案和社交媒体内容',
    agentId: 'agent_2',
    priority: 'medium',
    status: 'in_progress',
    createdAt: Date.now() - 86400000,
  },
  {
    id: 'task_3',
    title: '团队周报整理',
    description: '汇总本周各团队进展，生成周报摘要',
    agentId: 'agent_3',
    priority: 'low',
    status: 'pending',
    createdAt: Date.now(),
  },
];
