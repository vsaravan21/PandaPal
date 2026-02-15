/**
 * Role Select - Kid or Adult (Caregiver)
 */

import { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function RoleSelectScreen() {
  const { hasPanda, setRole, loading } = useAuth();

  useEffect(() => {
    if (!loading && !hasPanda) {
      router.replace('/');
    }
  }, [hasPanda, loading]);

  if (loading || !hasPanda) {
    return null;
  }

  const handleKid = async () => {
    await setRole('kid');
    router.replace('/(tabs)');
  };

  const handleAdult = () => {
    router.push('/caregiver-pin-gate');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Who's using PandaPal?</Text>
      <Text style={styles.subtitle}>Choose how you want to explore</Text>

      <Pressable
        style={({ pressed }) => [styles.button, styles.kidButton, pressed && styles.buttonPressed]}
        onPress={handleKid}
      >
        <Text style={styles.emoji}>🐼</Text>
        <Text style={styles.buttonTitle}>I'm a Kid</Text>
        <Text style={styles.buttonDesc}>Jump right into quests and adventures!</Text>
      </Pressable>

      <Pressable
        style={({ pressed }) => [styles.button, styles.adultButton, pressed && styles.buttonPressed]}
        onPress={handleAdult}
      >
        <Text style={styles.emoji}>👤</Text>
        <Text style={styles.buttonTitle}>I'm an Adult (Caregiver)</Text>
        <Text style={styles.buttonDesc}>View progress, trends, and care plan</Text>
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
    marginBottom: 32,
  },
  button: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    minHeight: 120,
    justifyContent: 'center',
  },
  kidButton: {
    backgroundColor: '#8CE0A1',
  },
  adultButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#2D7D46',
  },
  buttonPressed: {
    opacity: 0.9,
  },
  emoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  buttonTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  buttonDesc: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
});
