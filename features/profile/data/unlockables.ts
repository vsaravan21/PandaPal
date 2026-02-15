/**
 * Unlockable panda items - clothes, accessories
 * Use XP to unlock and wear
 */

import type { UnlockableItem } from '../types';

export const UNLOCKABLES: UnlockableItem[] = [
  // Hats - low cost, fun starter items
  { id: 'hat_bow', name: 'Bow', slot: 'hat', emoji: '🎀', costXp: 0, requiredLevel: 1 }, // free starter
  { id: 'hat_cap', name: 'Baseball Cap', slot: 'hat', emoji: '🧢', costXp: 50 },
  { id: 'hat_crown', name: 'Crown', slot: 'hat', emoji: '👑', costXp: 100, requiredLevel: 2 },
  { id: 'hat_headphones', name: 'Headphones', slot: 'hat', emoji: '🎧', costXp: 150 },
  { id: 'hat_flower', name: 'Flower', slot: 'hat', emoji: '🌸', costXp: 200, requiredLevel: 3 },
  { id: 'hat_wizard', name: 'Wizard Hat', slot: 'hat', emoji: '🧙', costXp: 300 },
  { id: 'hat_sunhat', name: 'Sun Hat', slot: 'hat', emoji: '👒', costXp: 350 },
  // Shirts
  { id: 'shirt_red', name: 'Red Shirt', slot: 'shirt', emoji: '👕', costXp: 0, requiredLevel: 1 }, // free
  { id: 'shirt_star', name: 'Star Shirt', slot: 'shirt', emoji: '⭐', costXp: 75 },
  { id: 'shirt_heart', name: 'Heart Shirt', slot: 'shirt', emoji: '❤️', costXp: 100 },
  { id: 'shirt_superhero', name: 'Superhero Cape', slot: 'shirt', emoji: '🦸', costXp: 250, requiredLevel: 3 },
  { id: 'shirt_rainbow', name: 'Rainbow Shirt', slot: 'shirt', emoji: '🌈', costXp: 300 },
  // Accessories
  { id: 'acc_glasses', name: 'Glasses', slot: 'accessory', emoji: '👓', costXp: 50 },
  { id: 'acc_scarf', name: 'Scarf', slot: 'accessory', emoji: '🧣', costXp: 100 },
  { id: 'acc_bowtie', name: 'Bow Tie', slot: 'accessory', emoji: '🎀', costXp: 80 },
  { id: 'acc_backpack', name: 'Backpack', slot: 'accessory', emoji: '🎒', costXp: 150 },
  { id: 'acc_wings', name: 'Angel Wings', slot: 'accessory', emoji: '🪽', costXp: 400, requiredLevel: 5 },
  // Backgrounds
  { id: 'bg_clouds', name: 'Cloud Sky', slot: 'background', emoji: '☁️', costXp: 0, requiredLevel: 1 }, // free
  { id: 'bg_garden', name: 'Garden', slot: 'background', emoji: '🌿', costXp: 100 },
  { id: 'bg_beach', name: 'Beach', slot: 'background', emoji: '🏖️', costXp: 200 },
  { id: 'bg_space', name: 'Space', slot: 'background', emoji: '🌌', costXp: 350, requiredLevel: 4 },
];
