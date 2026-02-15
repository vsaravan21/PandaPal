/**
 * Set Caregiver PIN - create + confirm
 */

import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { setCaregiverPin } from '@/features/auth/storage/caregiverPinStorage';

export default function SetCaregiverPinScreen() {
  const { setRole } = useAuth();
  const [pin, setPin] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');

  const handleSet = async () => {
    setError('');
    if (pin.length < 4) {
      setError('PIN must be at least 4 digits');
      return;
    }
    if (pin !== confirm) {
      setError('PINs do not match');
      return;
    }
    await setCaregiverPin(pin);
    await setRole('caregiver');
    router.replace('/(caregiver)');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Set Caregiver PIN</Text>
      <Text style={styles.subtitle}>Create a PIN to access caregiver features. Keep it safe!</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter PIN (4+ digits)"
        placeholderTextColor="#999"
        value={pin}
        onChangeText={(t) => {
          setPin(t);
          setError('');
        }}
        secureTextEntry
        keyboardType="number-pad"
        maxLength={8}
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm PIN"
        placeholderTextColor="#999"
        value={confirm}
        onChangeText={(t) => {
          setConfirm(t);
          setError('');
        }}
        secureTextEntry
        keyboardType="number-pad"
        maxLength={8}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable
        style={({ pressed }) => [
          styles.button,
          (pin.length < 4 || confirm !== pin) && styles.buttonDisabled,
          pressed && styles.buttonPressed,
        ]}
        onPress={handleSet}
        disabled={pin.length < 4 || confirm !== pin}
      >
        <Text style={styles.buttonText}>Set PIN & Continue</Text>
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
    marginBottom: 16,
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
