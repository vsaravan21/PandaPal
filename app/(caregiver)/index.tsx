/**
 * Caregiver Dashboard - What's next? How are we doing?
 * Calm, intuitive, actionable.
 */

import { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Alert } from 'react-native';
import { router } from 'expo-router';
import { useLessons } from '@/features/lessons/context/LessonsContext';
import { getTasks, completeTask, type CareTask } from '@/features/caregiver/data/tasksStore';
import { getLogs } from '@/features/caregiver/data/logsStore';
import { setRecommendedLessonId } from '@/features/caregiver/storage/recommendedLessonStore';
import { computeRoutineStability } from '@/features/caregiver/logic/routineStability';
import { getInsights, type Insight } from '@/features/caregiver/logic/insightEngine';
import {
  formatRelativeTime,
  pickTopInsights,
  computeRecentSummary,
  getCompletionBars,
} from '@/features/caregiver/utils/dashboardHelpers';
import { LessonsTheme } from '@/features/lessons/constants';
import { LESSONS } from '@/features/lessons/data/lessons';
import * as lessonProgressApi from '@/features/lessons/storage/lessonProgress';
import { getRecommendedNextLesson } from '@/features/lessons/utils/scoring';
import { ExportSummaryModal } from '@/features/caregiver/components/ExportSummaryModal';
import { ActionGrid } from '@/features/caregiver/components/ActionGrid';
import { SparklineMini } from '@/features/caregiver/components/SparklineMini';
import { StabilityLabel } from '@/features/caregiver/components/StabilityLabel';

function getNextDueTask(tasks: CareTask[]): CareTask | null {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const pending = tasks.filter((t) => !t.completedAt || !t.completedAt.startsWith(today));
  const withDue = pending.filter((t) => t.dueTime);
  if (withDue.length === 0) return pending[0] ?? null;
  const sorted = [...withDue].sort((a, b) => (a.dueTime ?? '').localeCompare(b.dueTime ?? ''));
  return sorted[0] ?? null;
}

