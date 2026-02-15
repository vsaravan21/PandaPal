/**
 * Story Missions config - AI mode and API (env / app config)
 * Default: mock (no credits, no network)
 */

import Constants from 'expo-constants';

export type AIMode = 'mock' | 'live';

function getEnv(key: string): string | undefined {
  try {
    const extra = (Constants.expoConfig as { extra?: Record<string, string> })?.extra;
    if (extra?.[key]) return extra[key];
    if (typeof process !== 'undefined' && (process as NodeJS.Process & { env?: Record<string, string> }).env?.[key]) {
      return (process as NodeJS.Process & { env: Record<string, string> }).env[key];
    }
  } catch {
    // ignore
  }
  return undefined;
}

export function getAIMode(): AIMode {
  const raw = getEnv('AI_MODE') ?? getEnv('EXPO_PUBLIC_AI_MODE');
  if (raw === 'live') return 'live';
  return 'mock';
}

export function getAnthropicApiKey(): string | undefined {
  return getEnv('ANTHROPIC_API_KEY') ?? getEnv('EXPO_PUBLIC_ANTHROPIC_API_KEY');
}

export function getClaudeModel(): string {
  return getEnv('CLAUDE_MODEL') ?? getEnv('EXPO_PUBLIC_CLAUDE_MODEL') ?? 'claude-3-5-sonnet-20241022';
}

export const isMockMode = (): boolean => getAIMode() === 'mock';
