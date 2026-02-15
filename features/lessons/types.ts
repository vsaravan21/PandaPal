/**
 * PandaPal Lessons - TypeScript data model
 * Education + adherence support only. No diagnosis or treatment advice.
 */

export type AgeBand = '7-9' | '9-12' | 'all';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type LessonCategory =
  | 'Safety'
  | 'My Brain'
  | 'Routines'
  | 'Triggers'
  | 'Feelings'
  | 'Sleep'
  | 'Nutrition'
  | 'Exercise'
  | 'Hygiene'
  | 'Social'
  | 'Dental';

export interface LessonReward {
  xp: number;
  coins: number;
  items?: string[]; // e.g. ['sticker_star', 'decor_poster']
}

export interface LessonProgress {
  lessonId: string;
  attempts: number;
  currentStepIndex: number;
  lastCompletedAt: string | null; // ISO date
  masteryScore: number; // 0-100
  stepResponses: Record<number, unknown>; // step index -> response data
  completed: boolean;
}

export type StepType =
  | 'STORY'
  | 'TAP_TO_REVEAL'
  | 'DRAG_SORT'
  | 'QUIZ'
  | 'SIMULATION'
  | 'MATCH'
  | 'BREATHING_BREAK';

// Step payloads
export interface StoryStepPayload {
  narrative: string;
  illustrationPlaceholder?: string; // e.g. 'brain_friendly' | 'panda_learning'
}

export interface TapToRevealStepPayload {
  cards: Array<{ id: string; hiddenText: string; revealedText: string }>;
}

export interface DragSortStepPayload {
  prompt: string;
  leftLabel: string; // e.g. "Helpful"
  rightLabel: string; // e.g. "Not Helpful"
  items: Array<{ id: string; text: string; correctSide: 'left' | 'right' }>;
}

export interface QuizStepPayload {
  question: string;
  options: Array<{ id: string; text: string; correct: boolean }>;
  correctFeedback: string;
  incorrectFeedback: string;
  hint?: string;
}

export interface SimulationStepPayload {
  scenario: string;
  prompt: string;
  options: Array<{ id: string; text: string; correct: boolean; feedback: string }>;
}

export interface MatchStepPayload {
  pairs: Array<{ term: string; definition: string }>;
}

export interface BreathingBreakStepPayload {
  durationSeconds: number;
  instruction?: string;
}

export type StepPayload =
  | StoryStepPayload
  | TapToRevealStepPayload
  | DragSortStepPayload
  | QuizStepPayload
  | SimulationStepPayload
  | MatchStepPayload
  | BreathingBreakStepPayload;

export interface LessonStep {
  id: string;
  type: StepType;
  payload: StepPayload;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  ageBand: AgeBand;
  estimatedMinutes: number;
  tags: string[];
  category: LessonCategory;
  difficulty: Difficulty;
  reward: LessonReward;
  steps: LessonStep[];
}

export interface ChildProfile {
  xp: number;
  coins: number;
  inventory: string[];
  lessonProgress: Record<string, LessonProgress>;
}
