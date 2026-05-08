import { getItem, setItem, generateId } from './storage';

// 默认全局设置
const DEFAULT_SETTINGS = {
  apiBaseUrl: 'https://api.openai.com/v1',
  apiKey: '',
  defaultModel: 'gpt-4',
};

// 默认 Agent 数据
const DEFAULT_AGENTS = [
  {
    id: 'agent_1',
    name: '数据分析师',
    description: '专注于数据分析和可视化，能快速处理数据集并生成洞察报告',
    model: 'gpt-4',
    modelName: 'gpt-4',
    apiBaseUrl: '',
    apiKey: '',
    systemPrompt: '你是一个专业的数据分析师，擅长数据处理、统计分析和数据可视化。请用清晰的结构回复，包含关键数据指标。',
    temperature: 0.3,
    maxTokens: 2048,
    status: 'idle',
    createdAt: Date.now() - 86400000 * 3,
  },
  {
    id: 'agent_2',
    name: '内容创作者',
    description: '负责文案撰写、内容策划和创意输出',
    model: 'claude-3',
    modelName: 'claude-3-sonnet-20240229',
    apiBaseUrl: '',
    apiKey: '',
    systemPrompt: '你是一个资深内容创作者，擅长撰写各类文案、文章和营销内容。注重文字的感染力和可读性。',
    temperature: 0.7,
    maxTokens: 4096,
    status: 'running',
    createdAt: Date.now() - 86400000 * 2,
  },
  {
    id: 'agent_3',
    name: '任务调度器',
    description: '管理和分配任务，优化工作流程和资源调度',
    model: 'gpt-4',
    modelName: 'gpt-4',
    apiBaseUrl: '',
    apiKey: '',
    systemPrompt: '你是一个智能任务调度器，负责任务分配、优先级排序和工作流优化。回复要简洁明确，包含时间估算。',
    temperature: 0.2,
    maxTokens: 1024,
    status: 'idle',
    createdAt: Date.now() - 86400000,
  },
];

// 默认任务
const DEFAULT_TASKS = [
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

function ensureInitialized() {
  if (!getItem('initialized')) {
    setItem('agents', DEFAULT_AGENTS);
    setItem('tasks', DEFAULT_TASKS);
    setItem('conversations', {});
    setItem('settings', DEFAULT_SETTINGS);
    setItem('initialized', true);
  }
  // 确保 settings 字段存在（兼容旧数据）
  if (!getItem('settings')) {
    setItem('settings', DEFAULT_SETTINGS);
  }
}

// ========== Settings API ==========

export function fetchSettings() {
  ensureInitialized();
  return getItem('settings', DEFAULT_SETTINGS);
}

export function updateSettings(data) {
  const settings = { ...fetchSettings(), ...data };
  setItem('settings', settings);
  return settings;
}

// ========== Agent API ==========

export function fetchAgents() {
  ensureInitialized();
  return getItem('agents', []);
}

export function fetchAgentById(id) {
  ensureInitialized();
  const agents = getItem('agents', []);
  const agent = agents.find((a) => a.id === id);
  if (!agent) throw new Error(`Agent ${id} 不存在`);
  return agent;
}

export function createAgent(data) {
  const agents = fetchAgents();
  const settings = fetchSettings();
  const newAgent = {
    id: 'agent_' + generateId(),
    status: 'idle',
    createdAt: Date.now(),
    temperature: 0.5,
    maxTokens: 2048,
    model: settings.defaultModel || 'gpt-4',
    modelName: '',
    apiBaseUrl: '',
    apiKey: '',
    systemPrompt: '',
    ...data,
  };
  agents.push(newAgent);
  setItem('agents', agents);
  return newAgent;
}

export function updateAgent(id, data) {
  const agents = fetchAgents();
  const index = agents.findIndex((a) => a.id === id);
  if (index === -1) throw new Error(`Agent ${id} 不存在`);
  agents[index] = { ...agents[index], ...data };
  setItem('agents', agents);
  return agents[index];
}

export function deleteAgent(id) {
  const agents = fetchAgents().filter((a) => a.id !== id);
  setItem('agents', agents);
  // 同时清理关联的对话记录
  const conversations = getItem('conversations', {});
  delete conversations[id];
  setItem('conversations', conversations);
}

// ========== Conversation API ==========

export function fetchConversations(agentId) {
  ensureInitialized();
  const conversations = getItem('conversations', {});
  return conversations[agentId] || [];
}

export function addMessage(agentId, message) {
  const conversations = getItem('conversations', {});
  if (!conversations[agentId]) {
    conversations[agentId] = [];
  }
  const msg = {
    id: generateId(),
    timestamp: Date.now(),
    ...message,
  };
  conversations[agentId].push(msg);
  setItem('conversations', conversations);
  return msg;
}

export function clearConversations(agentId) {
  const conversations = getItem('conversations', {});
  conversations[agentId] = [];
  setItem('conversations', conversations);
}

// ========== Task API ==========

export function fetchTasks() {
  ensureInitialized();
  return getItem('tasks', []);
}

export function fetchTaskById(id) {
  const tasks = fetchTasks();
  const task = tasks.find((t) => t.id === id);
  if (!task) throw new Error(`Task ${id} 不存在`);
  return task;
}

export function createTask(data) {
  const tasks = fetchTasks();
  const newTask = {
    id: 'task_' + generateId(),
    status: 'pending',
    createdAt: Date.now(),
    ...data,
  };
  tasks.push(newTask);
  setItem('tasks', tasks);
  return newTask;
}

export function updateTask(id, data) {
  const tasks = fetchTasks();
  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) throw new Error(`Task ${id} 不存在`);
  tasks[index] = { ...tasks[index], ...data };
  if (data.status === 'completed') {
    tasks[index].completedAt = Date.now();
  }
  setItem('tasks', tasks);
  return tasks[index];
}

export function deleteTask(id) {
  const tasks = fetchTasks().filter((t) => t.id !== id);
  setItem('tasks', tasks);
}

// ========== Stats API ==========

export function fetchStats() {
  const agents = fetchAgents();
  const tasks = fetchTasks();
  const conversations = getItem('conversations', {});

  let totalMessages = 0;
  Object.values(conversations).forEach((msgs) => {
    totalMessages += msgs.length;
  });

  return {
    totalAgents: agents.length,
    idleAgents: agents.filter((a) => a.status === 'idle').length,
    runningAgents: agents.filter((a) => a.status === 'running').length,
    errorAgents: agents.filter((a) => a.status === 'error').length,
    totalTasks: tasks.length,
    pendingTasks: tasks.filter((t) => t.status === 'pending').length,
    inProgressTasks: tasks.filter((t) => t.status === 'in_progress').length,
    completedTasks: tasks.filter((t) => t.status === 'completed').length,
    totalMessages,
  };
}
