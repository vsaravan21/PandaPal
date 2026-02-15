# Story Missions

Adaptive, replayable story adventures that teach epilepsy safety and routines. **Educational only—no diagnosis or treatment advice.**

Story Missions can run in two ways:

- **20-scene full run (default)** – One mission per guide; a full ~20-scene adventure is generated (mock mode locally, or Claude in production). Choices affect the story; 3 endings.
- **Legacy node-based** – Static missions defined in `seedMissions.ts` (e.g. Safety Quest), with fixed nodes and branching.

---

## Scene-generated missions (AI / mock)

### How to run in **mock mode** (default, no credits)

- Do **not** set `AI_MODE` or set `AI_MODE=mock`. Do not set `ANTHROPIC_API_KEY`.
- Run the app as usual (`npm start` / Expo). Story Mission uses **generateMockRun()**: deterministic 20-scene run, no network.
- You’ll see a **“Mock Story Mode”** badge when playing. Scenes are guide-dependent (space/detective/ocean/treasure tone) and include narrative, fun choices, and in-story learning checks.

### How to run in **live mode** (Claude API)

1. Set environment variables:
   - `AI_MODE=live`
   - `ANTHROPIC_API_KEY=<your key>`
   - Optional: `CLAUDE_MODEL=claude-3-5-sonnet-20241022` (or another model)
2. In Expo, you can use `app.config.js` / `app.json` and pass these via `extra` (e.g. `extra: { AI_MODE: process.env.AI_MODE, ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY }`), or use `EXPO_PUBLIC_AI_MODE` / `EXPO_PUBLIC_ANTHROPIC_API_KEY` for client-visible config.
3. Full run is requested from Claude; output validated with `validateStoryRun`. On invalid JSON, retry once; then fallback to mock. Run cached by guideId+seed.

### How pacing works

- A **pacing engine** (see `pacingEngine.ts`) decides when the next **learning check** happens.
- After each learning check, `nextLearningIn` is set randomly to **2, 3, or 4** (using a seeded RNG so the same run is reproducible).
- Until `scenesSinceLearning >= nextLearningIn`, only **NARRATIVE**, **FUN_CHOICE**, or **BREATHING_BREAK** scenes are generated. So you get 2–4 story scenes between learning checks—no quiz-quiz-quiz feel.

### How adaptation works

- **Mastery** is tracked per concept (`routines`, `tellingAdult`, `actionPlan`, `triggersDifferent`, `feelings`). Correct answer: +10; incorrect: −5 (clamped 0–100).
- **Next concept** for a learning check is chosen by `selectTargetConcept()` in `adaptation.ts`: prefer concepts with mastery &lt; 60; avoid the same concept as the last check unless mastery is very low (&lt; 30).
- When all mastery is ≥ 80, the system can request a **RECAP** or bonus branch instead of another learning check.

### Caching and replay

- Generated scenes are cached by a stable key (guideId, runSeed, sceneIndex, flags, targetConceptTag, pacing). Cache is stored in AsyncStorage.
- **“Replay last run”** uses only cached scenes for that run (no new API calls).

### How to add new concept tags and guide styles

- **Concept tags**  
  - In `sceneSchema.ts`, add the tag to `ALLOWED_CONCEPT_TAGS` and use it in `learningCheck.conceptTag`.  
  - In `adaptation.ts`, `selectTargetConcept` already works over `ALLOWED_CONCEPT_TAGS`.  
  - In `sceneGenerator/mock.ts`, add a template in `makeLearningCheckScene` for the new tag (question, options, correctIndex, feedback).
- **Guide styles**  
  - Guides are defined in `seedMissions.ts` (`GUIDES`) and in `missionShells.ts` (`MISSION_SHELLS`). Each shell has `openingPremise`, `sidekickNpc`, `settingProps`.  
  - To add a new guide: add its `GuideId` in `models.ts`, add an entry in `GUIDES` and `MISSION_SHELLS`, and extend `GUIDE_VOCAB` in `sceneGenerator/mock.ts` so mock scenes use the right tone and props.

---

## How to navigate

1. **Learn** tab → choose **Story Missions**.
2. **Choose Your Guide** (if first time) → pick Astronaut, Detective, Diver, or Treasure Hunter Panda.
3. Tap **Story Mission** to start the 20-scene adventure for your guide.
4. Progress is saved; you can resume. Complete all 20 scenes to reach one of 3 endings (hero, guide, or secret).

## How to author new missions

