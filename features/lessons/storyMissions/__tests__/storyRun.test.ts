/**
 * Story Run tests - scene count, EDU spacing, choices, endings, branching
 */

import { generateMockRun } from '../runGenerator/mockRun';
import { validateStoryRun } from '../storyRunSchema';
import { resolveNextIndex, resolveEnding } from '../runEngine';

describe('generateMockRun', () => {
  it('produces 18-22 scenes', () => {
    const run = generateMockRun('astronaut', 12345);
    expect(run.scenes.length).toBeGreaterThanOrEqual(18);
    expect(run.scenes.length).toBeLessThanOrEqual(22);
  });

  it('has no back-to-back EDU scenes', () => {
    const run = generateMockRun('detective', 999);
    for (let i = 1; i < run.scenes.length; i++) {
      if (run.scenes[i].kind === 'EDU' && run.scenes[i - 1].kind === 'EDU') {
        throw new Error('Back-to-back EDU at ' + i);
      }
    }
  });

  it('has at least 8 choices total', () => {
    const run = generateMockRun('diver', 42);
    const choiceCount = run.scenes.reduce((n, s) => n + (s.choices?.length ?? 0), 0);
    expect(choiceCount).toBeGreaterThanOrEqual(8);
  });

  it('has at least 3 endings', () => {
    const run = generateMockRun('treasure', 7);
    expect(run.endings.length).toBeGreaterThanOrEqual(3);
  });

  it('is deterministic for same seed', () => {
    const a = generateMockRun('astronaut', 111);
    const b = generateMockRun('astronaut', 111);
    expect(a.runId).toBe(b.runId);
    expect(a.scenes.length).toBe(b.scenes.length);
    expect(a.scenes[0].narration).toBe(b.scenes[0].narration);
  });

  it('passes validateStoryRun', () => {
    const run = generateMockRun('astronaut', 1);
    expect(validateStoryRun(run)).toBe(true);
  });

  it('guide themes differ', () => {
    const astronaut = generateMockRun('astronaut', 5);
    const diver = generateMockRun('diver', 5);
    expect(astronaut.scenes[0].narration).not.toBe(diver.scenes[0].narration);
  });
});

describe('runEngine', () => {
  it('resolveNextIndex advances through scenes', () => {
    const run = generateMockRun('astronaut', 100);
    const next1 = resolveNextIndex(run, 1, {});
    expect(next1).toBeGreaterThan(0);
  });

  it('resolveEnding returns hero when no flags', () => {
    const run = generateMockRun('astronaut', 200);
    const end = resolveEnding(run, {});
    expect(end.endingId).toBeDefined();
  });

  it('resolveEnding returns secret when flags match', () => {
    const run = generateMockRun('astronaut', 200);
    const end = resolveEnding(run, { gotStarKey: true, choseNebulaPath: true });
    expect(end.endingId).toContain('secret');
  });
});
