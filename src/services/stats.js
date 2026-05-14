// 业务聚合：从原始集合派生统计指标
export function computeStats({ agents, tasks, conversations }) {
  const totalMessages = Object.values(conversations).reduce(
    (sum, msgs) => sum + (msgs?.length || 0),
    0
  );

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
