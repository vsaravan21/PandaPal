/**
 * Seed Story Mission - "Safety Quest" MVP
 * Topics: tell trusted adult, routines, triggers, action plan, feelings.
 * No med dosing or medical instructions.
 */

import type { StoryMission } from './models';

export const GUIDES = [
  { id: 'astronaut' as const, name: 'Astronaut Explorer Panda', theme: 'space', tagline: 'Explore and discover!', artPlaceholder: '🚀', voice: 'curious' as const },
  { id: 'detective' as const, name: 'Detective Panda', theme: 'mystery', tagline: 'Find the clues!', artPlaceholder: '🔍', voice: 'clever' as const },
  { id: 'diver' as const, name: 'Deep Sea Diver Panda', theme: 'ocean', tagline: 'Stay calm and dive in.', artPlaceholder: '🐠', voice: 'calm' as const },
  { id: 'treasure' as const, name: 'Treasure Hunter Panda', theme: 'adventure', tagline: 'Adventure awaits!', artPlaceholder: '🗺️', voice: 'adventurous' as const },
];

export const STORY_MISSION_SAFETY_QUEST: StoryMission = {
  id: 'safety-quest',
  title: 'Safety Quest',
  guideId: 'astronaut',
  synopsis: 'Learn about staying safe and who can help—with your guide by your side!',
  tags: ['safety', 'routines', 'action-plan', 'feelings'],
  estimatedMinutes: 8,
  startNodeId: 'start',
  nodes: [
    { id: 'start', type: 'NARRATIVE', text: 'Your guide has a mission for you: learn how to stay safe and who can help. Ready? Let\'s go! Remember: follow your seizure action plan and ask a trusted adult when you need help.', illustrationPlaceholder: 'mission_start', nextNodeId: 'choice_tell_adult' },
    { id: 'n1_who_helps', type: 'NARRATIVE', text: 'When something doesn\'t feel right, the first thing to do is tell a trusted adult. That could be a parent, a teacher, or the school nurse. They can help you follow your plan.', nextNodeId: 'choice_tell_adult' },
    { id: 'choice_tell_adult', type: 'CHOICE', text: 'You feel a little funny. What do you do?', options: [
      { id: 'tell', text: 'Tell a trusted adult', nextNodeId: 'n2_routine', setFlags: { toldAdult: true } },
      { id: 'plan', text: 'Check my plan with my caregiver', nextNodeId: 'n2_routine', setFlags: { toldAdult: true, checkedPlan: true } },
      { id: 'breathe', text: 'Take a calm breathing break, then tell an adult', nextNodeId: 'n2_routine', setFlags: { toldAdult: true, breathingBreak: true } },
    ], feedback: 'Nice choice! Let\'s see what happens…' },
    { id: 'n2_routine', type: 'NARRATIVE', text: 'Good thinking! Doing things at the same time each day—like medicine time and sleep—helps your body and brain stay strong. Your caregiver and doctor help you with the plan.', nextNodeId: 'quiz_routines' },
    { id: 'quiz_routines', type: 'MINI_QUIZ', question: 'Why do routines (like same time each day) help?', options: ['They are boring', 'They help your body and brain stay strong', 'Only adults need them'], correctIndex: 1, explanation: 'Routines help your body and brain know what to expect. Your caregiver and doctor decide your plan!', concepts: ['routines'], nextNodeId: 'n3_triggers', remediationNodeId: 'remediation-routines' },
    { id: 'remediation-routines', type: 'NARRATIVE', text: 'No worries! Here\'s a clue: doing things at the same time each day is like giving your brain a steady map. Your caregiver can help you remember your routine.', illustrationPlaceholder: 'clue', nextNodeId: 'n3_triggers' },
    { id: 'n3_triggers', type: 'NARRATIVE', text: 'Triggers are things that might make a seizure more likely. Sleep, stress, or flashing lights can be triggers for some people—but everyone is different! Your doctor and caregiver know what might affect you.', nextNodeId: 'quiz_triggers' },
    { id: 'quiz_triggers', type: 'MINI_QUIZ', question: 'Who knows what might be a trigger for YOU?', options: ['Only you', 'Your doctor and caregiver', 'Nobody'], correctIndex: 1, explanation: 'Your doctor and caregiver know you best. Always ask them—never guess about your own care.', concepts: ['triggers'], nextNodeId: 'n4_plan', remediationNodeId: 'remediation-triggers' },
    { id: 'remediation-triggers', type: 'NARRATIVE', text: 'Think of it like this: everyone\'s body is different. Your doctor and caregiver help you learn what to watch for. Ask them: "What might be a trigger for me?"', nextNodeId: 'n4_plan' },
    { id: 'n4_plan', type: 'NARRATIVE', text: 'Your Seizure Action Plan is like a safety map. It tells people what to do if you have a seizure. It lives somewhere safe—at home, at school with the nurse, or with your caregiver. Ask: "Where is my plan?"', nextNodeId: 'quiz_plan' },
    { id: 'quiz_plan', type: 'MINI_QUIZ', question: 'What is a Seizure Action Plan?', options: ['A game', 'A safety map that tells people how to help you', 'A secret'], correctIndex: 1, explanation: 'It\'s your safety map! Follow your plan and ask a trusted adult for help.', concepts: ['actionPlan'], nextNodeId: 'n5_feelings', remediationNodeId: 'remediation-plan' },
    { id: 'remediation-plan', type: 'NARRATIVE', text: 'Your plan is a note your doctor and family made. It says what to do if you have a seizure. Ask your caregiver to show you where it lives!', nextNodeId: 'n5_feelings' },
    { id: 'n5_feelings', type: 'NARRATIVE', text: 'After a seizure, you might feel tired, confused, or even sad. That\'s normal! Lots of kids feel that way. Talking to a trusted adult or a friend can help. You\'re not alone.', nextNodeId: 'choice_feelings' },
    { id: 'choice_feelings', type: 'CHOICE', text: 'If you feel upset after a seizure, what can you do?', options: [
      { id: 'tell2', text: 'Tell a trusted adult', nextNodeId: 'recap_a', setFlags: {} },
      { id: 'breathe2', text: 'Take a calm breathing break', nextNodeId: 'recap_a', setFlags: {} },
      { id: 'both', text: 'Both: breathe, then tell an adult', nextNodeId: 'recap_a', setFlags: {} },
    ], feedback: 'Great! All of these are safe choices.' },
    { id: 'recap_a', type: 'RECAP', summary: 'You learned: tell a trusted adult, routines help, triggers are different for everyone, your action plan is your safety map, and feelings are normal. Follow your plan and ask your caregiver or doctor when you need help!', rewards: { xp: 40, coins: 25, relics: ['story_relic_compass'], endingId: 'ending_hero' } },
    { id: 'recap_b', type: 'RECAP', summary: 'Awesome work! You know to tell a trusted adult, follow your routine, and use your action plan. Keep learning with your caregiver and doctor!', rewards: { xp: 35, coins: 20, relics: ['story_relic_star'], endingId: 'ending_guide' } },
    { id: 'bonus-branch', type: 'NARRATIVE', text: 'You\'ve mastered the safety basics! Here\'s a bonus: you can be a helper by reminding friends to tell a trusted adult when they don\'t feel right. You\'re a safety star!', illustrationPlaceholder: 'bonus' },
    { id: 'breath_break', type: 'BREATHING_BREAK', durationSeconds: 15, instruction: 'Take 3 gentle breaths with your guide.', nextNodeId: 'n1_who_helps' },
  ],
};

export const STORY_MISSIONS: StoryMission[] = [STORY_MISSION_SAFETY_QUEST];
