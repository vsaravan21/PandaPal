/**
 * Full 20-scene Story Run Player - branching, endings, dev controls
 */

import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { StoryMissionBanner } from './StoryMissionBanner';
import { generateRun } from './runGenerator';
import { getCachedRun, setCachedRun } from './sceneCache';
import { validateStoryRun } from './storyRunSchema';
import { resolveNextIndex, resolveEnding } from './runEngine';
import { applyMasteryUpdate } from './runAdaptation';
import { getStoryRunPlayerState, saveStoryRunPlayerState, clearStoryRunPlayerState, saveConceptMastery, recordRunComplete } from './storage';
import type { StoryRun, StoryRunScene, Choice, Ending } from './storyRunSchema';
import type { GuideId } from './models';
import { StorySceneView } from './runScenes/StorySceneView';
import { FunSceneView } from './runScenes/FunSceneView';
import { EduSceneView } from './runScenes/EduSceneView';
import { EndingView } from './runScenes/EndingView';
import { LessonsTheme } from '../constants';
import { isMockMode } from './config';
import * as profileStore from '@/features/profile/storage/profileStore';
import { ALLOWED_CONCEPT_TAGS } from './storyRunSchema';

export interface StoryRunPlayerState {
  run: StoryRun;
  currentSceneIndex: number;
  flags: Record<string, boolean>;
  conceptMastery: Record<string, number>;
}

interface Props {
  guideId: GuideId;
  missionId: string;
  initialSeed?: number;
}

