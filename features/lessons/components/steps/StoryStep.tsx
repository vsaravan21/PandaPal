import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { StoryStepPayload } from '../../types';
import { LessonsTheme } from '../../constants';

interface StoryStepProps {
  payload: StoryStepPayload;
  calmMode?: boolean;
}

export function StoryStep({ payload, calmMode }: StoryStepProps) {
  return (
    <View style={[styles.container, calmMode && styles.calm]} accessible accessibilityRole="text">
      {payload.illustrationPlaceholder && (
        <View style={styles.illustration} accessibilityLabel="Lesson illustration">
          <Text style={styles.illustrationText}>🌱</Text>
        </View>
      )}
      <Text style={styles.narrative}>{payload.narrative}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    alignItems: 'center',
  },
  calm: {
    opacity: 0.95,
  },
  illustration: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: LessonsTheme.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  illustrationText: {
    fontSize: 40,
  },
  narrative: {
    fontSize: 18,
    lineHeight: 28,
    color: LessonsTheme.text,
    textAlign: 'center',
  },
});
