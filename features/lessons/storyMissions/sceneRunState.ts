/**
 * Scene-driven run state (replaces node-based session for generated stories)
 */

import type { Scene, CompactScene } from './sceneSchema';
import type { PacingState } from './pacingEngine';
import type { GuideId } from './models';
import type { ConceptTag } from './sceneSchema';

export interface SceneRunState {
  guideId: GuideId;
  missionId: string;
  runSeed: number;
  sceneIndex: number;
  pacingState: PacingState;
  flags: Record<string, boolean>;
  conceptMastery: Record<string, number>;
  lastLearningConcept: ConceptTag | undefined;
  scenes: Scene[];
  /** When true, use only cached scenes (replay last run) */
  replayMode: boolean;
  cachedSceneKeys: string[];
}

export function sceneToCompact(s: Scene): CompactScene {
  return {
    type: s.type,
    setting: s.setting,
    narration: s.narration.slice(0, 200),
    choiceIds: s.choices?.map((c) => c.id),
  };
}
