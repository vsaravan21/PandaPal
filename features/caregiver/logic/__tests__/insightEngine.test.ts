/**
 * Insight Engine - unit tests
 */

import { getInsights } from '../insightEngine';
import type { CareTask } from '../../data/tasksStore';
import type { SymptomLog } from '../../data/logsStore';
import type { LessonProgress } from '@/features/lessons/types';

describe('getInsights', () => {
  it('returns array of insights', () => {
    const tasks: CareTask[] = [];
    const logs: SymptomLog[] = [];
    const progress: Record<string, LessonProgress> = {};
    const insights = getInsights(tasks, logs, progress, 14);
    expect(Array.isArray(insights)).toBe(true);
  });

  it('returns at most 3 insights', () => {
    const tasks: CareTask[] = Array.from({ length: 10 }, (_, i) => ({
      id: `t${i}`,
      label: `Task ${i}`,
      dueTime: '08:00',
      missed: i < 3,
    }));
    const logs: SymptomLog[] = [];
    const progress: Record<string, LessonProgress> = {};
    const insights = getInsights(tasks, logs, progress, 14);
    expect(insights.length).toBeLessThanOrEqual(3);
  });

  it('each insight has type, message, recommendedAction', () => {
    const tasks: CareTask[] = [
      { id: '1', label: 'A', dueTime: '08:00', missed: true },
      { id: '2', label: 'B', dueTime: '12:00', missed: true },
    ];
    const logs: SymptomLog[] = [];
    const progress: Record<string, LessonProgress> = {};
    const insights = getInsights(tasks, logs, progress, 14);
    insights.forEach((i) => {
      expect(i).toHaveProperty('type');
      expect(i).toHaveProperty('message');
      expect(i).toHaveProperty('recommendedAction');
      expect(typeof i.message).toBe('string');
    });
  });
});
