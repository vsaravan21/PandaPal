/**
 * Caregiver Dashboard
 */

import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { LessonsTheme } from '@/features/lessons/constants';
import { ActionGrid } from '@/features/caregiver/components/ActionGrid';
import { SparklineMini } from '@/features/caregiver/components/SparklineMini';
import { StabilityLabel } from '@/features/caregiver/components/StabilityLabel';
import { ExportSummaryModal } from '@/features/caregiver/components/ExportSummaryModal';
import * as tasksStore from '@/features/caregiver/data/tasksStore';
import * as logsStore from '@/features/caregiver/data/logsStore';
import * as recommendedLessonStore from '@/features/caregiver/storage/recommendedLessonStore';
import { computeRoutineStability } from '@/features/caregiver/logic/routineStability';
import { generateInsights } from '@/features/caregiver/logic/insightEngine';
import { generateExportSummary } from '@/features/caregiver/logic/exportSummary';
import { formatRelativeTime, pickTopInsights } from '@/features/caregiver/utils/dashboardHelpers';
import { useLessons } from '@/features/lessons/context/LessonsContext';
import { LESSONS } from '@/features/lessons/data/lessons';
import { Ionicons } from '@expo/vector-icons';

export default function CaregiverDashboardScreen() {
  const { progress } = useLessons();
  const [tasks, setTasks] = useState<tasksStore.CareTask[]>([]);
  const [logs, setLogs] = useState<logsStore.SymptomLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [exportVisible, setExportVisible] = useState(false);
  const [exportText, setExportText] = useState('');

  useEffect(() => {
    Promise.all([tasksStore.getTasks(), logsStore.getLogs()]).then(([t, l]) => {
      setTasks(t);
      setLogs(l);
      setLoading(false);
    });
  }, []);

  const stability = computeRoutineStability(tasks, 7);
  const insights = pickTopInsights(generateInsights(tasks, logs, progress, 14), 2);
  const nextTask = tasks.find((t) => !t.completedAt) ?? tasks[0];
  const completed = tasks.filter((t) => t.completedAt);
  const lessonProgress = Object.values(progress).filter((p) => p.completed);
  const topMastery = lessonProgress.slice(0, 3);

  const handleCompleteTask = async (id: string) => {
    await tasksStore.completeTask(id);
    const t = await tasksStore.getTasks();
    setTasks(t);
  };

  const handleExport = () => {
    const summary = generateExportSummary({
      tasks,
      logs,
      progress,
      lessons: LESSONS.map((l) => ({ id: l.id, title: l.title })),
      dateRangeDays: 30,
    });
    setExportText(summary);
    setExportVisible(true);
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={LessonsTheme.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>Today</Text>
      {nextTask && (
        <View style={styles.card}>
          <Text style={styles.taskLabel}>{nextTask.label}</Text>
          {nextTask.dueTime && <Text style={styles.muted}>Due {nextTask.dueTime}</Text>}
          {nextTask.completedAt ? (
            <Text style={styles.done}>Done</Text>
          ) : (
            <Pressable style={styles.primaryBtn} onPress={() => handleCompleteTask(nextTask.id)}>
              <Text style={styles.primaryBtnText}>Mark done</Text>
            </Pressable>
          )}
        </View>
      )}

      <Pressable style={styles.card} onPress={() => router.push('/(caregiver)/trends')}>
        <Text style={styles.sectionTitle}>Routine Stability</Text>
        <View style={styles.stabilityRow}>
          <StabilityLabel score={stability.score} trend={stability.trend} label={stability.label} />
          <SparklineMini values={[60, 70, 65, 80, 75, stability.score]} />
        </View>
      </Pressable>

      {insights.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>We noticed</Text>
          {insights.map((i) => (
            <View key={i.type} style={styles.card}>
              <Text style={styles.insightMsg}>{i.message}</Text>
              <Text style={styles.muted}>{i.recommendedAction}</Text>
              {i.ctaRoute && (
                <Pressable style={styles.linkBtn} onPress={() => router.push(i.ctaRoute as any)}>
                  <Text style={styles.linkText}>{i.ctaLabel ?? 'Learn more'}</Text>
                </Pressable>
              )}
            </View>
          ))}
        </>
      )}

      <Text style={styles.sectionTitle}>Education Readiness</Text>
      <View style={styles.card}>
        {topMastery.length > 0 ? (
          topMastery.map((p) => {
            const lesson = LESSONS.find((l) => l.id === p.lessonId);
            return (
              <View key={p.lessonId} style={styles.masteryRow}>
                <Text style={styles.lessonTitle}>{lesson?.title ?? p.lessonId}</Text>
                <Text style={styles.masteryPct}>{p.masteryScore}%</Text>
              </View>
            );
          })
        ) : (
          <Text style={styles.muted}>No lessons completed yet.</Text>
        )}
        <Pressable
          style={styles.primaryBtn}
          onPress={async () => {
            const rec = LESSONS.find((l) => !progress[l.id]?.completed) ?? LESSONS[0];
            if (rec) await recommendedLessonStore.setRecommendedLessonId(rec.id);
          }}
        >
          <Text style={styles.primaryBtnText}>Recommend to Kid</Text>
        </Pressable>
      </View>

      <Text style={styles.sectionTitle}>Recent Activity</Text>
      <View style={styles.card}>
        <Text style={styles.muted}>
          Last log: {logs[0] ? formatRelativeTime(logs[0].timestamp) : 'None'}
        </Text>
        <Text style={styles.muted}>
          Last lesson: {lessonProgress[0] ? formatRelativeTime(lessonProgress[0].lastCompletedAt!) : 'None'}
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Quick actions</Text>
      <ActionGrid onExportPress={handleExport} />

      <Pressable style={styles.exportBtn} onPress={handleExport}>
        <Ionicons name="document-text-outline" size={20} color={LessonsTheme.primary} />
        <Text style={styles.exportBtnText}>Export Summary</Text>
      </Pressable>

      <ExportSummaryModal visible={exportVisible} onClose={() => setExportVisible(false)} summary={exportText} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: LessonsTheme.text, marginTop: 20, marginBottom: 12 },
  card: {
    backgroundColor: LessonsTheme.cardBg,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: LessonsTheme.border,
  },
  taskLabel: { fontSize: 17, fontWeight: '600', color: LessonsTheme.text },
  muted: { fontSize: 14, color: LessonsTheme.textMuted, marginTop: 4 },
  done: { fontSize: 14, color: LessonsTheme.primary, fontWeight: '600', marginTop: 4 },
  primaryBtn: { backgroundColor: LessonsTheme.primary, padding: 12, borderRadius: 10, alignItems: 'center', marginTop: 12 },
  primaryBtnText: { color: '#fff', fontWeight: '600' },
  stabilityRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  insightMsg: { fontSize: 15, color: LessonsTheme.text },
  linkBtn: { marginTop: 8 },
  linkText: { color: LessonsTheme.primary, fontWeight: '600' },
  masteryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  lessonTitle: { fontSize: 15, color: LessonsTheme.text },
  masteryPct: { fontSize: 14, fontWeight: '600', color: LessonsTheme.primary },
  exportBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 24, alignSelf: 'center' },
  exportBtnText: { color: LessonsTheme.primary, fontWeight: '600' },
});
