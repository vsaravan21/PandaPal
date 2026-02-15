/**
 * Panda Friend - profile, customization, collection
 */

export type ItemType = 'hat' | 'glasses' | 'outfit' | 'accessory' | 'background' | 'decor';

export type UnlockRule =
  | { kind: 'starter' }
  | { kind: 'xpLevel'; level: number }
  | { kind: 'storyEnding'; endingId: string }
  | { kind: 'lessonTopic'; topicTag: string };

export type Rarity = 'common' | 'rare' | 'epic';

export interface PandaItem {
  id: string;
  type: ItemType;
  name: string;
  emoji: string;
  rarity: Rarity;
  unlockRule: UnlockRule;
  /** For backgrounds: local image require() - when set, used instead of emoji in hero */
  imageSource?: number;
}

export interface PandaFriendState {
  pandaName: string;
  adventuresCompleted: number;
  seenItemIds: string[];
  equippedGlassesId: string | null;
  decorSlots: [string | null, string | null, string | null];
}
