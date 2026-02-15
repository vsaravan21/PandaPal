/**
 * Story Mission Player - scene-generated (by guide) or legacy node-based
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { StoryRunPlayer } from '@/features/lessons/storyMissions/StoryRunPlayer';
import { StoryPlayer } from '@/features/lessons/storyMissions/StoryPlayer';
import { STORY_MISSIONS } from '@/features/lessons/storyMissions/seedMissions';
import type { GuideId } from '@/features/lessons/storyMissions/models';

const GUIDE_IDS: GuideId[] = ['astronaut', 'detective', 'diver', 'treasure'];

export default function StoryPlayScreen() {
  const { missionId } = useLocalSearchParams<{ missionId: string }>();
  const isGuideMission = missionId && GUIDE_IDS.includes(missionId as GuideId);

  if (isGuideMission) {
    return (
      <View style={styles.container}>
        <StoryRunPlayer guideId={missionId as GuideId} missionId={missionId} />
      </View>
    );
  }

  const mission = STORY_MISSIONS.find((m) => m.id === missionId);
  if (!mission) return null;

  return (
    <View style={styles.container}>
      <StoryPlayer mission={mission} missionId={mission.id} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
