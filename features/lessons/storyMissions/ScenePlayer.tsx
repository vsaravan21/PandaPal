/**
 * Scene-driven Story Player - generated stories, pacing, adaptation, cache
 */

import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { StoryMissionBanner } from './StoryMissionBanner';
import { getSceneGenerator } from './sceneGenerator';
import { createInitialPacing, advancePacingAfterLearning, advancePacingAfterStory } from './pacingEngine';
import { selectTargetConcept, applyMasteryUpdate } from './adaptation';
import { shouldShowLearningCheck } from './pacingEngine';
import { sceneToCompact } from './sceneRunState';
import {
  getSceneCacheKey,
  getCachedScene,
  setCachedScene,
  getLastRunCache,
  setLastRunCache,
} from './sceneCache';
import {
  getSceneRunState,
  saveSceneRunState,
  clearSceneRunState,
  saveConceptMastery,
  recordRunComplete,
} from './storage';
import { validateScene } from './sceneSchema';
import { SAFETY_BANNER_COPY, ALLOWED_CONCEPT_TAGS, FORBIDDEN_TOPICS } from './sceneSchema';
import type { Scene, SceneChoice, GenerationInput } from './sceneSchema';
import type { SceneRunState } from './sceneRunState';
import type { GuideId } from './models';
import { NarrativeSceneView } from './scenes/NarrativeSceneView';
import { FunChoiceSceneView } from './scenes/FunChoiceSceneView';
import { LearningCheckSceneView } from './scenes/LearningCheckSceneView';
import { RecapSceneView } from './scenes/RecapSceneView';
import { BreathingBreakSceneView } from './scenes/BreathingBreakSceneView';
import { LessonsTheme } from '../constants';
import { isMockMode } from './config';
import * as profileStore from '@/features/profile/storage/profileStore';

const LEARNING_CHECKS_BEFORE_RECAP = 3;
const MIN_SCENES_BEFORE_RECAP = 6;

interface Props {
  guideId: GuideId;
  missionId: string;
  replayMode?: boolean;
}

