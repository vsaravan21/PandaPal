/**
 * Avatar tab - Panda + equipped items + Shop
 */

import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Text, ScrollView } from 'react-native';
import { PandaAvatar } from '@/features/profile/components/PandaAvatar';
import { Shop } from '@/features/profile/components/Shop';

export default function AvatarScreen() {
  const [showShop, setShowShop] = useState(false);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {showShop ? (
          <Shop />
        ) : (
          <PandaAvatar />
        )}
      </ScrollView>
      <Pressable
        style={({ pressed }) => [styles.toggleButton, pressed && styles.togglePressed]}
        onPress={() => setShowShop(!showShop)}
      >
        <Text style={styles.toggleText}>
          {showShop ? '👀 See my Panda' : '🛍️ Shop'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e8f4f0',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 80,
  },
  toggleButton: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
    backgroundColor: '#2D7D46',
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  togglePressed: {
    opacity: 0.9,
  },
  toggleText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
});
