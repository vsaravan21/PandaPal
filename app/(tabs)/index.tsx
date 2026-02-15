import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, ActivityIndicator, Image } from 'react-native';
import { Text as ThemedText } from '@/components/Themed';
import { QuestCard } from '@/components/QuestCard';
import { getTodayQuests, updateQuestCompleted, type StoredQuest } from '@/lib/questStore';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/features/profile/context/ProfileContext';
import { getPandaAvatarById } from '@/features/profile/data/pandaAvatars';
import { getChildren } from '@/features/backend/children';

const CELEBRATION_MESSAGES = [
  'You did it!',
  'Nice job!',
  'Way to go!',
  'Awesome! 🐼',
  'So proud of you!',
  'You rock!',
];

export default function QuestsScreen() {
  const [quests, setQuests] = useState<StoredQuest[]>([]);
  const [loading, setLoading] = useState(true);
  const [celebrationMessage, setCelebrationMessage] = useState<string | null>(null);
  const [pandaNameFromFirestore, setPandaNameFromFirestore] = useState<string | null>(null);
  const { uid } = useAuth();
  const { profile, refresh: refreshProfile } = useProfile();
  const pandaAvatar = getPandaAvatarById(profile?.pandaAvatarId ?? 'panda_default');

  const loadQuests = useCallback(async () => {
    setLoading(true);
    const list = await getTodayQuests();
    setQuests(list);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadQuests();
  }, [loadQuests]);

  // Panda name from Firestore (parents/{uid}/children doc pandaName field) for "Hey [panda name]!"
  useEffect(() => {
    if (!uid) return;
    getChildren(uid)
      .then((children) => {
        const first = children[0];
        setPandaNameFromFirestore(first?.pandaName?.trim() ?? null);
      })
      .catch(() => setPandaNameFromFirestore(null));
  }, [uid]);

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

  const greetingName =
    pandaNameFromFirestore ?? 'there';

  const totalPoints = quests.reduce((sum, q) => sum + q.reward, 0);
  const earnedPoints = quests.filter((q) => q.completed).reduce((sum, q) => sum + q.reward, 0);
  const progressPct = totalPoints ? (earnedPoints / totalPoints) * 100 : 0;

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.avatarWrap}>
          <Image
            source={pandaAvatar.source}
            style={styles.avatarImage}
            resizeMode="contain"
          />
          <Text style={styles.heyText}>Hey {greetingName}!</Text>
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
            source={pandaAvatar.source}
            style={styles.avatarImage}
            resizeMode="contain"
          />
          <Text style={styles.heyText}>Hey {greetingName}!</Text>
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
          source={pandaAvatar.source}
          style={styles.avatarImage}
          resizeMode="contain"
        />
        <Text style={styles.heyText}>Hey {greetingName}!</Text>
      </View>
      <ThemedText style={styles.title}>Quests</ThemedText>
      <View style={styles.progressRow}>
        <View style={styles.progressTrack}>
          <View
            style={[styles.progressFill, { width: `${progressPct}%` }]}
          />
        </View>
        <Text style={styles.progressLabel}>
          {earnedPoints}/{totalPoints} ❤️
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
    paddingTop: 100,
    paddingBottom: 4,
  },
  avatarImage: {
    width: 172,
    height: 172,
  },
  heyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginTop: 8,
    letterSpacing: 0.2,
  },
  celebrationWrap: {
    position: 'absolute',
    top: 60,
    left: 24,
    right: 24,
    alignItems: 'center',
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 16,
    marginHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  celebrationText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2D7D46',
    letterSpacing: 0.2,
  },
  progressRow: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    gap: 10,
  },
  progressTrack: {
    height: 14,
    backgroundColor: 'rgba(45, 125, 70, 0.12)',
    borderRadius: 7,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2D7D46',
    borderRadius: 7,
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2D7D46',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 4,
    color: '#1a1a1a',
    letterSpacing: 0.3,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  emptyText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#5a5a6e',
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 20,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 4,
    paddingBottom: 28,
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2D7D46',
    marginBottom: 12,
    marginHorizontal: 24,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
