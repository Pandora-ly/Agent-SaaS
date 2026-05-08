import { useState } from 'react';
import PropTypes from 'prop-types';
import { fetchSettings } from '../utils/api';
import './AgentForm.css';

const MODEL_PRESETS = [
  { value: 'gpt-4', label: 'GPT-4' },
  { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
  { value: 'gpt-4o', label: 'GPT-4o' },
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
  { value: 'claude-sonnet-4-20250514', label: 'Claude Sonnet 4' },
  { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet' },
  { value: 'claude-3-haiku-20240307', label: 'Claude 3 Haiku' },
  { value: 'deepseek-chat', label: 'DeepSeek Chat' },
  { value: 'qwen-turbo', label: '通义千问 Turbo' },
  { value: 'custom', label: '自定义' },
];

function AgentForm({ initial, onSubmit, onCancel }) {
  const settings = fetchSettings();

  const [form, setForm] = useState({
    name: initial?.name || '',
    description: initial?.description || '',
    model: initial?.model || settings.defaultModel || 'gpt-4',
    modelName: initial?.modelName || '',
    apiBaseUrl: initial?.apiBaseUrl || '',
    apiKey: initial?.apiKey || '',
    systemPrompt: initial?.systemPrompt || '',
    temperature: initial?.temperature ?? 0.5,
    maxTokens: initial?.maxTokens || 2048,
  });

  const isCustomModel = form.model === 'custom';
  const [showApiConfig, setShowApiConfig] = useState(
    isCustomModel || !!(initial?.apiBaseUrl || initial?.apiKey)
  );
  const [submitting, setSubmitting] = useState(false);

  // 切换模型时自动展开/收起 API 配置
  const handleModelChange = (value) => {
    handleChange('model', value);
    if (value === 'custom') {
      setShowApiConfig(true);
    }
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    // 自定义模型校验
    if (isCustomModel) {
      if (!form.apiBaseUrl.trim() || !form.apiKey.trim() || !form.modelName.trim()) {
        alert('自定义模型需要填写 API Base URL、API Key 和模型名称');
        return;
      }
    }
    setSubmitting(true);
    try {
      const data = { ...form };
      if (form.model !== 'custom' && !form.modelName) {
        data.modelName = form.model;
      }
      await onSubmit(data);
    } finally {
      setSubmitting(false);
    }
  };

  // 当前实际使用的 API 配置（Agent 自己的 > 全局默认）
  const effectiveBaseUrl = form.apiBaseUrl || settings.apiBaseUrl;
  const effectiveApiKey = form.apiKey || settings.apiKey;

  return (
    <form className="agent-form" onSubmit={handleSubmit}>
      <h3 className="agent-form__title">
        {initial ? '编辑 Agent' : '创建 Agent'}
      </h3>

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
          <label htmlFor="af-model">模型</label>
          <select
            id="af-model"
            value={form.model}
            onChange={(e) => handleModelChange(e.target.value)}
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
          <label htmlFor="af-temp">
            Temperature: {form.temperature}
          </label>
          <input
            id="af-temp"
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={form.temperature}
            onChange={(e) =>
              handleChange('temperature', parseFloat(e.target.value))
            }
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
            onChange={(e) =>
              handleChange('maxTokens', parseInt(e.target.value, 10))
            }
          />
        </div>
      </div>

      {/* API 配置 */}
      {isCustomModel ? (
        <div className="agent-form__divider">
          <div className="agent-form__section-label">API 接口配置（自定义模型必填）</div>
        </div>
      ) : (
        <div className="agent-form__divider">
          <button
            type="button"
            className="agent-form__toggle"
            onClick={() => setShowApiConfig(!showApiConfig)}
          >
            {showApiConfig ? '收起' : '展开'} API 配置
            <span className="agent-form__toggle-hint">
              {effectiveBaseUrl
                ? `当前: ${effectiveApiKey ? '已配置' : '未配置 Key'}`
                : '未配置'}
            </span>
          </button>
        </div>
      )}

      {(showApiConfig || isCustomModel) && (
        <div className={`agent-form__api-section ${isCustomModel ? 'agent-form__api-section--required' : ''}`}>
          <p className="agent-form__api-hint">
            {isCustomModel
              ? '自定义模型需要填写完整的 API 接口信息才能正常对话。'
              : '留空则使用全局默认配置（在「系统设置」中配置）。填写后仅对当前 Agent 生效。'}
          </p>
          <div className="agent-form__field">
            <label htmlFor="af-baseurl">
              API Base URL {isCustomModel && <span className="agent-form__required">*</span>}
            </label>
            <input
              id="af-baseurl"
              type="text"
              value={form.apiBaseUrl}
              onChange={(e) => handleChange('apiBaseUrl', e.target.value)}
              placeholder="https://api.example.com/v1"
              required={isCustomModel}
            />
          </div>
          <div className="agent-form__field">
            <label htmlFor="af-apikey">
              API Key {isCustomModel && <span className="agent-form__required">*</span>}
            </label>
            <input
              id="af-apikey"
              type="password"
              value={form.apiKey}
              onChange={(e) => handleChange('apiKey', e.target.value)}
              placeholder={isCustomModel ? '输入 API Key' : '留空使用全局配置'}
              required={isCustomModel}
            />
          </div>
          <div className="agent-form__field">
            <label htmlFor="af-modelname">
              模型名称 (Model Name) {isCustomModel && <span className="agent-form__required">*</span>}
            </label>
            <input
              id="af-modelname"
              type="text"
              value={form.modelName}
              onChange={(e) => handleChange('modelName', e.target.value)}
              placeholder="例如 gpt-4、claude-3-sonnet、deepseek-chat"
              required={isCustomModel}
            />
            <span className="agent-form__field-hint">
              实际发送给 API 的 model 参数
            </span>
          </div>
        </div>
      )}

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
