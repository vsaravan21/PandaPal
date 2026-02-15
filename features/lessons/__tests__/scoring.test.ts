/**
 * Unit tests for lesson scoring and progress logic
 */

import { computeMasteryScore, getRecommendedNextLesson } from '../utils/scoring';

const mockLesson = {
  id: 'test',
  title: 'Test',
  description: 'Test',
  ageBand: 'all',
  estimatedMinutes: 2,
  tags: [],
  category: 'Safety',
  difficulty: 'easy',
  reward: { xp: 20, coins: 10 },
  steps: [
    { id: 's1', type: 'STORY', payload: { narrative: 'Hi' } },
    { id: 's2', type: 'QUIZ', payload: { question: 'Q?', options: [], correctFeedback: '', incorrectFeedback: '' } },
    { id: 's3', type: 'DRAG_SORT', payload: { prompt: 'Sort', leftLabel: 'A', rightLabel: 'B', items: [] } },
  ],
};

describe('computeMasteryScore', () => {
  it('returns 100 for empty steps', () => {
    const lesson = { ...mockLesson, steps: [] };
    expect(computeMasteryScore(lesson, {})).toBe(100);
  });

  it('counts STORY steps as correct when completed', () => {
    const lesson = { ...mockLesson, steps: [{ id: 's1', type: 'STORY', payload: { narrative: 'Hi' } }] };
    expect(computeMasteryScore(lesson, { 0: { completed: true } })).toBe(100);
    expect(computeMasteryScore(lesson, {})).toBe(0);
  });

  it('counts QUIZ correct/incorrect', () => {
    const lesson = { ...mockLesson, steps: [
      { id: 's2', type: 'QUIZ', payload: { question: 'Q?', options: [{ id: 'a', text: 'A', correct: true }], correctFeedback: '', incorrectFeedback: '' } },
    ] };
    expect(computeMasteryScore(lesson, { 0: { correct: true } })).toBe(100);
    expect(computeMasteryScore(lesson, { 0: { correct: false } })).toBe(0);
  });

  it('counts DRAG_SORT/MATCH by correctCount/total', () => {
    const lesson = { ...mockLesson, steps: [
      { id: 's3', type: 'DRAG_SORT', payload: { prompt: 'S', leftLabel: 'A', rightLabel: 'B', items: [{ id: '1', text: 'T', correctSide: 'left' }] } },
    ] };
    expect(computeMasteryScore(lesson, { 0: { correctCount: 1, total: 1 } })).toBe(100);
    expect(computeMasteryScore(lesson, { 0: { correctCount: 0, total: 1 } })).toBe(0);
  });

  it('averages mixed steps correctly', () => {
    const lesson = { ...mockLesson, steps: [
      { id: 's1', type: 'STORY', payload: { narrative: 'Hi' } },
      { id: 's2', type: 'QUIZ', payload: { question: 'Q?', options: [], correctFeedback: '', incorrectFeedback: '' } },
    ] };
    expect(computeMasteryScore(lesson, { 0: { completed: true }, 1: { correct: true } })).toBe(100);
    expect(computeMasteryScore(lesson, { 0: { completed: true }, 1: { correct: false } })).toBe(50);
  });
});

describe('getRecommendedNextLesson', () => {
  const lessons = [
    { ...mockLesson, id: 'a', difficulty: 'easy' },
    { ...mockLesson, id: 'b', difficulty: 'medium' },
    { ...mockLesson, id: 'c', difficulty: 'hard' },
  ];

  it('returns in-progress lesson first', () => {
    const progress = {
      b: { lessonId: 'b', attempts: 0, currentStepIndex: 1, lastCompletedAt: null, masteryScore: 0, stepResponses: {}, completed: false },
    };
    expect(getRecommendedNextLesson(lessons, progress)?.id).toBe('b');
  });

  it('returns first not-started lesson (prefer easy)', () => {
    const progress = {};
    expect(getRecommendedNextLesson(lessons, progress)?.id).toBe('a');
  });

  it('returns next easy lesson when one completed', () => {
    const progress = {
      a: { lessonId: 'a', attempts: 1, currentStepIndex: 0, lastCompletedAt: '2024-01-01', masteryScore: 100, stepResponses: {}, completed: true },
    };
    expect(getRecommendedNextLesson(lessons, progress)?.id).toBe('b');
  });

  it('returns null when all completed', () => {
    const progress = {
      a: { lessonId: 'a', attempts: 1, currentStepIndex: 0, lastCompletedAt: '2024-01-01', masteryScore: 100, stepResponses: {}, completed: true },
      b: { lessonId: 'b', attempts: 1, currentStepIndex: 0, lastCompletedAt: '2024-01-01', masteryScore: 100, stepResponses: {}, completed: true },
      c: { lessonId: 'c', attempts: 1, currentStepIndex: 0, lastCompletedAt: '2024-01-01', masteryScore: 100, stepResponses: {}, completed: true },
    };
    expect(getRecommendedNextLesson(lessons, progress)).toBeNull();
  });
});
