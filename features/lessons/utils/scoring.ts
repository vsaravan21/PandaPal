/**
 * Lesson scoring and mastery calculation
 */

import type { Lesson, LessonProgress } from '../types';

type StepResponse = {
  correct?: boolean;
  score?: number;
  completed?: boolean;
  revealed?: string[];
  correctCount?: number;
  total?: number;
};

/**
 * Compute mastery score (0–100) from step responses.
 * Simple rule: percentage of steps answered correctly.
 */
export function computeMasteryScore(
  lesson: Lesson,
  stepResponses: Record<number, StepResponse>
): number {
  if (lesson.steps.length === 0) return 100;

  let correct = 0;
  let scored = 0;

  lesson.steps.forEach((step, idx) => {
    const resp = stepResponses[idx] as StepResponse | undefined;
    if (step.type === 'STORY' || step.type === 'BREATHING_BREAK') {
      if (resp !== undefined) correct++;
      scored++;
    } else if (resp?.correct !== undefined) {
      scored++;
      if (resp.correct) correct++;
    } else if (resp?.correctCount !== undefined && resp?.total !== undefined) {
      scored++;
      if (resp.correctCount === resp.total) correct++;
    } else if (resp?.revealed !== undefined) {
      scored++;
      correct++; // TAP_TO_REVEAL: completed when all revealed
    }
  });

  if (scored === 0) return 0;
  return Math.round((correct / scored) * 100);
}

/**
 * Get recommended next lesson (rule-based)
 */
export function getRecommendedNextLesson(
  lessons: Lesson[],
  progress: Record<string, LessonProgress>
): Lesson | null {
  const completed = Object.values(progress).filter((p) => p.completed).map((p) => p.lessonId);
  const inProgress = Object.values(progress).filter(
    (p) => !p.completed && p.currentStepIndex > 0
  ).map((p) => p.lessonId);

  if (inProgress.length > 0) {
    const lesson = lessons.find((l) => l.id === inProgress[0]);
    if (lesson) return lesson;
  }

  const notStarted = lessons.filter((l) => !completed.includes(l.id));
  if (notStarted.length === 0) return null;

  // Prefer easier lessons first
  const order: Array<'easy' | 'medium' | 'hard'> = ['easy', 'medium', 'hard'];
  for (const diff of order) {
    const match = notStarted.find((l) => l.difficulty === diff);
    if (match) return match;
  }
  return notStarted[0];
}
