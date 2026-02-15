/**
 * Dashboard helpers
 */

export function formatRelativeTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 60) return mins <= 1 ? 'Just now' : `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString();
}

export function stabilityLabel(trend: 'up' | 'down' | 'flat'): string {
  if (trend === 'up') return 'Improving';
  if (trend === 'down') return 'Declining';
  return 'Stable';
}

export function pickTopInsights<T>(items: T[], n: number): T[] {
  return items.slice(0, n);
}

export function computeRecentSummary<T extends { completedAt?: string }>(items: T[], days: number): T[] {
  const cutoff = Date.now() - days * 86400000;
  return items.filter((i) => i.completedAt && new Date(i.completedAt).getTime() > cutoff);
}

export function getCompletionBars(
  completed: number,
  total: number,
  width = 100
): { filled: number; empty: number } {
  const pct = total > 0 ? completed / total : 0;
  return { filled: Math.round(width * pct), empty: width - Math.round(width * pct) };
}
