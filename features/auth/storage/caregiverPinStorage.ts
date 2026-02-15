/**
 * Caregiver PIN - hash only, never plaintext
 */

import * as Crypto from 'expo-crypto';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY_PIN_HASH = '@pandapal/caregiver_pin_hash';
const KEY_PIN_SALT = '@pandapal/caregiver_pin_salt';
const DEFAULT_SALT = 'pandapal_cg_v1';

async function getSalt(): Promise<string> {
  try {
    const raw = await AsyncStorage.getItem(KEY_PIN_SALT);
    if (raw) return raw;
    const salt = `${DEFAULT_SALT}_${Date.now()}`;
    await AsyncStorage.setItem(KEY_PIN_SALT, salt);
    return salt;
  } catch {
    return DEFAULT_SALT;
  }
}

async function hashPin(pin: string, salt: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${pin}${salt}`);
}

export async function hasCaregiverPin(): Promise<boolean> {
  try {
    const raw = await AsyncStorage.getItem(KEY_PIN_HASH);
    return !!raw;
  } catch {
    return false;
  }
}

export async function setCaregiverPin(pin: string): Promise<void> {
  const salt = await getSalt();
  const hash = await hashPin(pin, salt);
  await AsyncStorage.setItem(KEY_PIN_HASH, hash);
}

export async function verifyCaregiverPin(inputPin: string): Promise<boolean> {
  const stored = await AsyncStorage.getItem(KEY_PIN_HASH);
  if (!stored) return false;
  const salt = await getSalt();
  const hash = await hashPin(inputPin, salt);
  return hash === stored;
}

export async function clearCaregiverPin(): Promise<void> {
  await AsyncStorage.removeItem(KEY_PIN_HASH);
}
