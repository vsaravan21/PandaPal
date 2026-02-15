/**
 * Panda avatar with equipped items - fun & kid-friendly
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useProfile } from '../context/ProfileContext';
import { UNLOCKABLES } from '../data/unlockables';
import type { ItemSlot } from '../types';

const SLOT_LABELS: Record<ItemSlot, string> = {
  hat: '👒 Hat',
  shirt: '👕 Shirt',
  accessory: '✨ Accessory',
  background: '🌈 Background',
};

export function PandaAvatar() {
  const { profile, level, xpProgress } = useProfile();

  if (!profile) return null;

  const equipped = profile.equippedItems;

  return (
    <View style={styles.container}>
      {/* Level badge */}
      <View style={styles.levelBadge}>
        <Text style={styles.levelEmoji}>⭐</Text>
        <Text style={styles.levelText}>Level {level}</Text>
        <View style={styles.xpBar}>
          <View style={[styles.xpFill, { width: `${xpProgress.pct}%` }]} />
        </View>
        <Text style={styles.xpLabel}>{xpProgress.current}/{xpProgress.needed || '—'} XP</Text>
      </View>

      {/* Panda + equipped items */}
      <View style={styles.pandaArea}>
        <View style={styles.pandaBase}>
          <Text style={styles.pandaEmoji}>🐼</Text>
          {equipped.hat && (
            <View style={styles.itemOverlay}>
              <Text style={styles.itemEmoji}>
                {UNLOCKABLES.find((u) => u.id === equipped.hat)?.emoji ?? '🎀'}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.equippedList}>
          {(Object.keys(equipped) as ItemSlot[]).map((slot) => {
            const id = equipped[slot];
            const item = id ? UNLOCKABLES.find((u) => u.id === id) : null;
            return (
              <View key={slot} style={styles.equippedRow}>
                <Text style={styles.equippedLabel}>{SLOT_LABELS[slot]}</Text>
                <Text style={styles.equippedValue}>
                  {item ? `${item.emoji} ${item.name}` : '—'}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* XP display */}
      <View style={styles.xpDisplay}>
        <Text style={styles.xpAmount}>🌟 {profile.xp} XP</Text>
        <Text style={styles.coinsAmount}>🪙 {profile.coins} coins</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 24,
  },
  levelBadge: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
    minWidth: 200,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  levelEmoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  levelText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  xpBar: {
    width: '100%',
    height: 10,
    backgroundColor: '#e8f4f0',
    borderRadius: 5,
    marginTop: 12,
    overflow: 'hidden',
  },
  xpFill: {
    height: '100%',
    backgroundColor: '#2D7D46',
    borderRadius: 5,
  },
  xpLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  pandaArea: {
    alignItems: 'center',
    marginBottom: 24,
  },
  pandaBase: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#f0f8f0',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#8CE0A1',
  },
  pandaEmoji: {
    fontSize: 80,
  },
  itemOverlay: {
    position: 'absolute',
    top: -10,
  },
  itemEmoji: {
    fontSize: 36,
  },
  equippedList: {
    marginTop: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    minWidth: 220,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  equippedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  equippedLabel: {
    fontSize: 14,
    color: '#666',
  },
  equippedValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  xpDisplay: {
    flexDirection: 'row',
    gap: 24,
  },
  xpAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D7D46',
  },
  coinsAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f59e0b',
  },
});
