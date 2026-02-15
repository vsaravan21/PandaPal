import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { router } from 'expo-router';

export default function CreatePandaIntroScreen() {
  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Create a New Panda</Text>

        <View style={styles.cardStack}>
          <View style={[styles.card, styles.cardActive]}>
            <Text style={styles.cardTitle}>Step 1 for Grown-Ups</Text>
            <Text style={styles.cardBody}>
              Caregivers upload care plan details so PandaPal can build daily quests
            </Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Step 2 for Your Panda</Text>
            <Text style={styles.cardBody}>
              Kids customize their panda and world
            </Text>
          </View>
        </View>

        <View style={styles.progressWrap}>
          <View style={styles.progressBar}>
            <View style={[styles.segment, styles.segmentActive]} />
            <View style={styles.segment} />
          </View>
          <Text style={styles.progressLabel}>Step 1 of 2</Text>
        </View>

        <View style={styles.infoBanner}>
          <Text style={styles.infoBannerText}>
            Caregiver and child should complete this onboarding together
          </Text>
        </View>

        <Pressable
          style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}
          onPress={() => router.push('/caregiver-upload')}
          accessibilityLabel="Start Caregiver Step"
        >
          <Text style={styles.primaryButtonText}>Start Caregiver Step</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D9EEF9',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#2C2C2C',
    marginBottom: 28,
    textAlign: 'center',
  },
  cardStack: {
    width: '100%',
    gap: 14,
    marginBottom: 28,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardActive: {
    borderWidth: 2,
    borderColor: 'rgba(139, 195, 74, 0.4)',
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2C2C2C',
    marginBottom: 6,
  },
  cardBody: {
    fontSize: 15,
    color: '#6B6B7B',
    lineHeight: 22,
  },
  progressWrap: {
    width: '100%',
    marginBottom: 24,
    alignItems: 'center',
  },
  progressBar: {
    flexDirection: 'row',
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(139, 195, 74, 0.25)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  segment: {
    flex: 1,
    backgroundColor: 'rgba(139, 195, 74, 0.25)',
  },
  segmentActive: {
    backgroundColor: '#8BC34A',
  },
  progressLabel: {
    fontSize: 14,
    color: '#6B6B7B',
    fontWeight: '500',
  },
  infoBanner: {
    width: '100%',
    backgroundColor: 'rgba(139, 195, 74, 0.15)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
    borderLeftWidth: 4,
    borderLeftColor: '#8BC34A',
  },
  infoBannerText: {
    fontSize: 15,
    color: '#2C2C2C',
    lineHeight: 22,
    fontWeight: '500',
  },
  primaryButton: {
    backgroundColor: '#8BC34A',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 28,
    minWidth: 280,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonPressed: {
    opacity: 0.9,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});
