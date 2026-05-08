import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import AgentForm from './AgentForm';
import './AgentList.css';

const STATUS_MAP = {
  idle: { label: '空闲', className: 'status--idle' },
  running: { label: '运行中', className: 'status--running' },
  error: { label: '异常', className: 'status--error' },
};

function AgentListPage() {
  const { agents, addAgent } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = useMemo(
    () =>
      agents.filter(
        (a) =>
          a.name.toLowerCase().includes(search.toLowerCase()) ||
          a.description.toLowerCase().includes(search.toLowerCase())
      ),
    [agents, search]
  );

  const handleCreate = (data) => {
    addAgent(data);
    setShowForm(false);
  };

  return (
    <div className="agent-list-page">
      <div className="agent-list-page__header">
        <h2>Agent 管理</h2>
        <button
          className="agent-list-page__add-btn"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '取消' : '+ 创建 Agent'}
        </button>
      </div>

      {showForm && (
        <AgentForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
      )}

      <div className="agent-list-page__search">
        <input
          type="text"
          placeholder="搜索 Agent..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="agent-list-page__search-input"
        />
      </div>

      <div className="agent-list-page__grid">
        {filtered.map((agent) => {
          const statusInfo = STATUS_MAP[agent.status] || { label: agent.status, className: '' };
          return (
            <Link
              key={agent.id}
              to={`/agents/${agent.id}`}
              className="agent-card"
            >
              <div className="agent-card__header">
                <h3 className="agent-card__name">{agent.name}</h3>
                <span className={`agent-card__status ${statusInfo.className}`}>
                  {statusInfo.label}
                </span>
              </div>
              <p className="agent-card__desc">{agent.description}</p>
              <div className="agent-card__meta">
                <span className="agent-card__model">{agent.model}</span>
                <span className="agent-card__temp">
                  T: {agent.temperature}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <p className="agent-list-page__empty">
          {search ? '没有匹配的 Agent' : '暂无 Agent，点击上方按钮创建'}
        </p>
      )}
    </div>
  );
}

export default AgentListPage;
