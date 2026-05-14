import { createContext, useContext, useState, useCallback, useMemo, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  loadSnapshot,
  persistAgents,
  persistTasks,
  persistConversations,
  persistSettings,
} from '../repository';
import { generateId } from '../repository/storage';
import { DEFAULT_AGENT_API } from '../repository/defaults';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // 一次性加载所有持久化数据，之后 React state 是单一数据源
  const initial = useRef(loadSnapshot()).current;
  const [agents, setAgents] = useState(initial.agents);
  const [tasks, setTasks] = useState(initial.tasks);
  const [conversations, setConversations] = useState(initial.conversations);
  const [settings, setSettings] = useState(initial.settings);

  // state 变化后写回 localStorage（写入失败不影响内存状态）
  useEffect(() => persistAgents(agents), [agents]);
  useEffect(() => persistTasks(tasks), [tasks]);
  useEffect(() => persistConversations(conversations), [conversations]);
  useEffect(() => persistSettings(settings), [settings]);

  // ===== Agent =====
  const addAgent = useCallback(
    (data) => {
      const newAgent = {
        id: 'agent_' + generateId(),
        status: 'idle',
        createdAt: Date.now(),
        temperature: 0.5,
        maxTokens: 2048,
        model: settings.defaultModel || 'gpt-4',
        modelName: '',
        systemPrompt: '',
        ...DEFAULT_AGENT_API,
        ...data,
      };
      setAgents((prev) => [...prev, newAgent]);
      return newAgent;
    },
    [settings.defaultModel]
  );

  const editAgent = useCallback((id, data) => {
    setAgents((prev) => prev.map((a) => (a.id === id ? { ...a, ...data } : a)));
  }, []);

  const removeAgent = useCallback((id) => {
    setAgents((prev) => prev.filter((a) => a.id !== id));
    setConversations((prev) => {
      if (!(id in prev)) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  // ===== Task =====
  const addTask = useCallback((data) => {
    const newTask = {
      id: 'task_' + generateId(),
      status: 'pending',
      createdAt: Date.now(),
      ...data,
    };
    setTasks((prev) => [...prev, newTask]);
    return newTask;
  }, []);

  const editTask = useCallback((id, data) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const next = { ...t, ...data };
        if (data.status === 'completed' && !t.completedAt) {
          next.completedAt = Date.now();
        }
        return next;
      })
    );
  }, []);

  const removeTask = useCallback((id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ===== Conversations =====
  const getConversations = useCallback(
    (agentId) => conversations[agentId] || [],
    [conversations]
  );

  const addMessage = useCallback((agentId, message) => {
    const msg = {
      id: generateId(),
      timestamp: Date.now(),
      ...message,
    };
    setConversations((prev) => ({
      ...prev,
      [agentId]: [...(prev[agentId] || []), msg],
    }));
    return msg;
  }, []);

  const clearConversations = useCallback((agentId) => {
    setConversations((prev) => ({ ...prev, [agentId]: [] }));
  }, []);

  // ===== Settings =====
  const updateSettings = useCallback((data) => {
    setSettings((prev) => ({ ...prev, ...data }));
  }, []);

  // 派生：agentId -> agent 的 Map，避免列表渲染中重复 find()
  const agentMap = useMemo(
    () => new Map(agents.map((a) => [a.id, a])),
    [agents]
  );

  const value = useMemo(
    () => ({
      agents,
      tasks,
      conversations,
      settings,
      agentMap,
      addAgent,
      editAgent,
      removeAgent,
      addTask,
      editTask,
      removeTask,
      getConversations,
      addMessage,
      clearConversations,
      updateSettings,
    }),
    [
      agents,
      tasks,
      conversations,
      settings,
      agentMap,
      addAgent,
      editAgent,
      removeAgent,
      addTask,
      editTask,
      removeTask,
      getConversations,
      addMessage,
      clearConversations,
      updateSettings,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

AppProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used within AppProvider');
  }
  return ctx;
}
