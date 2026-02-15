/**
 * Export summary - text for doctor visits
 */

import type { CareTask } from '../data/tasksStore';
import type { SymptomLog } from '../data/logsStore';
import type { LessonProgress } from '@/features/lessons/types';

export interface ExportInput {
  tasks: CareTask[];
  logs: SymptomLog[];
  progress: Record<string, LessonProgress>;
  lessons?: { id: string; title: string }[];
  dateRangeDays?: number;
}

const DISCLAIMER =
  'Routine support + education only. Not medical advice. Share with your care team for discussion.';

export function generateExportSummary(input: ExportInput): string {
  const { tasks, logs, progress, lessons = [], dateRangeDays = 30 } = input;
  const cutoff = Date.now() - dateRangeDays * 86400000;

  const recentTasks = tasks.filter((t) => t.completedAt && new Date(t.completedAt).getTime() > cutoff);
  const completedTasks = recentTasks.filter((t) => !t.missed);
  const missedTasks = recentTasks.filter((t) => t.missed);

  const recentLogs = logs.filter((l) => new Date(l.timestamp).getTime() > cutoff);
  const completedLessons = Object.values(progress).filter((p) => p.completed);

  let text = `PandaPal Care Summary (Last ${dateRangeDays} days)\n`;
  text += `Generated: ${new Date().toLocaleDateString()}\n\n`;
  text += `--- Routine Tasks ---\n`;
  text += `Completed: ${completedTasks.length}\n`;
  text += `Missed: ${missedTasks.length}\n`;
  if (recentTasks.length > 0) {
    text += `Tasks: ${tasks.map((t) => t.label).join(', ')}\n`;
  }
  text += `\n--- Symptom / Mood Logs ---\n`;
  text += `Entries: ${recentLogs.length}\n`;
  recentLogs.slice(0, 10).forEach((l) => {
    text += `- ${new Date(l.timestamp).toLocaleDateString()}: ${l.type}${l.note ? ` — ${l.note}` : ''}\n`;
  });
  text += `\n--- Education ---\n`;
  text += `Lessons completed: ${completedLessons.length}\n`;
  completedLessons.forEach((p) => {
    const lesson = lessons.find((l) => l.id === p.lessonId);
    text += `- ${lesson?.title ?? p.lessonId}: ${p.masteryScore}% mastery\n`;
  });
  text += `\n--- Disclaimer ---\n`;
  text += `${DISCLAIMER}\n`;
  return text;
}
