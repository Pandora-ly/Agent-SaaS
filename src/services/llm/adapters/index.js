import { openaiAdapter } from './openai';
import { anthropicAdapter } from './anthropic';
import { azureAdapter } from './azure';

const ADAPTERS = {
  openai: openaiAdapter,
  anthropic: anthropicAdapter,
  azure: azureAdapter,
};

export function getAdapter(protocol) {
  return ADAPTERS[protocol] || openaiAdapter;
}
