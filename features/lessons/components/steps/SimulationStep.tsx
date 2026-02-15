import React, { useState } from 'react';
import { StyleSheet, Text, Pressable, View } from 'react-native';
import type { SimulationStepPayload } from '../../types';
import { LessonsTheme } from '../../constants';

interface SimulationStepProps {
  payload: SimulationStepPayload;
  onComplete: (response: { correct: boolean; selectedId: string }) => void;
  calmMode?: boolean;
}

export function SimulationStep({ payload, onComplete, calmMode }: SimulationStepProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSelect = (id: string) => {
    if (selected) return;
    const option = payload.options.find((o) => o.id === id);
    if (!option) return;
    setSelected(id);
    setFeedback(option.feedback);
    setTimeout(() => onComplete({ correct: option.correct, selectedId: id }), 1500);
  };

  return (
    <View style={[styles.container, calmMode && styles.calm]} accessible accessibilityLabel={`What would you do? ${payload.scenario}`}>
      <Text style={styles.scenario}>{payload.scenario}</Text>
      <Text style={styles.prompt}>{payload.prompt}</Text>
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
          accessibilityRole="button"
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
  scenario: {
    fontSize: 17,
    fontStyle: 'italic',
    color: LessonsTheme.textMuted,
    marginBottom: 12,
    textAlign: 'center',
  },
  prompt: {
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
