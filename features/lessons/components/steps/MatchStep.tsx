/**
 * Match step - pair terms with definitions.
 * Each term has 2-3 options; pick the right definition.
 */

import React, { useState } from 'react';
import { StyleSheet, Text, Pressable, View } from 'react-native';
import type { MatchStepPayload } from '../../types';
import { LessonsTheme } from '../../constants';

interface MatchStepProps {
  payload: MatchStepPayload;
  onComplete: (response: { correctCount: number; total: number }) => void;
  calmMode?: boolean;
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function MatchStep({ payload, onComplete, calmMode }: MatchStepProps) {
  const [responses, setResponses] = useState<Record<string, string>>({});

  const handleSelect = (term: string, def: string) => {
    const next = { ...responses, [term]: def };
    setResponses(next);
    if (Object.keys(next).length === payload.pairs.length) {
      let correct = 0;
      payload.pairs.forEach((p) => {
        if (next[p.term] === p.definition) correct++;
      });
      onComplete({ correctCount: correct, total: payload.pairs.length });
    }
  };

  return (
    <View style={[styles.container, calmMode && styles.calm]} accessible accessibilityLabel="Match terms with definitions">
      <Text style={styles.instruction}>Match each term to its definition</Text>
      {payload.pairs.map((pair) => {
        const wrongDefs = payload.pairs
          .filter((p) => p.term !== pair.term && p.definition !== pair.definition)
          .map((p) => p.definition);
        const options = shuffle([pair.definition, ...wrongDefs.slice(0, 2)]);
        const selected = responses[pair.term];

        return (
          <View key={pair.term} style={styles.card}>
            <Text style={styles.term}>{pair.term}</Text>
            <View style={styles.options}>
              {options.map((def) => (
                <Pressable
                  key={def}
                  style={[
                    styles.option,
                    selected === def && styles.optionSelected,
                    selected && styles.optionDisabled,
                  ]}
                  onPress={() => !selected && handleSelect(pair.term, def)}
                  disabled={!!selected}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected === def }}
                  accessibilityLabel={def}
                >
                  <Text style={[styles.optionText, selected === def && styles.optionTextSelected]} numberOfLines={2}>
                    {def}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        );
      })}
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
  instruction: {
    fontSize: 16,
    color: LessonsTheme.textMuted,
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: LessonsTheme.cardBg,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: LessonsTheme.border,
  },
  term: {
    fontSize: 16,
    fontWeight: '600',
    color: LessonsTheme.text,
    marginBottom: 12,
  },
  options: {
    gap: 8,
  },
  option: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: LessonsTheme.background,
  },
  optionSelected: {
    backgroundColor: LessonsTheme.primaryLight,
    borderWidth: 2,
    borderColor: LessonsTheme.primary,
  },
  optionDisabled: {
    opacity: 0.7,
  },
  optionText: {
    fontSize: 14,
    color: LessonsTheme.text,
  },
  optionTextSelected: {
    color: LessonsTheme.primary,
    fontWeight: '600',
  },
});
