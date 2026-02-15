import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Image } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { API_BASE_URL } from '@/constants/api';

type Payload = {
  uploadedFiles?: Array<{ name: string; uri: string; categoryId: string }>;
  clinicalText?: string;
};

export default function AIParsingScreen() {
  const params = useLocalSearchParams<{ payload?: string }>();
  const [status, setStatus] = useState<'loading' | 'done' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let payload: Payload | null = null;
    try {
      payload = params.payload ? JSON.parse(params.payload) : null;
    } catch {
      payload = null;
    }

    if (!payload) {
      setStatus('error');
      setErrorMessage('No upload data');
      return;
    }

    const run = async () => {
      const formData = new FormData();
      const files = payload!.uploadedFiles || [];
      for (const f of files) {
        formData.append('files', {
          uri: f.uri,
          name: f.name || 'document.pdf',
          type: 'application/pdf',
        } as unknown as Blob);
      }
      const pasted = (payload!.clinicalText || '').trim();
      if (pasted) formData.append('pasted_text', pasted);

      if (files.length === 0 && !pasted) {
        setStatus('error');
        setErrorMessage('No files or text to parse');
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/api/upload`, {
          method: 'POST',
          body: formData,
          headers: {},
        });
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          setStatus('error');
          setErrorMessage(data.message || data.error || 'Parsing failed');
          return;
        }

        const parsed_plan = data.parsed_plan;
        if (!parsed_plan) {
          setStatus('error');
          setErrorMessage('No care plan in response');
          return;
        }

        setStatus('done');
        const skipped = data.skipped_files || [];
        router.replace({
          pathname: '/review-care-plan',
          params: {
            parsed_plan: JSON.stringify(parsed_plan),
            skipped_count: String(skipped.length),
          },
        });
      } catch (e) {
        setStatus('error');
        setErrorMessage(e instanceof Error ? e.message : 'Network error');
      }
    };

    run();
  }, [params.payload]);

  return (
    <View style={styles.container}>
      <Pressable
        style={({ pressed }) => [styles.backWrap, pressed && { opacity: 0.7 }]}
        onPress={() => router.back()}
        accessibilityLabel="Go back"
      >
        <Text style={styles.backText}>←</Text>
      </Pressable>

      {status === 'loading' && (
        <View style={[styles.centered, styles.loadingCentered]}>
          <Image
            source={require('../assets/images/Builder Panda.png')}
            style={styles.loadingImage}
            resizeMode="contain"
          />
          <Text style={styles.loadingText}>Analyzing your documents to create the care plan</Text>
          <ActivityIndicator size="large" color="#8BC34A" />
        </View>
      )}

      {status === 'error' && (
        <View style={styles.centered}>
          <Text style={styles.errorTitle}>Could not parse documents</Text>
          <Text style={styles.errorText}>{errorMessage}</Text>
          <Pressable
            style={styles.retryBtn}
            onPress={() => router.back()}
          >
            <Text style={styles.retryBtnText}>Go back</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F4F0',
  },
  backWrap: {
    alignSelf: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 24,
    paddingTop: 56,
    minHeight: 48,
    justifyContent: 'center',
  },
  backText: {
    color: '#8BC34A',
    fontSize: 17,
    fontWeight: '600',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  loadingCentered: {
    marginTop: -48,
  },
  loadingImage: {
    width: 200,
    height: 200,
    marginBottom: 24,
  },
  loadingText: {
    marginBottom: 16,
    fontSize: 15,
    color: '#6B6B7B',
    textAlign: 'center',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2C2C2C',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 15,
    color: '#6B6B7B',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryBtn: {
    backgroundColor: '#8BC34A',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
  },
  retryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
