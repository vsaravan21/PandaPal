import {
  UploadBottomSheet,
  type DocumentCategory,
} from '@/components/UploadBottomSheet';
import * as DocumentPicker from 'expo-document-picker';
import { router } from 'expo-router';
import { setPendingCarePlan } from '@/features/backend/pendingCarePlan';
import { useCallback, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

export type UploadedFileWithCategory = {
  name: string;
  uri: string;
  category: DocumentCategory;
};

export default function CaregiverUploadScreen() {
  const [sheetVisible, setSheetVisible] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileWithCategory[]>([]);
  const [clinicalText, setClinicalText] = useState('');

  const totalUploadedFiles = uploadedFiles.length;
  const canContinue = totalUploadedFiles > 0 || clinicalText.trim().length > 0;

  const pickDocument = useCallback(
    async (category: DocumentCategory): Promise<boolean> => {
      try {
        const result = await DocumentPicker.getDocumentAsync({
          type: 'application/pdf',
          copyToCacheDirectory: true,
          multiple: true,
        });
        if (result.canceled) return false;
        const newFiles: UploadedFileWithCategory[] = result.assets.map((a) => ({
          name: a.name ?? 'Document',
          uri: a.uri,
          category,
        }));
        setUploadedFiles((prev) => [...prev, ...newFiles]);
        return newFiles.length > 0;
      } catch (e) {
        Alert.alert('Upload', 'Could not open file picker. Please try again.');
        return false;
      }
    },
    []
  );

  const handleSelectCategory = useCallback(
    async (category: DocumentCategory) => {
      const added = await pickDocument(category);
      if (added) setSheetVisible(false);
    },
    [pickDocument]
  );

  const removeFile = useCallback((index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleContinue = () => {
    if (!canContinue) return;
    const payload = {
      uploadedFiles: uploadedFiles.map((f) => ({
        name: f.name,
        uri: f.uri,
        categoryId: f.category.id,
      })),
      clinicalText: clinicalText.trim(),
    };
    setPendingCarePlan(
      payload.uploadedFiles.map((f) => ({ uri: f.uri, name: f.name, categoryId: f.categoryId })),
      payload.clinicalText
    );
    router.push({
      pathname: '/ai-parsing',
      params: { payload: JSON.stringify(payload) },
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerRow}>
          <Pressable
            style={({ pressed }) => [styles.backWrap, pressed && { opacity: 0.7 }]}
            onPress={() => router.back()}
            accessibilityLabel="Go back"
          >
            <Text style={styles.backText}>←</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.skipWrap, pressed && { opacity: 0.7 }]}
            onPress={() => router.replace('/parent-signup')}
            accessibilityLabel="Skip to create account"
          >
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        </View>

        <Text style={styles.title}>Upload Care Plan Details</Text>

        <Image
          source={require('../assets/images/doctor panda.jpg')}
          style={styles.doctorPandaImage}
          resizeMode="contain"
        />

        <Pressable
          style={({ pressed }) => [styles.primaryCard, pressed && styles.primaryCardPressed]}
          onPress={() => setSheetVisible(true)}
        >
          <Text style={styles.primaryCardTitle}>Upload Medical Documents</Text>
          <Text style={styles.primaryCardDescription}>
            Care plans, medication, discharge reports & more
          </Text>
          <View style={styles.uploadButtonWrap}>
            <Text style={styles.uploadButtonText}>Upload</Text>
          </View>
        </Pressable>

        {uploadedFiles.length > 0 && (
          <View style={styles.attachedSection}>
            {uploadedFiles.map((file, index) => (
              <View key={`${file.uri}-${index}`} style={styles.attachedRow}>
                <View style={styles.attachedInfo}>
                  <Text style={styles.attachedName} numberOfLines={1}>
                    {file.name}
                  </Text>
                  <View style={styles.categoryTag}>
                    <Text style={styles.categoryTagText}>{file.category.title}</Text>
                  </View>
                </View>
                <Pressable
                  style={({ pressed }) => [styles.removeButton, pressed && { opacity: 0.7 }]}
                  onPress={() => removeFile(index)}
                  accessibilityLabel={`Remove ${file.name}`}
                >
                  <Text style={styles.removeButtonText}>Remove</Text>
                </Pressable>
              </View>
            ))}
          </View>
        )}

        <View style={styles.textCard}>
          <Text style={styles.textCardTitle}>Add Clinical Instructions by Text</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Paste medication rules, safety steps, or care instructions here"
            placeholderTextColor="#999"
            value={clinicalText}
            onChangeText={setClinicalText}
            multiline
            textAlignVertical="top"
          />
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.continueButton,
            !canContinue && styles.continueButtonDisabled,
            pressed && canContinue && styles.continueButtonPressed,
          ]}
          onPress={handleContinue}
          disabled={!canContinue}
          accessibilityLabel="Continue to Review"
        >
          <Text style={styles.continueButtonText}>Continue to Review</Text>
        </Pressable>
      </ScrollView>

      <UploadBottomSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        onSelectCategory={handleSelectCategory}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e0eeee',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  backWrap: {
    paddingVertical: 12,
    paddingRight: 16,
    marginBottom: 8,
    minHeight: 48,
    justifyContent: 'center',
  },
  backText: {
    color: '#8BC34A',
    fontSize: 17,
    fontWeight: '600',
  },
  skipWrap: {
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  skipText: {
    color: '#8BC34A',
    fontSize: 15,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2C2C2C',
    marginBottom: 6,
    textAlign: 'center',
  },
  doctorPandaImage: {
    width: 200,
    height: 200,
    marginBottom: 8,
    alignSelf: 'center',
  },
  primaryCard: {
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
  primaryCardPressed: {
    opacity: 0.98,
  },
  primaryCardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2C2C2C',
    marginBottom: 6,
    textAlign: 'center',
  },
  primaryCardDescription: {
    fontSize: 13,
    color: '#6B6B7B',
    lineHeight: 19,
    marginBottom: 20,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  uploadButtonWrap: {
    alignSelf: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
    backgroundColor: 'rgba(139, 195, 74, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(139, 195, 74, 0.5)',
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5a8a2d',
  },
  attachedSection: {
    marginBottom: 16,
    gap: 10,
  },
  attachedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  attachedInfo: {
    flex: 1,
    marginRight: 12,
  },
  attachedName: {
    fontSize: 15,
    color: '#2C2C2C',
    marginBottom: 4,
  },
  categoryTag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(139, 195, 74, 0.2)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  categoryTagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#5a8a2d',
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
  textCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  textCardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2C2C2C',
    marginBottom: 12,
    textAlign: 'center',
  },
  textInput: {
    backgroundColor: 'rgba(0,0,0,0.04)',
    borderRadius: 12,
    padding: 14,
    fontSize: 13,
    color: '#2C2C2C',
    fontStyle: 'italic',
    minHeight: 120,
    maxHeight: 200,
  },
  continueButton: {
    backgroundColor: '#8BC34A',
    paddingVertical: 18,
    borderRadius: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonPressed: {
    opacity: 0.9,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});
