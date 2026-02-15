/**
 * Lessons entry - choose Quick Lessons or Story Missions
 */

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LessonsTheme } from '../constants';

export function LessonsChooser() {
  return (
    <View style={styles.container}>
      <Text style={styles.subtitle}>Pick how you want to learn today!</Text>

      <Pressable
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
        onPress={() => router.push('/(tabs)/learn/quick')}
        accessibilityRole="button"
        accessibilityLabel="Quick Lessons - short lessons by topic"
      >
        <View style={styles.cardIcon}>
          <Text style={styles.cardEmoji}>⚡</Text>
        </View>
        <Text style={styles.cardTitle}>Quick Lessons</Text>
        <Text style={styles.cardDesc}>Short lessons by topic. Safety, brain, routines, and more!</Text>
        <Ionicons name="chevron-forward" size={24} color={LessonsTheme.textMuted} style={styles.chevron} />
      </Pressable>

      <Pressable
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
        onPress={() => router.push('/story-missions')}
        accessibilityRole="button"
        accessibilityLabel="Story Missions - adventure with a guide"
      >
        <View style={styles.cardIcon}>
          <Text style={styles.cardEmoji}>🗺️</Text>
        </View>
        <Text style={styles.cardTitle}>Story Missions</Text>
        <Text style={styles.cardDesc}>An adventure with your guide! Choose a panda and play through the story.</Text>
        <Ionicons name="chevron-forward" size={24} color={LessonsTheme.textMuted} style={styles.chevron} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: LessonsTheme.background,
  },
  subtitle: {
    fontSize: 17,
    color: LessonsTheme.textMuted,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 32,
  },
  card: {
    backgroundColor: LessonsTheme.cardBg,
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  cardPressed: {
    opacity: 0.92,
  },
  cardIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: LessonsTheme.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  cardEmoji: {
    fontSize: 28,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: LessonsTheme.text,
    marginBottom: 8,
  },
  cardDesc: {
    fontSize: 15,
    color: LessonsTheme.textMuted,
    lineHeight: 22,
  },
  chevron: {
    position: 'absolute',
    right: 20,
    top: 24,
  },
});
