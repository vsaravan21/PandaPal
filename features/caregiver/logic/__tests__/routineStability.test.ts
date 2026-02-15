/**
 * Routine Stability logic - unit tests
 */

import { computeRoutineStability } from '../routineStability';
import type { CareTask } from '../../data/tasksStore';

describe('computeRoutineStability', () => {
  it('returns score 0-100', () => {
    const tasks: CareTask[] = [];
    const r = computeRoutineStability(tasks, 7);
    expect(r.score).toBeGreaterThanOrEqual(0);
    expect(r.score).toBeLessThanOrEqual(100);
  });

  it('returns trend up/down/flat', () => {
    const tasks: CareTask[] = [
      { id: '1', label: 'A', dueTime: '08:00', completedAt: new Date().toISOString() },
    ];
    const r = computeRoutineStability(tasks, 7);
    expect(['up', 'down', 'flat']).toContain(r.trend);
  });

  it('includes completionRate and consistency', () => {
    const tasks: CareTask[] = [
      { id: '1', label: 'A', dueTime: '08:00', completedAt: new Date().toISOString() },
      { id: '2', label: 'B', dueTime: '12:00' },
      { id: '3', label: 'C', dueTime: '19:00' },
    ];
    const r = computeRoutineStability(tasks, 7);
    expect(r).toHaveProperty('completionRate');
    expect(r).toHaveProperty('consistency');
    expect(r.completionRate).toBeGreaterThanOrEqual(0);
    expect(r.completionRate).toBeLessThanOrEqual(1);
  });

  it('includes explanation', () => {
    const tasks: CareTask[] = [];
    const r = computeRoutineStability(tasks, 7);
    expect(typeof r.explanation).toBe('string');
    expect(r.explanation.length).toBeGreaterThan(0);
  });
});
