/**
 * Lessons Home - main screen
 */

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useProfile } from '@/features/profile/context/ProfileContext';
import { useLessons } from '../context/LessonsContext';
import type { LessonCategory } from '../types';
import { LessonsTheme } from '../constants';
import { LessonCard } from './LessonCard';

const CATEGORIES: LessonCategory[] = [
  'Safety',
  'My Brain',
  'Routines',
  'Triggers',
  'Feelings',
  'Sleep',
  'Nutrition',
  'Exercise',
  'Hygiene',
  'Social',
  'Dental',
];

export function LessonsHome() {
  const { level } = useProfile();
  const { lessons, progress, profile, loading, recommendedLesson } = useLessons();
  const [selectedCategory, setSelectedCategory] = React.useState<LessonCategory | null>(null);

  const filteredLessons = selectedCategory
    ? lessons.filter((l) => l.category === selectedCategory)
    : lessons;

  const completedCount = Object.values(progress).filter((p) => p.completed).length;
  const totalMastery =
    Object.values(progress).filter((p) => p.completed).reduce((s, p) => s + p.masteryScore, 0) /
    Math.max(completedCount, 1);

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={LessonsTheme.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Continue card */}
        {recommendedLesson && (
          <Pressable
            style={({ pressed }) => [styles.continueCard, pressed && styles.continuePressed]}
            onPress={() => router.push(`/lesson/${recommendedLesson.id}`)}
            accessibilityRole="button"
            accessibilityLabel={`Continue lesson: ${recommendedLesson.title}`}
          >
            <View style={styles.continueContent}>
              <Ionicons name="play-circle" size={40} color={LessonsTheme.primary} />
              <View style={styles.continueText}>
                <Text style={styles.continueLabel}>Continue</Text>
                <Text style={styles.continueTitle} numberOfLines={1}>
                  {recommendedLesson.title}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={LessonsTheme.textMuted} />
            </View>
          </Pressable>
        )}

        {/* Progress ring - kid-friendly! */}
        <View style={styles.progressSection}>
          <View style={styles.progressRing}>
            <Text style={styles.progressEmoji}>⭐</Text>
            <Text style={styles.progressNumber}>{level}</Text>
            <Text style={styles.progressLabel}>Level</Text>
          </View>
          <View style={styles.progressStats}>
            <Text style={styles.statsValue}>{completedCount}</Text>
            <Text style={styles.statsLabel}>lessons</Text>
          </View>
          <View style={styles.progressStats}>
            <Text style={styles.statsValue}>{Math.round(totalMastery)}%</Text>
            <Text style={styles.statsLabel}>mastery</Text>
          </View>
          {profile && (
            <View style={styles.progressStats}>
              <Text style={styles.statsValue}>🌟 {profile.xp}</Text>
              <Text style={styles.statsLabel}>XP</Text>
            </View>
          )}
        </View>

        {/* Categories carousel */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categories}
          style={styles.categoriesScroll}
        >
          {CATEGORIES.map((cat) => (
            <Pressable
              key={cat}
              style={[
                styles.categoryChip,
                selectedCategory === cat && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
              accessibilityRole="button"
              accessibilityState={{ selected: selectedCategory === cat }}
              accessibilityLabel={`Filter by ${cat}`}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === cat && styles.categoryTextActive,
                ]}
              >
                {cat}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Lesson cards */}
        <Text style={styles.sectionTitle}>📚 Lessons</Text>
        {filteredLessons.map((lesson) => (
          <LessonCard key={lesson.id} lesson={lesson} progress={progress[lesson.id]} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LessonsTheme.background,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  continueCard: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    backgroundColor: LessonsTheme.cardBg,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  continuePressed: {
    opacity: 0.9,
  },
  continueContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  continueText: {
    flex: 1,
    marginLeft: 12,
  },
  continueLabel: {
    fontSize: 13,
    color: LessonsTheme.textMuted,
  },
  continueTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: LessonsTheme.text,
  },
  progressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    marginVertical: 20,
  },
  progressRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: LessonsTheme.primaryLight,
    borderWidth: 4,
    borderColor: LessonsTheme.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressEmoji: {
    fontSize: 20,
    marginBottom: 2,
  },
  progressNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: LessonsTheme.primary,
  },
  progressLabel: {
    fontSize: 10,
    color: LessonsTheme.textMuted,
  },
  progressStats: {
    alignItems: 'center',
  },
  statsValue: {
    fontSize: 18,
    fontWeight: '700',
    color: LessonsTheme.text,
  },
  statsLabel: {
    fontSize: 12,
    color: LessonsTheme.textMuted,
  },
  categoriesScroll: {
    marginHorizontal: -16,
  },
  categories: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
    flexDirection: 'row',
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: LessonsTheme.cardBg,
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: LessonsTheme.primary,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: LessonsTheme.text,
  },
  categoryTextActive: {
    color: '#fff',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: LessonsTheme.text,
    marginHorizontal: 16,
    marginBottom: 12,
  },
});
