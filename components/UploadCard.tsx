import { View, Text, StyleSheet, Pressable } from 'react-native';

export type UploadFileInfo = { name: string; uri: string };

type UploadCardProps = {
  label: string;
  helper: string;
  files: UploadFileInfo[];
  onUpload: () => void;
  onRemoveFile: (index: number) => void;
  iconPlaceholder?: React.ReactNode;
};

export function UploadCard({
  label,
  helper,
  files,
  onUpload,
  onRemoveFile,
  iconPlaceholder,
}: UploadCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.iconRow}>
        {iconPlaceholder ?? (
          <View style={styles.iconPlaceholder}>
            <Text style={styles.iconPlaceholderText}>📄</Text>
          </View>
        )}
      </View>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.helper}>{helper}</Text>

      <Pressable
        style={({ pressed }) => [styles.uploadButton, pressed && styles.uploadButtonPressed]}
        onPress={onUpload}
        accessibilityLabel={`Upload file for ${label}`}
      >
        <Text style={styles.uploadButtonText}>Upload File</Text>
      </Pressable>

      {files.length > 0 && (
        <View style={styles.fileList}>
          {files.map((file, index) => (
            <View key={`${file.uri}-${index}`} style={styles.fileRow}>
              <Text style={styles.fileName} numberOfLines={1}>
                {file.name}
              </Text>
              <Pressable
                style={({ pressed }) => [styles.removeButton, pressed && { opacity: 0.7 }]}
                onPress={() => onRemoveFile(index)}
                accessibilityLabel={`Remove ${file.name}`}
              >
                <Text style={styles.removeButtonText}>Remove</Text>
              </Pressable>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  iconRow: {
    marginBottom: 12,
  },
  iconPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(139, 195, 74, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPlaceholderText: {
    fontSize: 22,
  },
  label: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2C2C2C',
    marginBottom: 4,
  },
  helper: {
    fontSize: 14,
    color: '#6B6B7B',
    marginBottom: 16,
    lineHeight: 20,
  },
  uploadButton: {
    backgroundColor: 'rgba(139, 195, 74, 0.2)',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(139, 195, 74, 0.5)',
  },
  uploadButtonPressed: {
    opacity: 0.9,
  },
  uploadButtonText: {
    color: '#5a8a2d',
    fontSize: 16,
    fontWeight: '600',
  },
  fileList: {
    marginTop: 12,
    gap: 8,
  },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.04)',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  fileName: {
    flex: 1,
    fontSize: 14,
    color: '#2C2C2C',
    marginRight: 8,
  },
  removeButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  removeButtonText: {
    color: '#c62828',
    fontSize: 14,
    fontWeight: '600',
  },
});
