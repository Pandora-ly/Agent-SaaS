import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  TASK_STATUS,
  TASK_STATUS_OPTIONS,
  getTaskStatusLabel,
  getTaskPriorityInfo,
} from '../constants/task';
import TaskForm from './TaskForm';
import './TaskList.css';

const FILTER_OPTIONS = ['all', ...TASK_STATUS_OPTIONS];

function TaskList() {
  const { agents, agentMap, tasks, addTask, editTask, removeTask } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('all');

  // 一次遍历同时得到分组计数 + 过滤结果（避免每个 filter 按钮各跑一次 filter）
  const { filteredSorted, counts } = useMemo(() => {
    const c = { all: tasks.length, pending: 0, in_progress: 0, completed: 0 };
    const result = [];
    for (const t of tasks) {
      if (t.status in c) c[t.status] += 1;
      if (filter === 'all' || t.status === filter) result.push(t);
    }
    result.sort((a, b) => b.createdAt - a.createdAt);
    return { filteredSorted: result, counts: c };
  }, [tasks, filter]);

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
        {FILTER_OPTIONS.map((status) => (
          <button
            key={status}
            className={`task-list-page__filter-btn ${
              filter === status ? 'task-list-page__filter-btn--active' : ''
            }`}
            onClick={() => setFilter(status)}
          >
            {status === 'all' ? '全部' : getTaskStatusLabel(status)}
            <span className="task-list-page__filter-count">{counts[status]}</span>
          </button>
        ))}
      </div>

      <div className="task-list-page__list">
        {filteredSorted.map((task) => {
          const agent = agentMap.get(task.agentId);
          const priority = getTaskPriorityInfo(task.priority);

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
                  {TASK_STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {TASK_STATUS[s].label}
                    </option>
                  ))}
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

      {filteredSorted.length === 0 && (
        <p className="task-list-page__empty">
          {filter === 'all' ? '暂无任务，点击上方按钮创建' : '该状态下暂无任务'}
        </p>
      )}
    </div>
  );
}

export default TaskList;
