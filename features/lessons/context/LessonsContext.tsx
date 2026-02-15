/**
 * Lessons feature context - state and actions
 */

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { Lesson, LessonProgress } from '../types';
import type { ChildProfile } from '@/features/profile/types';
import { useProfile } from '@/features/profile/context/ProfileContext';
import { LESSONS } from '../data/lessons';
import * as lessonProgressApi from '../storage/lessonProgress';
import * as profileStore from '@/features/profile/storage/profileStore';
import { computeMasteryScore, getRecommendedNextLesson } from '../utils/scoring';

type LessonsProfile = ChildProfile & { lessonProgress?: Record<string, LessonProgress> };

type LessonsContextType = {
  lessons: Lesson[];
  progress: Record<string, LessonProgress>;
  profile: LessonsProfile | null;
  loading: boolean;
  getLessonProgress: (lessonId: string) => Promise<LessonProgress | null>;
  saveLessonProgress: (lessonId: string, progress: LessonProgress) => Promise<void>;
  markLessonComplete: (
    lessonId: string,
    results: { masteryScore: number; xp: number; coins: number; items?: string[] }
  ) => Promise<void>;
  refresh: () => Promise<void>;
  recommendedLesson: Lesson | null;
};

const LessonsContext = createContext<LessonsContextType | null>(null);

export function LessonsProvider({ children }: { children: React.ReactNode }) {
  const { refresh: refreshProfile } = useProfile();
  const [lessons] = useState<Lesson[]>(LESSONS);
  const [progress, setProgress] = useState<Record<string, LessonProgress>>({});
  const [profile, setProfile] = useState<LessonsProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [allProgress, prof] = await Promise.all([
        lessonProgressApi.getAllLessonProgress(),
        profileStore.getProfile(),
      ]);
      setProgress(allProgress);
      setProfile({ ...prof, lessonProgress: allProgress });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const getLessonProgress = useCallback(async (lessonId: string) => {
    return lessonProgressApi.getLessonProgress(lessonId);
  }, []);

  const saveLessonProgress = useCallback(async (lessonId: string, prog: LessonProgress) => {
    await lessonProgressApi.saveLessonProgress(lessonId, prog);
    const all = await lessonProgressApi.getAllLessonProgress();
    setProgress(all);
  }, []);

  const markLessonComplete = useCallback(
    async (
      lessonId: string,
      results: { masteryScore: number; xp: number; coins: number; items?: string[] }
    ) => {
      await lessonProgressApi.markLessonComplete(lessonId, results);
      const { addAdventure } = await import('@/features/pandaFriend/storage/pandaFriendStore');
      await addAdventure();
      const prof = await profileStore.addLessonReward({
        xp: results.xp,
        coins: results.coins,
        items: results.items,
      });
      const all = await lessonProgressApi.getAllLessonProgress();
      setProgress(all);
      setProfile({ ...prof, lessonProgress: all });
      refreshProfile();
    },
    [refreshProfile]
  );

  const recommendedLesson = getRecommendedNextLesson(lessons, progress);

  const value: LessonsContextType = {
    lessons,
    progress,
    profile,
    loading,
    getLessonProgress,
    saveLessonProgress,
    markLessonComplete,
    refresh,
    recommendedLesson,
  };

  return (
    <LessonsContext.Provider value={value}>
      {children}
    </LessonsContext.Provider>
  );
}

export function useLessons() {
  const ctx = useContext(LessonsContext);
  if (!ctx) throw new Error('useLessons must be used within LessonsProvider');
  return ctx;
}

export { computeMasteryScore };
