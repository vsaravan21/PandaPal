/**
 * Mock scene generator - deterministic, no network, guide-dependent
 */

import type { Scene, SceneType } from '../sceneSchema';
import type { GenerationInput } from '../sceneSchema';
import type { SceneGenerator } from './types';
import { MISSION_SHELLS } from '../missionShells';
import { ALLOWED_CONCEPT_TAGS, type ConceptTag } from '../sceneSchema';

const GUIDE_VOCAB: Record<string, { setting: string; verb: string; item: string }> = {
  astronaut: { setting: 'Space station', verb: 'check the console', item: 'control panel' },
  detective: { setting: 'Case room', verb: 'look at the clue board', item: 'clue' },
  diver: { setting: 'Under the sea', verb: 'check your dive list', item: 'checklist' },
  treasure: { setting: 'Expedition camp', verb: 'read the map', item: 'treasure map' },
};

function seededPick<T>(seed: number, arr: T[]): T {
  const x = Math.sin(seed) * 10000;
  const t = x - Math.floor(x);
  return arr[Math.floor(t * arr.length) % arr.length];
}

function makeId(guideId: string, index: number): string {
  return `mock_${guideId}_${index}`;
}

export const mockSceneGenerator: SceneGenerator = {
  async generateNextScene(input: GenerationInput): Promise<Scene> {
    const { guideId, sceneIndex, runSeed, pacingState, targetConceptTag, requestRecap } = input;
    const shell = MISSION_SHELLS[guideId];
    const vocab = GUIDE_VOCAB[guideId] ?? GUIDE_VOCAB.astronaut;
    const seed = runSeed + sceneIndex * 7 + guideId.length;

    if (requestRecap) {
      return makeRecapScene(guideId, sceneIndex, shell);
    }

    const shouldLearning = pacingState.scenesSinceLearning >= pacingState.nextLearningIn && targetConceptTag;

    if (shouldLearning && targetConceptTag) {
      return makeLearningCheckScene(guideId, sceneIndex, targetConceptTag, vocab, shell);
    }

    const sceneType = seededPick(seed, ['NARRATIVE', 'NARRATIVE', 'FUN_CHOICE', 'BREATHING_BREAK'] as SceneType[]);

    if (sceneType === 'BREATHING_BREAK') {
      return makeBreathingScene(guideId, sceneIndex);
    }

    if (sceneType === 'FUN_CHOICE') {
      return makeFunChoiceScene(guideId, sceneIndex, runSeed, vocab, shell);
    }

    return makeNarrativeScene(guideId, sceneIndex, runSeed, vocab, shell);
  },
};

function makeNarrativeScene(
  guideId: string,
  sceneIndex: number,
  runSeed: number,
  vocab: { setting: string; verb: string; item: string },
  shell: { openingPremise: string; sidekickNpc: string }
): Scene {
  const seed = runSeed + sceneIndex;
  const openings = [
    `${shell.sidekickNpc} sends a message. "Everything on track?" You and your guide review the ${vocab.item}.`,
    `You move to a new area. The ${vocab.setting} glows. Your guide reminds you: if something feels wrong, tell a trusted adult.`,
    `A quiet moment. Your guide says, "Remember—follow your plan. That's how we stay safe."`,
  ];
  const narration = sceneIndex === 0 ? shell.openingPremise : seededPick(seed, openings);
  return {
    id: makeId(guideId, sceneIndex),
    guideId: guideId as Scene['guideId'],
    type: 'NARRATIVE',
    setting: vocab.setting,
    narration,
    conceptTagsTouched: [],
    visualCue: { backgroundKey: `${guideId}_bg`, characterPoseKey: 'idle' },
  };
}

function makeFunChoiceScene(
  guideId: string,
  sceneIndex: number,
  runSeed: number,
  vocab: { setting: string; verb: string; item: string },
  shell: { sidekickNpc: string }
): Scene {
  const seed = runSeed + sceneIndex + 3;
  const options: { id: string; label: string; setsFlags: Record<string, boolean> }[] = [
    { id: 'path_a', label: 'Take the left path', setsFlags: { tookLeftPath: true } },
    { id: 'path_b', label: 'Take the right path', setsFlags: { tookRightPath: true } },
    { id: 'ask', label: `Ask ${shell.sidekickNpc} for a hint`, setsFlags: { askedSidekick: true } },
  ];
  return {
    id: makeId(guideId, sceneIndex),
    guideId: guideId as Scene['guideId'],
    type: 'FUN_CHOICE',
    setting: vocab.setting,
    narration: `Time to choose. You can ${vocab.verb} or try a different approach. What do you do?`,
    choices: options.slice(0, 2 + (seed % 2)),
    conceptTagsTouched: [],
    visualCue: { propKey: vocab.item },
  };
}

