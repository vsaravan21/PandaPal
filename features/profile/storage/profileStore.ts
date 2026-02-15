/**
 * Profile store - XP, level, coins, unlockables, equipped items
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ChildProfile } from '../types';
import type { ItemSlot } from '../types';

const STORAGE_KEY = '@pandapal/child_profile';

const DEFAULT_EQUIPPED: Record<ItemSlot, string | null> = {
  hat: 'hat_bow',
  shirt: 'shirt_red',
  accessory: null,
  background: 'bg_clouds',
};

const DEFAULT_PROFILE: ChildProfile = {
  xp: 0,
  coins: 0,
  level: 1,
  inventory: ['hat_bow', 'shirt_red', 'bg_clouds'],
  equippedItems: { ...DEFAULT_EQUIPPED },
};

async function loadProfile(): Promise<ChildProfile> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_PROFILE };
    const parsed = JSON.parse(raw);
    const inv = Array.isArray(parsed.inventory) ? parsed.inventory : [];
    const base = ['hat_bow', 'shirt_red', 'bg_clouds'];
    const inventory = base.every((id) => inv.includes(id))
      ? inv
      : [...base.filter((id) => !inv.includes(id)), ...inv];
    return {
      ...DEFAULT_PROFILE,
      ...parsed,
      xp: parsed.xp ?? 0,
      coins: parsed.coins ?? 0,
      level: parsed.level ?? 1,
      inventory,
      equippedItems: {
        ...DEFAULT_EQUIPPED,
        ...(parsed.equippedItems ?? {}),
      },
      pandaAvatarId: parsed.pandaAvatarId ?? undefined,
      childName: parsed.childName ?? undefined,
    };
  } catch {
    return { ...DEFAULT_PROFILE };
  }
}


async function saveProfile(profile: ChildProfile): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

export async function getProfile(): Promise<ChildProfile> {
  return loadProfile();
}

export async function addLessonReward(params: {
  xp: number;
  coins: number;
  items?: string[];
}): Promise<ChildProfile> {
  const profile = await loadProfile();
  profile.xp += params.xp;
  profile.coins += params.coins;
  if (params.items?.length) {
    const seen = new Set(profile.inventory);
    params.items.forEach((id) => !seen.has(id) && profile.inventory.push(id) && seen.add(id));
  }
  const { xpToLevel } = await import('../utils/leveling');
  profile.level = xpToLevel(profile.xp);
  await saveProfile(profile);
  return profile;
}

export async function equipItem(slot: ItemSlot, itemId: string | null): Promise<ChildProfile> {
  const profile = await loadProfile();
  profile.equippedItems = { ...profile.equippedItems, [slot]: itemId };
  await saveProfile(profile);
  return profile;
}

export async function unlockItem(itemId: string, costXp: number): Promise<ChildProfile> {
  const profile = await loadProfile();
  if (profile.xp < costXp) throw new Error('Not enough XP');
  if (profile.inventory.includes(itemId)) return profile; // already owned
  profile.xp -= costXp;
  profile.inventory.push(itemId);
  const { xpToLevel } = await import('../utils/leveling');
  profile.level = xpToLevel(profile.xp);
  await saveProfile(profile);
  return profile;
}

export async function setPandaAvatarId(pandaAvatarId: string): Promise<ChildProfile> {
  const profile = await loadProfile();
  profile.pandaAvatarId = pandaAvatarId;
  await saveProfile(profile);
  return profile;
}

export async function setChildName(childName: string): Promise<ChildProfile> {
  const profile = await loadProfile();
  profile.childName = childName.trim() || undefined;
  await saveProfile(profile);
  return profile;
}

