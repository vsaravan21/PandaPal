/**
 * Panda Friend item catalog - hats, glasses, outfits, accessories, backgrounds, decor
 * 20–30 items, 6+ starter unlocked
 */

import type { PandaItem } from '../types';

export const ITEM_CATALOG: PandaItem[] = [
  // Hats - starters
  { id: 'hat_bow', type: 'hat', name: 'Bow', emoji: '🎀', rarity: 'common', unlockRule: { kind: 'starter' } },
  { id: 'hat_cap', type: 'hat', name: 'Baseball Cap', emoji: '🧢', rarity: 'common', unlockRule: { kind: 'xpLevel', level: 2 } },
  { id: 'hat_crown', type: 'hat', name: 'Crown', emoji: '👑', rarity: 'rare', unlockRule: { kind: 'xpLevel', level: 3 } },
  { id: 'hat_headphones', type: 'hat', name: 'Headphones', emoji: '🎧', rarity: 'common', unlockRule: { kind: 'xpLevel', level: 2 } },
  { id: 'hat_flower', type: 'hat', name: 'Flower', emoji: '🌸', rarity: 'common', unlockRule: { kind: 'xpLevel', level: 4 } },
  { id: 'hat_wizard', type: 'hat', name: 'Wizard Hat', emoji: '🧙', rarity: 'epic', unlockRule: { kind: 'xpLevel', level: 5 } },
  // Glasses
  { id: 'glasses_round', type: 'glasses', name: 'Round Glasses', emoji: '👓', rarity: 'common', unlockRule: { kind: 'starter' } },
  { id: 'glasses_sunglasses', type: 'glasses', name: 'Cool Shades', emoji: '🕶️', rarity: 'common', unlockRule: { kind: 'xpLevel', level: 2 } },
  { id: 'glasses_heart', type: 'glasses', name: 'Heart Glasses', emoji: '💕', rarity: 'rare', unlockRule: { kind: 'xpLevel', level: 4 } },
  // Outfits (shirts) - use shirt_red to match profile
  { id: 'shirt_red', type: 'outfit', name: 'Red Shirt', emoji: '👕', rarity: 'common', unlockRule: { kind: 'starter' } },
  { id: 'shirt_star', type: 'outfit', name: 'Star Shirt', emoji: '⭐', rarity: 'common', unlockRule: { kind: 'xpLevel', level: 2 } },
  { id: 'shirt_superhero', type: 'outfit', name: 'Superhero Cape', emoji: '🦸', rarity: 'epic', unlockRule: { kind: 'xpLevel', level: 4 } },
  { id: 'shirt_rainbow', type: 'outfit', name: 'Rainbow Shirt', emoji: '🌈', rarity: 'rare', unlockRule: { kind: 'xpLevel', level: 3 } },
  // Accessories
  { id: 'acc_scarf', type: 'accessory', name: 'Scarf', emoji: '🧣', rarity: 'common', unlockRule: { kind: 'starter' } },
  { id: 'acc_bowtie', type: 'accessory', name: 'Bow Tie', emoji: '🎀', rarity: 'common', unlockRule: { kind: 'xpLevel', level: 2 } },
  { id: 'acc_backpack', type: 'accessory', name: 'Backpack', emoji: '🎒', rarity: 'rare', unlockRule: { kind: 'xpLevel', level: 3 } },
  { id: 'acc_wings', type: 'accessory', name: 'Angel Wings', emoji: '🪽', rarity: 'epic', unlockRule: { kind: 'xpLevel', level: 5 } },
  // Backgrounds
  { id: 'bg_clouds', type: 'background', name: 'Cloud Sky', emoji: '☁️', rarity: 'common', unlockRule: { kind: 'starter' } },
  { id: 'bg_garden', type: 'background', name: 'Garden', emoji: '🌿', rarity: 'common', unlockRule: { kind: 'xpLevel', level: 2 } },
  { id: 'bg_beach', type: 'background', name: 'Beach', emoji: '🏖️', rarity: 'rare', unlockRule: { kind: 'xpLevel', level: 3 }, imageSource: require('../../../assets/images/beach.png') },
  { id: 'bg_forest', type: 'background', name: 'Forest House', emoji: '🏡', rarity: 'rare', unlockRule: { kind: 'xpLevel', level: 3 }, imageSource: require('../../../assets/images/forest_house.png') },
  { id: 'bg_campsite', type: 'background', name: 'Campsite', emoji: '⛺', rarity: 'epic', unlockRule: { kind: 'xpLevel', level: 4 }, imageSource: require('../../../assets/images/campsite.png') },
  { id: 'bg_space', type: 'background', name: 'Space', emoji: '🌌', rarity: 'epic', unlockRule: { kind: 'xpLevel', level: 5 } },
  // Decor (room)
  { id: 'decor_plant', type: 'decor', name: 'Plant', emoji: '🪴', rarity: 'common', unlockRule: { kind: 'starter' } },
  { id: 'decor_star', type: 'decor', name: 'Star Trophy', emoji: '🏆', rarity: 'common', unlockRule: { kind: 'xpLevel', level: 2 } },
  { id: 'decor_poster', type: 'decor', name: 'Poster', emoji: '🖼️', rarity: 'common', unlockRule: { kind: 'starter' } },
  { id: 'decor_books', type: 'decor', name: 'Books', emoji: '📚', rarity: 'rare', unlockRule: { kind: 'xpLevel', level: 3 } },
  { id: 'decor_lamp', type: 'decor', name: 'Lamp', emoji: '🪔', rarity: 'common', unlockRule: { kind: 'xpLevel', level: 2 } },
];

/** Starter item IDs (unlocked by default) */
export const STARTER_ITEM_IDS = [
  'hat_bow',
  'glasses_round',
  'shirt_red',
  'acc_scarf',
  'bg_clouds',
  'bg_beach',
  'bg_forest',
  'bg_campsite',
  'decor_plant',
  'decor_poster',
];
