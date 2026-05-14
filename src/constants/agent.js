export const AGENT_STATUS = {
  idle: { label: '空闲', className: 'status--idle' },
  running: { label: '运行中', className: 'status--running' },
  error: { label: '异常', className: 'status--error' },
};

export function getAgentStatusInfo(status) {
  return AGENT_STATUS[status] || { label: status, className: '' };
}

export const MODEL_PRESETS = [
  { value: 'gpt-4', label: 'GPT-4' },
  { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
  { value: 'gpt-4o', label: 'GPT-4o' },
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
  { value: 'claude-sonnet-4-20250514', label: 'Claude Sonnet 4' },
  { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet' },
  { value: 'claude-3-haiku-20240307', label: 'Claude 3 Haiku' },
  { value: 'deepseek-chat', label: 'DeepSeek Chat' },
  { value: 'qwen-turbo', label: '通义千问 Turbo' },
  { value: 'custom', label: '自定义' },
];
