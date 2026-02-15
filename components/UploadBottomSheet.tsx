import { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Dimensions,
  Animated,
  PanResponder,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = Math.min(SCREEN_HEIGHT * 0.78, 620);

export type DocumentCategory = {
  id: string;
  title: string;
  subtitle: string;
};

const CATEGORIES: DocumentCategory[] = [
  { id: 'discharge', title: 'Discharge and Visit Papers', subtitle: 'Visit and Discharge Summaries' },
  { id: 'seizure', title: 'Seizure Action Plan', subtitle: 'Emergency and response protocol' },
  { id: 'medication', title: 'Medication Schedule', subtitle: 'Dose timing and medication list' },
  { id: 'reports', title: 'Test and Doctor Reports', subtitle: 'EEG, MRI, neurology notes' },
  { id: 'other', title: 'Other Medical Document', subtitle: 'Any other clinical document' },
];

type UploadBottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  onSelectCategory: (category: DocumentCategory) => void;
};

export function UploadBottomSheet({ visible, onClose, onSelectCategory }: UploadBottomSheetProps) {
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          damping: 20,
          stiffness: 200,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: SHEET_HEIGHT,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, translateY, backdropOpacity]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 5,
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 80 || gestureState.vy > 0.3) {
          onClose();
        }
      },
    })
  ).current;

  const handleBackdropPress = () => onClose();

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={StyleSheet.absoluteFill}>
        <Animated.View
          style={[styles.backdrop, { opacity: backdropOpacity }]}
          pointerEvents={visible ? 'auto' : 'none'}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={handleBackdropPress} />
        </Animated.View>

        <Animated.View
          style={[styles.sheet, { height: SHEET_HEIGHT, transform: [{ translateY }] }]}
        >
          <View {...panResponder.panHandlers} style={styles.handleWrap}>
            <View style={styles.handle} />
          </View>

          <View style={styles.header}>
            <View style={styles.headerTextWrap}>
              <Text style={styles.headerTitle}>Choose document type</Text>
              <Text style={styles.headerSubtext}>Supported format: PDF</Text>
            </View>
            <Pressable
              style={({ pressed }) => [styles.closeButton, pressed && { opacity: 0.7 }]}
              onPress={onClose}
              accessibilityLabel="Close"
              hitSlop={12}
            >
              <Ionicons name="close" size={24} color="#2C2C2C" />
            </Pressable>
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {CATEGORIES.map((category) => (
              <View key={category.id} style={styles.row}>
                <Pressable
                  style={({ pressed }) => [styles.rowCard, pressed && styles.rowCardPressed]}
                  onPress={() => onSelectCategory(category)}
                >
                  <View style={styles.rowTextWrap}>
                    <Text style={styles.rowTitle}>{category.title}</Text>
                    <Text style={styles.rowSubtitle}>{category.subtitle}</Text>
                  </View>
                  <View style={styles.uploadButtonWrap}>
                    <Text style={styles.uploadButtonText}>+</Text>
                  </View>
                </Pressable>
              </View>
            ))}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#e8f4f0',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  handleWrap: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 16,
    paddingTop: 4,
  },
  headerTextWrap: {
    flex: 1,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2C2C2C',
    textAlign: 'left',
  },
  headerSubtext: {
    fontSize: 12,
    color: '#6B6B7B',
    marginTop: 4,
    textAlign: 'left',
  },
  closeButton: {
    padding: 4,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    gap: 12,
  },
  row: {
    marginBottom: 4,
  },
  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  rowCardPressed: {
    opacity: 0.95,
  },
  rowTextWrap: {
    flex: 1,
    marginRight: 12,
  },
  rowTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2C2C2C',
    marginBottom: 2,
    textAlign: 'left',
  },
  rowSubtitle: {
    fontSize: 12,
    color: '#6B6B7B',
    lineHeight: 18,
    fontStyle: 'italic',
    textAlign: 'left',
  },
  uploadButtonWrap: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: 'rgba(139, 195, 74, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(139, 195, 74, 0.5)',
  },
  uploadButtonText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#5a8a2d',
    lineHeight: 26,
  },
});
