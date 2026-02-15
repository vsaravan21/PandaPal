import React, { useState } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import type { StoryRunScene } from '../storyRunSchema';
import { LessonsTheme } from '../../constants';

interface Props {
  scene: StoryRunScene;
  onAnswer: (correct: boolean) => void;
}

export function EduSceneView({ scene, onAnswer }: Props) {
  const edu = scene.edu;
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!edu) return null;

  const options = edu.options.length === 3 ? edu.options : [edu.options[0], edu.options[1], edu.options[2] ?? edu.options[0]];

  const handleSelect = (index: number) => {
    if (selected !== null) return;
    setSelected(index);
    const correct = index === edu.correctIndex;
    setFeedback(correct ? edu.feedbackCorrect : edu.feedbackIncorrect);
    setTimeout(() => onAnswer(correct), 1800);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.setting}>{scene.settingTitle}</Text>
      <Text style={styles.narration}>{scene.narration}</Text>
      <Text style={styles.questionInStory}>{edu.questionInStory}</Text>
      {options.map((opt, i) => (
        <Pressable
          key={i}
          style={({ pressed }) => [
            styles.option,
            selected === i && (i === edu.correctIndex ? styles.correct : styles.incorrect),
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
