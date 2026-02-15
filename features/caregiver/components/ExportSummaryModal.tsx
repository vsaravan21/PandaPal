/**
 * Export Summary Modal - copyable doctor visit summary
 * Not medical advice.
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  Share,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { LessonsTheme } from '@/features/lessons/constants';
import { getTasks } from '../data/tasksStore';
import { getLogs } from '../data/logsStore';
import { LESSONS } from '@/features/lessons/data/lessons';
import * as lessonProgressApi from '@/features/lessons/storage/lessonProgress';
import { generateExportSummary } from '../logic/exportSummary';

interface ExportSummaryModalProps {
  visible: boolean;
  onClose: () => void;
  dateRangeDays?: number;
}

export function ExportSummaryModal({
  visible,
  onClose,
  dateRangeDays = 30,
}: ExportSummaryModalProps) {
  const [summary, setSummary] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [tasks, logs, progress] = await Promise.all([
        getTasks(),
        getLogs(),
        lessonProgressApi.getAllLessonProgress(),
      ]);
      const text = generateExportSummary({
        tasks,
        logs,
        progress,
        lessons: LESSONS,
        dateRangeDays,
      });
      setSummary(text);
    } finally {
      setLoading(false);
    }
  }, [dateRangeDays]);

  useEffect(() => {
    if (visible) load();
  }, [visible, load]);

  const handleCopy = async () => {
    try {
      await Clipboard.setStringAsync(summary);
      Alert.alert('Copied', 'Summary copied to clipboard.');
    } catch {
      Alert.alert('Error', 'Could not copy to clipboard.');
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: summary,
        title: 'PandaPal Care Summary',
      });
    } catch {
      // User cancelled
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Export Summary</Text>
          <Text style={styles.subtitle}>Last {dateRangeDays} days. Not medical advice.</Text>
          <Pressable style={({ pressed }) => [styles.closeBtn, pressed && styles.closeBtnPressed]} onPress={onClose}>
            <Text style={styles.closeBtnText}>Done</Text>
          </Pressable>
        </View>

        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={LessonsTheme.primary} />
          </View>
        ) : (
          <>
            <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
              <Text style={styles.summaryText}>{summary}</Text>
            </ScrollView>

            <View style={styles.actions}>
              <Pressable style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]} onPress={handleCopy}>
                <Text style={styles.btnText}>Copy to Clipboard</Text>
              </Pressable>
              {Platform.OS !== 'web' && (
                <Pressable style={({ pressed }) => [styles.btn, styles.outlineBtn, pressed && styles.btnPressed]} onPress={handleShare}>
                  <Text style={styles.outlineBtnText}>Share</Text>
                </Pressable>
              )}
            </View>
          </>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: LessonsTheme.background },
  header: {
    padding: 16,
    paddingTop: 48,
    borderBottomWidth: 1,
    borderBottomColor: LessonsTheme.border,
    backgroundColor: LessonsTheme.cardBg,
  },
  title: { fontSize: 20, fontWeight: '700', color: LessonsTheme.text },
  subtitle: { fontSize: 14, color: LessonsTheme.textMuted, marginTop: 4 },
  closeBtn: { alignSelf: 'flex-end', marginTop: 12, paddingVertical: 6, paddingHorizontal: 12 },
  closeBtnPressed: { opacity: 0.8 },
  closeBtnText: { color: LessonsTheme.primary, fontSize: 16, fontWeight: '600' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 24 },
  summaryText: { fontSize: 14, color: LessonsTheme.text, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', lineHeight: 22 },
  actions: { padding: 16, gap: 12, borderTopWidth: 1, borderTopColor: LessonsTheme.border, backgroundColor: LessonsTheme.cardBg },
  btn: { backgroundColor: LessonsTheme.primary, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  outlineBtn: { backgroundColor: 'transparent', borderWidth: 2, borderColor: LessonsTheme.primary },
  btnPressed: { opacity: 0.9 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  outlineBtnText: { color: LessonsTheme.primary, fontSize: 16, fontWeight: '600' },
});
