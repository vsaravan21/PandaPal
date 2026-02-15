/**
 * Caregiver Trends - 7/14/30 day view
 */

import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { getTasks } from '@/features/caregiver/data/tasksStore';
import { getLogs } from '@/features/caregiver/data/logsStore';
import { LessonsTheme } from '@/features/lessons/constants';

type Range = '7' | '14' | '30';

export default function CaregiverTrendsScreen() {
  const [range, setRange] = useState<Range>('7');
  const [taskPct, setTaskPct] = useState(0);
  const [missedCount, setMissedCount] = useState(0);
  const [logCount, setLogCount] = useState(0);

  useEffect(() => {
    (async () => {
      const [tasks, logs] = await Promise.all([getTasks(), getLogs()]);
      const days = parseInt(range, 10);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      const recentLogs = logs.filter((l) => new Date(l.timestamp) >= cutoff);
      const completed = tasks.filter((t) => t.completedAt && new Date(t.completedAt) >= cutoff).length;
      const total = Math.max(tasks.length * Math.ceil(days / 7), 1);
      setTaskPct(Math.round((completed / total) * 100));
      setMissedCount(tasks.filter((t) => t.missed).length);
      setLogCount(recentLogs.length);
    })();
  }, [range]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.pageHeader}>Insights</Text>
      <Text style={styles.pageDesc}>Task completion and symptom log patterns. Not medical advice.</Text>
      <View style={styles.rangeRow}>
        {(['7', '14', '30'] as const).map((r) => (
          <Pressable
            key={r}
            style={({ pressed }) => [styles.rangeBtn, range === r && styles.rangeBtnActive, pressed && styles.rangeBtnPressed]}
            onPress={() => setRange(r)}
          >
            <Text style={[styles.rangeText, range === r && styles.rangeTextActive]}>{r} days</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Task completion</Text>
        <Text style={styles.cardValue}>{taskPct}%</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Missed tasks</Text>
        <Text style={styles.cardValue}>{missedCount}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Symptom log frequency</Text>
        <Text style={styles.cardValue}>{logCount} entries</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: LessonsTheme.background },
  content: { padding: 16, paddingBottom: 40 },
  pageHeader: { fontSize: 20, fontWeight: '700', color: LessonsTheme.text, marginBottom: 4 },
  pageDesc: { fontSize: 14, color: LessonsTheme.textMuted, marginBottom: 20 },
  rangeRow: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  rangeBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: LessonsTheme.cardBg,
    alignItems: 'center',
  },
  rangeBtnActive: { backgroundColor: LessonsTheme.primary },
  rangeBtnPressed: { opacity: 0.9 },
  rangeText: { fontSize: 15, fontWeight: '600', color: LessonsTheme.text },
  rangeTextActive: { color: '#fff' },
  card: {
    backgroundColor: LessonsTheme.cardBg,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  cardTitle: { fontSize: 15, color: LessonsTheme.textMuted },
  cardValue: { fontSize: 24, fontWeight: '700', color: LessonsTheme.text, marginTop: 8 },
});