export function ScenePlayer({ guideId, missionId, replayMode = false }: Props) {
  const [state, setState] = useState<SceneRunState | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const ensureState = useCallback(async () => {
    if (replayMode) {
      const last = await getLastRunCache();
      if (!last || last.guideId !== guideId || !last.sceneKeys.length) {
        setState(createFreshState());
        setLoading(false);
        return;
      }
      const runSeed = last.runSeed;
      const initial = createFreshState();
      initial.runSeed = runSeed;
      initial.replayMode = true;
      initial.cachedSceneKeys = last.sceneKeys;
      initial.scenes = [];
      setState(initial);
      setLoading(false);
      return;
    }
    const saved = await getSceneRunState(missionId);
    if (saved && saved.guideId === guideId && saved.scenes.length > 0) {
      setState(saved);
      setLoading(false);
      return;
    }
    const fresh = createFreshState();
    setState(fresh);
    setLoading(false);
  }, [guideId, missionId, replayMode]);

  function createFreshState(): SceneRunState {
    const runSeed = Date.now();
    return {
      guideId,
      missionId,
      runSeed,
      sceneIndex: 0,
      pacingState: createInitialPacing(runSeed),
      flags: {},
      conceptMastery: { ...(Object.fromEntries(ALLOWED_CONCEPT_TAGS.map((t) => [t, 50])) as Record<string, number>) },
      lastLearningConcept: undefined,
      scenes: [],
      replayMode: false,
      cachedSceneKeys: [],
    };
  }

  useEffect(() => {
    let cancelled = false;
    ensureState().then(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [ensureState]);

  const persist = useCallback(async (next: SceneRunState) => {
    setState(next);
    await saveSceneRunState(next);
    await saveConceptMastery(next.conceptMastery);
  }, []);

  const loadNextScene = useCallback(async () => {
    const s = state;
    if (!s) return;
    if (s.sceneIndex < s.scenes.length) return; // already have current scene
    setGenerating(true);
    const sceneIndex = s.sceneIndex;
    const learningChecksCount = s.scenes.filter((sc) => sc.type === 'LEARNING_CHECK').length;
    const requestRecap =
      learningChecksCount >= LEARNING_CHECKS_BEFORE_RECAP && sceneIndex >= MIN_SCENES_BEFORE_RECAP;
    const shouldLearning = shouldShowLearningCheck(s.pacingState) && !requestRecap;
    const targetConceptTag = requestRecap ? undefined : selectTargetConcept(s.conceptMastery, s.lastLearningConcept);

    const flagsSubset = JSON.stringify(s.flags);
    const cacheKey = getSceneCacheKey({
      guideId: s.guideId,
      runSeed: s.runSeed,
      sceneIndex,
      flagsSubset,
      targetConceptTag: shouldLearning ? targetConceptTag : undefined,
      pacingState: s.pacingState,
    });

    let scene: Scene | null = null;
    if (s.replayMode && s.cachedSceneKeys[sceneIndex]) {
      const cached = await getCachedScene(s.cachedSceneKeys[sceneIndex]);
      if (cached && validateScene(cached)) scene = cached as Scene;
    }
    if (!scene) {
      scene = (await getCachedScene(cacheKey)) as Scene | null;
      if (!scene || !validateScene(scene)) {
        const input: GenerationInput = {
          guideId: s.guideId,
          childAgeBand: 'all',
          runSeed: s.runSeed,
          sceneIndex,
          currentPlotSummary: s.scenes.length ? `After ${s.scenes.length} scenes.` : 'Just started.',
          lastScenes: s.scenes.slice(-6).map(sceneToCompact),
          flags: s.flags,
          conceptMastery: s.conceptMastery,
          pacingState: s.pacingState,
          safetyCopy: SAFETY_BANNER_COPY,
          allowedConceptTags: ALLOWED_CONCEPT_TAGS,
          forbiddenTopics: FORBIDDEN_TOPICS,
          targetConceptTag: shouldLearning ? targetConceptTag : undefined,
          requestRecap,
        };
        scene = await getSceneGenerator().generateNextScene(input);
        await setCachedScene(cacheKey, scene);
      }
    }

    const nextScenes = [...s.scenes, scene];
    const nextKeys = s.replayMode ? s.cachedSceneKeys : [...s.cachedSceneKeys, cacheKey];
    let nextPacing = s.pacingState;
    if (scene.type === 'LEARNING_CHECK') {
      nextPacing = advancePacingAfterLearning(s.pacingState, s.runSeed, sceneIndex);
    } else if (scene.type !== 'RECAP') {
      nextPacing = advancePacingAfterStory(s.pacingState);
    }

    const next: SceneRunState = {
      ...s,
      scenes: nextScenes,
      cachedSceneKeys: nextKeys,
      pacingState: nextPacing,
    };
    setState(next);
    await saveSceneRunState(next);
    setGenerating(false);
  }, [state]);

  useEffect(() => {
    if (!state || loading) return;
    if (state.sceneIndex >= state.scenes.length) {
      loadNextScene();
    }
  }, [state?.sceneIndex, state?.scenes?.length, loading, loadNextScene]);

  const advanceToNext = useCallback(() => {
    if (!state) return;
    const next: SceneRunState = { ...state, sceneIndex: state.sceneIndex + 1 };
    persist(next);
  }, [state, persist]);

  const handleFunChoice = useCallback(
    (choice: SceneChoice) => {
      if (!state) return;
      const flags = { ...state.flags, ...(choice.setsFlags ?? {}) };
      const next: SceneRunState = {
        ...state,
        flags,
        sceneIndex: state.sceneIndex + 1,
        pacingState: advancePacingAfterStory(state.pacingState),
      };
      persist(next);
    },
    [state, persist]
  );

  const handleLearningAnswer = useCallback(
    (correct: boolean) => {
      if (!state) return;
      const scene = state.scenes[state.sceneIndex];
      const tag = scene?.learningCheck?.conceptTag;
      const nextMastery = tag ? applyMasteryUpdate(state.conceptMastery, tag, correct) : state.conceptMastery;
      const nextPacing = advancePacingAfterLearning(state.pacingState, state.runSeed, state.sceneIndex);
      const next: SceneRunState = {
        ...state,
        conceptMastery: nextMastery,
        lastLearningConcept: tag,
        pacingState: nextPacing,
        sceneIndex: state.sceneIndex + 1,
      };
      persist(next);
    },
    [state, persist]
  );

  const handleRecapClose = useCallback(async () => {
    if (!state) return;
    const scene = state.scenes[state.sceneIndex];
    const rewards = scene?.type === 'RECAP' ? scene.rewards : undefined;
    if (rewards) {
      await profileStore.addLessonReward({
        xp: rewards.xp,
        coins: rewards.coins,
        items: rewards.relics,
      });
      await recordRunComplete(missionId, rewards.endingId, Object.keys(state.flags));
    }
    if (!state.replayMode) {
      await setLastRunCache({
        missionId,
        guideId,
        runSeed: state.runSeed,
        sceneKeys: state.cachedSceneKeys,
      });
    }
    await clearSceneRunState(missionId);
    router.back();
  }, [state, missionId, guideId]);

  if (loading || !state) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={LessonsTheme.primary} />
      </View>
    );
  }

  const currentScene = state.scenes[state.sceneIndex];
  if (generating && !currentScene) {
    return (
      <View style={styles.container}>
        <StoryMissionBanner />
        {isMockMode() && (
          <View style={styles.mockBadge}>
            <Text style={styles.mockBadgeText}>Mock Story Mode</Text>
          </View>
        )}
        <View style={styles.center}>
          <ActivityIndicator size="large" color={LessonsTheme.primary} />
          <Text style={styles.loadingText}>Preparing your story...</Text>
        </View>
      </View>
    );
  }

  if (!currentScene) return null;

  const chapterNum = Math.floor(state.sceneIndex / 4) + 1;
  const renderScene = () => {
    switch (currentScene.type) {
      case 'NARRATIVE':
        return <NarrativeSceneView scene={currentScene} onNext={advanceToNext} />;
      case 'FUN_CHOICE':
        return <FunChoiceSceneView scene={currentScene} onChoice={handleFunChoice} />;
      case 'LEARNING_CHECK':
        return <LearningCheckSceneView scene={currentScene} onAnswer={handleLearningAnswer} />;
      case 'RECAP':
        return <RecapSceneView scene={currentScene} onClose={handleRecapClose} />;
      case 'BREATHING_BREAK':
        return <BreathingBreakSceneView scene={currentScene} onComplete={advanceToNext} />;
      default:
        return <Text style={styles.unknown}>Unknown scene type</Text>;
    }
  };

  return (
    <View style={styles.container}>
      <StoryMissionBanner />
      {isMockMode() && (
        <View style={styles.mockBadge}>
          <Text style={styles.mockBadgeText}>Mock Story Mode</Text>
        </View>
      )}
      <View style={styles.progress}>
        <Text style={styles.chapter}>Chapter {chapterNum}</Text>
        <View style={styles.dots}>
          {[0, 1, 2, 3].map((i) => (
            <View
              key={i}
              style={[
                styles.dot,
                state.sceneIndex % 4 === i && styles.dotActive,
              ]}
            />
          ))}
        </View>
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {renderScene()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: LessonsTheme.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 80 },
  progress: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: LessonsTheme.cardBg,
    borderBottomWidth: 1,
    borderBottomColor: LessonsTheme.border,
  },
  chapter: { fontSize: 14, fontWeight: '600', color: LessonsTheme.textMuted },
  dots: { flexDirection: 'row', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: LessonsTheme.border },
  dotActive: { backgroundColor: LessonsTheme.primary },
  loadingText: { marginTop: 12, fontSize: 16, color: LessonsTheme.textMuted },
  unknown: { padding: 24, fontSize: 16, color: LessonsTheme.textMuted },
  mockBadge: {
    alignSelf: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: LessonsTheme.funYellow,
    borderRadius: 8,
    marginTop: 4,
  },
  mockBadgeText: { fontSize: 12, fontWeight: '600', color: '#333' },
});