1. **Add mission** in `seedMissions.ts`: extend `STORY_MISSIONS` with a new `StoryMission` object.
2. **Mission shape**: `id`, `title`, `guideId`, `synopsis`, `tags`, `estimatedMinutes`, `nodes[]`, `startNodeId`.
3. **Node types**:
   - **NARRATIVE**: `text`, optional `illustrationPlaceholder`, optional `nextNodeId` (for “Next” flow).
   - **CHOICE**: `text`, `options[]` (each: `id`, `text`, `nextNodeId`, optional `setFlags`), optional `feedback`.
   - **MINI_QUIZ**: `question`, `options[]`, `correctIndex`, `explanation`, `concepts[]`, `nextNodeId`, optional `remediationNodeId`.
   - **RECAP**: `summary`, `rewards` (xp, coins, relics, endingId). Terminal; player shows rewards and exits.
   - **BREATHING_BREAK**: `durationSeconds`, optional `instruction`, `nextNodeId`.
   - **SKILL_CHECK**: `concept`, `threshold`, `passNodeId`, `failNodeId` (engine routes by mastery).
4. **Safe choices only**: Every “What would you do?” must only offer options like: tell a trusted adult, check plan with caregiver, take a breathing break, move to a safe spot. No medical instructions.

## How adaptive logic works

- **Mastery**: Each concept (e.g. `routines`, `triggers`, `actionPlan`) has a score 0–100. Correct quiz: +10; incorrect: −5; confidence bonus if correct twice in a row.
- **Remediation**: After a **MINI_QUIZ**, if the answer is wrong and mastery for that concept is &lt; 50, the engine sends the player to `remediationNodeId` (e.g. a short “clue” narrative) before continuing to `nextNodeId`.
- **Bonus branch**: If average concept mastery ≥ 80, the engine can offer a bonus node (e.g. `bonus-branch`); optional in the player UI.
- **Run history**: Completed runs and unlocked endings are stored; can be used for “Endings” UI or replay incentives.

## Safety guardrails

- **Banner**: “PandaPal teaches general epilepsy safety. Follow your seizure action plan and ask a trusted adult for help.” Shown on every Story Missions screen.
- **Copy**: No medication dosing, no step-by-step medical or emergency instructions. Only: follow your plan, tell a trusted adult, ask caregiver/doctor.
- **Choices**: All decision options are pre-authored and safe (no user-generated or AI-generated medical advice).

## File structure

- `models.ts` – Types (Guide, StoryMission, nodes, session, flags, mastery).
- `engine.ts` – Pure functions for legacy node-based flow.
- `storage.ts` – Persist guide, concept mastery, session, run history, scene run state (AsyncStorage).
- `sceneCache.ts` – Scene cache key, get/set cached scene, last run cache for replay.
- `sceneSchema.ts` – Scene and GenerationInput types, validateScene, ALLOWED_CONCEPT_TAGS, SAFETY_BANNER_COPY.
- `sceneRunState.ts` – SceneRunState type for generated runs.
- `pacingEngine.ts` – createInitialPacing, shouldShowLearningCheck, advancePacingAfterLearning/Story.
- `adaptation.ts` – selectTargetConcept, applyMasteryUpdate.
- `missionShells.ts` – Opening premise, sidekick NPC, setting props per guide.
- `config.ts` – getAIMode(), getAnthropicApiKey(), getClaudeModel(), isMockMode().
- `sceneGenerator/types.ts` – SceneGenerator interface.
- `sceneGenerator/mock.ts` – Deterministic mock generator (no network).
- `sceneGenerator/claude.ts` – Claude API generator, validation, fallback to mock.
- `sceneGenerator/index.ts` – getSceneGenerator() (mock vs live from config).
- `scenes/*` – NarrativeSceneView, FunChoiceSceneView, LearningCheckSceneView, RecapSceneView, BreathingBreakSceneView.
- `StoryMissionsHome.tsx` – Entry list; Story Mission card; guide select.
- `GuideSelect.tsx` – Choose one of four guide characters.
- `StoryRunPlayer.tsx` – Full 20-scene player: load/generate run, branching, endings, dev regenerate.
- `StoryPlayer.tsx` – Legacy node-based player.
- `nodes/*` – Legacy node views (NarrativeNode, ChoiceNode, MiniQuizNode, RecapNode, BreathingBreakNode).

## Two playthrough paths (walkthrough)

**Path A (all correct)**  
Start → Choice “Tell a trusted adult” → n2_routine → Quiz (correct) → n3_triggers → Quiz (correct) → n4_plan → Quiz (correct) → n5_feelings → Choice (any) → Recap (ending_hero). No remediation.

**Path B (wrong on routines)**  
Start → Choice “Check my plan with my caregiver” → n2_routine → Quiz (wrong: “They are boring”) → **remediation-routines** (“No worries! Here’s a clue…”) → n3_triggers → … rest same. Remediation inserted once; then story continues.

Different choices (e.g. “Take a calm breathing break”) only set flags; they don’t change the main path in the current seed. Multiple endings (e.g. recap_a vs recap_b) can be wired to flags or mastery in future missions.
