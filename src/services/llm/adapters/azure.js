// Azure OpenAI
// 接口：POST {baseUrl}/openai/deployments/{deploymentName}/chat/completions?api-version=xxx
// 鉴权：api-key 头
// modelName 当作 deployment name

function buildHeaders(config) {
  const headers = {
    'Content-Type': 'application/json',
    'api-key': config.apiKey,
  };
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

export const azureAdapter = {
  buildRequest(config, userMessage, history, { stream }) {
    const baseUrl = (config.apiBaseUrl || '').replace(/\/+$/, '');
    const deployment = encodeURIComponent(config.modelName || '');
    const apiVersion = config.apiVersion || '2024-02-15-preview';
    return {
      url: `${baseUrl}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`,
      headers: buildHeaders(config),
      body: {
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

  parseStreamChunk(data) {
    return data.choices?.[0]?.delta?.content || '';
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
