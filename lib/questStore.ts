/**
 * Persist and update child quests. On complete, award XP via profile store.
 * Supports both generated quests (from care plan) and seed quests (MVP).
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { addLessonReward } from '@/features/profile/storage/profileStore';
import { getQuestSeed } from './questSeed';

const STORAGE_KEY = '@pandapal/child_quests';

/** Stored quest: at least id, text, reward, completed; may have category, type, schedule, etc. */
export type StoredQuest = { id: string; text: string; reward: number; completed: boolean; [key: string]: unknown };

export async function getQuests(): Promise<StoredQuest[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function setQuests(quests: StoredQuest[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(quests));
}

/**
 * Use placeholder seed data only (no parsed/care-plan-generated quests).
 * If storage has seed-format quests (with category), return them so completions persist.
 * Otherwise persist and return the seed list.
 */
export async function getTodayQuests(): Promise<StoredQuest[]> {
  const stored = await getQuests();
  const isSeedFormat = stored.length > 0 && stored.every((q) => 'category' in q);
  if (isSeedFormat) return stored;
  const seed = getQuestSeed();
  await setQuests(seed);
  return seed;
}

export async function updateQuestCompleted(questId: string, completed: boolean): Promise<StoredQuest[]> {
  const quests = await getQuests();
  const index = quests.findIndex((q) => q.id === questId);
  if (index === -1) return quests;
  const wasCompleted = quests[index].completed;
  quests[index] = { ...quests[index], completed };

  if (completed && !wasCompleted) {
    await addLessonReward({ xp: quests[index].reward, coins: 0 });
  }

  await setQuests(quests);
  return quests;
}
