/**
 * Caregiver Timeline - symptom logs
 */

import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable } from 'react-native';
import { LessonsTheme } from '@/features/lessons/constants';
import * as logsStore from '@/features/caregiver/data/logsStore';
import { formatRelativeTime } from '@/features/caregiver/utils/dashboardHelpers';
import { Ionicons } from '@expo/vector-icons';

export default function LogsScreen() {
  const [logs, setLogs] = useState<logsStore.SymptomLog[]>([]);
  const [note, setNote] = useState('');
  const [type, setType] = useState('Note');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    logsStore.getLogs().then(setLogs);
    setLoading(false);
  }, []);

  const handleAdd = async () => {
    if (!note.trim()) return;
    await logsStore.addLog({ timestamp: new Date().toISOString(), type: type || 'Note', note: note.trim() });
    const updated = await logsStore.getLogs();
    setLogs(updated);
    setNote('');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.disclaimer}>Routine support + education only. Not medical advice.</Text>

      <View style={styles.addCard}>
        <TextInput
          style={styles.input}
          placeholder="Add a note..."
          placeholderTextColor={LessonsTheme.textMuted}
          value={note}
          onChangeText={setNote}
          multiline
        />
        <Pressable style={[styles.addBtn, !note.trim() && styles.addBtnDisabled]} onPress={handleAdd} disabled={!note.trim()}>
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.addBtnText}>Add</Text>
        </Pressable>
      </View>

      <Text style={styles.sectionTitle}>Timeline</Text>
      {logs.length === 0 ? (
        <Text style={styles.empty}>No logs yet.</Text>
      ) : (
        logs.map((l) => (
          <View key={l.id} style={styles.logCard}>
            <Text style={styles.logType}>{l.type}</Text>
            <Text style={styles.logTime}>{formatRelativeTime(l.timestamp)}</Text>
            {l.note ? <Text style={styles.logNote}>{l.note}</Text> : null}
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  disclaimer: { fontSize: 12, color: LessonsTheme.textMuted, marginBottom: 16 },
  addCard: { backgroundColor: LessonsTheme.cardBg, borderRadius: 12, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: LessonsTheme.border },
  input: { fontSize: 15, color: LessonsTheme.text, minHeight: 60, marginBottom: 12 },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: LessonsTheme.primary, padding: 12, borderRadius: 10 },
  addBtnDisabled: { opacity: 0.5 },
  addBtnText: { color: '#fff', fontWeight: '600' },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: LessonsTheme.text, marginBottom: 12 },
  empty: { fontSize: 15, color: LessonsTheme.textMuted, fontStyle: 'italic' },
  logCard: { backgroundColor: LessonsTheme.cardBg, borderRadius: 10, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: LessonsTheme.border },
  logType: { fontSize: 15, fontWeight: '600', color: LessonsTheme.text },
  logTime: { fontSize: 13, color: LessonsTheme.textMuted, marginTop: 4 },
  logNote: { fontSize: 14, color: LessonsTheme.text, marginTop: 6 },
});
