/**
 * Hash caregiver PIN with SHA256 + salt (EXPO_PUBLIC_PIN_SALT or default).
 */

import * as Crypto from 'expo-crypto';

const DEFAULT_SALT = 'pandapal_pin_v1';

export async function hashPin(pin: string): Promise<string> {
  const salt = process.env.EXPO_PUBLIC_PIN_SALT || DEFAULT_SALT;
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${pin}${salt}`);
}
