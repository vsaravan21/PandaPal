/**
 * Role select - Who's using PandaPal?
 * Reachable only after login/onboarding.
 */

import { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { LessonsTheme } from '@/features/lessons/constants';
import { Ionicons } from '@expo/vector-icons';

export default function RoleSelectScreen() {
  const { hasPanda, setRole, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!hasPanda) {
      router.replace('/');
      return;
    }
  }, [hasPanda, loading]);

  const handleKid = async () => {
    await setRole('kid');
    router.replace('/(tabs)');
  };

  const handleAdult = () => {
    router.push('/caregiver-pin-gate');
  };

  if (loading) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Who's using PandaPal?</Text>
      <View style={styles.options}>
        <Pressable style={({ pressed }) => [styles.option, pressed && styles.optionPressed]} onPress={handleKid}>
          <Ionicons name="happy-outline" size={40} color={LessonsTheme.primary} />
          <Text style={styles.optionLabel}>I'm a Kid</Text>
        </Pressable>
        <Pressable style={({ pressed }) => [styles.option, pressed && styles.optionPressed]} onPress={handleAdult}>
          <Ionicons name="heart-outline" size={40} color={LessonsTheme.primary} />
          <Text style={styles.optionLabel}>I'm an Adult (Caregiver)</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: LessonsTheme.background, padding: 24, paddingTop: 80, alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '700', color: LessonsTheme.text, marginBottom: 32, textAlign: 'center' },
  options: { gap: 16, width: '100%', maxWidth: 320 },
  option: {
    backgroundColor: LessonsTheme.cardBg,
    borderRadius: 16,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderWidth: 2,
    borderColor: LessonsTheme.border,
  },
  optionPressed: { opacity: 0.9 },
  optionLabel: { fontSize: 17, fontWeight: '600', color: LessonsTheme.text },
});
