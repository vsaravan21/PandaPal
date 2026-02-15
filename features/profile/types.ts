/**
 * PandaPal Profile - Level, XP, unlockables, equipped items
 */

export type ItemSlot = 'hat' | 'shirt' | 'accessory' | 'background';

export interface UnlockableItem {
  id: string;
  name: string;
  slot: ItemSlot;
  emoji: string; // Fun emoji for kid-friendly display
  costXp: number;
  requiredLevel?: number; // Min level to unlock
}

export interface ChildProfile {
  xp: number;
  coins: number;
  level: number;
  inventory: string[];
  equippedItems: Record<ItemSlot, string | null>; // slot -> item id
  /** Selected panda avatar id from onboarding; fallback "panda_default" when missing */
  pandaAvatarId?: string;
  /** Child's name from onboarding; for greeting on Quests etc. */
  childName?: string;
}
