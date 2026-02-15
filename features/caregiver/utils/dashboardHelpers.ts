/**
 * Dashboard helper functions - time, labels, summaries
 */

import type { CareTask } from '../data/tasksStore';

export function formatRelativeTime(task: { dueTime?: string }): string | null {
  if (!task.dueTime) return null;
  const now = new Date();
  const [h, m] = task.dueTime.split(':').map(Number);
  const due = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m || 0, 0, 0);
  if (due <= now) return null;
  const ms = due.getTime() - now.getTime();
  const mins = Math.floor(ms / 60000);
  const hrs = Math.floor(mins / 60);
  if (hrs >= 1) return `in ${hrs} hr`;
  if (mins >= 1) return `in ${mins} min`;
  return 'now';
}

export function stabilityLabel(score: number): string {
  if (score >= 70) return 'Strong';
  if (score >= 40) return 'Fair';
  return 'Needs attention';
}

export function pickTopInsights<T>(items: T[], max: number = 2): T[] {
  return items.slice(0, max);
}

export interface RecentSummaryResult {
  missedLine: string;
}

export function computeRecentSummary(tasks: CareTask[]): RecentSummaryResult {
  const recentMissed = tasks.filter((t) => t.missed);
  if (recentMissed.length === 0) {
    return { missedLine: 'No missed tasks in last 24h 🎉' };
  }
  const lastMissed = recentMissed[0];
  const ts = lastMissed.completedAt
    ? new Date(lastMissed.completedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    : 'recently';
  return { missedLine: `Last missed: ${lastMissed.label} • ${ts}` };
}

/**
 * Returns 7 values (0-1) for mini bar chart, oldest to newest
 */
export function getCompletionBars(tasks: CareTask[], days: number = 7): number[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const totalExpected = Math.max(tasks.length, 1);
  const bars: number[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(cutoff);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    const completed = tasks.filter(
      (t) => t.completedAt && t.completedAt.startsWith(key)
    ).length;
    bars.push(Math.min(completed / totalExpected, 1));
  }
  return bars;
}
