/**
 * Caregiver PIN storage - set, verify, clear
 */

import {
  hasCaregiverPin,
  setCaregiverPin,
  verifyCaregiverPin,
  clearCaregiverPin,
} from '../storage/caregiverPinStorage';

describe('caregiverPinStorage', () => {
  beforeEach(async () => {
    await clearCaregiverPin();
  });

  it('hasCaregiverPin returns false when empty', async () => {
    expect(await hasCaregiverPin()).toBe(false);
  });

  it('setCaregiverPin and verify roundtrip', async () => {
    await setCaregiverPin('1234');
    expect(await hasCaregiverPin()).toBe(true);
    expect(await verifyCaregiverPin('1234')).toBe(true);
    expect(await verifyCaregiverPin('5678')).toBe(false);
  });

  it('verify returns false for wrong PIN', async () => {
    await setCaregiverPin('1234');
    expect(await verifyCaregiverPin('0000')).toBe(false);
  });

  it('clearCaregiverPin removes PIN', async () => {
    await setCaregiverPin('1234');
    await clearCaregiverPin();
    expect(await hasCaregiverPin()).toBe(false);
    expect(await verifyCaregiverPin('1234')).toBe(false);
  });

  it('produces different hashes for different PINs', async () => {
    await setCaregiverPin('1234');
    expect(await verifyCaregiverPin('1234')).toBe(true);
    expect(await verifyCaregiverPin('1235')).toBe(false);
  });
});
