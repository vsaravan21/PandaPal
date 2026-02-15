import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import type { StoryRunScene, Choice } from '../storyRunSchema';
import { LessonsTheme } from '../../constants';

interface Props {
  scene: StoryRunScene;
  onChoice: (choice: Choice) => void;
}

export function FunSceneView({ scene, onChoice }: Props) {
  const choices = scene.choices ?? [];
  return (
    <View style={styles.container}>
      <Text style={styles.setting}>{scene.settingTitle}</Text>
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
