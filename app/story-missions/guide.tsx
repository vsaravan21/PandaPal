/**
 * Choose Your Guide
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { StoryMissionBanner } from '@/features/lessons/storyMissions/StoryMissionBanner';
import { GuideSelect } from '@/features/lessons/storyMissions/GuideSelect';

export default function GuideScreen() {
  return (
    <View style={styles.container}>
      <StoryMissionBanner />
      <GuideSelect />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
