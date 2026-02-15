import React, { useState } from 'react';
import { StyleSheet, Text, Pressable, View } from 'react-native';
import type { MiniQuizNode as MiniQuizNodeType } from '../models';
import { LessonsTheme } from '../../constants';

interface Props {
  node: MiniQuizNodeType;
  onAnswer: (correct: boolean) => void;
  calmMode?: boolean;
}

export function MiniQuizNodeView({ node, onAnswer, calmMode }: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const handleSelect = (index: number) => {
    if (selected !== null) return;
    setSelected(index);
    const correct = index === node.correctIndex;
    setShowExplanation(true);
    setTimeout(() => onAnswer(correct), 1500);
  };

  return (
    <View style={[styles.container, calmMode && styles.calm]}>
      <Text style={styles.question}>{node.question}</Text>
      {node.options.map((opt, i) => (
        <Pressable
          key={i}
          style={({ pressed }) => [
            styles.option,
            selected === i && (i === node.correctIndex ? styles.correct : styles.incorrect),
            pressed && selected === null && styles.optionPressed,
          ]}
          onPress={() => handleSelect(i)}
          disabled={selected !== null}
        >
          <Text style={[styles.optionText, selected === i && styles.optionTextSelected]}>{opt}</Text>
        </Pressable>
      ))}
      {showExplanation && (
        <View style={styles.explanation}>
          <Text style={styles.explanationText}>{node.explanation}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24 },
  calm: { opacity: 0.95 },
  question: { fontSize: 18, fontWeight: '600', color: LessonsTheme.text, marginBottom: 20, textAlign: 'center' },
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
  explanation: { marginTop: 16, padding: 14, backgroundColor: LessonsTheme.calmBg, borderRadius: 12 },
  explanationText: { fontSize: 15, color: LessonsTheme.text },
});