export default function CaregiverDashboardScreen() {
  const { progress, lessons } = useLessons();
  const [tasks, setTasks] = useState<CareTask[]>([]);
  const [logs, setLogs] = useState<Awaited<ReturnType<typeof getLogs>>>([]);
  const [allProgress, setAllProgress] = useState<Record<string, import('@/features/lessons/types').LessonProgress>>({});
  const [showExport, setShowExport] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [t, l, p] = await Promise.all([getTasks(), getLogs(), lessonProgressApi.getAllLessonProgress()]);
      setTasks(t);
      setLogs(l);
      setAllProgress(p);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const todayStr = new Date().toISOString().slice(0, 10);
  const dueToday = tasks.filter((t) => t.dueTime && !t.completedAt?.startsWith(todayStr));
  const completedToday = tasks.filter((t) => t.completedAt?.startsWith(todayStr));
  const missed = tasks.filter((t) => t.missed);
  const nextTask = getNextDueTask(tasks);
  const stability = computeRoutineStability(tasks, 7);
  const insights = pickTopInsights(
    getInsights(tasks, logs, allProgress, 14, lessons.map((l) => ({ id: l.id, category: l.category }))),
    2
  );
  const recommendedLesson = getRecommendedNextLesson(lessons, progress);
  const completedProgress = Object.values(allProgress).filter((p) => p.completed);
  const masteryByCategory: Record<string, { count: number; avg: number }> = {};
  completedProgress.forEach((p) => {
    const lesson = LESSONS.find((l) => l.id === p.lessonId);
    const cat = lesson?.category ?? 'Other';
    if (!masteryByCategory[cat]) masteryByCategory[cat] = { count: 0, avg: 0 };
    masteryByCategory[cat].count++;
    masteryByCategory[cat].avg += p.masteryScore;
  });
  Object.keys(masteryByCategory).forEach((k) => {
    const v = masteryByCategory[k];
    if (v.count > 0) v.avg = Math.round(v.avg / v.count);
  });
  const top3Mastery = Object.entries(masteryByCategory)
    .map(([cat, v]) => ({ cat, avg: v.avg }))
    .sort((a, b) => a.avg - b.avg)
    .slice(0, 3);
  const lastLog = logs[0] ? new Date(logs[0].timestamp).toLocaleDateString() : null;
  const lastLesson =
    completedProgress.length > 0
      ? (() => {
          const last = completedProgress.sort((a, b) =>
            (b.lastCompletedAt ?? '').localeCompare(a.lastCompletedAt ?? '')
          )[0];
          const lesson = LESSONS.find((l) => l.id === last.lessonId);
          return lesson?.title ?? last.lessonId;
        })()
      : null;
  const recentSummary = computeRecentSummary(tasks);
  const completionBars = getCompletionBars(tasks, 7);
  const relativeTime = nextTask ? formatRelativeTime(nextTask) : null;

  const handleMarkDone = async () => {
    if (!nextTask) return;
    const updated = await completeTask(nextTask.id);
    setTasks(updated);
  };

  const handleRecommendToKid = async (lessonId: string) => {
    await setRecommendedLessonId(lessonId);
    const lesson = lessons.find((l) => l.id === lessonId);
    Alert.alert('Recommended', `${lesson?.title ?? 'Lesson'} is now recommended for your child. They'll see it in Learn.`);
  };

  if (loading && tasks.length === 0) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={LessonsTheme.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Today - primary CTA, countdown, Mark done */}
      <Text style={styles.sectionTitle}>Today</Text>
      <View style={styles.card}>
        {nextTask ? (
          <View style={styles.nextTaskRow}>
            <Text style={styles.nextTaskLabel}>Next: {nextTask.label}</Text>
            {relativeTime ? (
              <Text style={styles.nextTaskRelative}>• {relativeTime}</Text>
            ) : null}
          </View>
        ) : null}
        <View style={styles.countsRow}>
          <Text style={styles.countLabel}>Due</Text>
          <Text style={styles.countValue}>{dueToday.length}</Text>
          <Text style={styles.countDot}>•</Text>
          <Text style={styles.countLabel}>Done</Text>
          <Text style={styles.countValue}>{completedToday.length}</Text>
          <Text style={styles.countDot}>•</Text>
          <Text style={styles.countLabel}>Missed</Text>
          <Text style={[styles.countValue, missed.length > 0 && styles.countWarn]}>{missed.length}</Text>
        </View>
        <View style={styles.todayButtons}>
          <Pressable
            style={({ pressed }) => [styles.primaryBtn, pressed && styles.btnPressed]}
            onPress={() => router.push('/(caregiver)/care-plan')}
          >
            <Text style={styles.primaryBtnText}>Review Today's Plan</Text>
          </Pressable>
          {nextTask ? (
            <Pressable
              style={({ pressed }) => [styles.secondaryBtn, pressed && styles.btnPressed]}
              onPress={handleMarkDone}
            >
              <Text style={styles.secondaryBtnText}>Mark done</Text>
            </Pressable>
          ) : null}
        </View>
      </View>

      {/* Routine Stability - tappable to Insights */}
      <Text style={styles.sectionTitle}>Routine Stability</Text>
      <Pressable
        style={({ pressed }) => [styles.card, styles.stabilityCard, pressed && styles.cardPressed]}
        onPress={() => router.push('/(caregiver)/trends')}
      >
        <View style={styles.stabilityRow}>
          <Text style={styles.stabilityScore}>{stability.score}</Text>
          <Text style={styles.stabilityLabel}>/ 100</Text>
          <Text style={styles.trendIndicator}>
            {stability.trend === 'up' ? '↑' : stability.trend === 'down' ? '↓' : '→'}
          </Text>
          <StabilityLabel score={stability.score} />
        </View>
        <SparklineMini values={completionBars} />
      </Pressable>

      {/* We noticed - max 2, simple cards */}
      {insights.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>We noticed</Text>
          {insights.map((insight: Insight) => (
            <View key={insight.type} style={styles.insightCard}>
              <Text style={styles.insightMessage}>{insight.message}</Text>
              {insight.supportingStats ? (
                <Text style={styles.insightSubtext}>{insight.supportingStats}</Text>
              ) : null}
              {insight.ctaLabel && insight.ctaRoute ? (
                <Pressable
                  style={({ pressed }) => [styles.insightCta, pressed && styles.btnPressed]}
                  onPress={() => router.push(insight.ctaRoute!)}
                >
                  <Text style={styles.insightCtaText}>{insight.ctaLabel}</Text>
                </Pressable>
              ) : null}
            </View>
          ))}
        </>
      )}

      {/* Education Readiness - top 3 chips + Recommend to Kid */}
      <Text style={styles.sectionTitle}>Education Readiness</Text>
      <View style={styles.card}>
        {top3Mastery.length > 0 ? (
          <>
            <View style={styles.chipRow}>
              {top3Mastery.map(({ cat, avg }) => (
                <View key={cat} style={styles.chip}>
                  <Text style={styles.chipText}>{cat} {avg}%</Text>
                </View>
              ))}
            </View>
            {recommendedLesson && (
              <Pressable
                style={({ pressed }) => [styles.recommendBtn, pressed && styles.btnPressed]}
                onPress={() => handleRecommendToKid(recommendedLesson.id)}
              >
                <Text style={styles.recommendBtnText}>Recommend to Kid</Text>
              </Pressable>
            )}
          </>
        ) : (
          <Text style={styles.emptyText}>No lessons completed yet.</Text>
        )}
      </View>

      {/* Recent Activity - add missed line */}
      <Text style={styles.sectionTitle}>Recent Activity</Text>
      <View style={styles.card}>
        <View style={styles.activityRow}>
          <Text style={styles.activityLabel}>Last log</Text>
          <Text style={styles.activityValue}>{lastLog ?? 'None yet'}</Text>
        </View>
        <View style={styles.activityRow}>
          <Text style={styles.activityLabel}>Last lesson</Text>
          <Text style={styles.activityValue}>{lastLesson ?? 'None yet'}</Text>
        </View>
        <View style={styles.activityRow}>
          <Text style={styles.activityLabel}>Tasks</Text>
          <Text style={styles.activityValue}>{recentSummary.missedLine}</Text>
        </View>
      </View>

      {/* 2x2 Action Grid */}
      <ActionGrid
        tiles={[
          { label: 'Insights', icon: 'stats-chart', onPress: () => router.push('/(caregiver)/trends') },
          { label: 'Timeline', icon: 'list', onPress: () => router.push('/(caregiver)/logs') },
          {
            label: 'Export',
            icon: 'share-outline',
            onPress: () => setShowExport(true),
            emphasized: true,
          },
          { label: 'Settings', icon: 'settings-outline', onPress: () => router.push('/(caregiver)/settings') },
        ]}
      />

      <ExportSummaryModal visible={showExport} onClose={() => setShowExport(false)} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: LessonsTheme.background },
  centered: { justifyContent: 'center', alignItems: 'center' },
  content: { padding: 16, paddingBottom: 40 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: LessonsTheme.text, marginBottom: 10 },
  card: {
    backgroundColor: LessonsTheme.cardBg,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  cardPressed: { opacity: 0.95 },
  nextTaskRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 4 },
  nextTaskLabel: { fontSize: 16, fontWeight: '600', color: LessonsTheme.text },
  nextTaskRelative: { fontSize: 13, color: LessonsTheme.textMuted },
  countsRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  countLabel: { fontSize: 12, color: LessonsTheme.textMuted },
  countValue: { fontSize: 13, fontWeight: '600', color: LessonsTheme.text },
  countDot: { fontSize: 10, color: LessonsTheme.textMuted },
  countWarn: { color: LessonsTheme.error },
  todayButtons: { flexDirection: 'row', gap: 10, marginTop: 14 },
  primaryBtn: {
    flex: 1,
    backgroundColor: LessonsTheme.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  secondaryBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: LessonsTheme.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: { color: LessonsTheme.primary, fontSize: 14, fontWeight: '600' },
  btnPressed: { opacity: 0.9 },
  stabilityCard: {},
  stabilityRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  stabilityScore: { fontSize: 28, fontWeight: '700', color: LessonsTheme.primary },
  stabilityLabel: { fontSize: 14, color: LessonsTheme.textMuted },
  trendIndicator: { fontSize: 16, color: LessonsTheme.textMuted },
  insightCard: {
    backgroundColor: LessonsTheme.calmBg,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: LessonsTheme.primary,
  },
  insightMessage: { fontSize: 14, color: LessonsTheme.text },
  insightSubtext: { fontSize: 12, color: LessonsTheme.textMuted, marginTop: 4 },
  insightCta: { marginTop: 10, paddingVertical: 6, alignSelf: 'flex-start' },
  insightCtaText: { color: LessonsTheme.primary, fontSize: 14, fontWeight: '600' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  chip: {
    backgroundColor: LessonsTheme.calmBg,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  chipText: { fontSize: 13, color: LessonsTheme.text, fontWeight: '500' },
  recommendBtn: {
    backgroundColor: LessonsTheme.primaryLight,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  recommendBtnText: { color: LessonsTheme.primary, fontSize: 14, fontWeight: '600' },
  emptyText: { fontSize: 14, color: LessonsTheme.textMuted, fontStyle: 'italic' },
  activityRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  activityLabel: { fontSize: 13, color: LessonsTheme.textMuted },
  activityValue: { fontSize: 14, fontWeight: '500', color: LessonsTheme.text },
});
