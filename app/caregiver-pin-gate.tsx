/**
 * Caregiver PIN Gate - verify PIN or redirect to Set PIN
 */

import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, Alert } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { hasCaregiverPin, verifyCaregiverPin } from '@/features/auth/storage/caregiverPinStorage';

export default function CaregiverPinGateScreen() {
  const { setRole } = useAuth();
  const [checking, setChecking] = useState(true);
  const [needsSetPin, setNeedsSetPin] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    hasCaregiverPin().then((has) => {
      setNeedsSetPin(!has);
      setChecking(false);
    });
  }, []);

  useEffect(() => {
    if (!checking && needsSetPin) {
      router.replace('/set-caregiver-pin');
    }
  }, [checking, needsSetPin]);

  const handleVerify = async () => {
    if (!pin.trim()) return;
    const ok = await verifyCaregiverPin(pin);
    if (ok) {
      await setRole('caregiver');
      router.replace('/(caregiver)');
    } else {
      setError('Incorrect PIN. Try again.');
      setPin('');
    }
  };

  if (checking) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Caregiver Access</Text>
      <Text style={styles.subtitle}>Enter your PIN to continue</Text>

      <TextInput
        style={styles.input}
        placeholder="PIN"
        placeholderTextColor="#999"
        value={pin}
        onChangeText={(t) => {
          setPin(t);
          setError('');
        }}
        secureTextEntry
        keyboardType="number-pad"
        maxLength={6}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable
        style={({ pressed }) => [styles.button, (!pin.trim() && styles.buttonDisabled) || (pressed && styles.buttonPressed)]}
        onPress={handleVerify}
        disabled={!pin.trim()}
      >
        <Text style={styles.buttonText}>Continue</Text>
      </Pressable>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e8f4f0',
    paddingHorizontal: 24,
    paddingTop: 80,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 18,
    fontSize: 18,
    color: '#333',
    marginBottom: 8,
  },
  error: {
    fontSize: 14,
    color: '#c0392b',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#2D7D46',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonPressed: {
    opacity: 0.9,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});
