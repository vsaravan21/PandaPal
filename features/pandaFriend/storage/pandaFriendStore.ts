/**
 * Panda Friend store - name, adventures, seen items, decor
 * Profile (xp, level, inventory, hat/shirt/accessory/background) lives in profileStore
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PandaFriendState } from '../types';

const KEY = '@pandapal/panda_friend';

const DEFAULT: PandaFriendState = {
  pandaName: 'My Panda',
  adventuresCompleted: 0,
  seenItemIds: [],
  equippedGlassesId: null,
  decorSlots: [null, null, null],
};

export async function loadPandaFriend(): Promise<PandaFriendState> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT };
    const parsed = JSON.parse(raw);
    return {
      pandaName: parsed.pandaName ?? DEFAULT.pandaName,
      adventuresCompleted: Math.max(0, parsed.adventuresCompleted ?? 0),
      seenItemIds: Array.isArray(parsed.seenItemIds) ? parsed.seenItemIds : DEFAULT.seenItemIds,
      equippedGlassesId: parsed.equippedGlassesId ?? DEFAULT.equippedGlassesId,
      decorSlots: Array.isArray(parsed.decorSlots) && parsed.decorSlots.length >= 3
        ? [parsed.decorSlots[0] ?? null, parsed.decorSlots[1] ?? null, parsed.decorSlots[2] ?? null]
        : DEFAULT.decorSlots,
    };
  } catch {
    return { ...DEFAULT };
  }
}

export async function savePandaFriend(state: PandaFriendState): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(state));
}

export async function setPandaName(name: string): Promise<void> {
  const s = await loadPandaFriend();
  s.pandaName = name.trim() || DEFAULT.pandaName;
  await savePandaFriend(s);
}

export async function setAdventuresCount(n: number): Promise<void> {
  const s = await loadPandaFriend();
  s.adventuresCompleted = Math.max(0, n);
  await savePandaFriend(s);
}

export async function addAdventure(): Promise<void> {
  const s = await loadPandaFriend();
  s.adventuresCompleted += 1;
  await savePandaFriend(s);
}

export async function markItemSeen(itemId: string): Promise<void> {
  const s = await loadPandaFriend();
  if (!s.seenItemIds.includes(itemId)) s.seenItemIds.push(itemId);
  await savePandaFriend(s);
}

export async function setEquippedGlasses(itemId: string | null): Promise<void> {
  const s = await loadPandaFriend();
  s.equippedGlassesId = itemId;
  await savePandaFriend(s);
}

export async function setDecorSlot(index: 0 | 1 | 2, itemId: string | null): Promise<void> {
  const s = await loadPandaFriend();
  const next = [...s.decorSlots] as [string | null, string | null, string | null];
  next[index] = itemId;
  s.decorSlots = next;
  await savePandaFriend(s);
}
