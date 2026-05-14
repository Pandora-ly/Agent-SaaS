import { useState, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { clearAll } from '../repository';
import ApiConfigFields from '../components/ApiConfigFields';
import TestConnectionButton from '../components/TestConnectionButton';
import { MODEL_PRESETS } from '../constants/agent';
import './Settings.css';

function Settings() {
  const { settings, updateSettings } = useApp();

  const [form, setForm] = useState({
    protocol: settings.protocol || 'openai',
    apiBaseUrl: settings.apiBaseUrl || '',
    apiKey: settings.apiKey || '',
    organizationId: settings.organizationId || '',
    apiVersion: settings.apiVersion || '',
    customHeaders: settings.customHeaders || [],
    timeoutMs: settings.timeoutMs || 60000,
    stream: settings.stream ?? true,
    defaultModel: settings.defaultModel || 'gpt-4',
  });
  const [saved, setSaved] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

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

  const handleReset = () => {
    if (window.confirm('确定要重置所有数据吗？这将清除所有 Agent、对话和任务。')) {
      clearAll();
      window.location.reload();
    }
  };

  // 用 callback 而非闭包：测试时读到的是最新表单
  const getTestConfig = useCallback(
    () => ({
      ...form,
      modelName: form.defaultModel,
    }),
    [form]
  );

  return (
    <div className="settings">
      <h2 className="settings__title">系统设置</h2>
      <p className="settings__desc">
        配置默认 API 连接参数。新建 Agent 默认继承这些配置，也可在 Agent 级单独覆盖。
      </p>

      <form className="settings__form" onSubmit={handleSave}>
        <div className="settings__section">
          <h3 className="settings__section-title">API 连接配置</h3>

          <div className="settings__warning">
            ⚠️ API Key 仅保存在浏览器 localStorage 中。请勿在公共设备使用，生产环境建议通过后端代理转发。
          </div>

          <ApiConfigFields
            value={form}
            onChange={handleChange}
            idPrefix="s"
            showApiKey={showApiKey}
            onToggleApiKey={() => setShowApiKey((v) => !v)}
          />

          <div className="settings__field" style={{ marginTop: 12 }}>
            <label htmlFor="s-default-model">默认模型</label>
            <select
              id="s-default-model"
              value={form.defaultModel}
              onChange={(e) => handleChange('defaultModel', e.target.value)}
            >
              {MODEL_PRESETS.filter((m) => m.value !== 'custom').map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
            <span className="settings__hint">
              新建 Agent 默认使用的模型，可在 Agent 中单独修改
            </span>
          </div>

          <div style={{ marginTop: 16 }}>
            <TestConnectionButton getConfig={getTestConfig} />
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
        <button className="settings__danger-btn" onClick={handleReset}>
          重置所有数据
        </button>
      </div>
    </div>
  );
}

export default Settings;
