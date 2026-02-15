/**
 * Doctor visit export summary - generates copyable text
 * Not medical advice. Observational only.
 */

import type { CareTask } from '../data/tasksStore';
import type { SymptomLog } from '../data/logsStore';
import type { LessonProgress } from '@/features/lessons/types';
import type { Lesson } from '@/features/lessons/types';
import { computeRoutineStability } from './routineStability';

const DISCLAIMER = 'Routine support + education only. Not medical advice.';

export interface ExportSummaryInput {
  tasks: CareTask[];
  logs: SymptomLog[];
  progress: Record<string, LessonProgress>;
  lessons: Lesson[];
  dateRangeDays?: number;
}

/**
 * Generate a text summary suitable for copying or downloading
 */
export function generateExportSummary(input: ExportSummaryInput): string {
  const { tasks, logs, progress, lessons, dateRangeDays = 30 } = input;

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - dateRangeDays);

  const recentLogs = logs.filter((l) => new Date(l.timestamp) >= cutoff);
  const completedTasks = tasks.filter(
    (t) => t.completedAt && new Date(t.completedAt) >= cutoff
  );
  const missedTasks = tasks.filter((t) => t.missed);
  const completedProgress = Object.values(progress).filter((p) => p.completed);
  const totalExpected = Math.max(tasks.length * Math.ceil(dateRangeDays / 7), 1);
  const completionPct = Math.round((completedTasks.length / totalExpected) * 100);
  const stability = computeRoutineStability(tasks, Math.min(dateRangeDays, 14));

  const lines: string[] = [];

  lines.push('PandaPal Care Summary');
  lines.push('='.repeat(40));
  lines.push(`Date range: Last ${dateRangeDays} days`);
  lines.push(`Generated: ${new Date().toLocaleDateString()}`);
  lines.push('');

  lines.push('Routine Stability');
  lines.push('-'.repeat(40));
  lines.push(`Score: ${stability.score}/100 (${stability.trend})`);
  lines.push(stability.explanation);
  lines.push('');

  lines.push('Task Completion');
  lines.push('-'.repeat(40));
  lines.push(`Completed: ${completedTasks.length}`);
  lines.push(`Missed: ${missedTasks.length}`);
  lines.push(`Rate: ${completionPct}%`);
  lines.push('');

  lines.push('Symptom / Notes');
  lines.push('-'.repeat(40));
  lines.push(`Entries: ${recentLogs.length}`);
  recentLogs.slice(0, 5).forEach((l) => {
    const d = new Date(l.timestamp).toLocaleString();
    const note = l.note ? ` — ${l.note}` : '';
    lines.push(`  ${d}${note}`);
  });
  if (recentLogs.length === 0) lines.push('  No entries in range.');
  lines.push('');

  lines.push('Education Progress');
  lines.push('-'.repeat(40));
  lines.push(`Lessons completed: ${completedProgress.length}`);
  completedProgress.slice(0, 5).forEach((p) => {
    const lesson = lessons.find((l) => l.id === p.lessonId);
    const title = lesson?.title ?? p.lessonId;
    lines.push(`  ${title}: ${p.masteryScore}% mastery`);
  });
  if (completedProgress.length === 0) lines.push('  No lessons completed yet.');
  lines.push('');

  lines.push('');
  lines.push(DISCLAIMER);

  return lines.join('\n');
}
