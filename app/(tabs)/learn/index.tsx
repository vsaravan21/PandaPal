/**
 * Learn tab - chooser (Quick Lessons | Story Missions)
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LessonsChooser } from '@/features/lessons/components/LessonsChooser';

export default function LearnTabIndex() {
  return (
    <View style={styles.container}>
      <LessonsChooser />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
