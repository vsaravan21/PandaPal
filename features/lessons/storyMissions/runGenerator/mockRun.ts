/**
 * Mock full-run generator - 20 scenes, 8+ choices, 4 EDU, 3 endings. Deterministic, no API.
 */

import type { GuideId } from '../models';
import type {
  StoryRun,
  StoryRunScene,
  Choice,
  EduBlock,
  Ending,
  ConceptTag,
  SceneKind,
} from '../storyRunSchema';
import { ALLOWED_CONCEPT_TAGS } from '../storyRunSchema';
import { GUIDE_STYLE_BIBLES } from '../guideStyleBibles';
import type { GuideStyleBible } from '../guideStyleBibles';

function seededInt(seed: number, min: number, max: number): number {
  const x = Math.sin(seed) * 10000;
  const t = x - Math.floor(x);
  return Math.floor(t * (max - min + 1)) + min;
}

function seededPick<T>(seed: number, arr: T[]): T {
  return arr[seededInt(seed, 0, arr.length - 1)];
}

export function generateMockRun(guideId: GuideId, seed: number): StoryRun {
  const bible = GUIDE_STYLE_BIBLES[guideId];
  const runId = `mock_${guideId}_${seed}`;
  const scenes: StoryRunScene[] = [];

  // Scene layout: 10 STORY, 6 FUN, 4 EDU, spaced (no back-to-back EDU)
  // Indices 0..19
  const layout: SceneKind[] = [
    'STORY',  // 0 opening
    'FUN',    // 1 choice - route
    'STORY',  // 2
    'EDU',    // 3 concept 1
    'STORY',  // 4
    'FUN',    // 5 choice - item
    'STORY',  // 6
    'EDU',    // 7 concept 2
    'STORY',  // 8
    'FUN',    // 9 choice - relationship
    'STORY',  // 10
    'EDU',    // 11 concept 3
    'FUN',    // 12 choice
    'STORY',  // 13
    'EDU',    // 14 concept 4
    'STORY',  // 15
    'FUN',    // 16 choice
    'FUN',    // 17 choice
    'STORY',  // 18
    'STORY',  // 19 finale
  ];

  const concepts: ConceptTag[] = [
    'tell_trusted_adult',
    'routines_are_power',
    'action_plan_is_map',
    'triggers_are_different',
    'feelings_are_normal',
  ];

  for (let i = 0; i < 20; i++) {
    const kind = layout[i];
    const s = buildScene(guideId, seed, i, kind, bible, concepts);
    scenes.push(s);
  }

  const endings: Ending[] = [
    {
      endingId: 'ending_hero',
      title: 'Hero of the Mission',
      epilogue: `You did it! You and ${bible.npcCast[0]} celebrated. You learned: tell a trusted adult, routines help, your action plan is your map, and feelings are normal. Follow your plan and ask your caregiver when you need help!`,
      rewards: { xp: 50, coins: 30, items: ['story_relic_star'] },
    },
    {
      endingId: 'ending_guide',
      title: 'Trusty Sidekick',
      requiredFlags: { askedSidekick: true },
      epilogue: `Your guide beams. "We make a great team!" You helped by asking when unsure. Remember: tell a trusted adult and follow your plan. You're a trusty sidekick!`,
      rewards: { xp: 45, coins: 25, items: ['story_relic_badge'] },
    },
    {
      endingId: 'ending_secret',
      title: 'Secret Explorer',
      requiredFlags: { gotStarKey: true, choseNebulaPath: true },
      epilogue: `The secret path led to the hidden treasure! Only those who chose wisely and trusted their guide find it. You're a true explorer. Follow your plan and stay curious!`,
      rewards: { xp: 60, coins: 40, items: ['story_relic_compass', 'story_relic_crystal'] },
    },
  ];

  const choiceCount = scenes.reduce((n, s) => n + (s.choices?.length ?? 0), 0);
  const eduCount = scenes.filter((s) => s.kind === 'EDU').length;

  return {
    runId,
    guideId,
    seed,
    title: `${bible.npcCast[0]}'s Adventure`,
    synopsis: bible.openingHook,
    scenes,
    endings,
    metadata: {
      sceneCount: 20,
      choiceCount,
      eduCount,
      endingCount: 3,
    },
  };
}

function buildScene(
  guideId: GuideId,
  seed: number,
  index: number,
  kind: SceneKind,
  bible: GuideStyleBible,
  concepts: ConceptTag[]
): StoryRunScene {
  const id = `s${guideId}_${seed}_${index}`;
  const baseSeed = seed + index * 31 + guideId.length;

  if (kind === 'STORY') {
    return buildStoryScene(guideId, seed, index, id, bible);
  }
  if (kind === 'FUN') {
    return buildFunScene(guideId, seed, index, id, bible);
  }
  return buildEduScene(guideId, seed, index, id, bible, concepts[Math.floor(index / 5) % concepts.length]);
}

