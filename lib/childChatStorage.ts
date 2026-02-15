/**
 * Stable ID for child chat rate limit (25 calls/day per device/child).
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@pandapal/child_chat_id';

function randomId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export async function getOrCreateChildChatId(): Promise<string> {
  try {
    const existing = await AsyncStorage.getItem(KEY);
    if (existing && existing.length > 0) return existing;
    const id = randomId();
    await AsyncStorage.setItem(KEY, id);
    return id;
  } catch {
    return randomId();
  }
}