export function StoryRunPlayer({ guideId, missionId, initialSeed }: Props) {
  const [state, setState] = useState<StoryRunPlayerState | null>(null);
  const [ending, setEnding] = useState<Ending | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const seedRef = React.useRef(initialSeed ?? Date.now());

  const loadRun = useCallback(
    async (newSeed?: number) => {
      const seed = newSeed ?? seedRef.current;
      seedRef.current = seed;

      const saved = await getStoryRunPlayerState(missionId);
      if (saved && saved.run && validateStoryRun(saved.run)) {
        const run = saved.run as StoryRun;
        setState({
          run,
          currentSceneIndex: saved.currentSceneIndex,
          flags: saved.flags ?? {},
          conceptMastery: saved.conceptMastery ?? (Object.fromEntries(ALLOWED_CONCEPT_TAGS.map((t) => [t, 50])) as Record<string, number>),
        });
        setLoading(false);
        return;
      }

      const cached = await getCachedRun(guideId, seed);
      if (cached && validateStoryRun(cached)) {
        const run = cached as StoryRun;
        setState({
          run,
          currentSceneIndex: 1,
          flags: {},
          conceptMastery: Object.fromEntries(ALLOWED_CONCEPT_TAGS.map((t) => [t, 50])) as Record<string, number>,
        });
        setLoading(false);
        return;
      }

      const run = await generateRun({ guideId, seed });
      await setCachedRun(guideId, seed, run);
      setState({
        run,
        currentSceneIndex: 1,
        flags: {},
        conceptMastery: Object.fromEntries(ALLOWED_CONCEPT_TAGS.map((t) => [t, 50])) as Record<string, number>,
      });
      setLoading(false);
    },
    [guideId, missionId]
  );

  useEffect(() => {
    let cancelled = false;
    loadRun().then(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [loadRun]);

  const persist = useCallback(
    async (next: StoryRunPlayerState) => {
      setState(next);
      await saveStoryRunPlayerState(missionId, {
        run: next.run,
        currentSceneIndex: next.currentSceneIndex,
        flags: next.flags,
        conceptMastery: next.conceptMastery,
      });
      await saveConceptMastery(next.conceptMastery);
    },
    [missionId]
  );

  const advance = useCallback(
    (nextIndex: number) => {
      if (!state) return;
      if (nextIndex <= 0) {
        const end = resolveEnding(state.run, state.flags);
        setEnding(end);
        return;
      }
      persist({ ...state, currentSceneIndex: nextIndex });
    },
    [state, persist]
  );

  const handleStoryNext = useCallback(() => {
    if (!state) return;
    const next = resolveNextIndex(state.run, state.currentSceneIndex, state.flags);
    advance(next);
  }, [state, advance]);

  const handleFunChoice = useCallback(
    (choice: Choice) => {
      if (!state) return;
      const flags = { ...state.flags, ...(choice.setsFlags ?? {}) };
      const next = resolveNextIndex(state.run, state.currentSceneIndex, flags);
      if (next <= 0) {
        setEnding(resolveEnding(state.run, flags));
      } else {
        persist({ ...state, flags, currentSceneIndex: next });
      }
    },
    [state, persist]
  );

  const handleEduAnswer = useCallback(
    (correct: boolean) => {
      if (!state) return;
      const scene = state.run.scenes.find((s) => s.index === state.currentSceneIndex);
      const tag = scene?.edu?.conceptTag;
      const mastery = tag ? applyMasteryUpdate(state.conceptMastery, tag, correct) : state.conceptMastery;
      const next = resolveNextIndex(state.run, state.currentSceneIndex, state.flags);
      if (next <= 0) {
        setEnding(resolveEnding(state.run, state.flags));
      } else {
        persist({ ...state, conceptMastery: mastery, currentSceneIndex: next });
      }
    },
    [state, persist]
  );

  const handleEndingClose = useCallback(async () => {
    if (!ending || !state) return;
    await profileStore.addLessonReward({
      xp: ending.rewards.xp,
      coins: ending.rewards.coins,
      items: ending.rewards.items,
    });
    await recordRunComplete(missionId, ending.endingId, Object.keys(state.flags));
    await clearStoryRunPlayerState(missionId);
    router.back();
  }, [ending, state, missionId]);

  const handleRegenerateSame = useCallback(() => {
    setLoading(true);
    setEnding(null);
    loadRun(seedRef.current);
  }, [loadRun]);

  const handleRegenerateNew = useCallback(() => {
    setLoading(true);
    setEnding(null);
    loadRun(Date.now());
  }, [loadRun]);

  if (loading || !state) {
    return (
      <View style={styles.center}>
        <StoryMissionBanner />
        <ActivityIndicator size="large" color={LessonsTheme.primary} />
        <Text style={styles.loadingText}>Preparing your adventure...</Text>
      </View>
    );
  }

  if (ending) {
    return (
      <View style={styles.container}>
        <StoryMissionBanner />
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          <EndingView ending={ending} onClose={handleEndingClose} />
        </ScrollView>
      </View>
    );
  }

  const scene = state.run.scenes.find((s) => s.index === state.currentSceneIndex) as StoryRunScene | undefined;
  if (!scene) {
    setEnding(resolveEnding(state.run, state.flags));
    return null;
  }

  const chapterNum = Math.ceil(state.currentSceneIndex / 5);
  const progress = state.currentSceneIndex / 20;

  const renderScene = () => {
    switch (scene.kind) {
      case 'STORY':
        return <StorySceneView scene={scene} onNext={handleStoryNext} />;
      case 'FUN':
        return <FunSceneView scene={scene} onChoice={handleFunChoice} />;
      case 'EDU':
        return <EduSceneView scene={scene} onAnswer={handleEduAnswer} />;
      default:
        return <Text style={styles.unknown}>Unknown scene</Text>;
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
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {renderScene()}
      </ScrollView>
      {__DEV__ && (
        <View style={styles.devTools}>
          <Pressable style={styles.devBtn} onPress={handleRegenerateSame}>
            <Text style={styles.devBtnText}>Regenerate (same seed)</Text>
          </Pressable>
          <Pressable style={styles.devBtn} onPress={handleRegenerateNew}>
            <Text style={styles.devBtnText}>Regenerate (new seed)</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: LessonsTheme.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 100 },
  progress: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: LessonsTheme.cardBg,
    borderBottomWidth: 1,
    borderBottomColor: LessonsTheme.border,
  },
  chapter: { fontSize: 14, fontWeight: '600', color: LessonsTheme.textMuted, marginBottom: 4 },
  progressBar: { height: 6, backgroundColor: LessonsTheme.border, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: LessonsTheme.primary },
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
  devTools: { flexDirection: 'row', justifyContent: 'center', gap: 12, padding: 8 },
  devBtn: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: LessonsTheme.funCoral, borderRadius: 8 },
  devBtnText: { fontSize: 12, color: '#333' },
});
