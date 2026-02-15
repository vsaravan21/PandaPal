import React, { useState } from 'react';
import { StyleSheet, Text, Pressable, View } from 'react-native';
import type { QuizStepPayload } from '../../types';
import { LessonsTheme } from '../../constants';

interface QuizStepProps {
  payload: QuizStepPayload;
  onComplete: (response: { correct: boolean; selectedId: string }) => void;
  calmMode?: boolean;
}

export function QuizStep({ payload, onComplete, calmMode }: QuizStepProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSelect = (id: string) => {
    if (selected) return;
    const option = payload.options.find((o) => o.id === id);
    if (!option) return;
    setSelected(id);
    const correct = option.correct;
    setFeedback(correct ? payload.correctFeedback : payload.incorrectFeedback);
    setTimeout(() => onComplete({ correct, selectedId: id }), 1200);
  };

  return (
    <View style={[styles.container, calmMode && styles.calm]} accessible accessibilityLabel={`Quiz: ${payload.question}`}>
      <Text style={styles.question}>{payload.question}</Text>
      {payload.options.map((opt) => (
        <Pressable
          key={opt.id}
          style={({ pressed }) => [
            styles.option,
            selected === opt.id && (opt.correct ? styles.optionCorrect : styles.optionIncorrect),
            pressed && !selected && styles.optionPressed,
          ]}
          onPress={() => handleSelect(opt.id)}
          disabled={!!selected}
          accessibilityRole="radio"
          accessibilityState={{ checked: selected === opt.id }}
          accessibilityLabel={opt.text}
        >
          <Text
            style={[
              styles.optionText,
              selected === opt.id && (opt.correct ? styles.optionTextCorrect : styles.optionTextIncorrect),
            ]}
          >
            {opt.text}
          </Text>
        </Pressable>
      ))}
      {feedback && (
        <View style={styles.feedbackBox}>
          <Text style={styles.feedbackText}>{feedback}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
  },
  calm: {
    opacity: 0.95,
  },
  question: {
    fontSize: 18,
    fontWeight: '600',
    color: LessonsTheme.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  option: {
    backgroundColor: LessonsTheme.cardBg,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: LessonsTheme.border,
  },
  optionCorrect: {
    borderColor: LessonsTheme.success,
    backgroundColor: LessonsTheme.calmBg,
  },
  optionIncorrect: {
    borderColor: LessonsTheme.error,
    backgroundColor: '#fef2f2',
  },
  optionPressed: {
    opacity: 0.8,
  },
  optionText: {
    fontSize: 16,
    color: LessonsTheme.text,
  },
  optionTextCorrect: {
    color: LessonsTheme.success,
    fontWeight: '600',
  },
  optionTextIncorrect: {
    color: LessonsTheme.error,
  },
  feedbackBox: {
    marginTop: 16,
    padding: 12,
    backgroundColor: LessonsTheme.calmBg,
    borderRadius: 8,
  },
  feedbackText: {
    fontSize: 15,
    color: LessonsTheme.text,
    textAlign: 'center',
  },
});
