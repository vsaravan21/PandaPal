import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

export default function AIParsingScreen() {
  const params = useLocalSearchParams<{ payload?: string }>();
  let payload: { clinicalText?: string } | null = null;
  try {
    payload = params.payload ? JSON.parse(params.payload) : null;
  } catch {
    payload = null;
  }

  return (
    <View style={styles.container}>
      <Pressable
        style={({ pressed }) => [styles.backWrap, pressed && { opacity: 0.7 }]}
        onPress={() => router.back()}
        accessibilityLabel="Go back"
      >
        <Text style={styles.backText}>← Back</Text>
      </Pressable>
      <View style={styles.content}>
        <Text style={styles.title}>Review & Parse</Text>
        <Text style={styles.subtitle}>
          Care plan data received. (Stub screen — parsing not implemented.)
        </Text>
        {payload?.clinicalText ? (
          <Text style={styles.preview} numberOfLines={3}>
            {payload.clinicalText}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D9EEF9',
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2C2C2C',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B6B7B',
    lineHeight: 22,
  },
  preview: {
    marginTop: 16,
    fontSize: 14,
    color: '#6B6B7B',
  },
});
