// 真实 LLM 调用：支持多协议、流式、超时
import { getAdapter } from './adapters';
import { fetchWithTimeout, readSSE } from './fetcher';

export async function callRealApi(config, userMessage, history, { signal, onChunk } = {}) {
  const adapter = getAdapter(config.protocol);
  const stream = !!config.stream && typeof onChunk === 'function';
  const { url, headers, body } = adapter.buildRequest(config, userMessage, history, { stream });

  const response = await fetchWithTimeout(
    url,
    {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    },
    config.timeoutMs || 60000,
    signal
  );

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    throw new Error(`API ${response.status}: ${errorBody.slice(0, 300)}`);
  }

  if (stream) {
    return readSSE(response, adapter.parseStreamChunk.bind(adapter), onChunk);
  }

  const data = await response.json();
  return adapter.parseResponse(data);
}

// 测试连接：返回 { ok, latencyMs, error }
export async function testConnection(config) {
  const adapter = getAdapter(config.protocol);
  const { url, headers, body } = adapter.buildTestRequest(config);
  const start = performance.now();
  try {
    const res = await fetchWithTimeout(
      url,
      { method: 'POST', headers, body: JSON.stringify(body) },
      Math.min(config.timeoutMs || 60000, 15000)
    );
    const latencyMs = Math.round(performance.now() - start);
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      return { ok: false, latencyMs, error: `${res.status} ${text.slice(0, 200)}` };
    }
    return { ok: true, latencyMs };
  } catch (err) {
    return {
      ok: false,
      latencyMs: Math.round(performance.now() - start),
      error: err.name === 'AbortError' ? '请求超时' : err.message,
    };
  }
}
