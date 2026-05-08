import { useState, useEffect } from 'react';
import { fetchSettings, updateSettings } from '../utils/api';
import './Settings.css';

function Settings() {
  const [form, setForm] = useState({
    apiBaseUrl: '',
    apiKey: '',
    defaultModel: 'gpt-4',
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const settings = fetchSettings();
    setForm({
      apiBaseUrl: settings.apiBaseUrl || '',
      apiKey: settings.apiKey || '',
      defaultModel: settings.defaultModel || 'gpt-4',
    });
  }, []);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSave = (e) => {
    e.preventDefault();
    updateSettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="settings">
      <h2 className="settings__title">系统设置</h2>
      <p className="settings__desc">
        配置默认的 API 连接参数。新建 Agent 时会自动使用这些默认值，也可以在每个 Agent 中单独覆盖。
      </p>

      <form className="settings__form" onSubmit={handleSave}>
        <div className="settings__section">
          <h3 className="settings__section-title">API 连接配置</h3>

          <div className="settings__field">
            <label htmlFor="s-baseurl">API Base URL</label>
            <input
              id="s-baseurl"
              type="text"
              value={form.apiBaseUrl}
              onChange={(e) => handleChange('apiBaseUrl', e.target.value)}
              placeholder="https://api.openai.com/v1"
            />
            <span className="settings__hint">
              OpenAI 兼容接口地址，支持 OpenAI / Azure / 本地部署 / 第三方代理
            </span>
          </div>

          <div className="settings__field">
            <label htmlFor="s-apikey">API Key</label>
            <input
              id="s-apikey"
              type="password"
              value={form.apiKey}
              onChange={(e) => handleChange('apiKey', e.target.value)}
              placeholder="sk-..."
            />
            <span className="settings__hint">
              你的 API 密钥，数据仅保存在本地浏览器中
            </span>
          </div>

          <div className="settings__field">
            <label htmlFor="s-model">默认模型</label>
            <select
              id="s-model"
              value={form.defaultModel}
              onChange={(e) => handleChange('defaultModel', e.target.value)}
            >
              <optgroup label="OpenAI">
                <option value="gpt-4">GPT-4</option>
                <option value="gpt-4-turbo">GPT-4 Turbo</option>
                <option value="gpt-4o">GPT-4o</option>
                <option value="gpt-4o-mini">GPT-4o Mini</option>
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
              </optgroup>
              <optgroup label="Anthropic">
                <option value="claude-sonnet-4-20250514">Claude Sonnet 4</option>
                <option value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet</option>
                <option value="claude-3-haiku-20240307">Claude 3 Haiku</option>
              </optgroup>
              <optgroup label="其他">
                <option value="deepseek-chat">DeepSeek Chat</option>
                <option value="qwen-turbo">通义千问 Turbo</option>
              </optgroup>
            </select>
            <span className="settings__hint">
              新建 Agent 时的默认模型，可在 Agent 中单独修改
            </span>
          </div>
        </div>

        <div className="settings__actions">
          <button type="submit" className="settings__save-btn">
            保存设置
          </button>
          {saved && <span className="settings__saved-msg">已保存</span>}
        </div>
      </form>

      <div className="settings__section">
        <h3 className="settings__section-title">数据管理</h3>
        <p className="settings__desc">
          所有数据保存在浏览器 localStorage 中。清除浏览器数据会丢失所有 Agent、对话和任务。
        </p>
        <button
          className="settings__danger-btn"
          onClick={() => {
            if (window.confirm('确定要重置所有数据吗？这将清除所有 Agent、对话和任务。')) {
              localStorage.clear();
              window.location.reload();
            }
          }}
        >
          重置所有数据
        </button>
      </div>
    </div>
  );
}

export default Settings;
