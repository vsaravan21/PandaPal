/**
 * Scene schema for AI-generated story missions
 * Strict TypeScript types + runtime validation
 */

import type { GuideId } from './models';

export type SceneType =
  | 'NARRATIVE'
  | 'FUN_CHOICE'
  | 'LEARNING_CHECK'
  | 'RECAP'
  | 'BREATHING_BREAK';

export const ALLOWED_CONCEPT_TAGS = [
  'routines',
  'tellingAdult',
  'actionPlan',
  'triggersDifferent',
  'feelings',
] as const;

export type ConceptTag = (typeof ALLOWED_CONCEPT_TAGS)[number];

export const FORBIDDEN_TOPICS = [
  'dosing',
  'diagnosis',
  'treatment changes',
  'medication instructions',
];

export interface DialogueLine {
  speaker: string;
  line: string;
}

export interface SceneChoice {
  id: string;
  label: string;
  nextHint?: string;
  setsFlags?: Record<string, boolean>;
}

export interface LearningCheckInScene {
  conceptTag: ConceptTag;
  questionInStory: string;
  options: string[];
  correctIndex: number;
  feedbackCorrect: string;
  feedbackIncorrect: string;
}

export interface VisualCue {
  backgroundKey?: string;
  characterPoseKey?: string;
  propKey?: string;
}

export interface PacingHints {
  sceneCountToNextLearningMin?: number;
  sceneCountToNextLearningMax?: number;
}

export interface Scene {
  id: string;
  guideId: GuideId;
  type: SceneType;
  setting: string;
  narration: string;
  dialogue?: DialogueLine[];
  choices?: SceneChoice[];
  learningCheck?: LearningCheckInScene;
  conceptTagsTouched: ConceptTag[];
  visualCue?: VisualCue;
  pacingHints?: PacingHints;
  /** RECAP only */
  rewards?: { xp: number; coins: number; relics?: string[]; endingId?: string };
  /** BREATHING_BREAK only */
  durationSeconds?: number;
  instruction?: string;
}

export interface GenerationInput {
  guideId: GuideId;
  childAgeBand: '7-9' | '9-12' | 'all';
  runSeed: number;
  sceneIndex: number;
  currentPlotSummary: string;
  lastScenes: CompactScene[];
  flags: Record<string, boolean>;
  conceptMastery: Record<string, number>;
  pacingState: {
    scenesSinceLearning: number;
    nextLearningIn: number;
  };
  safetyCopy: string;
  allowedConceptTags: readonly string[];
  forbiddenTopics: readonly string[];
  /** When pacing says it's time for a learning check */
  targetConceptTag?: ConceptTag;
  /** Request RECAP to end the run */
  requestRecap?: boolean;
}

export interface CompactScene {
  type: SceneType;
  setting: string;
  narration: string;
  choiceIds?: string[];
}

export const SAFETY_BANNER_COPY =
  'PandaPal teaches general epilepsy safety. Follow your seizure action plan and ask a trusted adult for help.';

const MAX_NARRATION_LENGTH = 1200;

export function validateScene(raw: unknown): raw is Scene {
  if (!raw || typeof raw !== 'object') return false;
  const s = raw as Record<string, unknown>;
  if (typeof s.id !== 'string' || typeof s.guideId !== 'string') return false;
  const types: SceneType[] = ['NARRATIVE', 'FUN_CHOICE', 'LEARNING_CHECK', 'RECAP', 'BREATHING_BREAK'];
  if (!types.includes(s.type as SceneType)) return false;
  if (typeof s.setting !== 'string' || typeof s.narration !== 'string') return false;
  if (s.narration.length > MAX_NARRATION_LENGTH) return false;
  if (!Array.isArray(s.conceptTagsTouched)) return false;
  if (s.choices && !Array.isArray(s.choices)) return false;
  if (s.choices && (s.choices as unknown[]).length > 4) return false;
  if (s.type === 'LEARNING_CHECK' && s.learningCheck) {
    const lc = s.learningCheck as Record<string, unknown>;
    if (typeof lc.questionInStory !== 'string' || !Array.isArray(lc.options)) return false;
    if (typeof lc.correctIndex !== 'number' || lc.correctIndex < 0 || lc.correctIndex >= (lc.options as unknown[]).length) return false;
  }
  return true;
}
