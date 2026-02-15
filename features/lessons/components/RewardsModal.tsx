/**
 * Rewards modal - shown on lesson completion (kid-friendly, fun!)
 */

import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { LessonsTheme } from '../constants';

interface RewardsModalProps {
  visible: boolean;
  xp: number;
  coins: number;
  items?: string[];
  leveledUp?: boolean;
  newLevel?: number;
  onClose: () => void;
}

export function RewardsModal({ visible, xp, coins, items, leveledUp, newLevel, onClose }: RewardsModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      accessibilityLabel="Lesson complete! You earned rewards."
    >
      <View style={styles.overlay}>
        <View style={styles.content} accessibilityRole="alert">
          <Text style={styles.emoji}>{leveledUp ? '🌟' : '🎉'}</Text>
          {leveledUp ? (
            <>
              <Text style={styles.title}>LEVEL UP!</Text>
              <Text style={styles.subtitle}>You reached Level {newLevel}!</Text>
            </>
          ) : (
            <Text style={styles.title}>Awesome Job!</Text>
          )}
          <Text style={styles.earnedLabel}>You earned:</Text>
          <View style={styles.rewards}>
            <View style={styles.reward}>
              <Text style={styles.rewardEmoji}>🌟</Text>
              <Text style={styles.rewardValue}>+{xp} XP</Text>
            </View>
            <View style={styles.reward}>
              <Text style={styles.rewardEmoji}>🪙</Text>
              <Text style={styles.rewardValue}>+{coins} coins</Text>
            </View>
            {items && items.length > 0 && (
              <View style={styles.reward}>
                <Text style={styles.rewardEmoji}>🎁</Text>
                <Text style={styles.rewardValue}>{items.length} item(s)</Text>
              </View>
            )}
          </View>
          <Pressable
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close and return"
          >
            <Text style={styles.buttonText}>{leveledUp ? 'Yay! 🎊' : 'Awesome!'}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    backgroundColor: LessonsTheme.cardBg,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    maxWidth: 320,
    width: '90%',
  },
  emoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: LessonsTheme.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: LessonsTheme.primary,
    marginBottom: 12,
  },
  earnedLabel: {
    fontSize: 16,
    color: LessonsTheme.textMuted,
    marginBottom: 16,
  },
  rewards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 24,
  },
  reward: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: LessonsTheme.background,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  rewardEmoji: {
    fontSize: 24,
  },
  rewardValue: {
    fontSize: 16,
    fontWeight: '600',
    color: LessonsTheme.text,
  },
  button: {
    backgroundColor: LessonsTheme.primary,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 14,
  },
  buttonPressed: {
    opacity: 0.9,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
});
