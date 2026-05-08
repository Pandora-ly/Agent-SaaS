import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import TaskForm from './TaskForm';
import './TaskList.css';

const STATUS_LABELS = {
  pending: '待处理',
  in_progress: '进行中',
  completed: '已完成',
};

const PRIORITY_LABELS = {
  high: { label: '高', className: 'priority--high' },
  medium: { label: '中', className: 'priority--medium' },
  low: { label: '低', className: 'priority--low' },
};

function TaskList() {
  const { agents, tasks, addTask, editTask, removeTask } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('all');

  const filtered = useMemo(
    () =>
      filter === 'all'
        ? tasks
        : tasks.filter((t) => t.status === filter),
    [tasks, filter]
  );

  const sorted = useMemo(
    () => [...filtered].sort((a, b) => b.createdAt - a.createdAt),
    [filtered]
  );

  const handleCreate = (data) => {
    addTask(data);
    setShowForm(false);
  };

  const handleStatusChange = (task, newStatus) => {
    editTask(task.id, { status: newStatus });
  };

  const handleDelete = (task) => {
    if (window.confirm(`确定删除任务 "${task.title}" 吗？`)) {
      removeTask(task.id);
    }
  };

  return (
    <div className="task-list-page">
      <div className="task-list-page__header">
        <h2>任务管理</h2>
        <button
          className="task-list-page__add-btn"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '取消' : '+ 创建任务'}
        </button>
      </div>

      {showForm && (
        <TaskForm
          agents={agents}
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
        />
      )}

      <div className="task-list-page__filters">
        {['all', 'pending', 'in_progress', 'completed'].map((status) => (
          <button
            key={status}
            className={`task-list-page__filter-btn ${
              filter === status ? 'task-list-page__filter-btn--active' : ''
            }`}
            onClick={() => setFilter(status)}
          >
            {status === 'all'
              ? '全部'
              : STATUS_LABELS[status]}
            <span className="task-list-page__filter-count">
              {status === 'all'
                ? tasks.length
                : tasks.filter((t) => t.status === status).length}
            </span>
          </button>
        ))}
      </div>

      <div className="task-list-page__list">
        {sorted.map((task) => {
          const agent = agents.find((a) => a.id === task.agentId);
          const priority = PRIORITY_LABELS[task.priority] || PRIORITY_LABELS.medium;

          return (
            <div key={task.id} className="task-item">
              <div className="task-item__main">
                <div className="task-item__header">
                  <span className={`task-item__priority ${priority.className}`}>
                    {priority.label}
                  </span>
                  <h4 className="task-item__title">{task.title}</h4>
                </div>
                {task.description && (
                  <p className="task-item__desc">{task.description}</p>
                )}
                <div className="task-item__meta">
                  <span className="task-item__agent">
                    🤖 {agent ? agent.name : '未分配'}
                  </span>
                  <span className="task-item__date">
                    {new Date(task.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="task-item__actions">
                <select
                  className="task-item__status-select"
                  value={task.status}
                  onChange={(e) => handleStatusChange(task, e.target.value)}
                >
                  <option value="pending">待处理</option>
                  <option value="in_progress">进行中</option>
                  <option value="completed">已完成</option>
                </select>
                <button
                  className="task-item__delete-btn"
                  onClick={() => handleDelete(task)}
                  title="删除"
                >
                  ✕
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {sorted.length === 0 && (
        <p className="task-list-page__empty">
          {filter === 'all'
            ? '暂无任务，点击上方按钮创建'
            : '该状态下暂无任务'}
        </p>
      )}
    </div>
  );
}

export default TaskList;
