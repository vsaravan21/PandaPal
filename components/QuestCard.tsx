/**
 * Single quest row/card. Plays checkmark bounce + heart burst from checkmark when completed.
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

const HEART_BURST_DURATION = 1000;
const NUM_BURST_HEARTS = 12;
const BURST_OFFSETS = Array.from({ length: NUM_BURST_HEARTS }, (_, i) => {
  const angle = (i / NUM_BURST_HEARTS) * Math.PI * 2;
  const dist = 24 + (i % 3) * 12;
  return { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist - 10 };
});

export function QuestCard({ title, points, completed, onToggleComplete }: QuestCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const prevCompleted = useRef(completed);
  const [showHeartBurst, setShowHeartBurst] = useState(false);
  const heartAnims = useRef(
    BURST_OFFSETS.map(() => ({
      x: new Animated.Value(0),
      y: new Animated.Value(0),
      opacity: new Animated.Value(1),
    }))
  ).current;

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
      // Heart burst from checkmark
      setShowHeartBurst(true);
      heartAnims.forEach((a) => {
        a.x.setValue(0);
        a.y.setValue(0);
        a.opacity.setValue(1);
      });
      Animated.parallel(
        heartAnims.map((anim, i) =>
          Animated.parallel([
            Animated.timing(anim.x, {
              toValue: BURST_OFFSETS[i].x,
              duration: HEART_BURST_DURATION,
              useNativeDriver: true,
            }),
            Animated.timing(anim.y, {
              toValue: BURST_OFFSETS[i].y,
              duration: HEART_BURST_DURATION,
              useNativeDriver: true,
            }),
            Animated.timing(anim.opacity, {
              toValue: 0,
              duration: HEART_BURST_DURATION,
              useNativeDriver: true,
            }),
          ])
        )
      ).start(() => {
        setShowHeartBurst(false);
        heartAnims.forEach((a) => {
          a.x.setValue(0);
          a.y.setValue(0);
          a.opacity.setValue(0);
        });
      });
    } else if (!completed) {
      prevCompleted.current = false;
    }
  }, [completed, scaleAnim]);

  return (
    <View style={[styles.card, completed && styles.cardCompleted]}>
      <View style={styles.content}>
        <Text style={[styles.title, completed && styles.titleCompleted]} numberOfLines={2}>
          {title}
        </Text>
        <Text style={styles.points}>❤️ {points}</Text>
      </View>
      <View style={styles.checkArea}>
        {showHeartBurst && (
          <View style={styles.heartBurstWrap} pointerEvents="none">
            {heartAnims.map((anim, i) => (
              <Animated.View
                key={i}
                style={[
                  styles.heartBurstItem,
                  {
                    transform: [
                      { translateX: anim.x },
                      { translateY: anim.y },
                    ],
                    opacity: anim.opacity,
                  },
                ]}
              >
                <Text style={styles.heartBurstEmoji}>❤️</Text>
              </Animated.View>
            ))}
          </View>
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
    borderRadius: 14,
    padding: 18,
    marginHorizontal: 24,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  cardCompleted: {
    backgroundColor: '#f4faf4',
    borderColor: 'rgba(45, 125, 70, 0.15)',
    borderLeftWidth: 3,
  },
  checkArea: {
    position: 'relative',
    marginLeft: 16,
    minWidth: 28,
    minHeight: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartBurstWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartBurstItem: {
    position: 'absolute',
  },
  heartBurstEmoji: {
    fontSize: 18,
  },
  checkWrap: {},
  checkInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#b0b0b8',
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 6,
    lineHeight: 21,
    letterSpacing: 0.2,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: '#6B6B7B',
  },
  points: {
    fontSize: 13,
    color: '#2D7D46',
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
