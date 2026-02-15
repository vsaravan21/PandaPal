/**
 * Caregiver Plan - tasks list (no dosing edits)
 */

import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { LessonsTheme } from '@/features/lessons/constants';
import * as tasksStore from '@/features/caregiver/data/tasksStore';
import { ActivityIndicator } from 'react-native';

export default function CarePlanScreen() {
  const [tasks, setTasks] = useState<tasksStore.CareTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    tasksStore.getTasks().then((t) => {
      setTasks(t);
      setLoading(false);
    });
  }, []);

  const handleComplete = async (id: string) => {
    await tasksStore.completeTask(id);
    const t = await tasksStore.getTasks();
    setTasks(t);
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
      <Text style={styles.disclaimer}>Routine support + education only. Not medical advice.</Text>
      <Text style={styles.subtitle}>Care tasks (no dosing changes)</Text>

      {tasks.map((t) => (
        <View key={t.id} style={styles.card}>
          <Text style={styles.label}>{t.label}</Text>
          {t.dueTime && <Text style={styles.muted}>Due {t.dueTime}</Text>}
          {t.completedAt ? (
            <Text style={styles.done}>Completed</Text>
          ) : (
            <Pressable style={styles.btn} onPress={() => handleComplete(t.id)}>
              <Text style={styles.btnText}>Mark done</Text>
            </Pressable>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  disclaimer: { fontSize: 12, color: LessonsTheme.textMuted, marginBottom: 8 },
  subtitle: { fontSize: 15, color: LessonsTheme.textMuted, marginBottom: 20 },
  card: { backgroundColor: LessonsTheme.cardBg, borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: LessonsTheme.border },
  label: { fontSize: 17, fontWeight: '600', color: LessonsTheme.text },
  muted: { fontSize: 14, color: LessonsTheme.textMuted, marginTop: 4 },
  done: { fontSize: 14, color: LessonsTheme.primary, fontWeight: '600', marginTop: 8 },
  btn: { backgroundColor: LessonsTheme.primary, padding: 12, borderRadius: 10, alignItems: 'center', marginTop: 12, alignSelf: 'flex-start' },
  btnText: { color: '#fff', fontWeight: '600' },
});
