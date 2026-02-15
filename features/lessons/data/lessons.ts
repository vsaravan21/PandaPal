/**
 * PandaPal Starter Lessons
 * General epilepsy education - no diagnosis or treatment advice.
 * Content emphasizes: tell trusted adult, follow seizure action plan, ask doctor/caregiver.
 */

import type { Lesson } from '../types';

export const LESSONS: Lesson[] = [
  {
    id: 'what-is-epilepsy',
    title: 'What is Epilepsy?',
    description: 'A friendly intro to how your brain works.',
    ageBand: '7-9',
    estimatedMinutes: 2,
    tags: ['brain', 'basics', 'education'],
    category: 'My Brain',
    difficulty: 'easy',
    reward: { xp: 20, coins: 10, items: ['sticker_brain'] },
    steps: [
      {
        id: 's1',
        type: 'STORY',
        payload: {
          narrative:
            'Your brain is like a supercomputer! It sends tiny electrical signals to control everything you do — walking, talking, thinking. Sometimes these signals get mixed up for a moment. That’s what we call a seizure. Epilepsy means someone’s brain is more likely to have these mix-ups. It doesn’t mean anything is wrong with who you are!',
          illustrationPlaceholder: 'brain_friendly',
        },
      },
      {
        id: 's2',
        type: 'TAP_TO_REVEAL',
        payload: {
          cards: [
            { id: 'c1', hiddenText: 'Tap to reveal', revealedText: 'Your brain controls your whole body!' },
            { id: 'c2', hiddenText: 'Tap to reveal', revealedText: 'A seizure is when brain signals get mixed up for a moment.' },
            { id: 'c3', hiddenText: 'Tap to reveal', revealedText: 'Epilepsy doesn’t change how awesome you are!' },
          ],
        },
      },
      {
        id: 's3',
        type: 'BREATHING_BREAK',
        payload: { durationSeconds: 15, instruction: 'Take 3 gentle breaths with the panda.' },
      },
    ],
  },
  {
    id: 'my-seizure-action-plan',
    title: 'My Seizure Action Plan',
    description: 'Learn what it is and who to ask.',
    ageBand: 'all',
    estimatedMinutes: 2,
    tags: ['safety', 'plan', 'caregiver'],
    category: 'Safety',
    difficulty: 'easy',
    reward: { xp: 25, coins: 15, items: ['sticker_plan'] },
    steps: [
      {
        id: 's1',
        type: 'STORY',
        payload: {
          narrative:
            'A Seizure Action Plan is a special note that your doctor and family made for you. It tells people what to do if you have a seizure. It lives somewhere safe — like at home, at school with the nurse, or in your backpack. Ask your caregiver: "Where is my Seizure Action Plan?"',
          illustrationPlaceholder: 'panda_learning',
        },
      },
      {
        id: 's2',
        type: 'QUIZ',
        payload: {
          question: 'Who knows where your Seizure Action Plan lives?',
          options: [
            { id: 'a', text: 'Only you', correct: false },
            { id: 'b', text: 'Your caregiver or doctor', correct: true },
            { id: 'c', text: 'Nobody', correct: false },
          ],
          correctFeedback: 'Nice! Your caregiver and doctor help keep your plan safe.',
          incorrectFeedback: 'Ask your caregiver or doctor where your plan lives. They know!',
        },
      },
      {
        id: 's3',
        type: 'SIMULATION',
        payload: {
          scenario: "A friend asks: 'What is a Seizure Action Plan?'",
          prompt: 'What would you say?',
          options: [
            { id: 'a', text: "It's a plan that tells people how to help me.", correct: true, feedback: "Perfect! You explained it well." },
            { id: 'b', text: "I don't know.", correct: false, feedback: "That's okay! You can ask your caregiver to explain it." },
            { id: 'c', text: "It's a secret.", correct: false, feedback: "It's not a secret — it helps people keep you safe. Ask your caregiver!" },
          ],
        },
      },
    ],
  },
  {
    id: 'medicine-time-power-time',
    title: 'Medicine Time = Power Time',
    description: 'Why routines matter for your brain.',
    ageBand: 'all',
    estimatedMinutes: 2,
    tags: ['medication', 'routines', 'timing'],
    category: 'Routines',
    difficulty: 'easy',
    reward: { xp: 25, coins: 15 },
    steps: [
      {
        id: 's1',
        type: 'STORY',
        payload: {
          narrative:
            'Taking your medicine at the same times each day helps your brain stay strong. Think of it like charging a superhero battery! Your caregiver and doctor decide when and how much. Your job is to follow the plan they made for you.',
          illustrationPlaceholder: 'panda_learning',
        },
      },
      {
        id: 's2',
        type: 'DRAG_SORT',
        payload: {
          prompt: 'Which habits are helpful for medicine time?',
          leftLabel: 'Helpful',
          rightLabel: 'Not Helpful',
          items: [
            { id: '1', text: 'Same time each day', correctSide: 'left' },
            { id: '2', text: 'Skip when busy', correctSide: 'right' },
            { id: '3', text: 'Ask caregiver if you forget', correctSide: 'left' },
            { id: '4', text: 'Change the dose yourself', correctSide: 'right' },
          ],
        },
      },
    ],
  },
  {
    id: 'seizure-first-aid-basics',
    title: 'Seizure First Aid Basics',
    description: 'Stay safe, get help, follow your plan.',
    ageBand: 'all',
    estimatedMinutes: 3,
    tags: ['safety', 'first-aid', 'help'],
    category: 'Safety',
    difficulty: 'medium',
    reward: { xp: 30, coins: 20, items: ['sticker_help'] },
    steps: [
      {
        id: 's1',
        type: 'STORY',
        payload: {
          narrative:
            'When someone has a seizure, we keep them safe, stay calm, and get help. Your Seizure Action Plan says exactly what to do for YOU. Always: tell a trusted adult, follow your plan, and call emergency services only if your plan says so.',
          illustrationPlaceholder: 'panda_learning',
        },
      },
      {
        id: 's2',
        type: 'QUIZ',
        payload: {
          question: 'What should people do during a seizure?',
          options: [
            { id: 'a', text: 'Follow the Seizure Action Plan and get help', correct: true },
            { id: 'b', text: 'Put something in the mouth', correct: false },
            { id: 'c', text: 'Hold the person down', correct: false },
          ],
          correctFeedback: 'Yes! Follow the plan and get a trusted adult.',
          incorrectFeedback: "Never put anything in the mouth or hold someone down. Follow the plan!",
        },
      },
    ],
  },
  {
    id: 'triggers-detective',
    title: 'Triggers Detective',
    description: 'Everyone is different. Learn the basics.',
    ageBand: 'all',
    estimatedMinutes: 2,
    tags: ['triggers', 'sleep', 'stress'],
    category: 'Triggers',
    difficulty: 'easy',
    reward: { xp: 25, coins: 15 },
    steps: [
      {
        id: 's1',
        type: 'STORY',
        payload: {
          narrative:
            "Triggers are things that might make a seizure more likely. Common ones: not enough sleep, stress, or flashing lights. But everyone is different! Your doctor and caregiver know what might affect YOU. You're a detective — notice what helps you feel your best.",
          illustrationPlaceholder: 'brain_friendly',
        },
      },
      {
        id: 's2',
        type: 'DRAG_SORT',
        payload: {
          prompt: 'Which might be triggers for some people?',
          leftLabel: 'Possible Trigger',
          rightLabel: 'Not Usually',
          items: [
            { id: '1', text: 'Missing sleep', correctSide: 'left' },
            { id: '2', text: 'Eating vegetables', correctSide: 'right' },
            { id: '3', text: 'Flashing lights (for some)', correctSide: 'left' },
            { id: '4', text: 'Drinking water', correctSide: 'right' },
          ],
        },
      },
    ],
  },
  {
    id: 'how-to-tell-a-grown-up',
    title: 'How to Tell a Grown-Up',
    description: 'Practice what to say when you need help.',
    ageBand: '7-9',
    estimatedMinutes: 2,
    tags: ['safety', 'communication', 'help'],
    category: 'Safety',
    difficulty: 'easy',
    reward: { xp: 25, coins: 15 },
    steps: [
      {
        id: 's1',
        type: 'STORY',
        payload: {
          narrative:
            'If you feel weird, don’t feel right, or think you might have a seizure — tell a trusted adult right away! It’s brave to ask for help. You could say: "I don’t feel right. Can you help?" or "I think I need to follow my plan."',
          illustrationPlaceholder: 'panda_learning',
        },
      },
      {
        id: 's2',
        type: 'SIMULATION',
        payload: {
          scenario: "You feel a little funny. A teacher is nearby.",
          prompt: 'What would you do?',
          options: [
            { id: 'a', text: 'Tell the teacher you don\'t feel right', correct: true, feedback: 'Yes! Telling a trusted adult keeps you safe.' },
            { id: 'b', text: 'Hide and wait for it to pass', correct: false, feedback: "It's better to tell an adult right away. They can help!" },
            { id: 'c', text: 'Go outside alone', correct: false, feedback: "Stay where a grown-up can see you. Tell them how you feel!" },
          ],
        },
      },
    ],
  },
  {
    id: 'feelings-after-a-seizure',
    title: 'Feelings After a Seizure',
    description: 'It’s okay to feel lots of feelings.',
    ageBand: '9-12',
    estimatedMinutes: 2,
    tags: ['feelings', 'coping', 'emotions'],
    category: 'Feelings',
    difficulty: 'easy',
    reward: { xp: 25, coins: 15 },
    steps: [
      {
        id: 's1',
        type: 'STORY',
        payload: {
          narrative:
            "After a seizure, you might feel tired, confused, sad, or even embarrassed. All of that is normal! Lots of kids feel this way. Talking to a caregiver, a friend, or a counselor can help. You're not alone.",
          illustrationPlaceholder: 'panda_learning',
        },
      },
      {
        id: 's2',
        type: 'TAP_TO_REVEAL',
        payload: {
          cards: [
            { id: 'c1', hiddenText: 'Tap', revealedText: "It's okay to feel tired or confused after a seizure." },
            { id: 'c2', hiddenText: 'Tap', revealedText: "Talking to someone you trust can help." },
            { id: 'c3', hiddenText: 'Tap', revealedText: "You're brave for learning about your feelings." },
          ],
        },
      },
      {
        id: 's3',
        type: 'BREATHING_BREAK',
        payload: { durationSeconds: 20, instruction: 'Take 4 gentle breaths. You\'re doing great.' },
      },
    ],
  },
  {
    id: 'school-day-toolkit',
    title: 'School Day Toolkit',
    description: 'Talking to your teacher and school nurse.',
    ageBand: '9-12',
    estimatedMinutes: 2,
    tags: ['school', 'teacher', 'nurse', 'buddy'],
    category: 'Safety',
    difficulty: 'medium',
    reward: { xp: 30, coins: 20, items: ['decor_school'] },
    steps: [
      {
        id: 's1',
        type: 'STORY',
        payload: {
          narrative:
            "Your teacher and school nurse can help keep you safe! They might know about your Seizure Action Plan. Some kids have a buddy who knows what to do. Your caregiver can talk to the school to set this up. You're part of the team!",
          illustrationPlaceholder: 'panda_learning',
        },
      },
      {
        id: 's2',
        type: 'MATCH',
        payload: {
          pairs: [
            { term: 'School nurse', definition: 'Knows your plan and can help at school' },
            { term: 'Buddy system', definition: 'A friend who knows what to do' },
            { term: 'Seizure Action Plan', definition: 'Lives at school too, with the nurse' },
          ],
        },
      },
    ],
  },
  // === Health topics for all kids ===
  {
    id: 'sleep-superpower',
    title: 'Sleep is Your Superpower',
    description: 'Why sleep helps your body and brain.',
    ageBand: 'all',
    estimatedMinutes: 2,
    tags: ['sleep', 'health', 'brain'],
    category: 'Sleep',
    difficulty: 'easy',
    reward: { xp: 20, coins: 10, items: ['sticker_moon'] },
    steps: [
      {
        id: 's1',
        type: 'STORY',
        payload: {
          narrative:
            'Sleep is like a power-up for your brain and body! When you get enough sleep, you feel better, think clearer, and have more energy to play and learn. Most kids need 9–12 hours of sleep each night. Ask your caregiver what time is best for you!',
          illustrationPlaceholder: 'panda_learning',
        },
      },
      {
        id: 's2',
        type: 'TAP_TO_REVEAL',
        payload: {
          cards: [
            { id: 'c1', hiddenText: 'Tap!', revealedText: 'Sleep helps your brain grow and stay strong.' },
            { id: 'c2', hiddenText: 'Tap!', revealedText: 'A regular bedtime helps you fall asleep easier.' },
            { id: 'c3', hiddenText: 'Tap!', revealedText: 'No screens before bed = better sleep!' },
          ],
        },
      },
      {
        id: 's3',
        type: 'BREATHING_BREAK',
        payload: { durationSeconds: 12, instruction: 'Take 3 gentle breaths. Sweet dreams!' },
      },
    ],
  },
  {
    id: 'eating-rainbow',
    title: 'Eating the Rainbow',
    description: 'Fun with fruits and veggies.',
    ageBand: '7-9',
    estimatedMinutes: 2,
    tags: ['nutrition', 'food', 'health'],
    category: 'Nutrition',
    difficulty: 'easy',
    reward: { xp: 25, coins: 15 },
    steps: [
      {
        id: 's1',
        type: 'STORY',
        payload: {
          narrative:
            'Eating lots of different colored fruits and veggies gives your body superpowers! Red tomatoes, orange carrots, green broccoli, purple grapes — each color has different vitamins. Try to eat a rainbow every day!',
          illustrationPlaceholder: 'brain_friendly',
        },
      },
      {
        id: 's2',
        type: 'DRAG_SORT',
        payload: {
          prompt: 'Which foods are healthy choices?',
          leftLabel: 'Healthy',
          rightLabel: 'Sometimes Only',
          items: [
            { id: '1', text: 'Apples and carrots', correctSide: 'left' },
            { id: '2', text: 'Fruits and veggies', correctSide: 'left' },
            { id: '3', text: 'Candy for every meal', correctSide: 'right' },
            { id: '4', text: 'Water', correctSide: 'left' },
          ],
        },
      },
    ],
  },
  {
    id: 'move-your-body',
    title: 'Move Your Body, Feel Great!',
    description: 'Why exercise is fun and important.',
    ageBand: 'all',
    estimatedMinutes: 2,
    tags: ['exercise', 'activity', 'health'],
    category: 'Exercise',
    difficulty: 'easy',
    reward: { xp: 25, coins: 15 },
    steps: [
      {
        id: 's1',
        type: 'STORY',
        payload: {
          narrative:
            'Moving your body — running, jumping, dancing, playing — makes your heart happy and your muscles strong! You don’t have to be an athlete. Just playing outside, riding a bike, or dancing counts. What’s your favorite way to move?',
          illustrationPlaceholder: 'panda_learning',
        },
      },
      {
        id: 's2',
        type: 'TAP_TO_REVEAL',
        payload: {
          cards: [
            { id: 'c1', hiddenText: 'Tap!', revealedText: 'Exercise makes you feel energized!' },
            { id: 'c2', hiddenText: 'Tap!', revealedText: 'Playing outside counts as exercise.' },
            { id: 'c3', hiddenText: 'Tap!', revealedText: 'Dancing is exercise too!' },
          ],
        },
      },
    ],
  },
  {
    id: 'hand-washing-hero',
    title: 'Hand Washing Hero',
    description: 'When and how to wash your hands.',
    ageBand: '7-9',
    estimatedMinutes: 2,
    tags: ['hygiene', 'hands', 'health'],
    category: 'Hygiene',
    difficulty: 'easy',
    reward: { xp: 20, coins: 10 },
    steps: [
      {
        id: 's1',
        type: 'STORY',
        payload: {
          narrative:
            'Washing your hands is like a superpower against germs! Scrub with soap for 20 seconds — about as long as singing "Happy Birthday" twice. Wash before eating, after using the bathroom, and when you come inside from playing.',
          illustrationPlaceholder: 'panda_learning',
        },
      },
      {
        id: 's2',
        type: 'QUIZ',
        payload: {
          question: 'When should you wash your hands?',
          options: [
            { id: 'a', text: 'Before eating and after the bathroom', correct: true },
            { id: 'b', text: 'Only once a day', correct: false },
            { id: 'c', text: 'Never', correct: false },
          ],
          correctFeedback: 'Yes! Wash before eating and after the bathroom!',
          incorrectFeedback: 'Washing hands keeps germs away. Do it often!',
        },
      },
    ],
  },
  {
    id: 'brush-smile',
    title: 'Brush Your Smile!',
    description: 'Taking care of your teeth.',
    ageBand: '7-9',
    estimatedMinutes: 2,
    tags: ['dental', 'teeth', 'hygiene'],
    category: 'Dental',
    difficulty: 'easy',
    reward: { xp: 25, coins: 15 },
    steps: [
      {
        id: 's1',
        type: 'STORY',
        payload: {
          narrative:
            'Brushing your teeth twice a day keeps your smile shiny and your mouth healthy! Use a pea-sized amount of toothpaste, brush for 2 minutes, and don’t forget to floss. Your dentist and caregiver can help you learn the best way!',
          illustrationPlaceholder: 'panda_learning',
        },
      },
      {
        id: 's2',
        type: 'TAP_TO_REVEAL',
        payload: {
          cards: [
            { id: 'c1', hiddenText: 'Tap!', revealedText: 'Brush morning and night!' },
            { id: 'c2', hiddenText: 'Tap!', revealedText: '2 minutes each time.' },
            { id: 'c3', hiddenText: 'Tap!', revealedText: 'Visit the dentist regularly.' },
          ],
        },
      },
    ],
  },
  {
    id: 'making-friends',
    title: 'Making Friends',
    description: 'How to be a good friend.',
    ageBand: '7-9',
    estimatedMinutes: 2,
    tags: ['social', 'friends', 'feelings'],
    category: 'Social',
    difficulty: 'easy',
    reward: { xp: 25, coins: 15 },
    steps: [
      {
        id: 's1',
        type: 'STORY',
        payload: {
          narrative:
            'Friends make life more fun! To make friends, try saying hi, sharing, and being kind. Listen when they talk. If someone is different from you — maybe they have epilepsy or something else — they can still be a great friend!',
          illustrationPlaceholder: 'panda_learning',
        },
      },
      {
        id: 's2',
        type: 'SIMULATION',
        payload: {
          scenario: "A new kid joins your class. They look shy.",
          prompt: 'What would you do?',
          options: [
            { id: 'a', text: 'Say hi and ask their name', correct: true, feedback: 'Nice! Being friendly is a great start.' },
            { id: 'b', text: 'Ignore them', correct: false, feedback: 'Saying hi can make someone feel welcome!' },
            { id: 'c', text: 'Share something with them', correct: true, feedback: 'Sharing is a wonderful way to be a friend!' },
          ],
        },
      },
    ],
  },
  {
    id: 'feelings-friends',
    title: 'All Feelings Are Okay',
    description: 'Understanding your emotions.',
    ageBand: 'all',
    estimatedMinutes: 2,
    tags: ['feelings', 'emotions', 'coping'],
    category: 'Feelings',
    difficulty: 'easy',
    reward: { xp: 25, coins: 15 },
    steps: [
      {
        id: 's1',
        type: 'STORY',
        payload: {
          narrative:
            'Sometimes you feel happy, sometimes sad, sometimes mad or scared. All feelings are okay! Talking about them with a grown-up you trust can help. Taking deep breaths, playing, or drawing can help too. You’re doing great!',
          illustrationPlaceholder: 'panda_learning',
        },
      },
      {
        id: 's2',
        type: 'TAP_TO_REVEAL',
        payload: {
          cards: [
            { id: 'c1', hiddenText: 'Tap!', revealedText: 'It\'s okay to feel sad sometimes.' },
            { id: 'c2', hiddenText: 'Tap!', revealedText: 'Talking helps.' },
            { id: 'c3', hiddenText: 'Tap!', revealedText: 'Deep breaths can calm you down.' },
          ],
        },
      },
    ],
  },
];
