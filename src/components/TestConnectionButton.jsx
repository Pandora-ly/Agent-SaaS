import { useState } from 'react';
import PropTypes from 'prop-types';
import { testConnection } from '../services/llm';

function TestConnectionButton({ getConfig, disabled }) {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState(null);

  const handleTest = async () => {
    setTesting(true);
    setResult(null);
    try {
      const config = getConfig();
      if (!config.apiBaseUrl || !config.apiKey || !config.modelName) {
        setResult({ ok: false, error: '请先填写 Base URL、API Key 和模型名称' });
        return;
      }
      const r = await testConnection(config);
      setResult(r);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
      <button
        type="button"
        onClick={handleTest}
        disabled={disabled || testing}
        style={{
          padding: '8px 16px',
          background: '#fff',
          color: '#1976d2',
          border: '1px solid #1976d2',
          borderRadius: 4,
          cursor: disabled || testing ? 'not-allowed' : 'pointer',
          fontSize: 14,
          opacity: disabled || testing ? 0.6 : 1,
        }}
      >
        {testing ? '测试中...' : '测试连接'}
      </button>
      {result && (
        <span
          style={{
            fontSize: 13,
            color: result.ok ? '#2e7d32' : '#c62828',
            background: result.ok ? '#e8f5e9' : '#ffebee',
            padding: '4px 10px',
            borderRadius: 4,
            maxWidth: 480,
            wordBreak: 'break-all',
          }}
        >
          {result.ok
            ? `✓ 连接成功（${result.latencyMs} ms）`
            : `✗ ${result.error || '连接失败'}`}
        </span>
      )}
    </div>
  );
}

TestConnectionButton.propTypes = {
  // 返回完整 config（用于 testConnection），返回时再读取避免闭包过期
  getConfig: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

TestConnectionButton.defaultProps = {
  disabled: false,
};

export default TestConnectionButton;
