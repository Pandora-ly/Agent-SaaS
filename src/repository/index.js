// 纯数据访问层：所有 localStorage 读写都在这里
import { getItem, setItem } from './storage';
import {
  DEFAULT_AGENTS,
  DEFAULT_TASKS,
  DEFAULT_SETTINGS,
  DEFAULT_AGENT_API,
} from './defaults';

const KEYS = {
  initialized: 'initialized',
  agents: 'agents',
  tasks: 'tasks',
  conversations: 'conversations',
  settings: 'settings',
};

function ensureInitialized() {
  if (!getItem(KEYS.initialized)) {
    setItem(KEYS.agents, DEFAULT_AGENTS);
    setItem(KEYS.tasks, DEFAULT_TASKS);
    setItem(KEYS.conversations, {});
    setItem(KEYS.settings, DEFAULT_SETTINGS);
    setItem(KEYS.initialized, true);
  }
  if (!getItem(KEYS.settings)) {
    setItem(KEYS.settings, DEFAULT_SETTINGS);
  }
}

// 升级 Agent：补齐新增字段
function upgradeAgent(agent) {
  return { ...DEFAULT_AGENT_API, ...agent };
}

function upgradeSettings(settings) {
  return { ...DEFAULT_SETTINGS, ...settings };
}

export function loadSnapshot() {
  ensureInitialized();
  const rawAgents = getItem(KEYS.agents, []);
  const rawSettings = getItem(KEYS.settings, DEFAULT_SETTINGS);
  return {
    agents: rawAgents.map(upgradeAgent),
    tasks: getItem(KEYS.tasks, []),
    conversations: getItem(KEYS.conversations, {}),
    settings: upgradeSettings(rawSettings),
  };
}

export function persistAgents(agents) {
  setItem(KEYS.agents, agents);
}

export function persistTasks(tasks) {
  setItem(KEYS.tasks, tasks);
}

export function persistConversations(conversations) {
  setItem(KEYS.conversations, conversations);
}

export function persistSettings(settings) {
  setItem(KEYS.settings, settings);
}

export function clearAll() {
  Object.values(KEYS).forEach((k) => {
    localStorage.removeItem('agent_saas_' + k);
  });
}
