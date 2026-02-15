/**
 * Shop - unlock panda items with XP
 */

import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, Pressable, View } from 'react-native';
import { useProfile } from '../context/ProfileContext';
import { UNLOCKABLES } from '../data/unlockables';
import type { ItemSlot } from '../types';

const SLOT_LABELS: Record<ItemSlot, string> = {
  hat: 'Hats',
  shirt: 'Shirts',
  accessory: 'Accessories',
  background: 'Backgrounds',
};

export function Shop() {
  const { profile, equipItem, unlockItem } = useProfile();
  const [selectedSlot, setSelectedSlot] = useState<ItemSlot>('hat');
  const [message, setMessage] = useState<string | null>(null);

  if (!profile) return null;

  const items = UNLOCKABLES.filter((u) => u.slot === selectedSlot);
  const owned = new Set(profile.inventory);

  const handleUnlock = async (itemId: string) => {
    const ok = await unlockItem(itemId);
    setMessage(ok ? '🎉 Unlocked!' : 'Need more XP!');
    setTimeout(() => setMessage(null), 2000);
  };

  const handleEquip = async (itemId: string | null) => {
    await equipItem(selectedSlot, itemId);
    setMessage('✨ Equipped!');
    setTimeout(() => setMessage(null), 1500);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>🛍️ Panda Shop</Text>
      <Text style={styles.subtitle}>Use XP to unlock cool stuff!</Text>
      <Text style={styles.xp}>🌟 You have {profile.xp} XP</Text>

      {/* Slot tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabs}>
        {(['hat', 'shirt', 'accessory', 'background'] as ItemSlot[]).map((slot) => (
          <Pressable
            key={slot}
            style={[styles.tab, selectedSlot === slot && styles.tabActive]}
            onPress={() => setSelectedSlot(slot)}
          >
            <Text style={[styles.tabText, selectedSlot === slot && styles.tabTextActive]}>
              {SLOT_LABELS[slot]}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {message && (
        <View style={styles.message}>
          <Text style={styles.messageText}>{message}</Text>
        </View>
      )}

      {/* Items */}
      <View style={styles.grid}>
        {items.map((item) => {
          const isOwned = owned.has(item.id);
          const canAfford = profile.xp >= item.costXp;
          const meetsLevel = !item.requiredLevel || profile.level >= (item.requiredLevel ?? 1);
          const canUnlock = !isOwned && canAfford && meetsLevel;
          const isEquipped = profile.equippedItems[selectedSlot] === item.id;

          return (
            <View key={item.id} style={styles.itemCard}>
              <Text style={styles.itemEmoji}>{item.emoji}</Text>
              <Text style={styles.itemName}>{item.name}</Text>
              {isOwned ? (
                <Pressable
                  style={[styles.btn, isEquipped && styles.btnEquipped]}
                  onPress={() => handleEquip(isEquipped ? null : item.id)}
                >
                  <Text style={styles.btnText}>{isEquipped ? '✓ Wearing' : 'Equip'}</Text>
                </Pressable>
              ) : (
                <>
                  <Text style={styles.cost}>🌟 {item.costXp} XP</Text>
                  {item.requiredLevel && (
                    <Text style={styles.req}>Lv.{item.requiredLevel}+</Text>
                  )}
                  <Pressable
                    style={[styles.btn, canUnlock ? styles.btnUnlock : styles.btnLocked]}
                    onPress={() => canUnlock && handleUnlock(item.id)}
                    disabled={!canUnlock}
                  >
                    <Text style={[styles.btnText, !canUnlock && styles.btnTextLocked]}>
                      {canUnlock ? 'Unlock!' : 'Need XP'}
                    </Text>
                  </Pressable>
                </>
              )}
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 12,
  },
  xp: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D7D46',
    textAlign: 'center',
    marginBottom: 20,
  },
  tabs: {
    marginBottom: 16,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: '#fff',
    marginRight: 10,
  },
  tabActive: {
    backgroundColor: '#2D7D46',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  tabTextActive: {
    color: '#fff',
  },
  message: {
    backgroundColor: '#8CE0A1',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  messageText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a5c2e',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'center',
  },
  itemCard: {
    width: 120,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  itemEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  cost: {
    fontSize: 13,
    color: '#2D7D46',
    fontWeight: '600',
    marginBottom: 4,
  },
  req: {
    fontSize: 11,
    color: '#999',
    marginBottom: 8,
  },
  btn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    marginTop: 4,
  },
  btnUnlock: {
    backgroundColor: '#2D7D46',
  },
  btnEquipped: {
    backgroundColor: '#8CE0A1',
  },
  btnLocked: {
    backgroundColor: '#ddd',
  },
  btnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
  btnTextLocked: {
    color: '#999',
  },
});
