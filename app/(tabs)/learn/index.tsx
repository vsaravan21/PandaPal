/**
 * Learn tab - chooser (Quick Lessons | Story Missions)
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { DisclaimerBanner } from '@/features/lessons/components/DisclaimerBanner';
import { LessonsChooser } from '@/features/lessons/components/LessonsChooser';

export default function LearnTabIndex() {
  return (
    <View style={styles.container}>
      <DisclaimerBanner />
      <LessonsChooser />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
