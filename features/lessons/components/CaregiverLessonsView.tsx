/**
 * Caregiver view - read-only lessons progress
 */

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLessons } from '../context/LessonsContext';
import { LESSONS } from '../data/lessons';
import { getRecommendedNextLesson } from '../utils/scoring';
import { LessonsTheme } from '../constants';
import * as recommendedLessonStore from '@/features/caregiver/storage/recommendedLessonStore';

export function CaregiverLessonsView() {
  const { progress, loading } = useLessons();
  const [caregiverRecommendedId, setCaregiverRecommendedId] = useState<string | null>(null);

  useEffect(() => {
    recommendedLessonStore.getRecommendedLessonId().then(setCaregiverRecommendedId);
  }, []);

  const completed = Object.values(progress).filter((p) => p.completed);
  const totalTimeMinutes = completed.reduce((sum, p) => {
    const lesson = LESSONS.find((l) => l.id === p.lessonId);
    return sum + (lesson?.estimatedMinutes ?? 0);
  }, 0);
  const avgMastery =
    completed.length > 0
      ? Math.round(
          completed.reduce((s, p) => s + p.masteryScore, 0) / completed.length
        )
      : 0;

  const caregiverRec = caregiverRecommendedId ? LESSONS.find((l) => l.id === caregiverRecommendedId) : null;
  const recommended = caregiverRec ?? getRecommendedNextLesson(LESSONS, progress);

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={LessonsTheme.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>Lessons Progress</Text>
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Ionicons name="checkmark-done" size={28} color={LessonsTheme.primary} />
          <Text style={styles.statValue}>{completed.length}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.stat}>
          <Ionicons name="time" size={28} color={LessonsTheme.primary} />
          <Text style={styles.statValue}>{totalTimeMinutes}</Text>
          <Text style={styles.statLabel}>Minutes</Text>
        </View>
        <View style={styles.stat}>
          <Ionicons name="trophy" size={28} color={LessonsTheme.primary} />
          <Text style={styles.statValue}>{avgMastery}%</Text>
          <Text style={styles.statLabel}>Avg Mastery</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Mastery by Topic</Text>
      {completed.map((p) => {
        const lesson = LESSONS.find((l) => l.id === p.lessonId);
        if (!lesson) return null;
        return (
          <View key={lesson.id} style={styles.row}>
            <Text style={styles.lessonTitle} numberOfLines={2}>
              {lesson.title}
            </Text>
            <View style={styles.masteryBar}>
              <View style={[styles.masteryFill, { width: `${p.masteryScore}%` }]} />
            </View>
            <Text style={styles.masteryPct}>{p.masteryScore}%</Text>
          </View>
        );
      })}
      {completed.length === 0 && (
        <Text style={styles.empty}>No lessons completed yet.</Text>
      )}

      {recommended && (
        <>
          <Text style={styles.sectionTitle}>Recommended Next</Text>
          <Pressable
            style={({ pressed }) => [styles.recommendedCard, pressed && styles.cardPressed]}
            onPress={() => router.push(`/lesson/${recommended.id}`)}
            accessibilityRole="button"
            accessibilityLabel={`Recommended: ${recommended.title}`}
          >
            <Text style={styles.recommendedTitle}>{recommended.title}</Text>
            <Text style={styles.recommendedDesc}>{recommended.description}</Text>
            <Text style={styles.recommendedMeta}>
              {recommended.estimatedMinutes} min • {recommended.category}
            </Text>
          </Pressable>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: LessonsTheme.text,
    marginTop: 20,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: LessonsTheme.cardBg,
    borderRadius: 12,
    padding: 20,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: LessonsTheme.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 13,
    color: LessonsTheme.textMuted,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: LessonsTheme.cardBg,
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
  },
  lessonTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: LessonsTheme.text,
  },
  masteryBar: {
    width: 60,
    height: 8,
    backgroundColor: LessonsTheme.background,
    borderRadius: 4,
    overflow: 'hidden',
    marginHorizontal: 12,
  },
  masteryFill: {
    height: '100%',
    backgroundColor: LessonsTheme.primary,
    borderRadius: 4,
  },
  masteryPct: {
    fontSize: 14,
    fontWeight: '600',
    color: LessonsTheme.primary,
    minWidth: 36,
  },
  empty: {
    fontSize: 15,
    color: LessonsTheme.textMuted,
    fontStyle: 'italic',
  },
  recommendedCard: {
    backgroundColor: LessonsTheme.cardBg,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: LessonsTheme.primaryLight,
  },
  cardPressed: {
    opacity: 0.9,
  },
  recommendedTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: LessonsTheme.text,
  },
  recommendedDesc: {
    fontSize: 14,
    color: LessonsTheme.textMuted,
    marginTop: 6,
  },
  recommendedMeta: {
    fontSize: 13,
    color: LessonsTheme.primary,
    marginTop: 8,
  },
});