function buildStoryScene(
  guideId: GuideId,
  seed: number,
  index: number,
  id: string,
  bible: GuideStyleBible
): StoryRunScene {
  const baseSeed = seed + index * 31;
  const prop = seededPick(baseSeed, bible.recurringProps) as string;
  const npc = seededPick(baseSeed + 1, bible.npcCast) as string;
  const setting = seededPick(baseSeed + 2, bible.settingPalette) as string;

  const storyTemplates: Record<string, string[]> = {
    astronaut: [
      `The ${prop} glows. ${npc} says, "${bible.catchphrases[0]}" You feel the rhythm of the ship—steady and strong.`,
      `You arrive at the ${setting}. Stars twinkle. Your guide reminds you: if something feels off, tell Mission Control.`,
      `The comet hamster scurries past. ${npc} sends a message. Everything's on track when we follow the plan.`,
      `The control console beeps. You and your guide check the star map. Steady routines keep the mission safe.`,
      `A quiet moment in space. "Remember," says your guide, "tell a trusted adult when you need help."`,
    ],
    detective: [
      `The ${prop} holds a clue. ${npc} nods. "${bible.catchphrases[1]}" The case deepens.`,
      `You're at the ${setting}. Madame Whiskers has a tip. Always tell a trusted adult if something feels wrong.`,
      `The clue board fills up. ${npc} adjusts the magnifying monocle. The plot thickens!`,
      `A secret decoder reveals a message. Your guide says, "Follow your case file—that's your action plan."`,
      `The Chief gives you a thumbs-up. You're getting closer. Remember: feelings are normal. Talk to someone.`,
    ],
    diver: [
      `The ${prop} glows softly. ${npc} swims by. "${bible.catchphrases[0]}" The reef is calm.`,
      `You explore the ${setting}. The Turtle Librarian waves. Tell your dive buddy if something feels wrong.`,
      `Bubbles rise. The coral sage shares wisdom: routines help your body stay strong.`,
      `Your dive checklist shines. Steady habits—same time each day—keep you safe.`,
      `The Glowfish Choir hums. Your guide reminds you: your action plan is like a dive map. Follow it!`,
    ],
    treasure: [
      `The ${prop} points the way. ${npc} squawks. "${bible.catchphrases[2]}" Adventure awaits!`,
      `You reach the ${setting}. The Jungle Sage nods. Tell your crew (a trusted adult) if you feel unsure.`,
      `The relic chest glows. Your expedition plan is your map. Follow it and ask for help when needed.`,
      `The First Mate high-fives you. "Routines keep the ship steady!" Same time each day helps.`,
      `You found a clue! Your guide says, "Triggers are different for everyone. Your doctor knows you best."`,
    ],
  };
  const lines = storyTemplates[guideId] ?? storyTemplates.astronaut;
  const narration = seededPick(seed + index * 7, lines);

  const isFinale = index === 19;
  // defaultNextIndex 0 = end run, engine resolves ending by flags
  const nextIndex = isFinale ? 0 : index + 2;

  return {
    index: index + 1,
    id,
    kind: 'STORY',
    settingTitle: setting.replace(/\s+/g, ' ').replace(/^\w/, (c: string) => c.toUpperCase()),
    narration,
    visualCue: { backgroundKey: `${guideId}_${setting}`, propKey: prop as string, moodKey: 'calm' },
    next: { defaultNextIndex: nextIndex },
  };
}

function buildFunScene(
  guideId: GuideId,
  seed: number,
  index: number,
  id: string,
  bible: GuideStyleBible
): StoryRunScene {
  const baseSeed = seed + index * 31;
  const npc = seededPick(baseSeed, bible.npcCast);

  const choiceSets: { narration: string; choices: Choice[] }[] = [
    {
      narration: `A fork in the path. ${npc} waits. Which way do you go?`,
      choices: [
        { id: 'path_nebula', label: 'Take the nebula path', setsFlags: { choseNebulaPath: true } },
        { id: 'path_reef', label: 'Take the reef tunnel', setsFlags: { choseReefTunnel: true } },
        { id: 'ask_npc', label: `Ask ${npc} for advice`, setsFlags: { askedSidekick: true } },
      ],
    },
    {
      narration: `You spot something gleaming. ${npc} gasps. What do you do?`,
      choices: [
        { id: 'take_star', label: 'Pick up the star key', setsFlags: { gotStarKey: true } },
        { id: 'leave_it', label: 'Leave it and move on', setsFlags: {} },
        { id: 'show_guide', label: 'Show your guide first', setsFlags: { showedGuide: true } },
      ],
    },
    {
      narration: `${npc} looks at you. "We could work together…" How do you respond?`,
      choices: [
        { id: 'team_up', label: "Let's team up!", setsFlags: { turtleTrust: true } },
        { id: 'solo', label: "I'll go alone for now", setsFlags: {} },
        { id: 'help_them', label: "I'll help you first", setsFlags: { helpedNpc: true } },
      ],
    },
    {
      narration: `A puzzle block blocks the way. ${npc} scratches their head. What's your move?`,
      choices: [
        { id: 'solve_alone', label: 'Try to solve it yourself', setsFlags: {} },
        { id: 'solve_together', label: 'Solve it together', setsFlags: { solvedTogether: true } },
      ],
    },
    {
      narration: `Two doors. One glows. ${npc} shrugs. Your choice!`,
      choices: [
        { id: 'door_left', label: 'Go through the left door', setsFlags: { choseLeftDoor: true } },
        { id: 'door_right', label: 'Go through the right door', setsFlags: { choseRightDoor: true } },
      ],
    },
    {
      narration: `The path splits again. "${bible.catchphrases[2]}" Which path calls to you?`,
      choices: [
        { id: 'path_high', label: 'Climb the high path', setsFlags: { choseHighPath: true } },
        { id: 'path_low', label: 'Take the lower path', setsFlags: { choseLowPath: true } },
      ],
    },
  ];

  const set = choiceSets[index % choiceSets.length];
  const choices = set.choices.slice(0, 2 + (baseSeed % 2)); // 2 or 3 choices

  return {
    index: index + 1,
    id,
    kind: 'FUN',
    settingTitle: seededPick(baseSeed + 1, bible.settingPalette) as string,
    narration: set.narration,
    choices,
    visualCue: { propKey: seededPick(baseSeed, bible.recurringProps) },
    next: { defaultNextIndex: index + 2 },
  };
}

