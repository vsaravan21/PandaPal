/**
 * Caregiver PIN gate - verify PIN or redirect to set PIN
 */

import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import * as caregiverPinStorage from '@/features/auth/storage/caregiverPinStorage';
import { LessonsTheme } from '@/features/lessons/constants';

export default function CaregiverPinGateScreen() {
  const { setRole } = useAuth();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(true);
  const [hasPin, setHasPin] = useState(false);

  useEffect(() => {
    caregiverPinStorage.hasCaregiverPin().then((exists) => {
      setHasPin(exists);
      if (!exists) router.replace('/set-caregiver-pin');
      setChecking(false);
    });
  }, []);

  const handleVerify = async () => {
    if (!pin || pin.length < 4) {
      setError('Enter at least 4 digits');
      return;
    }
    const ok = await caregiverPinStorage.verifyCaregiverPin(pin);
    if (ok) {
      await setRole('caregiver');
      router.replace('/(caregiver)');
    } else {
      setError('Wrong PIN. Try again.');
      setPin('');
    }
  };

  if (checking || !hasPin) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter Caregiver PIN</Text>
      <TextInput
        style={styles.input}
        placeholder="PIN (4+ digits)"
        placeholderTextColor={LessonsTheme.textMuted}
        value={pin}
        onChangeText={(t) => { setPin(t.replace(/\D/g, '')); setError(''); }}
        keyboardType="number-pad"
        secureTextEntry
        maxLength={8}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable style={[styles.btn, (!pin || pin.length < 4) && styles.btnDisabled]} onPress={handleVerify} disabled={!pin || pin.length < 4}>
        <Text style={styles.btnText}>Continue</Text>
      </Pressable>
      <Pressable style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backText}>← Back</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: LessonsTheme.background, padding: 24, paddingTop: 80 },
  title: { fontSize: 22, fontWeight: '700', color: LessonsTheme.text, marginBottom: 16 },
  input: {
    backgroundColor: LessonsTheme.cardBg,
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: LessonsTheme.border,
  },
  error: { color: LessonsTheme.error, fontSize: 14, marginBottom: 12 },
  btn: { backgroundColor: LessonsTheme.primary, padding: 18, borderRadius: 12, alignItems: 'center', marginBottom: 24 },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: '#fff', fontSize: 17, fontWeight: '600' },
  backBtn: { alignSelf: 'flex-start' },
  backText: { color: LessonsTheme.primary, fontSize: 16, fontWeight: '600' },
});
