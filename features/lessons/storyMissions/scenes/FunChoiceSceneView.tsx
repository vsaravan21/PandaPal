import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import type { Scene, SceneChoice } from '../sceneSchema';
import { LessonsTheme } from '../../constants';

interface Props {
  scene: Scene;
  onChoice: (choice: SceneChoice) => void;
  calmMode?: boolean;
}

export function FunChoiceSceneView({ scene, onChoice, calmMode }: Props) {
  const choices = scene.choices ?? [];
  return (
    <View style={[styles.container, calmMode && styles.calm]}>
      <Text style={styles.setting}>{scene.setting}</Text>
      <Text style={styles.narration}>{scene.narration}</Text>
      {choices.map((c) => (
        <Pressable
          key={c.id}
          style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}
          onPress={() => onChoice(c)}
        >
          <Text style={styles.optionText}>{c.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24 },
  calm: { opacity: 0.95 },
  setting: { fontSize: 14, fontWeight: '600', color: LessonsTheme.primary, marginBottom: 8 },
  narration: { fontSize: 18, lineHeight: 28, color: LessonsTheme.text, marginBottom: 20 },
  option: {
    backgroundColor: LessonsTheme.cardBg,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: LessonsTheme.border,
  },
  optionPressed: { opacity: 0.85 },
  optionText: { fontSize: 16, color: LessonsTheme.text },
});
