import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, TextInput } from 'react-native';

type Props = {
  visible: boolean;
  initialText: string;
  isNew: boolean;
  onSave: (text: string) => void;
  onDelete?: () => void;
  onClose: () => void;
};

export function EditTaskBottomSheet({ visible, initialText, isNew, onSave, onDelete, onClose }: Props) {
  const [text, setText] = useState(initialText);

  useEffect(() => {
    if (visible) setText(initialText);
  }, [visible, initialText]);

  const handleSave = () => {
    const trimmed = text.trim() || (isNew ? 'Task' : '');
    if (trimmed) onSave(trimmed);
    onClose();
  };

  const handleDelete = () => {
    onDelete?.();
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal visible transparent animationType="slide">
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View style={styles.sheet} onStartShouldSetResponder={() => true}>
          <Text style={styles.title}>{isNew ? 'New Task' : 'Edit Task'}</Text>
          <TextInput
            style={styles.input}
            placeholder="Task"
            value={text}
            onChangeText={setText}
            placeholderTextColor="#999"
            multiline
            textAlignVertical="top"
          />
          <Pressable style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>Save</Text>
          </Pressable>
          {!isNew && onDelete && (
            <Pressable style={styles.deleteAction} onPress={handleDelete}>
              <Text style={styles.deleteActionText}>Delete task</Text>
            </Pressable>
          )}
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2C2C2C',
    marginBottom: 16,
  },
  input: {
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#2C2C2C',
    minHeight: 100,
    marginBottom: 16,
  },
  saveBtn: {
    backgroundColor: '#8BC34A',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  deleteAction: {
    marginTop: 16,
    alignItems: 'center',
  },
  deleteActionText: {
    fontSize: 14,
    color: '#c62828',
    fontWeight: '600',
  },
});
