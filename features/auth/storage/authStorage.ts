/**
 * Auth storage - persisted hasPanda (logged in state)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY_AUTH = '@pandapal/auth';

export interface AuthState {
  hasPanda: boolean;
}

export async function getAuthState(): Promise<AuthState> {
  try {
    const raw = await AsyncStorage.getItem(KEY_AUTH);
    if (!raw) return { hasPanda: false };
    const parsed = JSON.parse(raw);
    return { hasPanda: !!parsed?.hasPanda };
  } catch {
    return { hasPanda: false };
  }
}

export async function setAuthState(state: AuthState): Promise<void> {
  await AsyncStorage.setItem(KEY_AUTH, JSON.stringify(state));
}
