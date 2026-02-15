/**
 * Lesson progress storage API
 * Uses AsyncStorage for React Native (local persistence)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { LessonProgress } from '../types';

const STORAGE_KEY = '@pandapal/lesson_progress';

async function loadAllProgress(): Promise<Record<string, LessonProgress>> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

async function saveAllProgress(data: Record<string, LessonProgress>): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export async function getLessonProgress(lessonId: string): Promise<LessonProgress | null> {
  const all = await loadAllProgress();
  return all[lessonId] ?? null;
}

export async function saveLessonProgress(lessonId: string, progress: LessonProgress): Promise<void> {
  const all = await loadAllProgress();
  all[lessonId] = progress;
  await saveAllProgress(all);
}

export async function markLessonComplete(
  lessonId: string,
  results: { masteryScore: number; xp: number; coins: number; items?: string[] }
): Promise<void> {
  const existing = await getLessonProgress(lessonId);
  const now = new Date().toISOString();
  const progress: LessonProgress = {
    lessonId,
    attempts: (existing?.attempts ?? 0) + 1,
    currentStepIndex: 0,
    lastCompletedAt: now,
    masteryScore: results.masteryScore,
    stepResponses: existing?.stepResponses ?? {},
    completed: true,
  };
  await saveLessonProgress(lessonId, progress);
}

export async function getAllLessonProgress(): Promise<Record<string, LessonProgress>> {
  return loadAllProgress();
}
