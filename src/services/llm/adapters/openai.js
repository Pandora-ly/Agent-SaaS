// OpenAI 兼容协议
// 也用于 DeepSeek / 通义千问 / 第三方代理

function buildHeaders(config) {
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${config.apiKey}`,
  };
  if (config.organizationId) {
    headers['OpenAI-Organization'] = config.organizationId;
  }
  for (const h of config.customHeaders || []) {
    if (h?.key && h?.value) headers[h.key] = h.value;
  }
  return headers;
}

function buildMessages(systemPrompt, history, userMessage) {
  const messages = [];
  if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
  for (const m of history.slice(-10)) {
    messages.push({ role: m.role, content: m.content });
  }
  messages.push({ role: 'user', content: userMessage });
  return messages;
}

export const openaiAdapter = {
  buildRequest(config, userMessage, history, { stream }) {
    const baseUrl = (config.apiBaseUrl || '').replace(/\/+$/, '');
    return {
      url: `${baseUrl}/chat/completions`,
      headers: buildHeaders(config),
      body: {
        model: config.modelName || 'gpt-4',
        messages: buildMessages(config.systemPrompt, history, userMessage),
        temperature: config.temperature ?? 0.5,
        max_tokens: config.maxTokens || 2048,
        stream: !!stream,
      },
    };
  },

  parseResponse(data) {
    return data.choices?.[0]?.message?.content || '';
  },

  // SSE chunk: data: {"choices":[{"delta":{"content":"xxx"}}]}
  parseStreamChunk(data) {
    return data.choices?.[0]?.delta?.content || '';
  },

  // 测试连接：发一条最短消息
  buildTestRequest(config) {
    return this.buildRequest(
      { ...config, systemPrompt: '', temperature: 0, maxTokens: 1 },
      'ping',
      [],
      { stream: false }
    );
  },
};
