/**
 * MVP child quest seed for pediatric epilepsy.
 * Categories: medicine, routine, safety, health.
 * Used when no generated quests exist in storage.
 */

const REWARDS = {
  medicine: 10,
  routine: 5,
  safety: 10,
  health: 5,
};

/** @typedef {'medicine'|'routine'|'safety'|'health'} QuestCategory */
/** @typedef {{ id: string, text: string, category: QuestCategory, reward: number, completed: boolean }} SeedQuest */

/** @type {SeedQuest[]} */
const QUEST_SEED = [
  // Medicine
  { id: 'seed_med_1', text: 'Take your morning medicine with a grown up', category: 'medicine', reward: REWARDS.medicine, completed: false },
  { id: 'seed_med_2', text: 'Take your evening medicine with a grown up', category: 'medicine', reward: REWARDS.medicine, completed: false },
  // Routine
  { id: 'seed_rout_1', text: 'Go to bed on time tonight', category: 'routine', reward: REWARDS.routine, completed: false },
  { id: 'seed_rout_2', text: 'Finish your bedtime routine', category: 'routine', reward: REWARDS.routine, completed: false },
  // Safety
  { id: 'seed_safe_1', text: 'Wear your helmet when riding', category: 'safety', reward: REWARDS.safety, completed: false },
  { id: 'seed_safe_2', text: 'Ask an adult before swimming', category: 'safety', reward: REWARDS.safety, completed: false },
  // Health
  { id: 'seed_health_1', text: 'Drink a glass of water', category: 'health', reward: REWARDS.health, completed: false },
  { id: 'seed_health_2', text: 'Take a calm rest break', category: 'health', reward: REWARDS.health, completed: false },
  { id: 'seed_health_3', text: 'Tell a grown up if you feel strange', category: 'health', reward: REWARDS.health, completed: false },
];

/** Bump this when the seed list changes so stored quests are replaced with the new list. */
export const QUEST_SEED_VERSION = 3;

/**
 * Returns a copy of the seed list (so completed flags can be set per session without mutating shared data).
 * @returns {SeedQuest[]}
 */
export function getQuestSeed() {
  return QUEST_SEED.map((q) => ({ ...q, completed: false }));
}

export { QUEST_SEED };
