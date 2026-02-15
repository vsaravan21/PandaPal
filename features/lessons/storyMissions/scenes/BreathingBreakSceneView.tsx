import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Scene } from '../sceneSchema';
import { LessonsTheme } from '../../constants';

interface Props {
  scene: Scene;
  onComplete: () => void;
  calmMode?: boolean;
}

export function BreathingBreakSceneView({ scene, onComplete, calmMode }: Props) {
  const duration = scene.durationSeconds ?? 12;
  const [secondsLeft, setSecondsLeft] = useState(duration);

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
      <Text style={styles.instruction}>{scene.instruction ?? 'Take slow, gentle breaths.'}</Text>
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
