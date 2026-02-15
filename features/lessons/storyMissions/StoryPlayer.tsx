/**
 * Story Player - runs mission, renders nodes, handles state
 */

import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, Pressable, View } from 'react-native';
import type { StoryMission, StoryNode } from './models';
import {
  getNode,
  applyChoice,
  applyQuizResult,
  nextNodeAfterQuiz,
  maybeInjectRemediation,
  createInitialSession,
} from './engine';
import { getConceptMastery, saveConceptMastery, getSession, saveSession, clearSession, recordRunComplete } from './storage';
import * as profileStore from '@/features/profile/storage/profileStore';
import { useProfile } from '@/features/profile/context/ProfileContext';
import { StoryMissionBanner } from './StoryMissionBanner';
import { NarrativeNodeView } from './nodes/NarrativeNode';
import { ChoiceNodeView } from './nodes/ChoiceNode';
import { MiniQuizNodeView } from './nodes/MiniQuizNode';
import { RecapNodeView } from './nodes/RecapNode';
import { BreathingBreakNodeView } from './nodes/BreathingBreakNode';
import type { NarrativeNode, ChoiceNode, MiniQuizNode, RecapNode, BreathingBreakNode } from './models';
import type { StorySession } from './models';
import { LessonsTheme } from '../constants';

interface Props {
  mission: StoryMission;
  missionId: string;
}

export function StoryPlayer({ mission, missionId }: Props) {
  const { refresh: refreshProfile } = useProfile();
  const [session, setSession] = useState<StorySession | null>(null);
  const [calmMode, setCalmMode] = useState(false);
  const [readToMe, setReadToMe] = useState(false);
  const [lastCorrect, setLastCorrect] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [saved, savedMastery] = await Promise.all([getSession(missionId), getConceptMastery()]);
      if (cancelled) return;
      if (saved) {
        setSession(saved);
      } else {
        const initial = createInitialSession(missionId, mission.startNodeId);
        if (Object.keys(savedMastery).length > 0) {
          initial.conceptMastery = { ...savedMastery } as any;
        }
        setSession(initial);
      }
    })();
    return () => { cancelled = true; };
  }, [missionId, mission.startNodeId]);

  const persistSession = useCallback(async (next: StorySession) => {
    setSession(next);
    await saveSession(next);
    const masteryForStorage: Record<string, number> = { ...next.conceptMastery };
    await saveConceptMastery(masteryForStorage);
  }, []);

  const goToNode = useCallback((nextId: string) => {
    if (!session) return;
    const injected = maybeInjectRemediation(mission, session, nextId);
    const next: StorySession = { ...session, currentNodeId: injected };
    persistSession(next);
  }, [session, mission, persistSession]);

  const handleChoice = useCallback((option: { nextNodeId: string; setFlags?: Record<string, boolean> }) => {
    if (!session) return;
    const next = applyChoice(session, option);
    persistSession(next);
  }, [session, persistSession]);

  const handleQuizAnswer = useCallback((correct: boolean, concepts: string[]) => {
    if (!session) return;
    const { session: next, useRemediation } = applyQuizResult(
      session,
      correct,
      concepts as any,
      lastCorrect
    );
    setLastCorrect(Object.fromEntries(concepts.map((c) => [c, correct])));
    const qNode = getNode(mission, session.currentNodeId) as MiniQuizNode;
    const nextId = nextNodeAfterQuiz(mission, qNode, useRemediation);
    persistSession({ ...next, currentNodeId: nextId });
  }, [session, mission, lastCorrect, persistSession]);

  const handleRecapClose = useCallback(async () => {
    if (!session) return;
    const node = getNode(mission, session.currentNodeId) as RecapNode;
    await profileStore.addLessonReward({
      xp: node.rewards.xp,
      coins: node.rewards.coins,
      items: node.rewards.relics,
    });
    await recordRunComplete(missionId, node.rewards.endingId, session.choicesMade);
    await clearSession(missionId);
    refreshProfile();
    router.back();
  }, [session, mission, missionId, refreshProfile]);

  if (!session) return null;

  const node = getNode(mission, session.currentNodeId) as StoryNode | undefined;
  if (!node) return null;

  const renderNode = () => {
    switch (node.type) {
      case 'NARRATIVE': {
        const n = node as NarrativeNode;
        return (
          <>
            <NarrativeNodeView node={n} calmMode={calmMode} />
            {n.nextNodeId && (
              <Pressable
                style={({ pressed }) => [styles.nextBtn, pressed && styles.nextBtnPressed]}
                onPress={() => goToNode(n.nextNodeId!)}
              >
                <Text style={styles.nextBtnText}>Next</Text>
              </Pressable>
            )}
          </>
        );
      }
      case 'CHOICE':
        return (
          <ChoiceNodeView
            node={node as ChoiceNode}
            onChoice={handleChoice}
            calmMode={calmMode}
          />
        );
      case 'MINI_QUIZ': {
        const qNode = node as MiniQuizNode;
        return (
          <MiniQuizNodeView
            node={qNode}
            onAnswer={(correct) => handleQuizAnswer(correct, qNode.concepts)}
            calmMode={calmMode}
          />
        );
      }
      case 'RECAP':
        return <RecapNodeView node={node as RecapNode} onClose={handleRecapClose} />;
      case 'BREATHING_BREAK':
        return (
          <BreathingBreakNodeView
            node={node as BreathingBreakNode}
            onComplete={() => goToNode((node as BreathingBreakNode).nextNodeId)}
            calmMode={calmMode}
          />
        );
      default:
        return <Text style={styles.unknown}>Unknown step</Text>;
    }
  };

  return (
    <View style={styles.container}>
      <StoryMissionBanner />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {renderNode()}
      </ScrollView>
      <View style={styles.controls}>
        <View style={styles.toggles}>
          <Text style={styles.toggleLabel}>Calm mode</Text>
          <Pressable
            style={[styles.toggleBtn, calmMode && styles.toggleBtnOn]}
            onPress={() => setCalmMode((v) => !v)}
          >
            <Text style={styles.toggleBtnText}>{calmMode ? 'On' : 'Off'}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: LessonsTheme.background },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 80 },
  nextBtn: {
    alignSelf: 'center',
    marginTop: 24,
    backgroundColor: LessonsTheme.primary,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 14,
  },
  nextBtnPressed: { opacity: 0.9 },
  nextBtnText: { fontSize: 18, fontWeight: '700', color: '#fff' },
  unknown: { padding: 24, fontSize: 16, color: LessonsTheme.textMuted },
  controls: {
    padding: 16,
    backgroundColor: LessonsTheme.cardBg,
    borderTopWidth: 1,
    borderTopColor: LessonsTheme.border,
  },
  toggles: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
  toggleLabel: { fontSize: 14, color: LessonsTheme.textMuted },
  toggleBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10, backgroundColor: LessonsTheme.background },
  toggleBtnOn: { backgroundColor: LessonsTheme.primaryLight },
  toggleBtnText: { fontSize: 14, fontWeight: '600', color: LessonsTheme.text },
});
