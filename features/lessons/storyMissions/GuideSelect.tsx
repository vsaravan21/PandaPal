/**
 * Choose Your Guide - 4 character cards
 */

import { router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { GUIDES } from './seedMissions';
import type { Guide } from './models';
import { setSelectedGuide } from './storage';
import { LessonsTheme } from '../constants';

export function GuideSelect() {
  const handleSelect = async (guide: Guide) => {
    await setSelectedGuide(guide.id);
    router.back();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Choose Your Guide</Text>
      <Text style={styles.subtitle}>Your guide will join you on the mission!</Text>
      {GUIDES.map((guide) => (
        <Pressable
          key={guide.id}
          style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
          onPress={() => handleSelect(guide)}
        >
          <View style={styles.iconWrap}>
            <Text style={styles.emoji}>{guide.artPlaceholder}</Text>
          </View>
          <Text style={styles.name}>{guide.name}</Text>
          <Text style={styles.tagline}>{guide.tagline}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: '800', color: LessonsTheme.text, marginBottom: 8 },
  subtitle: { fontSize: 16, color: LessonsTheme.textMuted, marginBottom: 24 },
  card: {
    backgroundColor: LessonsTheme.cardBg,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  cardPressed: { opacity: 0.9 },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: LessonsTheme.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  emoji: { fontSize: 28 },
  name: { fontSize: 18, fontWeight: '700', color: LessonsTheme.text, flex: 1 },
  tagline: { fontSize: 14, color: LessonsTheme.textMuted },
});
