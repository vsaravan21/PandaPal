/**
 * Story Missions home - choose guide, start generated story or replay
 */

import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { GUIDES } from './seedMissions';
import { getSelectedGuide } from './storage';
import { getStoryRunPlayerState } from './storage';
import { LessonsTheme } from '../constants';
import { StoryMissionBanner } from './StoryMissionBanner';

export function StoryMissionsHome() {
  const [guideId, setGuideId] = useState<string | null>(null);
  const [hasInProgress, setHasInProgress] = useState(false);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      (async () => {
        const id = await getSelectedGuide();
        setGuideId(id);
        if (id) {
          const saved = await getStoryRunPlayerState(id);
          setHasInProgress(!!saved);
        } else {
          setHasInProgress(false);
        }
        setLoading(false);
      })();
    }, [])
  );

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={LessonsTheme.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StoryMissionBanner />
      {!guideId ? (
        <Pressable
          style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
          onPress={() => router.push('/story-missions/guide')}
        >
          <Text style={styles.cardEmoji}>🐼</Text>
          <Text style={styles.cardTitle}>Choose Your Guide</Text>
          <Text style={styles.cardDesc}>Pick a panda to join your adventure!</Text>
        </Pressable>
      ) : (
        <>
          <Text style={styles.sectionTitle}>Your mission</Text>
          <Pressable
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            onPress={() => router.push(`/story-missions/play/${guideId}`)}
          >
            <Text style={styles.cardEmoji}>🗺️</Text>
            <Text style={styles.cardTitle}>Story Mission</Text>
            <Text style={styles.cardDesc}>
              An immersive story with your guide. Learn safety, make choices, and explore!
            </Text>
            <Text style={styles.cardMeta}>~15–20 min • 20 scenes</Text>
          </Pressable>
          {hasInProgress && (
            <Text style={styles.continueHint}>Your progress is saved. Tap above to continue!</Text>
          )}
          <Pressable
            style={styles.changeGuide}
            onPress={() => router.push('/story-missions/guide')}
          >
            <Text style={styles.changeGuideText}>Change guide</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: LessonsTheme.background },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: LessonsTheme.text, marginBottom: 16 },
  card: {
    backgroundColor: LessonsTheme.cardBg,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardPressed: { opacity: 0.9 },
  cardEmoji: { fontSize: 36, marginBottom: 12 },
  cardTitle: { fontSize: 20, fontWeight: '700', color: LessonsTheme.text, marginBottom: 8 },
  cardDesc: { fontSize: 15, color: LessonsTheme.textMuted, lineHeight: 22 },
  cardMeta: { fontSize: 13, color: LessonsTheme.primary, marginTop: 8 },
  continueHint: { fontSize: 14, color: LessonsTheme.textMuted, marginBottom: 8, fontStyle: 'italic' },
  changeGuide: { marginTop: 24, paddingVertical: 12, alignItems: 'center' },
  changeGuideText: { fontSize: 16, fontWeight: '600', color: LessonsTheme.primary },
});
