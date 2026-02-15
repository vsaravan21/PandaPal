/**
 * Safety disclaimer banner for lessons
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LessonsTheme } from '../constants';

export function DisclaimerBanner() {
  return (
    <View style={styles.banner} accessible accessibilityRole="text" accessibilityLabel="PandaPal teaches general epilepsy safety. Ask your caregiver or doctor for medical decisions.">
      <Text style={styles.text}>
        PandaPal teaches general epilepsy safety. Ask your caregiver or doctor for medical decisions.
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
