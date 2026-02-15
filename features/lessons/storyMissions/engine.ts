/**
 * Story engine - pure functions for routing, choices, mastery, remediation
 */

import type {
  StoryMission,
  StoryNode,
  NarrativeNode,
  ChoiceNode,
  MiniQuizNode,
  SkillCheckNode,
  RecapNode,
  BreathingBreakNode,
  StoryFlags,
  ConceptMastery,
  StorySession,
  ConceptId,
} from './models';

const MASTERY_CORRECT_DELTA = 10;
const MASTERY_INCORRECT_DELTA = -5;
const MASTERY_CONFIDENCE_BONUS = 5;
const REMEDIATION_THRESHOLD = 50;
const BONUS_BRANCH_THRESHOLD = 80;

function clampMastery(n: number): number {
  return Math.max(0, Math.min(100, n));
}

export function getNode(mission: StoryMission, nodeId: string): StoryNode | undefined {
  return mission.nodes.find((n) => n.id === nodeId);
}

export function applyChoice(
  session: StorySession,
  option: { nextNodeId: string; setFlags?: Record<string, boolean> }
): StorySession {
  const next: StorySession = {
    ...session,
    currentNodeId: option.nextNodeId,
    choicesMade: [...session.choicesMade, option.nextNodeId],
  };
  if (option.setFlags) {
    next.flags = { ...session.flags, ...option.setFlags };
  }
  return next;
}

export function applyQuizResult(
  session: StorySession,
  correct: boolean,
  concepts: ConceptId[],
  lastCorrectOnConcept?: Partial<Record<ConceptId, boolean>>
): { session: StorySession; useRemediation: boolean } {
  const nextMastery = { ...session.conceptMastery };
  const nextIncorrect = { ...session.incorrectCounts };

  for (const c of concepts) {
    const current = nextMastery[c] ?? 50;
    const delta = correct ? MASTERY_CORRECT_DELTA : MASTERY_INCORRECT_DELTA;
    let newVal = current + delta;
    if (correct && lastCorrectOnConcept?.[c]) {
      newVal += MASTERY_CONFIDENCE_BONUS;
    }
    nextMastery[c] = clampMastery(newVal);
    if (!correct) {
      nextIncorrect[c] = (nextIncorrect[c] ?? 0) + 1;
    }
  }

  const sessionOut: StorySession = {
    ...session,
    conceptMastery: nextMastery,
    incorrectCounts: nextIncorrect,
  };

  const lowestMastery = Math.min(
    ...concepts.map((c) => nextMastery[c] ?? 0)
  );
  const useRemediation = !correct && lowestMastery < REMEDIATION_THRESHOLD;

  return { session: sessionOut, useRemediation };
}

export function nextNodeAfterQuiz(
  mission: StoryMission,
  node: MiniQuizNode,
  useRemediation: boolean
): string {
  if (useRemediation && node.remediationNodeId) {
    return node.remediationNodeId;
  }
  return node.nextNodeId;
}

export function maybeInjectRemediation(
  mission: StoryMission,
  session: StorySession,
  nextNodeId: string
): string {
  const nextNode = getNode(mission, nextNodeId);
  if (!nextNode) return nextNodeId;

  const conceptsInNode = getConceptsTouchedInNode(nextNode);
  if (conceptsInNode.length === 0) return nextNodeId;

  const lowest = Math.min(
    ...conceptsInNode.map((c) => session.conceptMastery[c] ?? 100)
  );
  if (lowest >= REMEDIATION_THRESHOLD) return nextNodeId;

  const remediation = mission.nodes.find(
    (n) => n.type === 'NARRATIVE' && (n as NarrativeNode).id?.startsWith('remediation-')
  ) as NarrativeNode | undefined;
  if (remediation) return remediation.id;

  return nextNodeId;
}

function getConceptsTouchedInNode(node: StoryNode): ConceptId[] {
  if (node.type === 'MINI_QUIZ') return (node as MiniQuizNode).concepts;
  if (node.type === 'SKILL_CHECK') return [(node as SkillCheckNode).concept];
  return [];
}

export function resolveSkillCheck(
  mission: StoryMission,
  node: SkillCheckNode,
  session: StorySession
): string {
  const mastery = session.conceptMastery[node.concept] ?? 0;
  return mastery >= node.threshold ? node.passNodeId : node.failNodeId;
}

export function getBonusBranchNodeId(mission: StoryMission): string | null {
  const bonus = mission.nodes.find(
    (n) => n.type === 'NARRATIVE' && (n as NarrativeNode).id?.startsWith('bonus-')
  );
  return bonus ? bonus.id : null;
}

export function shouldOfferBonusBranch(session: StorySession): boolean {
  const values = Object.values(session.conceptMastery) as number[];
  if (values.length === 0) return false;
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  return avg >= BONUS_BRANCH_THRESHOLD;
}

export function createInitialSession(missionId: string, startNodeId: string): StorySession {
  return {
    missionId,
    attempt: 1,
    currentNodeId: startNodeId,
    flags: {},
    conceptMastery: {},
    incorrectCounts: {},
    timeSpentSeconds: 0,
    choicesMade: [],
  };
}

export function getConceptsFromNode(node: StoryNode): ConceptId[] {
  if (node.type === 'MINI_QUIZ') return (node as MiniQuizNode).concepts;
  if (node.type === 'SKILL_CHECK') return [(node as SkillCheckNode).concept];
  return [];
}
