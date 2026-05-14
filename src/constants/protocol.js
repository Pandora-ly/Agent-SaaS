export const PROTOCOLS = [
  {
    value: 'openai',
    label: 'OpenAI 兼容',
    description: '适用于 OpenAI / DeepSeek / 通义千问 / 第三方代理 / 本地部署',
    defaultBaseUrl: 'https://api.openai.com/v1',
    needsApiVersion: false,
    supportsOrganization: true,
  },
  {
    value: 'anthropic',
    label: 'Anthropic 原生',
    description: 'Claude 官方接口（/v1/messages）',
    defaultBaseUrl: 'https://api.anthropic.com',
    needsApiVersion: false,
    supportsOrganization: false,
  },
  {
    value: 'azure',
    label: 'Azure OpenAI',
    description: '需要填写 deployment name 作为 modelName 与 api-version',
    defaultBaseUrl: 'https://YOUR_RESOURCE.openai.azure.com',
    needsApiVersion: true,
    supportsOrganization: false,
  },
];

export function getProtocol(value) {
  return PROTOCOLS.find((p) => p.value === value) || PROTOCOLS[0];
}
