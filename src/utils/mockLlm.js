// LLM 响应引擎
// 有 API 配置时调用真实接口，否则使用模拟响应

const RESPONSE_TEMPLATES = {
  数据分析: [
    '根据数据分析结果，{topic} 的趋势呈现上升态势，建议关注核心指标变化。',
    '已完成数据采集，发现 {topic} 相关的 3 个关键洞察：1) 峰值出现在工作日 2) 用户留存率稳定 3) 转化漏斗有优化空间。',
    '数据报告已生成。{topic} 的环比增长率为 12.7%，同比增幅显著。',
  ],
  内容生成: [
    '已为您生成关于 "{topic}" 的内容草稿，包含引言、核心论点和总结三个部分。',
    '根据您的要求，我撰写了 "{topic}" 的文案。建议从用户痛点切入，突出产品核心价值。',
    '关于 "{topic}" 的内容已完成，共约 800 字，风格偏向专业但易读。',
  ],
  任务调度: [
    '任务 "{topic}" 已加入队列，预计执行时间 5 分钟。当前队列中有 2 个待执行任务。',
    '已分析任务 "{topic}" 的依赖关系，建议按以下顺序执行：数据准备 → 模型训练 → 结果验证。',
    '任务 "{topic}" 的资源分配已完成，CPU 占用 40%，内存使用 2.1GB。',
  ],
  通用: [
    '收到您的请求。我正在处理关于 "{topic}" 的任务，请稍候...',
    '关于 "{topic}"，我的分析如下：这是一个值得深入探讨的方向，建议分步骤推进。',
    '已理解您的需求。针对 "{topic}"，我建议从以下三个方面入手：目标明确、资源整合、迭代优化。',
    '处理完成。关于 "{topic}" 的结果符合预期，如需进一步调整请告知。',
    '您好！关于 "{topic}" 的问题，我认为关键在于理解核心需求。让我为您详细分析一下。',
  ],
};

function selectTemplate(systemPrompt, userMessage) {
  const prompt = (systemPrompt || '').toLowerCase();
  const msg = userMessage.toLowerCase();

  if (prompt.includes('数据') || msg.includes('数据') || msg.includes('分析')) {
    return RESPONSE_TEMPLATES['数据分析'];
  }
  if (prompt.includes('内容') || prompt.includes('写作') || msg.includes('写') || msg.includes('生成')) {
    return RESPONSE_TEMPLATES['内容生成'];
  }
  if (prompt.includes('任务') || prompt.includes('调度') || msg.includes('任务')) {
    return RESPONSE_TEMPLATES['任务调度'];
  }
  return RESPONSE_TEMPLATES['通用'];
}

function extractTopic(message) {
  const cleaned = message
    .replace(/^(请|帮我|帮忙|能不能|可以|我想|我要|给我)/, '')
    .replace(/(一下|吗|呢|吧|啊|哦|哈)$/, '')
    .trim();
  return cleaned.slice(0, 20) || '这个问题';
}

// 模拟响应
function generateMockResponse(systemPrompt, userMessage, conversationHistory) {
  return new Promise((resolve) => {
    const delay = 800 + Math.random() * 1200;
    setTimeout(() => {
      const templates = selectTemplate(systemPrompt, userMessage);
      const topic = extractTopic(userMessage);
      const template = templates[Math.floor(Math.random() * templates.length)];
      let response = template.replace('{topic}', topic);
      if (conversationHistory.length > 2 && Math.random() > 0.7) {
        response += '\n\n基于之前的对话，我补充一点：整体方向是正确的，建议持续推进。';
      }
      resolve(response);
    }, delay);
  });
}

// 调用真实 LLM API（兼容 OpenAI 格式）
async function callRealApi(agentConfig, userMessage, conversationHistory) {
  const { apiBaseUrl, apiKey, modelName, systemPrompt, temperature, maxTokens } = agentConfig;

  const baseUrl = (apiBaseUrl || '').replace(/\/+$/, '');
  const model = modelName || 'gpt-4';

  // 构建 messages 数组
  const messages = [];
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }
  // 加入历史对话（最近 10 条）
  const recentHistory = conversationHistory.slice(-10);
  for (const msg of recentHistory) {
    messages.push({ role: msg.role, content: msg.content });
  }
  messages.push({ role: 'user', content: userMessage });

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: temperature ?? 0.5,
      max_tokens: maxTokens || 2048,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    throw new Error(`API 调用失败 (${response.status}): ${errorBody.slice(0, 200)}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '（无响应内容）';
}

// 统一入口：有 API 配置用真实接口，否则用模拟
export async function generateResponse(agentConfig, userMessage, conversationHistory = []) {
  const { apiBaseUrl, apiKey } = agentConfig;

  // 有完整的 API 配置时调用真实接口
  if (apiBaseUrl && apiKey) {
    try {
      return await callRealApi(agentConfig, userMessage, conversationHistory);
    } catch (err) {
      // 调用失败时回退到模拟响应，并附加错误提示
      const mock = await generateMockResponse(
        agentConfig.systemPrompt,
        userMessage,
        conversationHistory
      );
      return `[API 调用失败: ${err.message}]\n\n以下为模拟响应：\n${mock}`;
    }
  }

  // 无 API 配置时使用模拟响应
  return generateMockResponse(agentConfig.systemPrompt, userMessage, conversationHistory);
}
