# PandaPal Lessons Feature

Interactive, gamified lessons for children (ages 7–12) with epilepsy. Education and adherence support only — **no diagnosis or treatment advice**.

## Structure

```
features/lessons/
├── types.ts              # Data model (Lesson, Step, Progress, etc.)
├── constants.ts          # Theme and styling
├── data/
│   └── lessons.ts        # 8 starter lessons (JSON seed)
├── storage/
│   ├── lessonProgress.ts # Progress API (AsyncStorage)
│   └── profileStore.ts   # XP, coins, inventory
├── utils/
│   └── scoring.ts        # Mastery, recommended next lesson
├── context/
│   └── LessonsContext.tsx
├── components/
│   ├── LessonCard.tsx
│   ├── LessonsHome.tsx
│   ├── LessonPlayer.tsx
│   ├── RewardsModal.tsx
│   ├── CaregiverLessonsView.tsx
│   └── steps/
│       ├── StoryStep.tsx
│       ├── TapToRevealStep.tsx
│       ├── DragSortStep.tsx
│       ├── QuizStep.tsx
│       ├── SimulationStep.tsx
│       ├── MatchStep.tsx
│       └── BreathingBreakStep.tsx
└── __tests__/
    └── scoring.test.ts
```

## How to Add New Lessons

1. Open `data/lessons.ts` and add a new object to the `LESSONS` array:

```ts
{
  id: 'my-new-lesson',
  title: 'My New Lesson',
  description: 'Short description',
  ageBand: '7-9' | '9-12' | 'all',
  estimatedMinutes: 2,
  tags: ['safety', 'brain'],
  category: 'Safety' | 'My Brain' | 'Routines' | 'Triggers' | 'Feelings',
  difficulty: 'easy' | 'medium' | 'hard',
  reward: { xp: 25, coins: 15, items: ['sticker_xyz'] },
  steps: [
    // See step types below
  ],
}
```

2. Add steps from the supported types.

## Step Types

| Type | Payload | Behavior |
|------|---------|----------|
| `STORY` | `{ narrative, illustrationPlaceholder? }` | Short text + optional emoji illustration. User taps Next. |
| `TAP_TO_REVEAL` | `{ cards: [{ id, hiddenText, revealedText }] }` | Tap cards to reveal facts. Completes when all revealed. |
| `DRAG_SORT` | `{ prompt, leftLabel, rightLabel, items: [{ id, text, correctSide }] }` | Sort items into left/right categories. |
| `QUIZ` | `{ question, options: [{ id, text, correct }], correctFeedback, incorrectFeedback }` | Single multiple-choice. |
| `SIMULATION` | `{ scenario, prompt, options: [{ id, text, correct, feedback }] }` | "What would you do?" — only safe responses. |
| `MATCH` | `{ pairs: [{ term, definition }] }` | Match terms to definitions (options auto-generated). |
| `BREATHING_BREAK` | `{ durationSeconds, instruction? }` | Calming timer. Auto-advances when done. |

## Scoring

- **Mastery score (0–100):** % of scored steps answered correctly.
- Non-scored steps (STORY, BREATHING_BREAK): count as correct if completed.
- QUIZ / SIMULATION: `correct: true/false`.
- DRAG_SORT / MATCH: `correctCount/total` — full score when all correct.

## Storage API

```ts
import * as lessonProgress from '@/features/lessons/storage/lessonProgress';

// Get progress for a lesson
const p = await lessonProgress.getLessonProgress('what-is-epilepsy');

// Save progress (partial)
await lessonProgress.saveLessonProgress(lessonId, { ... });

// Mark complete (grants XP, coins, items)
await lessonProgress.markLessonComplete(lessonId, {
  masteryScore: 85,
  xp: 20,
  coins: 10,
  items: ['sticker_brain'],
});
```

## Safety

- Content is general education only. No dosing, no treatment changes, no individualized advice.
- Always: tell a trusted adult, follow your seizure action plan, call emergency services if your plan says so.

## Navigation

- **Lessons Home:** Learn tab → `app/(tabs)/learn.tsx`
- **Lesson Player:** `/lesson/[id]` → `app/lesson/[id].tsx`
- **Caregiver view:** Caregiver tab → `app/(tabs)/caregiver.tsx`
