import React, { useState } from 'react';
import { StyleSheet, Text, Pressable, View } from 'react-native';
import type { TapToRevealStepPayload } from '../../types';
import { LessonsTheme } from '../../constants';

interface TapToRevealStepProps {
  payload: TapToRevealStepPayload;
  onComplete: (response: { revealed: string[] }) => void;
  calmMode?: boolean;
}

export function TapToRevealStep({ payload, onComplete, calmMode }: TapToRevealStepProps) {
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  const handleTap = (id: string) => {
    const next = { ...revealed, [id]: true };
    setRevealed(next);
    if (Object.keys(next).length === payload.cards.length) {
      onComplete({ revealed: payload.cards.map((c) => c.id) });
    }
  };

  return (
    <View style={[styles.container, calmMode && styles.calm]} accessible accessibilityLabel="Tap cards to reveal facts">
      {payload.cards.map((card) => {
        const isRevealed = revealed[card.id];
        return (
          <Pressable
            key={card.id}
            style={({ pressed }) => [
              styles.card,
              isRevealed && styles.cardRevealed,
              pressed && !isRevealed && styles.cardPressed,
            ]}
            onPress={() => !isRevealed && handleTap(card.id)}
            accessibilityRole="button"
            accessibilityState={{ selected: isRevealed }}
            accessibilityLabel={isRevealed ? card.revealedText : 'Tap to reveal'}
          >
            <Text style={[styles.text, isRevealed && styles.textRevealed]}>
              {isRevealed ? card.revealedText : card.hiddenText}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    gap: 12,
  },
  calm: {
    opacity: 0.95,
  },
  card: {
    backgroundColor: LessonsTheme.cardBg,
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: LessonsTheme.border,
  },
  cardRevealed: {
    borderColor: LessonsTheme.primary,
    backgroundColor: LessonsTheme.calmBg,
  },
  cardPressed: {
    opacity: 0.8,
  },
  text: {
    fontSize: 16,
    color: LessonsTheme.textMuted,
  },
  textRevealed: {
    color: LessonsTheme.text,
    fontWeight: '500',
  },
});
