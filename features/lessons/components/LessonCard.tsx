/**
 * Lesson card for Lessons Home
 */

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Lesson, LessonProgress } from '../types';
import { LessonsTheme } from '../constants';

interface LessonCardProps {
  lesson: Lesson;
  progress?: LessonProgress | null;
}

const DIFFICULTY_LABELS: Record<string, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
};

export function LessonCard({ lesson, progress }: LessonCardProps) {
  const isComplete = progress?.completed ?? false;
  const progressPct = progress ? Math.round(progress.masteryScore) : 0;

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={() => router.push(`/lesson/${lesson.id}`)}
      accessibilityRole="button"
      accessibilityLabel={`${lesson.title}, ${lesson.estimatedMinutes} minutes, ${DIFFICULTY_LABELS[lesson.difficulty]}`}
    >
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={2}>
          {lesson.title}
        </Text>
        {isComplete && (
          <View style={styles.badge} accessibilityLabel="Completed">
            <Text style={styles.badgeEmoji}>✅</Text>
          </View>
        )}
      </View>
      <Text style={styles.description} numberOfLines={2}>
        {lesson.description}
      </Text>
      <View style={styles.meta}>
        <View style={styles.metaItem}>
          <Ionicons name="time-outline" size={14} color={LessonsTheme.textMuted} />
          <Text style={styles.metaText}>{lesson.estimatedMinutes} min</Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="trophy-outline" size={14} color={LessonsTheme.primary} />
          <Text style={styles.metaText}>{lesson.reward.xp} XP</Text>
        </View>
        <Text style={styles.difficulty}>{DIFFICULTY_LABELS[lesson.difficulty]}</Text>
      </View>
      {progress && !isComplete && progress.currentStepIndex > 0 && (
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress.currentStepIndex / lesson.steps.length * 100}%` }]} />
        </View>
      )}
      {isComplete && (
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
          <Text style={styles.masteryText}>{progressPct}% mastery</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: LessonsTheme.cardBg,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    minWidth: 280,
    maxWidth: 320,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  cardPressed: {
    opacity: 0.9,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: LessonsTheme.text,
    flex: 1,
  },
  badge: {
    marginLeft: 8,
  },
  badgeEmoji: {
    fontSize: 20,
  },
  description: {
    fontSize: 14,
    color: LessonsTheme.textMuted,
    marginTop: 6,
    lineHeight: 20,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    color: LessonsTheme.textMuted,
  },
  difficulty: {
    fontSize: 12,
    color: LessonsTheme.primary,
    fontWeight: '500',
    marginLeft: 'auto',
  },
  progressBar: {
    height: 6,
    backgroundColor: LessonsTheme.background,
    borderRadius: 3,
    marginTop: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: LessonsTheme.primary,
    borderRadius: 3,
  },
  masteryText: {
    fontSize: 11,
    color: LessonsTheme.textMuted,
    marginTop: 4,
  },
});
