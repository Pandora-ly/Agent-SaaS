import { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useApp } from '../context/AppContext';
import { MODEL_PRESETS } from '../constants/agent';
import ApiConfigFields from '../components/ApiConfigFields';
import TestConnectionButton from '../components/TestConnectionButton';
import { resolveApiConfig } from '../services/llm';
import './AgentForm.css';

function AgentForm({ initial, onSubmit, onCancel }) {
  const { settings } = useApp();

  const [form, setForm] = useState({
    name: initial?.name || '',
    description: initial?.description || '',
    model: initial?.model || settings.defaultModel || 'gpt-4',
    modelName: initial?.modelName || '',
    systemPrompt: initial?.systemPrompt || '',
    temperature: initial?.temperature ?? 0.5,
    maxTokens: initial?.maxTokens || 2048,
    // API 覆盖
    useCustomApi: initial?.useCustomApi ?? false,
    protocol: initial?.protocol || settings.protocol || 'openai',
    apiBaseUrl: initial?.apiBaseUrl || '',
    apiKey: initial?.apiKey || '',
    organizationId: initial?.organizationId || '',
    apiVersion: initial?.apiVersion || '',
    customHeaders: initial?.customHeaders || [],
    timeoutMs: initial?.timeoutMs || 60000,
    stream: initial?.stream ?? true,
  });

  const [showApiKey, setShowApiKey] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isCustomModel = form.model === 'custom';
  // 自定义模型必须开启 Agent 级 API 配置
  const useCustomApi = form.useCustomApi || isCustomModel;

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    if (useCustomApi && (!form.apiBaseUrl.trim() || !form.apiKey.trim() || !form.modelName.trim())) {
      alert('启用 Agent 专属 API 时，需填写 Base URL、API Key 和模型名称');
      return;
    }
    setSubmitting(true);
    try {
      const data = { ...form, useCustomApi };
      if (form.model !== 'custom' && !form.modelName) {
        data.modelName = form.model;
      }
      await onSubmit(data);
    } finally {
      setSubmitting(false);
    }
  };

  // 用于测试按钮：按当前表单解析最终配置
  const getTestConfig = useCallback(() => {
    const agentLike = {
      ...form,
      useCustomApi,
    };
    return resolveApiConfig(agentLike, settings);
  }, [form, useCustomApi, settings]);

  return (
    <form className="agent-form" onSubmit={handleSubmit}>
      <h3 className="agent-form__title">{initial ? '编辑 Agent' : '创建 Agent'}</h3>

      {/* 基本信息 */}
      <div className="agent-form__row">
        <div className="agent-form__field">
          <label htmlFor="af-name">名称 *</label>
          <input
            id="af-name"
            type="text"
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="给 Agent 起个名字"
            required
            autoFocus
          />
        </div>
        <div className="agent-form__field">
          <label htmlFor="af-model">模型预设</label>
          <select
            id="af-model"
            value={form.model}
            onChange={(e) => handleChange('model', e.target.value)}
          >
            {MODEL_PRESETS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="agent-form__field">
        <label htmlFor="af-desc">描述</label>
        <input
          id="af-desc"
          type="text"
          value={form.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Agent 的功能描述"
        />
      </div>

      <div className="agent-form__field">
        <label htmlFor="af-modelname">实际模型名（发送给 API）</label>
        <input
          id="af-modelname"
          type="text"
          value={form.modelName}
          onChange={(e) => handleChange('modelName', e.target.value)}
          placeholder={form.model === 'custom' ? '必填，例如 gpt-4-turbo' : '留空则使用预设值'}
          required={isCustomModel}
        />
        <span className="agent-form__field-hint">
          OpenAI/Anthropic 填模型名；Azure 填 deployment 名
        </span>
      </div>

      <div className="agent-form__field">
        <label htmlFor="af-prompt">系统提示词</label>
        <textarea
          id="af-prompt"
          value={form.systemPrompt}
          onChange={(e) => handleChange('systemPrompt', e.target.value)}
          placeholder="定义 Agent 的角色和行为..."
          rows={4}
        />
      </div>

      <div className="agent-form__row">
        <div className="agent-form__field">
          <label htmlFor="af-temp">Temperature: {form.temperature}</label>
          <input
            id="af-temp"
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={form.temperature}
            onChange={(e) => handleChange('temperature', parseFloat(e.target.value))}
          />
        </div>
        <div className="agent-form__field">
          <label htmlFor="af-tokens">Max Tokens</label>
          <input
            id="af-tokens"
            type="number"
            min="256"
            max="8192"
            step="256"
            value={form.maxTokens}
            onChange={(e) => handleChange('maxTokens', parseInt(e.target.value, 10))}
          />
        </div>
      </div>

      {/* API 配置覆盖 */}
      <div className="agent-form__divider">
        <label className="agent-form__toggle-label">
          <input
            type="checkbox"
            checked={useCustomApi}
            onChange={(e) => handleChange('useCustomApi', e.target.checked)}
            disabled={isCustomModel}
          />
          <span style={{ marginLeft: 8 }}>
            使用 Agent 专属 API 配置
            {isCustomModel && (
              <span className="agent-form__required-tag"> 自定义模型必须开启</span>
            )}
          </span>
        </label>
        <span className="agent-form__field-hint">
          {useCustomApi
            ? '当前 Agent 使用自己的 API 配置，不受全局设置影响'
            : '当前 Agent 继承「系统设置」中的全局 API 配置'}
        </span>
      </div>

      {useCustomApi && (
        <div className="agent-form__api-section">
          <ApiConfigFields
            value={form}
            onChange={handleChange}
            idPrefix="af"
            showApiKey={showApiKey}
            onToggleApiKey={() => setShowApiKey((v) => !v)}
          />
        </div>
      )}

      {/* 测试连接：始终可用，反映最终生效配置 */}
      <div style={{ marginTop: 12 }}>
        <TestConnectionButton getConfig={getTestConfig} />
      </div>

      <div className="agent-form__actions">
        <button
          type="button"
          className="agent-form__btn agent-form__btn--cancel"
          onClick={onCancel}
          disabled={submitting}
        >
          取消
        </button>
        <button
          type="submit"
          className="agent-form__btn agent-form__btn--submit"
          disabled={!form.name.trim() || submitting}
        >
          {submitting ? '保存中...' : '保存'}
        </button>
      </div>
    </form>
  );
}

AgentForm.propTypes = {
  initial: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

AgentForm.defaultProps = {
  initial: null,
};

export default AgentForm;
