import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  fetchConversations,
  addMessage,
  clearConversations,
  fetchAgentById,
  fetchSettings,
} from '../utils/api';
import { generateResponse } from '../utils/mockLlm';
import './Chat.css';

function Chat() {
  const { id } = useParams();
  const { agents, editAgent } = useApp();
  const [agent, setAgent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const agentData = agents.find((a) => a.id === id);

  useEffect(() => {
    try {
      setAgent(fetchAgentById(id));
      setMessages(fetchConversations(id));
    } catch {
      setAgent(null);
    }
  }, [id, agentData]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || sending) return;

    setInput('');

    // 添加用户消息
    const userMsg = addMessage(id, { role: 'user', content: text });
    setMessages((prev) => [...prev, userMsg]);

    setSending(true);

    // 更新 agent 状态为 running
    editAgent(id, { status: 'running' });

    try {
      // 合并 Agent 配置与全局设置
      const settings = fetchSettings();
      const agentConfig = {
        systemPrompt: agent?.systemPrompt,
        temperature: agent?.temperature,
        maxTokens: agent?.maxTokens,
        apiBaseUrl: agent?.apiBaseUrl || settings.apiBaseUrl,
        apiKey: agent?.apiKey || settings.apiKey,
        modelName: agent?.modelName || agent?.model,
      };
      const responseText = await generateResponse(
        agentConfig,
        text,
        messages
      );

      const assistantMsg = addMessage(id, {
        role: 'assistant',
        content: responseText,
      });
      setMessages((prev) => [...prev, assistantMsg]);
    } finally {
      setSending(false);
      editAgent(id, { status: 'idle' });
    }
  }, [input, sending, id, agent, messages, editAgent]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = () => {
    if (window.confirm('确定清空对话历史吗？')) {
      clearConversations(id);
      setMessages([]);
    }
  };

  if (!agent) {
    return (
      <div className="chat__not-found">
        <p>Agent 不存在</p>
        <Link to="/agents">返回列表</Link>
      </div>
    );
  }

  return (
    <div className="chat">
      <div className="chat__header">
        <div className="chat__header-info">
          <Link to={`/agents/${id}`} className="chat__back">
            ← {agent.name}
          </Link>
          <span className="chat__model">{agent.modelName || agent.model}</span>
          <span className="chat__api-status">
            {(agent.apiBaseUrl || fetchSettings().apiBaseUrl) && (agent.apiKey || fetchSettings().apiKey)
              ? '🟢 API 已配置'
              : '🟡 模拟模式'}
          </span>
        </div>
        <button className="chat__clear-btn" onClick={handleClear}>
          清空对话
        </button>
      </div>

      <div className="chat__messages">
        {messages.length === 0 && (
          <div className="chat__welcome">
            <div className="chat__welcome-icon">💬</div>
            <h3>开始与 {agent.name} 对话</h3>
            <p>{agent.description}</p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`chat__message chat__message--${msg.role}`}
          >
            <div className="chat__message-avatar">
              {msg.role === 'user' ? '👤' : '🤖'}
            </div>
            <div className="chat__message-content">
              <div className="chat__message-text">{msg.content}</div>
              <span className="chat__message-time">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}

        {sending && (
          <div className="chat__message chat__message--assistant">
            <div className="chat__message-avatar">🤖</div>
            <div className="chat__message-content">
              <div className="chat__typing">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="chat__input-area">
        <textarea
          className="chat__input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="输入消息... (Enter 发送, Shift+Enter 换行)"
          rows={1}
          disabled={sending}
        />
        <button
          className="chat__send-btn"
          onClick={handleSend}
          disabled={!input.trim() || sending}
        >
          发送
        </button>
      </div>
    </div>
  );
}

export default Chat;
