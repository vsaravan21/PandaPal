/**
 * Learning check embedded IN the story (not a separate quiz card)
 */

import React, { useState } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import type { Scene } from '../sceneSchema';
import { LessonsTheme } from '../../constants';

interface Props {
  scene: Scene;
  onAnswer: (correct: boolean) => void;
  calmMode?: boolean;
}

export function LearningCheckSceneView({ scene, onAnswer, calmMode }: Props) {
  const lc = scene.learningCheck;
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!lc) return null;

  const handleSelect = (index: number) => {
    if (selected !== null) return;
    setSelected(index);
    const correct = index === lc.correctIndex;
    setFeedback(correct ? lc.feedbackCorrect : lc.feedbackIncorrect);
    setTimeout(() => onAnswer(correct), 1800);
  };

  return (
    <View style={[styles.container, calmMode && styles.calm]}>
      <Text style={styles.setting}>{scene.setting}</Text>
      <Text style={styles.narration}>{scene.narration}</Text>
      <Text style={styles.questionInStory}>{lc.questionInStory}</Text>
      {lc.options.map((opt, i) => (
        <Pressable
          key={i}
          style={({ pressed }) => [
            styles.option,
            selected === i && (i === lc.correctIndex ? styles.correct : styles.incorrect),
            pressed && selected === null && styles.optionPressed,
          ]}
          onPress={() => handleSelect(i)}
          disabled={selected !== null}
        >
          <Text style={[styles.optionText, selected === i && styles.optionTextSelected]}>{opt}</Text>
        </Pressable>
      ))}
      {feedback && (
        <View style={styles.feedback}>
          <Text style={styles.feedbackText}>{feedback}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24 },
  calm: { opacity: 0.95 },
  setting: { fontSize: 14, fontWeight: '600', color: LessonsTheme.primary, marginBottom: 8 },
  narration: { fontSize: 18, lineHeight: 28, color: LessonsTheme.text, marginBottom: 12 },
  questionInStory: { fontSize: 17, fontWeight: '600', color: LessonsTheme.text, marginBottom: 16 },
  option: {
    backgroundColor: LessonsTheme.cardBg,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: LessonsTheme.border,
  },
  correct: { borderColor: LessonsTheme.success, backgroundColor: LessonsTheme.calmBg },
  incorrect: { borderColor: LessonsTheme.error, backgroundColor: '#fef2f2' },
  optionPressed: { opacity: 0.85 },
  optionText: { fontSize: 16, color: LessonsTheme.text },
  optionTextSelected: { fontWeight: '600' },
  feedback: { marginTop: 16, padding: 14, backgroundColor: LessonsTheme.calmBg, borderRadius: 12 },
  feedbackText: { fontSize: 15, color: LessonsTheme.text },
});
