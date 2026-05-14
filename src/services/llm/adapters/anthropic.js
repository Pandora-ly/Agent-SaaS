// Anthropic 原生协议
// 接口：POST {baseUrl}/v1/messages
// system 单独传，messages 不含 system

function buildHeaders(config) {
  const headers = {
    'Content-Type': 'application/json',
    'x-api-key': config.apiKey,
    'anthropic-version': '2023-06-01',
    // 浏览器直连必须显式声明，否则 Anthropic 拒绝
    'anthropic-dangerous-direct-browser-access': 'true',
  };
  for (const h of config.customHeaders || []) {
    if (h?.key && h?.value) headers[h.key] = h.value;
  }
  return headers;
}

function buildMessages(history, userMessage) {
  const messages = [];
  for (const m of history.slice(-10)) {
    if (m.role === 'system') continue;
    messages.push({ role: m.role, content: m.content });
  }
  messages.push({ role: 'user', content: userMessage });
  return messages;
}

export const anthropicAdapter = {
  buildRequest(config, userMessage, history, { stream }) {
    const baseUrl = (config.apiBaseUrl || '').replace(/\/+$/, '');
    const body = {
      model: config.modelName || 'claude-3-5-sonnet-20241022',
      messages: buildMessages(history, userMessage),
      max_tokens: config.maxTokens || 2048,
      temperature: config.temperature ?? 0.5,
      stream: !!stream,
    };
    if (config.systemPrompt) body.system = config.systemPrompt;
    return {
      url: `${baseUrl}/v1/messages`,
      headers: buildHeaders(config),
      body,
    };
  },

  parseResponse(data) {
    // { content: [{ type: 'text', text: '...' }] }
    return (data.content || [])
      .filter((c) => c.type === 'text')
      .map((c) => c.text)
      .join('');
  },

  // SSE 事件类型：content_block_delta -> delta.text
  parseStreamChunk(data) {
    if (data.type === 'content_block_delta') {
      return data.delta?.text || '';
    }
    return '';
  },

  buildTestRequest(config) {
    return this.buildRequest(
      { ...config, systemPrompt: '', temperature: 0, maxTokens: 1 },
      'ping',
      [],
      { stream: false }
    );
  },
};
