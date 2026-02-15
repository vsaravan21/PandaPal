/**
 * Breathing break - calming animation + timer
 */

import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LessonsTheme } from '../../constants';
import type { BreathingBreakStepPayload } from '../../types';

interface BreathingBreakStepProps {
  payload: BreathingBreakStepPayload;
  onComplete: (response: { completed: true }) => void;
  calmMode?: boolean;
}

export function BreathingBreakStep({ payload, onComplete, calmMode }: BreathingBreakStepProps) {
  const [secondsLeft, setSecondsLeft] = useState(payload.durationSeconds);

  useEffect(() => {
    if (secondsLeft <= 0) {
      onComplete({ completed: true });
      return;
    }
    const t = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [secondsLeft, onComplete]);

  return (
    <View style={[styles.container, calmMode && styles.calm]} accessible accessibilityLabel={`Breathing break, ${secondsLeft} seconds remaining`}>
      <View style={styles.circle}>
        <Text style={styles.emoji}>🌿</Text>
      </View>
      <Text style={styles.instruction}>
        {payload.instruction ?? 'Take slow, gentle breaths.'}
      </Text>
      <Text style={styles.timer}>{secondsLeft}s</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  calm: {
    opacity: 0.95,
  },
  circle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: LessonsTheme.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emoji: {
    fontSize: 48,
  },
  instruction: {
    fontSize: 18,
    color: LessonsTheme.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  timer: {
    fontSize: 24,
    fontWeight: '700',
    color: LessonsTheme.primary,
  },
});
