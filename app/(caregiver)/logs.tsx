/**
 * Caregiver Logs Timeline
 */

import { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { getLogs, addLog, type SymptomLog } from '@/features/caregiver/data/logsStore';
import { LessonsTheme } from '@/features/lessons/constants';

export default function CaregiverLogsScreen() {
  const [logs, setLogs] = useState<SymptomLog[]>([]);

  const load = useCallback(async () => {
    const data = await getLogs();
    setLogs(data);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleAddNote = async () => {
    await addLog({
      timestamp: new Date().toISOString(),
      type: 'note',
      note: 'Caregiver note',
      tags: ['observational'],
    });
    load();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.pageHeader}>Timeline</Text>
      <Text style={styles.pageDesc}>Symptom and activity notes. Observational only. No medical advice.</Text>

      <Pressable style={({ pressed }) => [styles.addBtn, pressed && styles.addBtnPressed]} onPress={handleAddNote}>
        <Text style={styles.addBtnText}>+ Add note</Text>
      </Pressable>

      {logs.map((log) => (
        <View key={log.id} style={styles.card}>
          <Text style={styles.date}>{new Date(log.timestamp).toLocaleString()}</Text>
          <Text style={styles.type}>{log.type}</Text>
          {log.note ? <Text style={styles.note}>{log.note}</Text> : null}
          {log.tags?.length ? (
            <View style={styles.tags}>
              {log.tags.map((t) => (
                <Text key={t} style={styles.tag}>{t}</Text>
              ))}
            </View>
          ) : null}
        </View>
      ))}
      {logs.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.empty}>No logs yet.</Text>
          <Pressable style={({ pressed }) => [styles.emptyCta, pressed && styles.addBtnPressed]} onPress={handleAddNote}>
            <Text style={styles.emptyCtaText}>Add note</Text>
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
  pageDesc: { fontSize: 14, color: LessonsTheme.textMuted, marginBottom: 24 },
  addBtn: {
    backgroundColor: LessonsTheme.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  addBtnPressed: { opacity: 0.9 },
  addBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  card: {
    backgroundColor: LessonsTheme.cardBg,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  date: { fontSize: 13, color: LessonsTheme.textMuted },
  type: { fontSize: 15, fontWeight: '600', color: LessonsTheme.text, marginTop: 4 },
  note: { fontSize: 14, color: LessonsTheme.text, marginTop: 6 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  tag: {
    fontSize: 12,
    color: LessonsTheme.primary,
    backgroundColor: LessonsTheme.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  emptyState: { marginTop: 24, alignItems: 'center', gap: 12 },
  empty: { fontSize: 15, color: LessonsTheme.textMuted, fontStyle: 'italic' },
  emptyCta: { paddingVertical: 12, paddingHorizontal: 24, backgroundColor: LessonsTheme.primary, borderRadius: 12 },
  emptyCtaText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
