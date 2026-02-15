/**
 * Caregiver Settings
 */

import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { LessonsTheme } from '@/features/lessons/constants';
import { ExportSummaryModal } from '@/features/caregiver/components/ExportSummaryModal';
import * as tasksStore from '@/features/caregiver/data/tasksStore';
import * as logsStore from '@/features/caregiver/data/logsStore';
import * as caregiverPinStorage from '@/features/auth/storage/caregiverPinStorage';
import { generateExportSummary } from '@/features/caregiver/logic/exportSummary';
import { useLessons } from '@/features/lessons/context/LessonsContext';
import { LESSONS } from '@/features/lessons/data/lessons';

export default function SettingsScreen() {
  const { clearRole } = useAuth();
  const { progress } = useLessons();
  const [exportVisible, setExportVisible] = useState(false);
  const [exportSummary, setExportSummary] = useState('');

  const handleExport = async () => {
    const [t, l] = await Promise.all([tasksStore.getTasks(), logsStore.getLogs()]);
    const summary = generateExportSummary({
      tasks: t,
      logs: l,
      progress,
      lessons: LESSONS.map((l) => ({ id: l.id, title: l.title })),
      dateRangeDays: 30,
    });
    setExportSummary(summary);
    setExportVisible(true);
  };

  const handleExportClose = () => setExportVisible(false);

  const handleChangePin = () => {
    router.push('/set-caregiver-pin');
  };

  const handleSwitchRole = async () => {
    await clearRole();
    router.replace('/role-select');
  };

  const handleResetPin = async () => {
    await caregiverPinStorage.clearCaregiverPin();
    router.replace('/set-caregiver-pin');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.disclaimer}>Routine support + education only. Not medical advice.</Text>

      <Pressable style={styles.row} onPress={handleExport}>
        <Text style={styles.rowLabel}>Export Summary</Text>
        <Text style={styles.rowChevron}>→</Text>
      </Pressable>

      <Pressable style={styles.row} onPress={handleChangePin}>
        <Text style={styles.rowLabel}>Change Caregiver PIN</Text>
        <Text style={styles.rowChevron}>→</Text>
      </Pressable>

      <Pressable style={styles.row} onPress={handleSwitchRole}>
        <Text style={styles.rowLabel}>Switch Role</Text>
        <Text style={styles.rowChevron}>→</Text>
      </Pressable>

      <Pressable style={[styles.row, styles.devRow]} onPress={handleResetPin}>
        <Text style={styles.rowLabel}>Reset Caregiver PIN</Text>
        <Text style={styles.rowChevron}>→</Text>
      </Pressable>

      <ExportSummaryModal
        visible={exportVisible}
        onClose={handleExportClose}
        summary={exportSummary}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  disclaimer: { fontSize: 12, color: LessonsTheme.textMuted, marginBottom: 24 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: LessonsTheme.cardBg,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: LessonsTheme.border,
  },
  rowLabel: { fontSize: 16, fontWeight: '500', color: LessonsTheme.text },
  rowChevron: { fontSize: 18, color: LessonsTheme.textMuted },
  devRow: { opacity: 0.8 },
});