function buildEduScene(
  guideId: GuideId,
  seed: number,
  index: number,
  id: string,
  bible: GuideStyleBible,
  conceptTag: ConceptTag
): StoryRunScene {
  const baseSeed = seed + index * 31;
  const prop = seededPick(baseSeed, bible.recurringProps);
  const npc = seededPick(baseSeed, bible.npcCast);

  const eduTemplates: Record<ConceptTag, { setup: string; question: string; options: [string, string, string]; correctIndex: number; correctFb: string; incorrectFb: string }> = {
    tell_trusted_adult: {
      setup: `${npc} asks: "If you don't feel right, what should you do first?"`,
      question: `You look at the ${prop}. ${npc} waits for your answer.`,
      options: ['Hide until it passes', 'Tell a trusted adult', 'Ignore it'],
      correctIndex: 1,
      correctFb: 'Right! Telling a trusted adult keeps you safe.',
      incorrectFb: 'Remember: tell a trusted adult so they can help.',
    },
    routines_are_power: {
      setup: `On the ${prop} it says: "Why is doing things at the same time each day helpful?"`,
      question: `Your guide points at the ${prop}. What do you think?`,
      options: ['It is boring', 'It helps your body and brain stay strong', 'Only for adults'],
      correctIndex: 1,
      correctFb: 'Yes! Routines help your body and brain. Your caregiver and doctor help with the plan.',
      incorrectFb: 'Routines help you stay strong. Ask your caregiver about your routine!',
    },
    action_plan_is_map: {
      setup: `Your guide shows you a plan. "What is a Seizure Action Plan?"`,
      question: `The ${prop} glows. You think about what you know.`,
      options: ['A game', 'A safety map that tells people how to help you', 'A secret'],
      correctIndex: 1,
      correctFb: 'Correct! It is your safety map. Follow it and ask a trusted adult for help.',
      incorrectFb: 'It is a note from your doctor and family that tells people how to help. Ask your caregiver where it is!',
    },
    triggers_are_different: {
      setup: `${npc} says: "Who knows what might be a trigger for YOU?"`,
      question: `The ${prop} holds the answer. Who knows you best?`,
      options: ['Only you', 'Your doctor and caregiver', 'Nobody'],
      correctIndex: 1,
      correctFb: 'Right! Your doctor and caregiver know you best. Always ask them.',
      incorrectFb: 'Your doctor and caregiver know what might affect you. Ask them!',
    },
    feelings_are_normal: {
      setup: 'Your guide asks: "If you feel upset after a seizure, what can help?"',
      question: `You remember the ${prop}. What would help?`,
      options: ['Keep it secret', 'Tell a trusted adult or take a calm breath', 'Stay alone'],
      correctIndex: 1,
      correctFb: 'Yes! Talking to someone or breathing calmly can help. You are not alone.',
      incorrectFb: 'Telling a trusted adult or taking slow breaths can help. You are brave!',
    },
  };

  const t = eduTemplates[conceptTag];
  const edu: EduBlock = {
    conceptTag,
    questionInStory: t.setup,
    options: t.options,
    correctIndex: t.correctIndex,
    feedbackCorrect: t.correctFb,
    feedbackIncorrect: t.incorrectFb,
  };

  return {
    index: index + 1,
    id,
    kind: 'EDU',
    settingTitle: seededPick(baseSeed + 1, bible.settingPalette) as string,
    narration: t.question,
    edu,
    visualCue: { propKey: prop as string, moodKey: 'focused' },
    next: { defaultNextIndex: index + 2 },
  };
}
