import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { BreathingBreakNode as BreathingBreakNodeType } from '../models';
import { LessonsTheme } from '../../constants';

interface Props {
  node: BreathingBreakNodeType;
  onComplete: () => void;
  calmMode?: boolean;
}

export function BreathingBreakNodeView({ node, onComplete, calmMode }: Props) {
  const [secondsLeft, setSecondsLeft] = useState(node.durationSeconds);

  useEffect(() => {
    if (secondsLeft <= 0) {
      onComplete();
      return;
    }
    const t = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [secondsLeft, onComplete]);

  return (
    <View style={[styles.container, calmMode && styles.calm]}>
      <View style={styles.circle}>
        <Text style={styles.emoji}>🌿</Text>
      </View>
      <Text style={styles.instruction}>{node.instruction ?? 'Take slow, gentle breaths.'}</Text>
      <Text style={styles.timer}>{secondsLeft}s</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  calm: { opacity: 0.95 },
  circle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: LessonsTheme.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emoji: { fontSize: 44 },
  instruction: { fontSize: 18, color: LessonsTheme.text, textAlign: 'center', marginBottom: 16 },
  timer: { fontSize: 24, fontWeight: '700', color: LessonsTheme.primary },
});
