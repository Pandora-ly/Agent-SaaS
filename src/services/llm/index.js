// LLM 统一入口
import { generateMockResponse } from './mockLlm';
import { callRealApi, testConnection } from './realLlm';
import { resolveApiConfig, isApiConfigured } from './config';

export { resolveApiConfig, isApiConfigured, testConnection };

// options: { signal, onChunk(text) }
export async function generateResponse(config, userMessage, history = [], options = {}) {
  if (isApiConfigured(config)) {
    try {
      return await callRealApi(config, userMessage, history, options);
    } catch (err) {
      if (err.name === 'AbortError') throw err;
      const mock = await generateMockResponse(
        config.systemPrompt,
        userMessage,
        history,
        options
      );
      return `[API 调用失败: ${err.message}]\n\n以下为模拟响应：\n${mock}`;
    }
  }
  return generateMockResponse(config.systemPrompt, userMessage, history, options);
}
