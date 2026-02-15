/**
 * Unlock logic - check if item is unlocked for user
 */

import type { PandaItem, UnlockRule } from '../types';
import { STARTER_ITEM_IDS } from '../data/itemCatalog';

export function isItemUnlocked(
  item: PandaItem,
  profile: { level: number; inventory: string[] }
): boolean {
  if (profile.inventory.includes(item.id)) return true;
  if (STARTER_ITEM_IDS.includes(item.id)) return true;
  const rule = item.unlockRule;
  if (rule.kind === 'starter') return true;
  if (rule.kind === 'xpLevel') return profile.level >= rule.level;
  return false;
}

/**
 * Grant reward - add XP and/or items. Call from quest/lesson/story completion.
 */
export async function grantReward(params: {
  xpDelta?: number;
  itemsUnlocked?: string[];
  adventure?: boolean;
}): Promise<void> {
  const { addLessonReward } = await import('@/features/profile/storage/profileStore');
  const { addAdventure } = await import('../storage/pandaFriendStore');
  if (params.xpDelta || (params.itemsUnlocked?.length ?? 0) > 0) {
    await addLessonReward({
      xp: params.xpDelta ?? 0,
      coins: 0,
      items: params.itemsUnlocked ?? [],
    });
  }
  if (params.adventure !== false) {
    await addAdventure();
  }
}
