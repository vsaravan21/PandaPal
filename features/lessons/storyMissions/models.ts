/**
 * Story Missions - type definitions
 * Educational branching narratives. No diagnosis/treatment advice.
 */

export type GuideId = 'astronaut' | 'detective' | 'diver' | 'treasure';

export interface Guide {
  id: GuideId;
  name: string;
  theme: string;
  tagline: string;
  artPlaceholder: string;
  voice: 'curious' | 'clever' | 'calm' | 'adventurous';
}

export type NodeType =
  | 'NARRATIVE'
  | 'CHOICE'
  | 'MINI_QUIZ'
  | 'SKILL_CHECK'
  | 'RECAP'
  | 'BREATHING_BREAK';

export type ConceptId = 'tellingAdult' | 'routines' | 'triggers' | 'actionPlan' | 'feelings';

export interface StoryNodeBase {
  id: string;
  type: NodeType;
}

export interface NarrativeNode extends StoryNodeBase {
  type: 'NARRATIVE';
  text: string;
  illustrationPlaceholder?: string;
  nextNodeId?: string;
}

export interface ChoiceOption {
  id: string;
  text: string;
  nextNodeId: string;
  setFlags?: Record<string, boolean>;
}

export interface ChoiceNode extends StoryNodeBase {
  type: 'CHOICE';
  text: string;
  options: ChoiceOption[];
  feedback?: string;
}

export interface MiniQuizNode extends StoryNodeBase {
  type: 'MINI_QUIZ';
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  concepts: ConceptId[];
  nextNodeId: string;
  remediationNodeId?: string;
}

export interface SkillCheckNode extends StoryNodeBase {
  type: 'SKILL_CHECK';
  concept: ConceptId;
  threshold: number;
  passNodeId: string;
  failNodeId: string;
}

export interface RecapNode extends StoryNodeBase {
  type: 'RECAP';
  summary: string;
  rewards: { xp: number; coins: number; relics?: string[]; endingId?: string };
}

export interface BreathingBreakNode extends StoryNodeBase {
  type: 'BREATHING_BREAK';
  durationSeconds: number;
  instruction?: string;
  nextNodeId: string;
}

export type StoryNode =
  | NarrativeNode
  | ChoiceNode
  | MiniQuizNode
  | SkillCheckNode
  | RecapNode
  | BreathingBreakNode;

export interface StoryMission {
  id: string;
  title: string;
  guideId: GuideId;
  synopsis: string;
  tags: string[];
  estimatedMinutes: number;
  nodes: StoryNode[];
  startNodeId: string;
}

export interface StoryFlags {
  toldAdult?: boolean;
  choseRoutine?: boolean;
  checkedPlan?: boolean;
  breathingBreak?: boolean;
  [key: string]: boolean | undefined;
}

export interface ConceptMastery {
  [K in ConceptId]?: number;
}

export interface StorySession {
  missionId: string;
  attempt: number;
  currentNodeId: string;
  flags: StoryFlags;
  conceptMastery: ConceptMastery;
  incorrectCounts: Partial<Record<ConceptId, number>>;
  timeSpentSeconds: number;
  choicesMade: string[];
}

export interface StoryRunHistory {
  missionId: string;
  runsCompleted: number;
  endingsUnlocked: string[];
  choicesCounts: Record<string, number>;
}
