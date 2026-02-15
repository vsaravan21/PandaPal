/**
 * Role storage - kid | caregiver | null
 * Persisted until Switch Role
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY_ROLE = '@pandapal/role';

export type Role = 'kid' | 'caregiver' | null;

export async function getRole(): Promise<Role> {
  try {
    const raw = await AsyncStorage.getItem(KEY_ROLE);
    if (!raw) return null;
    const v = raw as Role;
    return v === 'kid' || v === 'caregiver' ? v : null;
  } catch {
    return null;
  }
}

export async function setRole(role: Role): Promise<void> {
  if (role) {
    await AsyncStorage.setItem(KEY_ROLE, role);
  } else {
    await AsyncStorage.removeItem(KEY_ROLE);
  }
}

export async function clearRole(): Promise<void> {
  await AsyncStorage.removeItem(KEY_ROLE);
}
