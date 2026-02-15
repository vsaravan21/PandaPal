/**
 * Routine Stability score (0-100)
 * completionRate + consistency, observational only. Not medical advice.
 */

import type { CareTask } from '../data/tasksStore';

export type TrendDirection = 'up' | 'down' | 'flat';

export interface RoutineStabilityResult {
  score: number;
  trend: TrendDirection;
  explanation: string;
  completionRate: number;
  consistency: number;
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

/**
 * Normalized variance of completion by day (0 = perfectly consistent, 1 = max variance)
 */
function normalizedVarianceByDay(tasks: CareTask[], days: number): number {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  const completionByDay: Record<string, number> = {};
  const expectedPerDay = Math.max(tasks.length * (days / 7), 1);

  for (let i = 0; i < days; i++) {
    const d = new Date(cutoff);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    completionByDay[key] = 0;
  }

  tasks.forEach((t) => {
    if (t.completedAt) {
      const key = t.completedAt.slice(0, 10);
      if (completionByDay[key] !== undefined) completionByDay[key]++;
    }
  });

  const values = Object.values(completionByDay);
  const mean = values.reduce((s, v) => s + v, 0) / values.length;
  const variance =
    values.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / Math.max(values.length, 1);
  const maxVariance = Math.pow(expectedPerDay, 2) * 0.5;
  return clamp(variance / Math.max(maxVariance, 0.01), 0, 1);
}

/**
 * Compare 7-day score to previous 7-day score for trend
 */
function computeTrend(tasks: CareTask[], currentCompletion: number, currentConsistency: number): TrendDirection {
  const now = new Date();
  const prevCutoff = new Date(now);
  prevCutoff.setDate(prevCutoff.getDate() - 14);
  const currCutoff = new Date(now);
  currCutoff.setDate(currCutoff.getDate() - 7);

  const prevCompleted = tasks.filter(
    (t) => t.completedAt && new Date(t.completedAt) >= prevCutoff && new Date(t.completedAt) < currCutoff
  ).length;
  const currCompleted = tasks.filter(
    (t) => t.completedAt && new Date(t.completedAt) >= currCutoff
  ).length;

  const totalPerWeek = Math.max(tasks.length, 1);
  const prevCompletion = prevCompleted / totalPerWeek;
  const prevTasksInWindow = tasks.filter(
    (t) => t.completedAt && new Date(t.completedAt) >= prevCutoff && new Date(t.completedAt) < currCutoff
  );
  const prevConsistency = prevTasksInWindow.length > 0
    ? 1 - normalizedVarianceByDay(prevTasksInWindow, 7)
    : 0.5;

  const prevScore = 70 * Math.min(prevCompletion, 1) + 30 * prevConsistency;
  const currScore = 70 * currentCompletion + 30 * currentConsistency;
  const diff = currScore - prevScore;

  if (diff > 2) return 'up';
  if (diff < -2) return 'down';
  return 'flat';
}

/**
 * Compute Routine Stability score (0-100)
 * 70% completion rate + 30% consistency
 */
export function computeRoutineStability(
  tasks: CareTask[],
  days: number = 7
): RoutineStabilityResult {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  const totalExpected = Math.max(tasks.length * Math.ceil(days / 7), 1);
  const completed = tasks.filter(
    (t) => t.completedAt && new Date(t.completedAt) >= cutoff
  ).length;
  const completionRate = clamp(completed / totalExpected, 0, 1);
  const consistency = 1 - normalizedVarianceByDay(
    tasks.filter((t) => t.completedAt && new Date(t.completedAt) >= cutoff),
    days
  );
  const score = Math.round(clamp(70 * completionRate + 30 * consistency, 0, 100));
  const trend = computeTrend(tasks, completionRate, consistency);

  let explanation = 'Based on completion and consistency.';
  if (score >= 80) explanation = 'Routines look consistent.';
  else if (score >= 50) explanation = 'Some variation in routines.';
  else explanation = 'Routines may need attention.';

  return {
    score,
    trend,
    explanation,
    completionRate,
    consistency,
  };
}
