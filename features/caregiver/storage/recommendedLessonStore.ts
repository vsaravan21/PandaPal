/**
 * Caregiver-recommended lesson - shows badge in kid UI
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@pandapal/recommended_lesson';

export async function getRecommendedLessonId(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export async function setRecommendedLessonId(lessonId: string | null): Promise<void> {
  if (lessonId) {
    await AsyncStorage.setItem(KEY, lessonId);
  } else {
    await AsyncStorage.removeItem(KEY);
  }
}
