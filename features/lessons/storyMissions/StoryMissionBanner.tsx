/**
 * Safety banner for Story Missions (persistent)
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LessonsTheme } from '../constants';

export function StoryMissionBanner() {
  return (
    <View style={styles.banner} accessible accessibilityRole="text">
      <Text style={styles.text}>
        PandaPal teaches general epilepsy safety. Follow your seizure action plan and ask a trusted adult for help.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: LessonsTheme.calmBg,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: LessonsTheme.border,
  },
  text: {
    fontSize: 13,
    color: LessonsTheme.textMuted,
    textAlign: 'center',
  },
});
