import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, ActivityIndicator, Image } from 'react-native';
import { Text as ThemedText } from '@/components/Themed';
import { QuestCard } from '@/components/QuestCard';
import { getTodayQuests, updateQuestCompleted, type StoredQuest } from '@/lib/questStore';
import { useProfile } from '@/features/profile/context/ProfileContext';

const CELEBRATION_MESSAGES = [
  'You did it! 🌟',
  'Nice job! ✨',
  'Super star! ⭐',
  'Way to go! 🎉',
  'Awesome! 🐼',
  'So proud of you! 💚',
];

export default function QuestsScreen() {
  const [quests, setQuests] = useState<StoredQuest[]>([]);
  const [loading, setLoading] = useState(true);
  const [celebrationMessage, setCelebrationMessage] = useState<string | null>(null);
  const { refresh: refreshProfile } = useProfile();

  const loadQuests = useCallback(async () => {
    setLoading(true);
    const list = await getTodayQuests();
    setQuests(list);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadQuests();
  }, [loadQuests]);

  const handleToggleComplete = useCallback(
    async (questId: string, completed: boolean) => {
      const updated = await updateQuestCompleted(questId, completed);
      setQuests(updated);
      await refreshProfile();
      if (completed) {
        const msg = CELEBRATION_MESSAGES[Math.floor(Math.random() * CELEBRATION_MESSAGES.length)];
        setCelebrationMessage(msg);
        setTimeout(() => setCelebrationMessage(null), 2200);
      }
    },
    [refreshProfile]
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.avatarWrap}>
          <Image
            source={require('../../assets/images/astronaut Panda-Photoroom.png')}
            style={styles.avatarImage}
            resizeMode="contain"
          />
        </View>
        <ThemedText style={styles.title}>Quests</ThemedText>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#2D7D46" />
        </View>
      </View>
    );
  }

  if (quests.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.avatarWrap}>
          <Image
            source={require('../../assets/images/astronaut Panda-Photoroom.png')}
            style={styles.avatarImage}
            resizeMode="contain"
          />
        </View>
        <ThemedText style={styles.title}>Quests</ThemedText>
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No quests yet</Text>
          <Text style={styles.emptySubtext}>Complete caregiver onboarding to get daily quests!</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {celebrationMessage ? (
        <View style={styles.celebrationWrap}>
          <Text style={styles.celebrationText}>{celebrationMessage}</Text>
        </View>
      ) : null}
      <View style={styles.avatarWrap}>
        <Image
          source={require('../../assets/images/astronaut Panda-Photoroom.png')}
          style={styles.avatarImage}
          resizeMode="contain"
        />
      </View>
      <ThemedText style={styles.title}>Quests</ThemedText>
      <View style={styles.progressRow}>
        <Text style={styles.progressText}>
          {quests.filter((q) => q.completed).length} of {quests.length} done 🌟
        </Text>
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {(['medicine', 'routine', 'safety', 'health'] as const).map((category) => {
          const categoryQuests = quests.filter((q) => q.category === category);
          if (categoryQuests.length === 0) return null;
          const categoryLabel =
            category === 'medicine'
              ? 'Medicine'
              : category === 'routine'
                ? 'Routine'
                : category === 'safety'
                  ? 'Safety'
                  : 'Health';
          return (
            <View key={category} style={styles.categorySection}>
              <Text style={styles.categoryTitle}>{categoryLabel}</Text>
              {categoryQuests.map((q) => (
                <QuestCard
                  key={q.id}
                  title={q.text}
                  points={q.reward}
                  completed={q.completed}
                  onToggleComplete={() => handleToggleComplete(q.id, !q.completed)}
                />
              ))}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e0eeee',
  },
  avatarWrap: {
    alignItems: 'center',
    paddingTop: 56,
    paddingBottom: 8,
  },
  avatarImage: {
    width: 180,
    height: 180,
  },
  celebrationWrap: {
    position: 'absolute',
    top: 56,
    left: 24,
    right: 24,
    alignItems: 'center',
    zIndex: 10,
    backgroundColor: 'rgba(45, 125, 70, 0.15)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginHorizontal: 24,
  },
  celebrationText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D7D46',
  },
  progressRow: {
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  progressText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2D7D46',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B6B7B',
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 8,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 8,
    paddingBottom: 24,
  },
  categorySection: {
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2D7D46',
    marginBottom: 10,
    marginHorizontal: 24,
  },
});
