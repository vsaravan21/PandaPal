/**
 * Quick Lessons - existing lessons list
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { DisclaimerBanner } from '@/features/lessons/components/DisclaimerBanner';
import { LessonsHome } from '@/features/lessons/components/LessonsHome';

export default function QuickLessonsScreen() {
  return (
    <View style={styles.container}>
      <DisclaimerBanner />
      <LessonsHome />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
