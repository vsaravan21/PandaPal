/**
 * Set Caregiver PIN - first-time creation or change
 */

import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import * as caregiverPinStorage from '@/features/auth/storage/caregiverPinStorage';
import { LessonsTheme } from '@/features/lessons/constants';

const MIN_LENGTH = 4;

export default function SetCaregiverPinScreen() {
  const { setRole } = useAuth();
  const [step, setStep] = useState<'check' | 'verify' | 'create'>('check');
  const [isChanging, setIsChanging] = useState(false);
  const [currentPin, setCurrentPin] = useState('');
  const [pin, setPin] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    caregiverPinStorage.hasCaregiverPin().then((exists) => {
      setStep(exists ? 'verify' : 'create');
      setIsChanging(!!exists);
    });
  }, []);

  const handleVerify = async () => {
    setError('');
    if (currentPin.length < MIN_LENGTH) {
      setError('Enter at least 4 digits');
      return;
    }
    const ok = await caregiverPinStorage.verifyCaregiverPin(currentPin);
    if (ok) {
      setStep('create');
      setCurrentPin('');
    } else {
      setError('Wrong PIN. Try again.');
      setCurrentPin('');
    }
  };

  const handleSetPin = async () => {
    setError('');
    if (pin.length < MIN_LENGTH) {
      setError(`PIN must be at least ${MIN_LENGTH} digits`);
      return;
    }
    if (pin !== confirm) {
      setError('PINs do not match');
      return;
    }
    await caregiverPinStorage.setCaregiverPin(pin);
    if (!isChanging) await setRole('caregiver');
    router.replace('/(caregiver)');
  };

  if (step === 'check') return null;

  if (step === 'verify') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Change Caregiver PIN</Text>
        <Text style={styles.subtitle}>Enter your current PIN</Text>
        <TextInput
          style={styles.input}
          placeholder="Current PIN"
          placeholderTextColor={LessonsTheme.textMuted}
          value={currentPin}
          onChangeText={(t) => { setCurrentPin(t.replace(/\D/g, '')); setError(''); }}
          keyboardType="number-pad"
          secureTextEntry
          maxLength={8}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Pressable
          style={[styles.btn, currentPin.length < MIN_LENGTH && styles.btnDisabled]}
          onPress={handleVerify}
          disabled={currentPin.length < MIN_LENGTH}
        >
          <Text style={styles.btnText}>Continue</Text>
        </Pressable>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
      </View>
    );
  }

  const pinOk = pin.length >= MIN_LENGTH;
  const match = pin === confirm && confirm.length >= MIN_LENGTH;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Caregiver PIN</Text>
      <Text style={styles.subtitle}>Use at least 4 digits. You'll need this to open Caregiver Mode.</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter PIN"
        placeholderTextColor={LessonsTheme.textMuted}
        value={pin}
        onChangeText={(t) => { setPin(t.replace(/\D/g, '')); setError(''); }}
        keyboardType="number-pad"
        secureTextEntry
        maxLength={8}
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm PIN"
        placeholderTextColor={LessonsTheme.textMuted}
        value={confirm}
        onChangeText={(t) => { setConfirm(t.replace(/\D/g, '')); setError(''); }}
        keyboardType="number-pad"
        secureTextEntry
        maxLength={8}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable
        style={[styles.btn, (!pinOk || !match) && styles.btnDisabled]}
        onPress={handleSetPin}
        disabled={!pinOk || !match}
      >
        <Text style={styles.btnText}>Create PIN & Continue</Text>
      </Pressable>
      <Pressable style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backText}>← Back</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: LessonsTheme.background, padding: 24, paddingTop: 80 },
  title: { fontSize: 22, fontWeight: '700', color: LessonsTheme.text, marginBottom: 8 },
  subtitle: { fontSize: 15, color: LessonsTheme.textMuted, marginBottom: 24 },
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
