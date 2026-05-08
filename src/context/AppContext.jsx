import { createContext, useContext, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import * as api from '../utils/api';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [agents, setAgents] = useState(() => api.fetchAgents());
  const [tasks, setTasks] = useState(() => api.fetchTasks());

  const refreshAgents = useCallback(() => {
    setAgents(api.fetchAgents());
  }, []);

  const refreshTasks = useCallback(() => {
    setTasks(api.fetchTasks());
  }, []);

  const addAgent = useCallback(
    (data) => {
      const agent = api.createAgent(data);
      refreshAgents();
      return agent;
    },
    [refreshAgents]
  );

  const editAgent = useCallback(
    (id, data) => {
      const agent = api.updateAgent(id, data);
      refreshAgents();
      return agent;
    },
    [refreshAgents]
  );

  const removeAgent = useCallback(
    (id) => {
      api.deleteAgent(id);
      refreshAgents();
    },
    [refreshAgents]
  );

  const addTask = useCallback(
    (data) => {
      const task = api.createTask(data);
      refreshTasks();
      return task;
    },
    [refreshTasks]
  );

  const editTask = useCallback(
    (id, data) => {
      const task = api.updateTask(id, data);
      refreshTasks();
      return task;
    },
    [refreshTasks]
  );

  const removeTask = useCallback(
    (id) => {
      api.deleteTask(id);
      refreshTasks();
    },
    [refreshTasks]
  );

  const value = {
    agents,
    tasks,
    refreshAgents,
    refreshTasks,
    addAgent,
    editAgent,
    removeAgent,
    addTask,
    editTask,
    removeTask,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

AppProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
