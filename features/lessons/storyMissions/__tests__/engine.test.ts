/**
 * Story engine tests - routing, mastery, remediation
 */

import {
  applyChoice,
  applyQuizResult,
  nextNodeAfterQuiz,
  createInitialSession,
  getNode,
} from '../engine';
import { STORY_MISSION_SAFETY_QUEST } from '../seedMissions';

describe('createInitialSession', () => {
  it('starts at startNodeId with empty flags and mastery', () => {
    const s = createInitialSession('safety-quest', 'start');
    expect(s.missionId).toBe('safety-quest');
    expect(s.currentNodeId).toBe('start');
    expect(s.flags).toEqual({});
    expect(s.conceptMastery).toEqual({});
  });
});

describe('applyChoice', () => {
  it('updates currentNodeId and sets flags', () => {
    const s = createInitialSession('m1', 'choice');
    const opt = { nextNodeId: 'n2', setFlags: { toldAdult: true } };
    const next = applyChoice(s, opt);
    expect(next.currentNodeId).toBe('n2');
    expect(next.flags.toldAdult).toBe(true);
  });
});

describe('applyQuizResult', () => {
  it('increases mastery on correct', () => {
    const s = createInitialSession('m1', 'q1');
    const { session, useRemediation } = applyQuizResult(s, true, ['routines']);
    expect(session.conceptMastery.routines).toBe(60); // 50 + 10
    expect(useRemediation).toBe(false);
  });

  it('decreases mastery on incorrect and suggests remediation when low', () => {
    const s = createInitialSession('m1', 'q1');
    s.conceptMastery = { routines: 30 };
    const { session, useRemediation } = applyQuizResult(s, false, ['routines']);
    expect(session.conceptMastery.routines).toBe(25);
    expect(useRemediation).toBe(true);
  });
});

describe('nextNodeAfterQuiz', () => {
  it('returns remediationNodeId when useRemediation true', () => {
    const node = getNode(STORY_MISSION_SAFETY_QUEST, 'quiz_routines') as any;
    expect(nextNodeAfterQuiz(STORY_MISSION_SAFETY_QUEST, node, true)).toBe('remediation-routines');
  });

  it('returns nextNodeId when useRemediation false', () => {
    const node = getNode(STORY_MISSION_SAFETY_QUEST, 'quiz_routines') as any;
    expect(nextNodeAfterQuiz(STORY_MISSION_SAFETY_QUEST, node, false)).toBe('n3_triggers');
  });
});
