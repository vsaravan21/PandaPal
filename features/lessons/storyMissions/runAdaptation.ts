/**
 * Adaptation for full-run EDU - mastery updates
 */

import type { ConceptTag } from './storyRunSchema';
import { ALLOWED_CONCEPT_TAGS } from './storyRunSchema';

export const MASTERY_CORRECT_DELTA = 10;
export const MASTERY_INCORRECT_DELTA = -5;

export function applyMasteryUpdate(
  conceptMastery: Record<string, number>,
  conceptTag: ConceptTag,
  correct: boolean
): Record<string, number> {
  const next = { ...conceptMastery };
  const current = next[conceptTag] ?? 50;
  const delta = correct ? MASTERY_CORRECT_DELTA : MASTERY_INCORRECT_DELTA;
  next[conceptTag] = Math.max(0, Math.min(100, current + delta));
  return next;
}
