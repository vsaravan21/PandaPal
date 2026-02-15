/**
 * Caregiver tab - lessons progress + recommended
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { CaregiverLessonsView } from '@/features/lessons/components/CaregiverLessonsView';

export default function CaregiverScreen() {
  return (
    <View style={styles.container}>
      <CaregiverLessonsView />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e8f4f0',
  },
});
