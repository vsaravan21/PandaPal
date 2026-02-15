import React, { useState } from 'react';
import { StyleSheet, Text, Pressable, View } from 'react-native';
import type { ChoiceNode as ChoiceNodeType } from '../models';
import { LessonsTheme } from '../../constants';

interface Props {
  node: ChoiceNodeType;
  onChoice: (option: { nextNodeId: string; setFlags?: Record<string, boolean> }) => void;
  calmMode?: boolean;
}

export function ChoiceNodeView({ node, onChoice, calmMode }: Props) {
  const [feedback, setFeedback] = useState(false);

  const handlePress = (option: { nextNodeId: string; setFlags?: Record<string, boolean> }) => {
    setFeedback(true);
    setTimeout(() => onChoice(option), 900);
  };

  return (
    <View style={[styles.container, calmMode && styles.calm]}>
      <Text style={styles.prompt}>{node.text}</Text>
      {node.options.map((opt) => (
        <Pressable
          key={opt.id}
          style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}
          onPress={() => handlePress(opt)}
        >
          <Text style={styles.optionText}>{opt.text}</Text>
        </Pressable>
      ))}
      {feedback && node.feedback && (
        <Text style={styles.feedback}>{node.feedback}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24 },
  calm: { opacity: 0.95 },
  prompt: { fontSize: 18, fontWeight: '600', color: LessonsTheme.text, marginBottom: 20, textAlign: 'center' },
  option: {
    backgroundColor: LessonsTheme.cardBg,
    borderRadius: 14,
    padding: 18,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: LessonsTheme.border,
  },
  optionPressed: { opacity: 0.85, borderColor: LessonsTheme.primary },
  optionText: { fontSize: 16, fontWeight: '600', color: LessonsTheme.text },
  feedback: { marginTop: 16, fontSize: 15, color: LessonsTheme.primary, textAlign: 'center' },
});
