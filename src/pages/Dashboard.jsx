import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { fetchStats } from '../utils/api';
import StatCard from '../components/StatCard';
import './Dashboard.css';

const STATUS_LABELS = {
  pending: '待处理',
  in_progress: '进行中',
  completed: '已完成',
};

function Dashboard() {
  const { agents, tasks } = useApp();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stats = useMemo(() => fetchStats(), [agents, tasks]);

  const recentTasks = useMemo(
    () => [...tasks].sort((a, b) => b.createdAt - a.createdAt).slice(0, 5),
    [tasks]
  );

  const recentAgents = useMemo(
    () => [...agents].sort((a, b) => b.createdAt - a.createdAt).slice(0, 3),
    [agents]
  );

  return (
    <div className="dashboard">
      <h2 className="dashboard__title">仪表盘</h2>

      <div className="dashboard__stats">
        <StatCard label="Agent 总数" value={stats.totalAgents} icon="🤖" color="#1976d2" />
        <StatCard label="运行中" value={stats.runningAgents} icon="▶️" color="#e65100" />
        <StatCard label="任务总数" value={stats.totalTasks} icon="📋" color="#2e7d32" />
        <StatCard label="已完成任务" value={stats.completedTasks} icon="✅" color="#7b1fa2" />
        <StatCard label="对话消息" value={stats.totalMessages} icon="💬" color="#00838f" />
      </div>

      <div className="dashboard__grid">
        <section className="dashboard__section">
          <div className="dashboard__section-header">
            <h3>最近任务</h3>
            <Link to="/tasks" className="dashboard__link">
              查看全部 →
            </Link>
          </div>
          {recentTasks.length === 0 ? (
            <p className="dashboard__empty">暂无任务</p>
          ) : (
            <div className="dashboard__task-list">
              {recentTasks.map((task) => {
                const agent = agents.find((a) => a.id === task.agentId);
                return (
                  <div key={task.id} className="dashboard__task-item">
                    <div className="dashboard__task-info">
                      <span className="dashboard__task-title">{task.title}</span>
                      <span className="dashboard__task-agent">
                        {agent ? agent.name : '未分配'}
                      </span>
                    </div>
                    <span
                      className={`dashboard__task-status dashboard__task-status--${task.status}`}
                    >
                      {STATUS_LABELS[task.status]}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="dashboard__section">
          <div className="dashboard__section-header">
            <h3>最近 Agent</h3>
            <Link to="/agents" className="dashboard__link">
              查看全部 →
            </Link>
          </div>
          {recentAgents.length === 0 ? (
            <p className="dashboard__empty">暂无 Agent</p>
          ) : (
            <div className="dashboard__agent-list">
              {recentAgents.map((agent) => (
                <Link
                  key={agent.id}
                  to={`/agents/${agent.id}`}
                  className="dashboard__agent-item"
                >
                  <span className="dashboard__agent-name">{agent.name}</span>
                  <span className="dashboard__agent-model">{agent.model}</span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default Dashboard;
