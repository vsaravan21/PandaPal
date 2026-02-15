/**
 * Export summary modal - copy / share
 */

import { View, Text, StyleSheet, Modal, Pressable } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Share } from 'react-native';
import { LessonsTheme } from '@/features/lessons/constants';

interface ExportSummaryModalProps {
  visible: boolean;
  onClose: () => void;
  summary: string;
}

export function ExportSummaryModal({ visible, onClose, summary }: ExportSummaryModalProps) {
  const handleCopy = async () => {
    await Clipboard.setStringAsync(summary);
    onClose();
  };

  const handleShare = async () => {
    try {
      await Share.share({ message: summary, title: 'PandaPal Care Summary' });
    } catch {}
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Export Summary</Text>
          <Text style={styles.preview} numberOfLines={6}>
            {summary}
          </Text>
          <View style={styles.row}>
            <Pressable style={styles.btn} onPress={handleCopy}>
              <Text style={styles.btnText}>Copy</Text>
            </Pressable>
            <Pressable style={styles.btn} onPress={handleShare}>
              <Text style={styles.btnText}>Share</Text>
            </Pressable>
          </View>
          <Pressable style={styles.cancelBtn} onPress={onClose}>
            <Text style={styles.cancelText}>Close</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end', padding: 0 },
  card: { backgroundColor: LessonsTheme.cardBg, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 },
  title: { fontSize: 18, fontWeight: '700', color: LessonsTheme.text, marginBottom: 12 },
  preview: { fontSize: 14, color: LessonsTheme.textMuted, marginBottom: 20, maxHeight: 120 },
  row: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  btn: { flex: 1, backgroundColor: LessonsTheme.primary, padding: 14, borderRadius: 12, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '600' },
  cancelBtn: { alignItems: 'center', paddingVertical: 12 },
  cancelText: { color: LessonsTheme.textMuted, fontSize: 15 },
});
