/**
 * Caregiver Insights
 */

import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { LessonsTheme } from '@/features/lessons/constants';
import * as tasksStore from '@/features/caregiver/data/tasksStore';
import * as logsStore from '@/features/caregiver/data/logsStore';
import { computeRoutineStability } from '@/features/caregiver/logic/routineStability';
import { useLessons } from '@/features/lessons/context/LessonsContext';
import { ActivityIndicator } from 'react-native';

type Range = 7 | 14 | 30;

export default function TrendsScreen() {
  const { progress } = useLessons();
  const [tasks, setTasks] = useState<tasksStore.CareTask[]>([]);
  const [logs, setLogs] = useState<logsStore.SymptomLog[]>([]);
  const [range, setRange] = useState<Range>(7);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([tasksStore.getTasks(), logsStore.getLogs()]).then(([t, l]) => {
      setTasks(t);
      setLogs(l);
      setLoading(false);
    });
  }, []);

  const stability = computeRoutineStability(tasks, range);
  const cutoff = Date.now() - range * 86400000;
  const completedTasks = tasks.filter((t) => t.completedAt && new Date(t.completedAt).getTime() > cutoff);
  const missedTasks = tasks.filter((t) => t.missed);
  const recentLogs = logs.filter((l) => new Date(l.timestamp).getTime() > cutoff);
  const totalSlots = tasks.length * range;
  const completionPct = totalSlots > 0 ? Math.round((completedTasks.length / totalSlots) * 100) : 0;

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={LessonsTheme.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.disclaimer}>Routine support + education only. Not medical advice.</Text>

      <View style={styles.rangeRow}>
        {([7, 14, 30] as Range[]).map((r) => (
          <Pressable
            key={r}
            style={[styles.rangeBtn, range === r && styles.rangeBtnActive]}
            onPress={() => setRange(r)}
          >
            <Text style={[styles.rangeBtnText, range === r && styles.rangeBtnTextActive]}>{r}d</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Completion %</Text>
        <Text style={styles.cardValue}>{completionPct}%</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Missed count</Text>
        <Text style={styles.cardValue}>{missedTasks.length}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Log frequency</Text>
        <Text style={styles.cardValue}>{recentLogs.length} entries</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Routine stability</Text>
        <Text style={styles.cardValue}>{stability.score}</Text>
        <Text style={styles.muted}>{stability.label} • {stability.trend}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  disclaimer: { fontSize: 12, color: LessonsTheme.textMuted, marginBottom: 16 },
  rangeRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  rangeBtn: { paddingVertical: 8, paddingHorizontal: 16, backgroundColor: LessonsTheme.cardBg, borderRadius: 8 },
  rangeBtnActive: { backgroundColor: LessonsTheme.primary },
  rangeBtnText: { fontSize: 15, fontWeight: '600' as const, color: LessonsTheme.text },
  rangeBtnTextActive: { color: '#fff' },
  card: { backgroundColor: LessonsTheme.cardBg, borderRadius: 12, padding: 20, marginBottom: 12, borderWidth: 1, borderColor: LessonsTheme.border },
  cardTitle: { fontSize: 14, color: LessonsTheme.textMuted, marginBottom: 4 },
  cardValue: { fontSize: 24, fontWeight: '700', color: LessonsTheme.primary },
  muted: { fontSize: 13, color: LessonsTheme.textMuted, marginTop: 4 },
});
