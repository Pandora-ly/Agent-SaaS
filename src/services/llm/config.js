// 把 agent + settings 合并成最终调用 LLM 的配置
// agent.useCustomApi=true 用 agent 自己的 API 配置，否则继承 settings
export function resolveApiConfig(agent, settings) {
  const useCustom = !!agent?.useCustomApi;
  const src = useCustom ? agent : settings;

  return {
    protocol: src.protocol || 'openai',
    apiBaseUrl: src.apiBaseUrl || '',
    apiKey: src.apiKey || '',
    organizationId: src.organizationId || '',
    apiVersion: src.apiVersion || '',
    customHeaders: src.customHeaders || [],
    timeoutMs: src.timeoutMs || 60000,
    stream: src.stream ?? true,
    // 模型与采样参数始终来自 agent
    systemPrompt: agent?.systemPrompt || '',
    temperature: agent?.temperature ?? 0.5,
    maxTokens: agent?.maxTokens || 2048,
    modelName: agent?.modelName || agent?.model || '',
  };
}

export function isApiConfigured(config) {
  return !!(config.apiBaseUrl && config.apiKey);
}
