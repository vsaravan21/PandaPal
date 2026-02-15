import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { UploadCard, type UploadFileInfo } from '@/components/UploadCard';

const CARD_KEYS = [
  'discharge',
  'seizure',
  'medication',
  'other',
] as const;

type CardKey = (typeof CARD_KEYS)[number];

const CARD_CONFIG: Record<
  CardKey,
  { label: string; helper: string; acceptTypes: string }
> = {
  discharge: {
    label: 'Upload discharge instructions',
    helper: 'Hospital or clinic discharge papers',
    acceptTypes: 'PDF',
  },
  seizure: {
    label: 'Upload seizure action plan',
    helper: 'Emergency and response protocol',
    acceptTypes: 'PDF',
  },
  medication: {
    label: 'Upload medication schedule',
    helper: 'Dose timing and medication list',
    acceptTypes: 'PDF',
  },
  other: {
    label: 'Other clinical documents',
    helper: 'Any additional care instructions',
    acceptTypes: 'PDF',
  },
};

export default function CaregiverUploadScreen() {
  const [filesByCard, setFilesByCard] = useState<Record<CardKey, UploadFileInfo[]>>({
    discharge: [],
    seizure: [],
    medication: [],
    other: [],
  });
  const [clinicalText, setClinicalText] = useState('');

  const totalUploadedFiles = CARD_KEYS.reduce((sum, key) => sum + filesByCard[key].length, 0);
  const canContinue = totalUploadedFiles > 0 || clinicalText.trim().length > 0;

  const pickDocument = useCallback(async (cardKey: CardKey) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
        multiple: true,
      });
      if (result.canceled) return;
      const newFiles: UploadFileInfo[] = result.assets.map((a) => ({
        name: a.name ?? 'Document',
        uri: a.uri,
      }));
      setFilesByCard((prev) => ({
        ...prev,
        [cardKey]: [...prev[cardKey], ...newFiles],
      }));
    } catch (e) {
      Alert.alert('Upload', 'Could not open file picker. Please try again.');
    }
  }, []);

  const removeFile = useCallback((cardKey: CardKey, index: number) => {
    setFilesByCard((prev) => ({
      ...prev,
      [cardKey]: prev[cardKey].filter((_, i) => i !== index),
    }));
  }, []);

  const handleContinue = () => {
    if (!canContinue) return;
    const payload = {
      filesByCard: Object.fromEntries(
        CARD_KEYS.map((k) => [k, filesByCard[k].map((f) => ({ name: f.name, uri: f.uri }))])
      ) as Record<string, { name: string; uri: string }[]>,
      clinicalText: clinicalText.trim(),
    };
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
        <Text style={styles.title}>Upload Care Plan Details</Text>
        <Text style={styles.subtitle}>
          We turn clinical instructions into daily Panda quests
        </Text>

        {CARD_KEYS.map((key) => (
          <UploadCard
            key={key}
            label={CARD_CONFIG[key].label}
            helper={CARD_CONFIG[key].helper}
            files={filesByCard[key]}
            onUpload={() => pickDocument(key)}
            onRemoveFile={(index) => removeFile(key, index)}
          />
        ))}

        <Text style={styles.supportedFormats}>
          Supported format: PDF
        </Text>

        <View style={styles.textCard}>
          <Text style={styles.textCardTitle}>Or paste clinical text</Text>
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
            styles.primaryButton,
            !canContinue && styles.primaryButtonDisabled,
            pressed && canContinue && styles.primaryButtonPressed,
          ]}
          onPress={handleContinue}
          disabled={!canContinue}
          accessibilityLabel="Continue to Review"
        >
          <Text style={styles.primaryButtonText}>Continue to Review</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D9EEF9',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2C2C2C',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B6B7B',
    marginBottom: 24,
    lineHeight: 22,
  },
  supportedFormats: {
    fontSize: 12,
    color: '#6B6B7B',
    marginBottom: 20,
    marginTop: -4,
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
  },
  textInput: {
    backgroundColor: 'rgba(0,0,0,0.04)',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#2C2C2C',
    minHeight: 120,
    maxHeight: 200,
  },
  primaryButton: {
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
  primaryButtonDisabled: {
    opacity: 0.5,
  },
  primaryButtonPressed: {
    opacity: 0.9,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});
