/**
 * Single quest row/card. Plays a cute bounce + XP pop when a task is completed.
 */

import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface QuestCardProps {
  title: string;
  points: number;
  completed: boolean;
  onToggleComplete?: () => void;
}

const XP_POP_DURATION = 800;

export function QuestCard({ title, points, completed, onToggleComplete }: QuestCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const xpPopY = useRef(new Animated.Value(0)).current;
  const xpPopOpacity = useRef(new Animated.Value(0)).current;
  const prevCompleted = useRef(completed);
  const [showXpPop, setShowXpPop] = useState(false);

  useEffect(() => {
    if (completed && !prevCompleted.current) {
      prevCompleted.current = true;
      // Checkmark bounce
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.35,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 4,
          tension: 200,
          useNativeDriver: true,
        }),
      ]).start();
      // "+X XP" float-up pop
      setShowXpPop(true);
      xpPopY.setValue(0);
      xpPopOpacity.setValue(1);
      Animated.parallel([
        Animated.timing(xpPopY, {
          toValue: -28,
          duration: XP_POP_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(xpPopOpacity, {
          toValue: 0,
          duration: XP_POP_DURATION,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowXpPop(false);
        xpPopY.setValue(0);
        xpPopOpacity.setValue(0);
      });
    } else if (!completed) {
      prevCompleted.current = false;
    }
  }, [completed, scaleAnim, xpPopY, xpPopOpacity]);

  return (
    <View style={[styles.card, completed && styles.cardCompleted]}>
      <View style={styles.content}>
        <Text style={[styles.title, completed && styles.titleCompleted]} numberOfLines={2}>
          {title}
        </Text>
        <Text style={styles.points}>🌟 {points} XP</Text>
      </View>
      <View style={styles.checkArea}>
        {showXpPop && (
          <Animated.View
            style={[
              styles.xpPop,
              {
                opacity: xpPopOpacity,
                transform: [{ translateY: xpPopY }],
              },
            ]}
          >
            <Text style={styles.xpPopText}>+{points} XP</Text>
          </Animated.View>
        )}
        <Pressable
          style={styles.checkWrap}
          onPress={onToggleComplete}
          disabled={!onToggleComplete}
          hitSlop={12}
        >
          <Animated.View style={[styles.checkInner, { transform: [{ scale: scaleAnim }] }]}>
            {completed ? (
              <Ionicons name="checkmark-circle" size={28} color="#2D7D46" />
            ) : (
              <View style={styles.checkCircle} />
            )}
          </Animated.View>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 24,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardCompleted: {
    opacity: 0.85,
    backgroundColor: '#f0f8f0',
  },
  checkArea: {
    position: 'relative',
    marginLeft: 14,
  },
  checkWrap: {},
  xpPop: {
    position: 'absolute',
    right: 0,
    bottom: 36,
    alignSelf: 'flex-end',
  },
  xpPopText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#2D7D46',
  },
  checkInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#8E8E93',
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C2C2C',
    marginBottom: 4,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: '#6B6B7B',
  },
  points: {
    fontSize: 14,
    color: '#2D7D46',
    fontWeight: '500',
  },
});
