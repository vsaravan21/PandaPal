/**
 * Pacing engine - learning check every 2–4 story scenes (deterministic, seeded)
 */

const MIN_SCENES_BETWEEN_LEARNING = 2;
const MAX_SCENES_BETWEEN_LEARNING = 4;

/** Seeded random in [min, max] inclusive */
function seededInt(seed: number, min: number, max: number): number {
  const x = Math.sin(seed) * 10000;
  const t = x - Math.floor(x);
  return Math.floor(t * (max - min + 1)) + min;
}

export interface PacingState {
  scenesSinceLearning: number;
  nextLearningIn: number;
}

export function createInitialPacing(runSeed: number): PacingState {
  return {
    scenesSinceLearning: 0,
    nextLearningIn: seededInt(runSeed, MIN_SCENES_BETWEEN_LEARNING, MAX_SCENES_BETWEEN_LEARNING),
  };
}

/** True if the next scene should be a LEARNING_CHECK */
export function shouldShowLearningCheck(state: PacingState): boolean {
  return state.scenesSinceLearning >= state.nextLearningIn;
}

/** Call after showing a LEARNING_CHECK scene to advance pacing */
export function advancePacingAfterLearning(state: PacingState, runSeed: number, sceneIndex: number): PacingState {
  const nextIn = seededInt(runSeed + sceneIndex + 1, MIN_SCENES_BETWEEN_LEARNING, MAX_SCENES_BETWEEN_LEARNING);
  return {
    scenesSinceLearning: 0,
    nextLearningIn: nextIn,
  };
}

/** Call after showing a non-learning scene (NARRATIVE, FUN_CHOICE, BREATHING_BREAK) */
export function advancePacingAfterStory(state: PacingState): PacingState {
  return {
    ...state,
    scenesSinceLearning: state.scenesSinceLearning + 1,
  };
}
