/**
 * Care Plan Viewer - readable view, reminder windows, task toggles
 */

import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { getTasks } from '@/features/caregiver/data/tasksStore';
import { LessonsTheme } from '@/features/lessons/constants';

export default function CarePlanScreen() {
  const [tasks, setTasks] = useState<Awaited<ReturnType<typeof getTasks>>>([]);

  useEffect(() => {
    getTasks().then(setTasks);
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.pageHeader}>Plan</Text>
      <Text style={styles.pageDesc}>Schedule and reminders. No dosing edits.</Text>
      <Text style={styles.sectionTitle}>Schedule</Text>
      {tasks.map((t) => (
        <View key={t.id} style={styles.card}>
          <Text style={styles.taskLabel}>{t.label}</Text>
          <Text style={styles.taskTime}>{t.dueTime ?? '—'}</Text>
          <Text style={styles.taskStatus}>{t.completedAt ? 'Completed' : 'Pending'}</Text>
        </View>
      ))}
      {tasks.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.empty}>No care plan tasks yet.</Text>
          <Pressable style={({ pressed }) => [styles.emptyCta, pressed && styles.emptyCtaPressed]} onPress={() => router.push('/(caregiver)')}>
            <Text style={styles.emptyCtaText}>View Dashboard</Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: LessonsTheme.background },
  content: { padding: 16, paddingBottom: 40 },
  pageHeader: { fontSize: 20, fontWeight: '700', color: LessonsTheme.text, marginBottom: 4 },
  pageDesc: { fontSize: 14, color: LessonsTheme.textMuted, marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: LessonsTheme.text, marginBottom: 12 },
  card: {
    backgroundColor: LessonsTheme.cardBg,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  taskLabel: { fontSize: 16, fontWeight: '600', color: LessonsTheme.text },
  taskTime: { fontSize: 14, color: LessonsTheme.textMuted, marginTop: 4 },
  taskStatus: { fontSize: 13, color: LessonsTheme.primary, marginTop: 4 },
  emptyState: { marginTop: 24, alignItems: 'center', gap: 12 },
  empty: { fontSize: 15, color: LessonsTheme.textMuted, fontStyle: 'italic' },
  emptyCta: { paddingVertical: 12, paddingHorizontal: 24, backgroundColor: LessonsTheme.primary, borderRadius: 12 },
  emptyCtaPressed: { opacity: 0.9 },
  emptyCtaText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
