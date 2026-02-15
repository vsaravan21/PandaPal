/**
 * Routine stability - 0–100 score from completion + consistency
 */

import type { CareTask } from '../data/tasksStore';

export type StabilityTrend = 'up' | 'down' | 'flat';

export interface RoutineStabilityResult {
  score: number;
  trend: StabilityTrend;
  label: 'Strong' | 'Fair' | 'Needs attention';
}

function getDayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function tasksByDay(tasks: CareTask[], days: number): Map<string, { completed: number; total: number }> {
  const now = new Date();
  const map = new Map<string, { completed: number; total: number }>();
  const taskCount = tasks.length || 1;
  for (let i = 0; i < days; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = getDayKey(d);
    const dayTasks = tasks.filter((t) => {
      const completedAt = t.completedAt ? new Date(t.completedAt) : null;
      if (!completedAt) return false;
      return getDayKey(completedAt) === key;
    });
    map.set(key, { completed: dayTasks.length, total: taskCount });
  }
  return map;
}

export function computeRoutineStability(tasks: CareTask[], days = 7): RoutineStabilityResult {
  const byDay = tasksByDay(tasks, days * 2);
  const entries = Array.from(byDay.entries());
  const recent = entries.slice(0, days);
  const prior = entries.slice(days, days * 2);

  const recentComplete = recent.reduce((s, [, v]) => s + v.completed, 0);
  const recentTotal = recent.reduce((s, [, v]) => s + v.total, 0) || 1;
  const priorComplete = prior.reduce((s, [, v]) => s + v.completed, 0);
  const priorTotal = prior.reduce((s, [, v]) => s + v.total, 0) || 1;

  const completion = (recentComplete / recentTotal) * 100;
  const priorCompletion = (priorComplete / priorTotal) * 100;
  const consistency = Math.min(100, Math.abs(completion - priorCompletion) < 20 ? 100 : 60);

  const score = Math.round(0.7 * Math.min(100, completion) + 0.3 * consistency);

  let trend: StabilityTrend = 'flat';
  if (score > (completion * 0.7 + consistency * 0.3) - 5) trend = 'up';
  else if (priorCompletion > completion + 10) trend = 'down';

  let label: 'Strong' | 'Fair' | 'Needs attention' = 'Fair';
  if (score >= 75) label = 'Strong';
  else if (score < 50) label = 'Needs attention';

  return { score, trend, label };
}
