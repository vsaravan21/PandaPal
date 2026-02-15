import { useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Animated, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { PinInput } from '@/components/PinInput';
import { getPendingPin, getParentToken, clearPendingPin } from '@/lib/parentAuthStore';
import { API_BASE_URL } from '@/constants/api';

export default function ConfirmPinScreen() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const canSubmit = pin.length === 4;

  const runShake = useCallback(() => {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 1, duration: 40, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 2, duration: 40, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 3, duration: 40, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 4, duration: 40, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 0, useNativeDriver: true }),
    ]).start();
  }, [shakeAnim]);

  const handleSubmit = useCallback(async () => {
    if (!canSubmit || loading) return;
    const firstPin = getPendingPin();
    if (firstPin !== pin) {
      setError('PINs did not match. Try again.');
      setPin('');
      runShake();
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const token = getParentToken();
      const res = await fetch(`${API_BASE_URL}/api/parent/set-pin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ pin }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.message || data.error || 'Could not set PIN. Try again.');
        setLoading(false);
        return;
      }
      clearPendingPin();
      router.replace('/parent-setup-success');
    } catch {
      setError('Connection error. Try again.');
    } finally {
      setLoading(false);
    }
  }, [pin, canSubmit, loading, runShake]);

  const translateX = shakeAnim.interpolate({
    inputRange: [0, 1, 2, 3, 4],
    outputRange: [0, -8, 8, -8, 0],
  });

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <Pressable style={styles.backWrap} onPress={() => router.back()} hitSlop={12}>
        <Text style={styles.backText}>←</Text>
      </Pressable>
      <Text style={styles.title}>Confirm Parent PIN</Text>
      <Text style={styles.subtitle}>Enter the same 4 digit PIN again</Text>

      <Animated.View style={[styles.card, { transform: [{ translateX }] }]}>
        <PinInput length={4} value={pin} onChange={(v) => { setPin(v); setError(null); }} masked />
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <Pressable
          style={[styles.primaryBtn, (!canSubmit || loading) && styles.primaryBtnDisabled]}
          onPress={handleSubmit}
          disabled={!canSubmit || loading}
          hitSlop={12}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.primaryBtnText}>Confirm PIN</Text>
          )}
        </Pressable>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 56, paddingBottom: 40, alignItems: 'center' },
  backWrap: { alignSelf: 'flex-start', paddingVertical: 12, paddingRight: 16, minHeight: 48, justifyContent: 'center', marginBottom: 8 },
  backText: { color: '#8BC34A', fontSize: 17, fontWeight: '600' },
  title: { fontSize: 24, fontWeight: '700', color: '#2C2C2C', textAlign: 'center', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#6B6B7B', textAlign: 'center', marginBottom: 32 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  errorText: { fontSize: 14, color: '#c62828', marginTop: 12, marginBottom: 8, textAlign: 'center' },
  primaryBtn: { backgroundColor: '#8BC34A', paddingVertical: 18, paddingHorizontal: 48, borderRadius: 28, alignSelf: 'stretch', alignItems: 'center', marginTop: 8 },
  primaryBtnDisabled: { opacity: 0.6 },
  primaryBtnText: { color: '#fff', fontSize: 18, fontWeight: '700' },
});
