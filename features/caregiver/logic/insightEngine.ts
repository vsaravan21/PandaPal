/**
 * Caregiver insight engine - observational insights, calm and actionable.
 * Not medical advice. No diagnosis or treatment.
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
  supportingStats?: string;
}

const SCHOOL_HOURS = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16];

function getDayOfWeek(d: Date): number {
  return d.getDay();
}

function getHour(d: Date): number {
  return d.getHours();
}

/** Lesson with category for education insights */
type LessonRef = { id: string; category: string };

/**
 * Emit up to 3 insights based on tasks, logs, and education progress
 */
export function getInsights(
  tasks: CareTask[],
  logs: SymptomLog[],
  progress: Record<string, LessonProgress>,
  days: number = 14,
  lessons?: LessonRef[]
): Insight[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  const recentTasks = tasks.filter((t) => t.completedAt && new Date(t.completedAt) >= cutoff);
  const missedTasks = tasks.filter((t) => t.missed);
  const recentLogs = logs.filter((l) => new Date(l.timestamp) >= cutoff);

  const insights: Insight[] = [];

  // WEEKEND_DIP: completion lower on Sat/Sun
  const weekdayCompleted = recentTasks.filter((t) => {
    const d = getDayOfWeek(new Date(t.completedAt!));
    return d >= 1 && d <= 5;
  }).length;
  const weekendCompleted = recentTasks.filter((t) => {
    const d = getDayOfWeek(new Date(t.completedAt!));
    return d === 0 || d === 6;
  }).length;
  const weekdayDays = Math.min(days, 10);
  const weekendDays = Math.min(days, 4);
  const weekdayRate = weekdayDays > 0 ? weekdayCompleted / (tasks.length * (weekdayDays / 7)) : 0;
  const weekendRate = weekendDays > 0 ? weekendCompleted / (tasks.length * (weekendDays / 7)) : 0;
  if (weekendDays > 0 && weekdayRate > 0 && weekendRate < weekdayRate * 0.7) {
    insights.push({
      type: 'WEEKEND_DIP',
      message: 'We noticed routines were harder on weekends.',
      recommendedAction: 'Consider adjusting reminder windows for weekends.',
      ctaRoute: '/(caregiver)/care-plan',
      ctaLabel: 'Adjust reminders',
      supportingStats: `${Math.round(weekendRate * 100)}% weekend vs ${Math.round(weekdayRate * 100)}% weekdays`,
    });
  }

  // SCHOOL_HOUR_MISSES: misses cluster during school hours (8-16)
  const missedInSchoolHours = missedTasks.filter((t) => {
    const due = t.dueTime;
    if (!due) return false;
    const [h] = due.split(':').map(Number);
    return SCHOOL_HOURS.includes(h);
  }).length;
  if (missedInSchoolHours >= 2 && missedTasks.length >= 2) {
    insights.push({
      type: 'SCHOOL_HOUR_MISSES',
      message: 'We noticed more misses during school hours.',
      recommendedAction: 'Consider checking in with your care team about school-day routines.',
      ctaRoute: '/(caregiver)/care-plan',
      ctaLabel: 'View plan',
      supportingStats: `${missedInSchoolHours} of ${missedTasks.length} misses`,
    });
  }

  // LOGGING_DROP: symptom logs decreasing week over week
  const thisWeek = logs.filter((l) => {
    const d = new Date(l.timestamp);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return d >= weekAgo;
  }).length;
  const lastWeek = logs.filter((l) => {
    const d = new Date(l.timestamp);
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return d >= twoWeeksAgo && d < weekAgo;
  }).length;
  if (lastWeek >= 2 && thisWeek < lastWeek * 0.5) {
    insights.push({
      type: 'LOGGING_DROP',
      message: 'We noticed fewer symptom notes lately.',
      recommendedAction: 'Consider logging when something stands out.',
      ctaRoute: '/(caregiver)/logs',
      ctaLabel: 'View timeline',
      supportingStats: `${thisWeek} this week vs ${lastWeek} last week`,
    });
  }

  // EDUCATION_GAP: low mastery by category - specific message
  const completedProgress = Object.values(progress).filter((p) => p.completed);
  if (completedProgress.length >= 1 && lessons?.length) {
    const byCategory: Record<string, { sum: number; count: number }> = {};
    completedProgress.forEach((p) => {
      const lesson = lessons.find((l) => l.id === p.lessonId);
      const cat = lesson?.category ?? 'Other';
      if (!byCategory[cat]) byCategory[cat] = { sum: 0, count: 0 };
      byCategory[cat].sum += p.masteryScore;
      byCategory[cat].count++;
    });
    const lowCategory = Object.entries(byCategory)
      .map(([cat, v]) => ({ cat, avg: Math.round(v.sum / v.count) }))
      .filter((x) => x.avg < 70)
      .sort((a, b) => a.avg - b.avg)[0];
    if (lowCategory) {
      insights.push({
        type: 'EDUCATION_GAP',
        message: `${lowCategory.cat} lessons need more practice.`,
        recommendedAction: 'Consider suggesting a review lesson.',
        ctaRoute: '/(tabs)/learn',
        ctaLabel: 'View lessons',
        supportingStats: `${lowCategory.cat} mastery is ${lowCategory.avg}%.`,
      });
    }
  } else if (completedProgress.length >= 1) {
    const avgMastery =
      completedProgress.reduce((s, p) => s + p.masteryScore, 0) / completedProgress.length;
    if (avgMastery < 70) {
      insights.push({
        type: 'EDUCATION_GAP',
        message: 'We noticed lesson topics could use more practice.',
        recommendedAction: 'Consider suggesting a review lesson.',
        ctaRoute: '/(tabs)/learn',
        ctaLabel: 'View lessons',
        supportingStats: `Avg mastery is ${Math.round(avgMastery)}%.`,
      });
    }
  }

  // ROUTINE_VARIATION: generic when completion varies
  const completed = recentTasks.length;
  const total = Math.max(tasks.length * Math.ceil(days / 7), 1);
  const pct = (completed / total) * 100;
  if (pct < 60 && pct > 0 && insights.length < 2) {
    insights.push({
      type: 'ROUTINE_VARIATION',
      message: 'We noticed routines vary from day to day.',
      recommendedAction: 'Consider adjusting reminder windows.',
      ctaRoute: '/(caregiver)/care-plan',
      ctaLabel: 'Adjust reminders',
      supportingStats: `${Math.round(pct)}% completion`,
    });
  }

  // MISSED_TASKS: simple missed count
  if (missedTasks.length >= 2 && insights.length < 3) {
    insights.push({
      type: 'MISSED_TASKS',
      message: `We noticed ${missedTasks.length} missed tasks recently.`,
      recommendedAction: 'Consider checking in with your care team.',
      ctaRoute: '/(caregiver)/care-plan',
      ctaLabel: 'Review plan',
      supportingStats: `${missedTasks.length} missed`,
    });
  }

  return insights.slice(0, 3);
}
