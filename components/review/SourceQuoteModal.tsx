import { Modal, View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';

type Props = {
  visible: boolean;
  quote: string;
  onClose: () => void;
};

export function SourceQuoteModal({ visible, quote, onClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.box} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.title}>From uploaded document</Text>
          <ScrollView style={styles.quoteScroll} showsVerticalScrollIndicator={false}>
            <Text style={styles.quote}>{quote || 'No quote available.'}</Text>
          </ScrollView>
          <Pressable
            style={({ pressed }) => [styles.button, pressed && { opacity: 0.9 }]}
            onPress={onClose}
          >
            <Text style={styles.buttonText}>Close</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    padding: 24,
  },
  box: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    maxHeight: '70%',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2C2C2C',
    marginBottom: 12,
  },
  quoteScroll: { maxHeight: 200, marginBottom: 20 },
  quote: {
    fontSize: 15,
    color: '#6B6B7B',
    lineHeight: 22,
  },
  button: {
    backgroundColor: '#8BC34A',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
