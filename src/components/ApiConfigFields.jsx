import PropTypes from 'prop-types';
import { PROTOCOLS, getProtocol } from '../constants/protocol';
import './ApiConfigFields.css';

// 通用 API 配置字段集合
// value: { protocol, apiBaseUrl, apiKey, organizationId, apiVersion, customHeaders, timeoutMs, stream }
// onChange(field, value)
function ApiConfigFields({ value, onChange, idPrefix, showApiKey, onToggleApiKey }) {
  const protocol = getProtocol(value.protocol);

  const handleProtocolChange = (newProtocol) => {
    const proto = getProtocol(newProtocol);
    onChange('protocol', newProtocol);
    // 自动填充该协议的默认 baseUrl（仅当当前为空或为已知默认值时）
    const knownDefaults = PROTOCOLS.map((p) => p.defaultBaseUrl);
    if (!value.apiBaseUrl || knownDefaults.includes(value.apiBaseUrl)) {
      onChange('apiBaseUrl', proto.defaultBaseUrl);
    }
  };

  const handleHeaderChange = (idx, key, val) => {
    const next = [...(value.customHeaders || [])];
    next[idx] = { ...next[idx], [key]: val };
    onChange('customHeaders', next);
  };

  const handleAddHeader = () => {
    onChange('customHeaders', [...(value.customHeaders || []), { key: '', value: '' }]);
  };

  const handleRemoveHeader = (idx) => {
    const next = (value.customHeaders || []).filter((_, i) => i !== idx);
    onChange('customHeaders', next);
  };

  return (
    <div className="api-fields">
      <div className="api-fields__row">
        <div className="api-fields__field">
          <label htmlFor={`${idPrefix}-protocol`}>API 协议</label>
          <select
            id={`${idPrefix}-protocol`}
            value={value.protocol}
            onChange={(e) => handleProtocolChange(e.target.value)}
          >
            {PROTOCOLS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
          <span className="api-fields__hint">{protocol.description}</span>
        </div>
        <div className="api-fields__field">
          <label htmlFor={`${idPrefix}-timeout`}>超时（毫秒）</label>
          <input
            id={`${idPrefix}-timeout`}
            type="number"
            min="5000"
            max="600000"
            step="5000"
            value={value.timeoutMs}
            onChange={(e) => onChange('timeoutMs', parseInt(e.target.value, 10) || 60000)}
          />
        </div>
      </div>

      <div className="api-fields__field">
        <label htmlFor={`${idPrefix}-baseurl`}>API Base URL *</label>
        <input
          id={`${idPrefix}-baseurl`}
          type="text"
          value={value.apiBaseUrl}
          onChange={(e) => onChange('apiBaseUrl', e.target.value)}
          placeholder={protocol.defaultBaseUrl}
        />
      </div>

      <div className="api-fields__field">
        <label htmlFor={`${idPrefix}-apikey`}>
          API Key *
          {onToggleApiKey && (
            <button
              type="button"
              className="api-fields__inline-btn"
              onClick={onToggleApiKey}
            >
              {showApiKey ? '隐藏' : '显示'}
            </button>
          )}
        </label>
        <input
          id={`${idPrefix}-apikey`}
          type={showApiKey ? 'text' : 'password'}
          value={value.apiKey}
          onChange={(e) => onChange('apiKey', e.target.value)}
          placeholder="sk-..."
          autoComplete="off"
        />
      </div>

      {protocol.supportsOrganization && (
        <div className="api-fields__field">
          <label htmlFor={`${idPrefix}-org`}>Organization ID</label>
          <input
            id={`${idPrefix}-org`}
            type="text"
            value={value.organizationId}
            onChange={(e) => onChange('organizationId', e.target.value)}
            placeholder="org-... （可选）"
          />
          <span className="api-fields__hint">OpenAI 多组织场景使用，留空即可</span>
        </div>
      )}

      {protocol.needsApiVersion && (
        <div className="api-fields__field">
          <label htmlFor={`${idPrefix}-apiver`}>API Version *</label>
          <input
            id={`${idPrefix}-apiver`}
            type="text"
            value={value.apiVersion}
            onChange={(e) => onChange('apiVersion', e.target.value)}
            placeholder="2024-02-15-preview"
          />
          <span className="api-fields__hint">Azure OpenAI 必填</span>
        </div>
      )}

      <div className="api-fields__field">
        <label>
          <input
            type="checkbox"
            checked={!!value.stream}
            onChange={(e) => onChange('stream', e.target.checked)}
          />
          <span style={{ marginLeft: 8 }}>启用流式响应（Streaming）</span>
        </label>
        <span className="api-fields__hint">开启后聊天界面将逐字显示回复</span>
      </div>

      <div className="api-fields__headers">
        <div className="api-fields__headers-header">
          <span>自定义请求头</span>
          <button
            type="button"
            className="api-fields__inline-btn"
            onClick={handleAddHeader}
          >
            + 添加
          </button>
        </div>
        {(value.customHeaders || []).length === 0 && (
          <span className="api-fields__hint">无（如代理需要额外认证可添加，如 X-Custom-Auth）</span>
        )}
        {(value.customHeaders || []).map((h, idx) => (
          <div key={idx} className="api-fields__header-row">
            <input
              type="text"
              placeholder="Header 名"
              value={h.key}
              onChange={(e) => handleHeaderChange(idx, 'key', e.target.value)}
            />
            <input
              type="text"
              placeholder="Header 值"
              value={h.value}
              onChange={(e) => handleHeaderChange(idx, 'value', e.target.value)}
            />
            <button
              type="button"
              className="api-fields__remove-btn"
              onClick={() => handleRemoveHeader(idx)}
              title="删除"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

ApiConfigFields.propTypes = {
  value: PropTypes.shape({
    protocol: PropTypes.string,
    apiBaseUrl: PropTypes.string,
    apiKey: PropTypes.string,
    organizationId: PropTypes.string,
    apiVersion: PropTypes.string,
    customHeaders: PropTypes.array,
    timeoutMs: PropTypes.number,
    stream: PropTypes.bool,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  idPrefix: PropTypes.string.isRequired,
  showApiKey: PropTypes.bool,
  onToggleApiKey: PropTypes.func,
};

ApiConfigFields.defaultProps = {
  showApiKey: false,
  onToggleApiKey: null,
};

export default ApiConfigFields;
