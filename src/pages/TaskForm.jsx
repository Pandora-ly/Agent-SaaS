import { useState } from 'react';
import PropTypes from 'prop-types';
import './TaskForm.css';

function TaskForm({ agents, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    agentId: agents[0]?.id || '',
    priority: 'medium',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    onSubmit(form);
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <h3 className="task-form__title">创建任务</h3>

      <div className="task-form__field">
        <label htmlFor="tf-title">任务标题 *</label>
        <input
          id="tf-title"
          type="text"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="输入任务标题"
          required
          autoFocus
        />
      </div>

      <div className="task-form__field">
        <label htmlFor="tf-desc">任务描述</label>
        <textarea
          id="tf-desc"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="详细描述任务内容"
          rows={3}
        />
      </div>

      <div className="task-form__row">
        <div className="task-form__field">
          <label htmlFor="tf-agent">指派 Agent</label>
          <select
            id="tf-agent"
            value={form.agentId}
            onChange={(e) => setForm({ ...form, agentId: e.target.value })}
          >
            <option value="">不分配</option>
            {agents.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
        <div className="task-form__field">
          <label htmlFor="tf-priority">优先级</label>
          <select
            id="tf-priority"
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: e.target.value })}
          >
            <option value="high">高</option>
            <option value="medium">中</option>
            <option value="low">低</option>
          </select>
        </div>
      </div>

      <div className="task-form__actions">
        <button
          type="button"
          className="task-form__btn task-form__btn--cancel"
          onClick={onCancel}
        >
          取消
        </button>
        <button
          type="submit"
          className="task-form__btn task-form__btn--submit"
          disabled={!form.title.trim()}
        >
          创建
        </button>
      </div>
    </form>
  );
}

TaskForm.propTypes = {
  agents: PropTypes.array.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default TaskForm;
