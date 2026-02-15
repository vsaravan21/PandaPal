/**
 * Insight engine - surfaces patterns for caregiver
 */

import type { CareTask } from '../data/tasksStore';
import type { SymptomLog } from '../data/logsStore';
import type { LessonProgress } from '@/features/lessons/types';

export type InsightType =
  | 'WEEKEND_DIP'
  | 'SCHOOL_HOUR_MISSES'
  | 'LOGGING_DROP'
  | 'EDUCATION_GAP'
  | 'ROUTINE_VARIATION'
  | 'MISSED_TASKS';

export interface Insight {
  type: InsightType;
  message: string;
  recommendedAction: string;
  ctaRoute?: string;
  ctaLabel?: string;
  supportingStats?: Record<string, number | string>;
}

function getDayOfWeek(iso: string): number {
  return new Date(iso).getDay();
}

export function generateInsights(
  tasks: CareTask[],
  logs: SymptomLog[],
  progress: Record<string, LessonProgress>,
  lookbackDays = 14
): Insight[] {
  const insights: Insight[] = [];
  const now = Date.now();
  const cutoff = now - lookbackDays * 86400000;

  const recentTasks = tasks.filter((t) => t.completedAt && new Date(t.completedAt).getTime() > cutoff);
  const weekendTasks = recentTasks.filter((t) => {
    const d = getDayOfWeek(t.completedAt!);
    return d === 0 || d === 6;
  });
  const weekdayTasks = recentTasks.filter((t) => {
    const d = getDayOfWeek(t.completedAt!);
    return d >= 1 && d <= 5;
  });
  const schoolHours = weekdayTasks.filter((t) => {
    const h = new Date(t.completedAt!).getHours();
    return h >= 8 && h <= 15;
  });

  if (weekendTasks.length < weekdayTasks.length * 0.5 && weekdayTasks.length > 2) {
    insights.push({
      type: 'WEEKEND_DIP',
      message: 'Routine completion tends to drop on weekends.',
      recommendedAction: 'Consider weekend reminders or simpler weekend routines.',
      ctaRoute: '/(caregiver)/trends',
      ctaLabel: 'View trends',
      supportingStats: { weekend: weekendTasks.length, weekday: weekdayTasks.length },
    });
  }

  if (schoolHours.length < weekdayTasks.length * 0.3 && weekdayTasks.length > 3) {
    insights.push({
      type: 'SCHOOL_HOUR_MISSES',
      message: 'Few tasks completed during typical school hours.',
      recommendedAction: 'Review timing with school or caregiver.',
      ctaRoute: '/(caregiver)/logs',
      ctaLabel: 'Timeline',
      supportingStats: { schoolHours: schoolHours.length, weekday: weekdayTasks.length },
    });
  }

  const recentLogs = logs.filter((l) => new Date(l.timestamp).getTime() > cutoff);
  if (recentLogs.length === 0 && logs.length > 0) {
    insights.push({
      type: 'LOGGING_DROP',
      message: 'No symptom logs in the last 2 weeks.',
      recommendedAction: 'Consider logging when something notable happens.',
      ctaRoute: '/(caregiver)/logs',
      ctaLabel: 'Add log',
    });
  }

  const completed = Object.values(progress).filter((p) => p.completed).length;
  if (completed === 0 && Object.keys(progress).length > 0) {
    insights.push({
      type: 'EDUCATION_GAP',
      message: 'No lessons completed yet.',
      recommendedAction: 'Encourage the child to try a lesson.',
      ctaRoute: '/(caregiver)',
      ctaLabel: 'Recommend lesson',
      supportingStats: { lessonsAvailable: Object.keys(progress).length },
    });
  }

  const missedCount = tasks.filter((t) => t.missed).length;
  if (missedCount > 2) {
    insights.push({
      type: 'MISSED_TASKS',
      message: `${missedCount} tasks marked as missed recently.`,
      recommendedAction: 'Review care plan timing and adjust if needed.',
      ctaRoute: '/(caregiver)/care-plan',
      ctaLabel: 'View plan',
      supportingStats: { missed: missedCount },
    });
  }

  return insights.slice(0, 3);
}
