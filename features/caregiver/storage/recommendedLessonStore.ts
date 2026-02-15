/**
 * Caregiver-recommended lesson - persists choice for kid view
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@pandapal/recommended_lesson_id';

export async function getRecommendedLessonId(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export async function setRecommendedLessonId(lessonId: string): Promise<void> {
  await AsyncStorage.setItem(KEY, lessonId);
}

export async function clearRecommendedLessonId(): Promise<void> {
  await AsyncStorage.removeItem(KEY);
}
