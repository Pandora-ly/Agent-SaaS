import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getAgentStatusInfo } from '../constants/agent';
import { getTaskStatusLabel } from '../constants/task';
import { getProtocol } from '../constants/protocol';
import AgentForm from './AgentForm';
import './AgentDetail.css';

function AgentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { agentMap, tasks, getConversations, editAgent, removeAgent } = useApp();
  const [editing, setEditing] = useState(false);

  const agent = agentMap.get(id);
  const agentTasks = useMemo(
    () => tasks.filter((t) => t.agentId === id),
    [tasks, id]
  );
  const conversations = getConversations(id);

  if (!agent) {
    return (
      <div className="agent-detail__not-found">
        <p>Agent 不存在</p>
        <Link to="/agents">返回列表</Link>
      </div>
    );
  }

  const statusInfo = getAgentStatusInfo(agent.status);

  const handleEdit = (data) => {
    editAgent(id, data);
    setEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm(`确定删除 Agent "${agent.name}" 吗？`)) {
      removeAgent(id);
      navigate('/agents');
    }
  };

  const handleToggleStatus = () => {
    const newStatus = agent.status === 'running' ? 'idle' : 'running';
    editAgent(id, { status: newStatus });
  };

  return (
    <div className="agent-detail">
      <div className="agent-detail__breadcrumb">
        <Link to="/agents">← 返回列表</Link>
      </div>

      {editing ? (
        <AgentForm
          initial={agent}
          onSubmit={handleEdit}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <div className="agent-detail__card">
          <div className="agent-detail__header">
            <div>
              <h2 className="agent-detail__name">{agent.name}</h2>
              <p className="agent-detail__desc">{agent.description}</p>
            </div>
            <span className={`agent-card__status ${statusInfo.className}`}>
              {statusInfo.label}
            </span>
          </div>

          <div className="agent-detail__info">
            <div className="agent-detail__info-item">
              <span className="agent-detail__label">模型</span>
              <span>{agent.modelName || agent.model}</span>
            </div>
            <div className="agent-detail__info-item">
              <span className="agent-detail__label">Temperature</span>
              <span>{agent.temperature}</span>
            </div>
            <div className="agent-detail__info-item">
              <span className="agent-detail__label">Max Tokens</span>
              <span>{agent.maxTokens}</span>
            </div>
            <div className="agent-detail__info-item">
              <span className="agent-detail__label">对话数</span>
              <span>{conversations.length} 条消息</span>
            </div>
            <div className="agent-detail__info-item">
              <span className="agent-detail__label">API 配置</span>
              <span>
                {agent.useCustomApi
                  ? `Agent 专属（${getProtocol(agent.protocol).label}）`
                  : '继承全局配置'}
              </span>
            </div>
            {agent.useCustomApi && (
              <>
                <div className="agent-detail__info-item">
                  <span className="agent-detail__label">API Base URL</span>
                  <span className="agent-detail__mono">
                    {agent.apiBaseUrl || '—'}
                  </span>
                </div>
                <div className="agent-detail__info-item">
                  <span className="agent-detail__label">API Key</span>
                  <span className="agent-detail__mono">
                    {agent.apiKey ? '••••••' + agent.apiKey.slice(-4) : '—'}
                  </span>
                </div>
              </>
            )}
            <div className="agent-detail__info-item">
              <span className="agent-detail__label">流式响应</span>
              <span>{agent.stream !== false ? '开启' : '关闭'}</span>
            </div>
          </div>

          {agent.systemPrompt && (
            <div className="agent-detail__prompt">
              <span className="agent-detail__label">系统提示词</span>
              <p>{agent.systemPrompt}</p>
            </div>
          )}

          <div className="agent-detail__actions">
            <Link to={`/chat/${id}`} className="agent-detail__btn agent-detail__btn--primary">
              开始对话
            </Link>
            <button
              className="agent-detail__btn agent-detail__btn--secondary"
              onClick={handleToggleStatus}
            >
              {agent.status === 'running' ? '停止' : '启动'}
            </button>
            <button
              className="agent-detail__btn agent-detail__btn--secondary"
              onClick={() => setEditing(true)}
            >
              编辑
            </button>
            <button
              className="agent-detail__btn agent-detail__btn--danger"
              onClick={handleDelete}
            >
              删除
            </button>
          </div>
        </div>
      )}

      <section className="agent-detail__section">
        <h3>关联任务 ({agentTasks.length})</h3>
        {agentTasks.length === 0 ? (
          <p className="agent-detail__empty">暂无关联任务</p>
        ) : (
          <div className="agent-detail__task-list">
            {agentTasks.map((task) => (
              <Link key={task.id} to="/tasks" className="agent-detail__task-item">
                <span className="agent-detail__task-title">{task.title}</span>
                <span
                  className={`dashboard__task-status dashboard__task-status--${task.status}`}
                >
                  {getTaskStatusLabel(task.status)}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default AgentDetail;
