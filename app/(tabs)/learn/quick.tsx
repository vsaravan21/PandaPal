/**
 * Quick Lessons - existing lessons list
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LessonsHome } from '@/features/lessons/components/LessonsHome';

export default function QuickLessonsScreen() {
  return (
    <View style={styles.container}>
      <LessonsHome />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
