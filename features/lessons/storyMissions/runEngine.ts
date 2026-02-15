/**
 * Run engine - resolve next scene, resolve ending by flags
 */

import type { StoryRun, StoryRunScene, Ending } from './storyRunSchema';

/** Get scene by 1-based index */
export function getSceneByIndex(run: StoryRun, index: number): StoryRunScene | undefined {
  return run.scenes.find((s) => s.index === index);
}

/** Resolve next scene index from current scene and flags. Returns 0 if run complete. */
export function resolveNextIndex(
  run: StoryRun,
  currentIndex: number,
  flags: Record<string, boolean>
): number {
  const scene = getSceneByIndex(run, currentIndex);
  if (!scene) return 0;

  const { defaultNextIndex, branchByFlag } = scene.next;

  if (branchByFlag) {
    for (const { flag, nextIndex } of branchByFlag) {
      if (flags[flag]) return nextIndex;
    }
  }

  return defaultNextIndex;
}

/** Match flags to best ending. Prefer secret > guide > hero. */
export function resolveEnding(run: StoryRun, flags: Record<string, boolean>): Ending {
  const ordered = [...run.endings].sort((a, b) => {
    const aSecret = a.endingId.includes('secret') ? 1 : 0;
    const bSecret = b.endingId.includes('secret') ? 1 : 0;
    return bSecret - aSecret;
  });

  for (const ending of ordered) {
    if (!ending.requiredFlags) continue;
    const match = Object.entries(ending.requiredFlags).every(([k, v]) => flags[k] === v);
    if (match) return ending;
  }

  return ordered.find((e) => !e.requiredFlags) ?? run.endings[0];
}
