import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import type { StoryRunScene } from '../storyRunSchema';
import { LessonsTheme } from '../../constants';

interface Props {
  scene: StoryRunScene;
  onNext: () => void;
}

export function StorySceneView({ scene, onNext }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.setting}>{scene.settingTitle}</Text>
      <Text style={styles.narration}>{scene.narration}</Text>
      {scene.dialogue?.map((d, i) => (
        <View key={i} style={styles.dialogue}>
          <Text style={styles.speaker}>{d.speaker}</Text>
          <Text style={styles.line}>{d.line}</Text>
        </View>
      ))}
      <Pressable style={({ pressed }) => [styles.nextBtn, pressed && styles.nextBtnPressed]} onPress={onNext}>
        <Text style={styles.nextBtnText}>Next</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24 },
  setting: { fontSize: 14, fontWeight: '600', color: LessonsTheme.primary, marginBottom: 8 },
  narration: { fontSize: 18, lineHeight: 28, color: LessonsTheme.text, marginBottom: 16 },
  dialogue: { marginBottom: 12 },
  speaker: { fontSize: 14, fontWeight: '600', color: LessonsTheme.textMuted },
  line: { fontSize: 16, color: LessonsTheme.text, fontStyle: 'italic' },
  nextBtn: {
    alignSelf: 'center',
    marginTop: 24,
    backgroundColor: LessonsTheme.primary,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 14,
  },
  nextBtnPressed: { opacity: 0.9 },
  nextBtnText: { fontSize: 18, fontWeight: '700', color: '#fff' },
});
