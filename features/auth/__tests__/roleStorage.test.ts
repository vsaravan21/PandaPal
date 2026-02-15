/**
 * Role storage - get/set/clear
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { getRole, setRole, clearRole } from '../storage/roleStorage';

const KEY = '@pandapal/role';

describe('roleStorage', () => {
  beforeEach(async () => {
    await AsyncStorage.removeItem(KEY);
  });

  it('getRole returns null when empty', async () => {
    expect(await getRole()).toBeNull();
  });

  it('setRole and getRole roundtrip', async () => {
    await setRole('kid');
    expect(await getRole()).toBe('kid');
    await setRole('caregiver');
    expect(await getRole()).toBe('caregiver');
  });

  it('clearRole removes role', async () => {
    await setRole('kid');
    await clearRole();
    expect(await getRole()).toBeNull();
  });

  it('setRole null clears', async () => {
    await setRole('kid');
    await setRole(null);
    expect(await getRole()).toBeNull();
  });
});
