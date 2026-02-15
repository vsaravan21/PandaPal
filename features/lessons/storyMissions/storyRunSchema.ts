/**
 * 20-scene Story Run schema - full adventure per run
 */

import type { GuideId } from './models';

// New concept tags per requirements
export const ALLOWED_CONCEPT_TAGS = [
  'routines_are_power',
  'tell_trusted_adult',
  'action_plan_is_map',
  'triggers_are_different',
  'feelings_are_normal',
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

export interface VisualCue {
  backgroundKey?: string;
  propKey?: string;
  moodKey?: string;
  guidePoseKey?: string;
}

export interface Choice {
  id: string;
  label: string;
  setsFlags?: Record<string, boolean>;
}

export interface EduBlock {
  conceptTag: ConceptTag;
  questionInStory: string;
  options: [string, string, string];
  correctIndex: number;
  feedbackCorrect: string;
  feedbackIncorrect: string;
}

export interface SceneNext {
  defaultNextIndex: number;
  branchByFlag?: { flag: string; nextIndex: number }[];
}

export type SceneKind = 'STORY' | 'FUN' | 'EDU';

export interface StoryRunScene {
  index: number;
  id: string;
  kind: SceneKind;
  settingTitle: string;
  narration: string;
  dialogue?: DialogueLine[];
  visualCue?: VisualCue;
  choices?: Choice[];
  requiresFlags?: Record<string, boolean>;
  edu?: EduBlock;
  next: SceneNext;
}

export interface Ending {
  endingId: string;
  title: string;
  requiredFlags?: Record<string, boolean>;
  epilogue: string;
  rewards: { xp: number; coins: number; items?: string[] };
}

export interface StoryRunMetadata {
  sceneCount: number;
  choiceCount: number;
  eduCount: number;
  endingCount: number;
}

export interface StoryRun {
  runId: string;
  guideId: GuideId;
  seed: number;
  title: string;
  synopsis: string;
  scenes: StoryRunScene[];
  endings: Ending[];
  metadata: StoryRunMetadata;
}

export const SAFETY_BANNER_COPY =
  'PandaPal teaches general epilepsy safety. Follow your seizure action plan and ask a trusted adult for help.';

const MAX_NARRATION = 1200;
const MAX_EPILOGUE = 1000;

export function validateStoryRun(raw: unknown): raw is StoryRun {
  if (!raw || typeof raw !== 'object') return false;
  const r = raw as Record<string, unknown>;
  if (typeof r.runId !== 'string' || typeof r.guideId !== 'string') return false;
  if (typeof r.seed !== 'number' || typeof r.title !== 'string' || typeof r.synopsis !== 'string') return false;
  if (!Array.isArray(r.scenes) || !Array.isArray(r.endings)) return false;

  const scenes = r.scenes as StoryRunScene[];
  if (scenes.length < 18 || scenes.length > 22) return false;

  let choiceCount = 0;
  let eduCount = 0;
  const kinds: SceneKind[] = ['STORY', 'FUN', 'EDU'];
  let lastKind: SceneKind | null = null;

  for (let i = 0; i < scenes.length; i++) {
    const s = scenes[i];
    if (!s || typeof s !== 'object') return false;
    if (typeof s.index !== 'number' || typeof s.id !== 'string') return false;
    if (!kinds.includes(s.kind)) return false;
    if (s.kind === 'EDU') {
      eduCount++;
      if (lastKind === 'EDU') return false; // no back-to-back EDU
    }
    lastKind = s.kind;
    if (typeof s.settingTitle !== 'string' || typeof s.narration !== 'string') return false;
    if (s.narration.length > MAX_NARRATION) return false;
    if (s.choices) {
      if (!Array.isArray(s.choices) || s.choices.length < 2 || s.choices.length > 4) return false;
      choiceCount += s.choices.length;
    }
    if (s.kind === 'EDU' && s.edu) {
      const edu = s.edu as EduBlock;
      if (!Array.isArray(edu.options) || edu.options.length !== 3) return false;
      if (typeof edu.correctIndex !== 'number' || edu.correctIndex < 0 || edu.correctIndex > 2) return false;
    }
    if (!s.next || typeof s.next.defaultNextIndex !== 'number') return false;
  }

  if (choiceCount < 8) return false;
  if (eduCount < 3 || eduCount > 5) return false;
  if ((r.endings as Ending[]).length < 3) return false;

  return true;
}
