/**
 * Story Missions - home
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { StoryMissionsHome } from '@/features/lessons/storyMissions/StoryMissionsHome';

export default function StoryMissionsIndex() {
  return (
    <View style={styles.container}>
      <StoryMissionsHome />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
