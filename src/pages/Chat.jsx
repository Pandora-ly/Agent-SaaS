import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { generateResponse, resolveApiConfig, isApiConfigured } from '../services/llm';
import './Chat.css';

function Chat() {
  const { id } = useParams();
  const {
    agentMap,
    settings,
    getConversations,
    addMessage,
    clearConversations,
    editAgent,
  } = useApp();

  const agent = agentMap.get(id);
  const messages = getConversations(id);

  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  // 流式渲染：正在接收的文本
  const [streamingText, setStreamingText] = useState('');
  const messagesEndRef = useRef(null);
  const abortRef = useRef(null);

  // 离开页面或切换 Agent 时取消进行中的请求
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText, sending]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || sending || !agent) return;

    setInput('');
    setStreamingText('');
    addMessage(id, { role: 'user', content: text });
    setSending(true);
    editAgent(id, { status: 'running' });

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const config = resolveApiConfig(agent, settings);
      const history = [...messages, { role: 'user', content: text }];

      let fullText = '';
      const onChunk = (chunk) => {
        fullText += chunk;
        setStreamingText(fullText);
      };

      const responseText = await generateResponse(config, text, history, {
        signal: controller.signal,
        onChunk,
      });

      // 流式完成后写入正式消息
      setStreamingText('');
      addMessage(id, { role: 'assistant', content: responseText });
    } catch (err) {
      setStreamingText('');
      if (err.name !== 'AbortError') {
        addMessage(id, {
          role: 'assistant',
          content: `[发送失败] ${err.message}`,
        });
      }
    } finally {
      setSending(false);
      editAgent(id, { status: 'idle' });
      if (abortRef.current === controller) abortRef.current = null;
    }
  }, [input, sending, id, agent, messages, settings, addMessage, editAgent]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = () => {
    if (window.confirm('确定清空对话历史吗？')) {
      clearConversations(id);
    }
  };

  const handleStop = () => {
    abortRef.current?.abort();
  };

  if (!agent) {
    return (
      <div className="chat__not-found">
        <p>Agent 不存在</p>
        <Link to="/agents">返回列表</Link>
      </div>
    );
  }

  const config = resolveApiConfig(agent, settings);
  const apiReady = isApiConfigured(config);

  return (
    <div className="chat">
      <div className="chat__header">
        <div className="chat__header-info">
          <Link to={`/agents/${id}`} className="chat__back">
            ← {agent.name}
          </Link>
          <span className="chat__model">{config.modelName || agent.model}</span>
          <span className="chat__protocol">{config.protocol}</span>
          <span className="chat__api-status">
            {apiReady ? '🟢 API 已配置' : '🟡 模拟模式'}
          </span>
          {config.stream && apiReady && (
            <span className="chat__stream-badge">流式</span>
          )}
        </div>
        <button className="chat__clear-btn" onClick={handleClear}>
          清空对话
        </button>
      </div>

      <div className="chat__messages">
        {messages.length === 0 && !sending && (
          <div className="chat__welcome">
            <div className="chat__welcome-icon">💬</div>
            <h3>开始与 {agent.name} 对话</h3>
            <p>{agent.description}</p>
            {!apiReady && (
              <p className="chat__welcome-hint">
                当前未配置 API，将使用模拟响应。前往
                <Link to="/settings"> 系统设置 </Link>
                或编辑 Agent 配置真实 API。
              </p>
            )}
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

        {/* 流式渲染中 */}
        {sending && streamingText && (
          <div className="chat__message chat__message--assistant">
            <div className="chat__message-avatar">🤖</div>
            <div className="chat__message-content">
              <div className="chat__message-text">{streamingText}</div>
            </div>
          </div>
        )}

        {/* 等待中（无流式内容时显示打字动画） */}
        {sending && !streamingText && (
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
        {sending ? (
          <button className="chat__stop-btn" onClick={handleStop}>
            停止
          </button>
        ) : (
          <button
            className="chat__send-btn"
            onClick={handleSend}
            disabled={!input.trim()}
          >
            发送
          </button>
        )}
      </div>
    </div>
  );
}

export default Chat;