function makeLearningCheckScene(
  guideId: string,
  sceneIndex: number,
  conceptTag: ConceptTag,
  vocab: { setting: string; item: string },
  shell: { sidekickNpc: string }
): Scene {
  const templates: Record<string, { question: string; options: string[]; correctIndex: number; correctFb: string; incorrectFb: string }> = {
    tellingAdult: {
      question: `${shell.sidekickNpc} asks: "If you don't feel right, what should you do first?"`,
      options: ['Hide until it passes', 'Tell a trusted adult', 'Ignore it'],
      correctIndex: 1,
      correctFb: 'Right! Telling a trusted adult keeps you safe.',
      incorrectFb: 'Remember: tell a trusted adult so they can help.',
    },
    routines: {
      question: `On the ${vocab.item} it says: "Why is doing things at the same time each day helpful?"`,
      options: ['It is boring', 'It helps your body and brain stay strong', 'Only for adults'],
      correctIndex: 1,
      correctFb: 'Yes! Routines help your body and brain. Your caregiver and doctor help with the plan.',
      incorrectFb: 'Routines help you stay strong. Ask your caregiver about your routine!',
    },
    actionPlan: {
      question: `Your guide shows you a plan. "What is a Seizure Action Plan?"`,
      options: ['A game', 'A safety map that tells people how to help you', 'A secret'],
      correctIndex: 1,
      correctFb: 'Correct! It is your safety map. Follow it and ask a trusted adult for help.',
      incorrectFb: 'It is a note from your doctor and family that tells people how to help. Ask your caregiver where it is!',
    },
    triggersDifferent: {
      question: `${shell.sidekickNpc} says: "Who knows what might be a trigger for YOU?"`,
      options: ['Only you', 'Your doctor and caregiver', 'Nobody'],
      correctIndex: 1,
      correctFb: 'Right! Your doctor and caregiver know you best. Always ask them.',
      incorrectFb: 'Your doctor and caregiver know what might affect you. Ask them!',
    },
    feelings: {
      question: 'Your guide asks: "If you feel upset after a seizure, what can help?"',
      options: ['Keep it secret', 'Tell a trusted adult or take a calm breath', 'Stay alone'],
      correctIndex: 1,
      correctFb: 'Yes! Talking to someone or breathing calmly can help. You are not alone.',
      incorrectFb: 'Telling a trusted adult or taking slow breaths can help. You are brave!',
    },
  };
  const t = templates[conceptTag] ?? templates.tellingAdult;
  return {
    id: makeId(guideId, sceneIndex),
    guideId: guideId as Scene['guideId'],
    type: 'LEARNING_CHECK',
    setting: vocab.setting,
    narration: `You look at the ${vocab.item}. ${t.question}`,
    conceptTagsTouched: [conceptTag],
    learningCheck: {
      conceptTag,
      questionInStory: t.question,
      options: t.options,
      correctIndex: t.correctIndex,
      feedbackCorrect: t.correctFb,
      feedbackIncorrect: t.incorrectFb,
    },
    visualCue: { propKey: vocab.item },
  };
}

function makeRecapScene(guideId: string, sceneIndex: number, shell: { openingPremise: string }): Scene {
  return {
    id: makeId(guideId, sceneIndex),
    guideId: guideId as Scene['guideId'],
    type: 'RECAP',
    setting: 'Mission complete',
    narration: `You did it! You learned: tell a trusted adult, routines help, your action plan is your safety map, and feelings are normal. ${shell.openingPremise.split('.')[0]}. Follow your plan and ask your caregiver or doctor when you need help!`,
    conceptTagsTouched: ALLOWED_CONCEPT_TAGS as unknown as ConceptTag[],
    rewards: { xp: 40, coins: 25, relics: ['story_relic_compass'], endingId: 'ending_hero' },
  };
}

function makeBreathingScene(guideId: string, sceneIndex: number): Scene {
  return {
    id: makeId(guideId, sceneIndex),
    guideId: guideId as Scene['guideId'],
    type: 'BREATHING_BREAK',
    setting: 'Calm moment',
    narration: 'Take a short break with your guide.',
    conceptTagsTouched: [],
    durationSeconds: 12,
    instruction: 'Take 3 gentle breaths.',
  };
}
