/**
 * Drag/Sort step - items into left/right categories.
 * Uses Pressable instead of actual drag for simpler implementation and accessibility.
 */

import React, { useState } from 'react';
import { StyleSheet, Text, Pressable, View } from 'react-native';
import type { DragSortStepPayload } from '../../types';
import { LessonsTheme } from '../../constants';

interface DragSortStepProps {
  payload: DragSortStepPayload;
  onComplete: (response: { correctCount: number; total: number }) => void;
  calmMode?: boolean;
}

export function DragSortStep({ payload, onComplete, calmMode }: DragSortStepProps) {
  const [assignments, setAssignments] = useState<Record<string, 'left' | 'right' | null>>(
    Object.fromEntries(payload.items.map((i) => [i.id, null]))
  );

  const handleAssign = (id: string, side: 'left' | 'right') => {
    const next = { ...assignments, [id]: assignments[id] === side ? null : side };
    setAssignments(next);
    const allAssigned = payload.items.every((i) => next[i.id] !== null);
    if (allAssigned) {
      let correct = 0;
      payload.items.forEach((item) => {
        if (next[item.id] === item.correctSide) correct++;
      });
      onComplete({ correctCount: correct, total: payload.items.length });
    }
  };

  return (
    <View style={[styles.container, calmMode && styles.calm]} accessible accessibilityLabel={`Sort items: ${payload.prompt}`}>
      <Text style={styles.prompt}>{payload.prompt}</Text>
      <View style={styles.columns}>
        <View style={styles.column}>
          <Text style={styles.columnLabel}>{payload.leftLabel}</Text>
        </View>
        <View style={styles.column}>
          <Text style={styles.columnLabel}>{payload.rightLabel}</Text>
        </View>
      </View>
      {payload.items.map((item) => (
        <View key={item.id} style={styles.itemRow}>
          <Text style={styles.itemText}>{item.text}</Text>
          <View style={styles.buttons}>
            <Pressable
              style={[
                styles.sideButton,
                assignments[item.id] === 'left' && styles.sideButtonSelected,
              ]}
              onPress={() => handleAssign(item.id, 'left')}
              accessibilityRole="button"
              accessibilityState={{ selected: assignments[item.id] === 'left' }}
              accessibilityLabel={`Put in ${payload.leftLabel}`}
            >
              <Text style={[styles.sideButtonText, assignments[item.id] === 'left' && styles.sideButtonTextSelected]}>
                {payload.leftLabel}
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.sideButton,
                assignments[item.id] === 'right' && styles.sideButtonSelected,
              ]}
              onPress={() => handleAssign(item.id, 'right')}
              accessibilityRole="button"
              accessibilityState={{ selected: assignments[item.id] === 'right' }}
              accessibilityLabel={`Put in ${payload.rightLabel}`}
            >
              <Text style={[styles.sideButtonText, assignments[item.id] === 'right' && styles.sideButtonTextSelected]}>
                {payload.rightLabel}
              </Text>
            </Pressable>
          </View>
        </View>
      ))}
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
  prompt: {
    fontSize: 18,
    fontWeight: '600',
    color: LessonsTheme.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  columns: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  column: {
    flex: 1,
    alignItems: 'center',
  },
  columnLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: LessonsTheme.primary,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: LessonsTheme.cardBg,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: LessonsTheme.border,
  },
  itemText: {
    flex: 1,
    fontSize: 15,
    color: LessonsTheme.text,
  },
  buttons: {
    flexDirection: 'row',
    gap: 8,
  },
  sideButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: LessonsTheme.background,
  },
  sideButtonSelected: {
    backgroundColor: LessonsTheme.primary,
  },
  sideButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: LessonsTheme.text,
  },
  sideButtonTextSelected: {
    color: '#fff',
  },
});
