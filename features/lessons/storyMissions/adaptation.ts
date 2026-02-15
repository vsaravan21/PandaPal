/**
 * Adaptation - pick which concept to reinforce, avoid back-to-back same concept
 */

import type { ConceptTag } from './sceneSchema';
import { ALLOWED_CONCEPT_TAGS } from './sceneSchema';

const MASTERY_LOW_THRESHOLD = 60;
const MASTERY_BONUS_THRESHOLD = 80;
const MASTERY_VERY_LOW = 30;

/** Pick next concept for a learning check. Prefer lowest mastery; avoid same as last unless very low. */
export function selectTargetConcept(
  conceptMastery: Record<string, number>,
  lastLearningConcept: ConceptTag | undefined
): ConceptTag | undefined {
  const scores = ALLOWED_CONCEPT_TAGS.map((tag) => ({
    tag,
    score: conceptMastery[tag] ?? 50,
  })).sort((a, b) => a.score - b.score);

  const allHigh = scores.every((s) => s.score >= MASTERY_BONUS_THRESHOLD);
  if (allHigh) return undefined; // caller can show bonus/advanced

  const low = scores.filter((s) => s.score < MASTERY_LOW_THRESHOLD);
  const candidates = low.length > 0 ? low : scores;

  // Avoid same concept back-to-back unless mastery very low
  const filtered =
    lastLearningConcept && (conceptMastery[lastLearningConcept] ?? 0) > MASTERY_VERY_LOW
      ? candidates.filter((c) => c.tag !== lastLearningConcept)
      : candidates;

  const pick = filtered.length > 0 ? filtered : candidates;
  if (pick.length === 0) return undefined;
  // Weight toward lowest: pick from bottom half
  const idx = Math.min(Math.floor(pick.length * 0.5), pick.length - 1);
  return pick[idx].tag;
}

export const MASTERY_CORRECT_DELTA = 10;
export const MASTERY_INCORRECT_DELTA = -5;

export function applyMasteryUpdate(
  conceptMastery: Record<string, number>,
  conceptTag: string,
  correct: boolean
): Record<string, number> {
  const next = { ...conceptMastery };
  const current = next[conceptTag] ?? 50;
  const delta = correct ? MASTERY_CORRECT_DELTA : MASTERY_INCORRECT_DELTA;
  next[conceptTag] = Math.max(0, Math.min(100, current + delta));
  return next;
}
