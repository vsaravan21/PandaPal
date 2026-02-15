import { router } from 'expo-router';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function CreatePandaIntroChildScreen() {
  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          style={({ pressed }) => [styles.backWrap, pressed && { opacity: 0.7 }]}
          onPress={() => router.back()}
          accessibilityLabel="Go back"
        >
          <Text style={styles.backText}>←</Text>
        </Pressable>

        <Text style={styles.title}>Create a New Panda</Text>

        <Image
          source={require('../assets/images/new_panda.png')}
          style={styles.pandaImage}
          resizeMode="contain"
        />

        <View style={styles.cardStack}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Step 1 for Grown-Ups</Text>
            <Text style={styles.cardBody}>
              Caregivers upload care plan details so PandaPal can build daily quests
            </Text>
          </View>
          <View style={[styles.card, styles.cardActive]}>
            <Text style={styles.cardTitle}>Step 2 for your Child</Text>
            <Text style={styles.cardBody}>
              Kids customize their panda and world
            </Text>
          </View>
        </View>

        <View style={styles.progressWrap}>
          <View style={styles.progressBar}>
            <View style={styles.segment} />
            <View style={[styles.segment, styles.segmentActive]} />
          </View>
          <Text style={styles.progressLabel}>Step 2 of 2</Text>
        </View>

        <View style={styles.infoBanner}>
          <Text style={styles.infoBannerText}>
            One step closer to unlocking your Panda!
          </Text>
        </View>

        <Pressable
          style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}
          onPress={() => router.push('/create-panda')}
          accessibilityLabel="Start Child Step"
        >
          <Text style={styles.primaryButtonText}>Start Child Step</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e0eeee',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 40,
    alignItems: 'center',
  },
  backWrap: {
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingRight: 16,
    marginBottom: 8,
    minHeight: 44,
    justifyContent: 'center',
  },
  backText: {
    color: '#2D7D46',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  pandaImage: {
    width: 208,
    height: 208,
    marginBottom: 8,
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
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  cardActive: {
    borderWidth: 2,
    borderColor: 'rgba(45, 125, 70, 0.35)',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  cardBody: {
    fontSize: 13,
    color: '#6B6B7B',
    lineHeight: 19,
    fontStyle: 'italic',
    letterSpacing: 0.2,
  },
  progressWrap: {
    width: '100%',
    marginBottom: 24,
    alignItems: 'center',
  },
  progressBar: {
    flexDirection: 'row',
    width: '100%',
    height: 10,
    backgroundColor: 'rgba(45, 125, 70, 0.12)',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 10,
  },
  segment: {
    flex: 1,
    backgroundColor: 'rgba(45, 125, 70, 0.12)',
  },
  segmentActive: {
    backgroundColor: '#2D7D46',
  },
  progressLabel: {
    fontSize: 13,
    color: '#6B6B7B',
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  infoBanner: {
    width: '100%',
    backgroundColor: 'rgba(45, 125, 70, 0.08)',
    borderRadius: 14,
    padding: 18,
    marginBottom: 32,
    borderLeftWidth: 4,
    borderLeftColor: '#2D7D46',
  },
  infoBannerText: {
    fontSize: 13,
    color: '#1a1a1a',
    lineHeight: 20,
    fontWeight: '500',
    fontStyle: 'italic',
    letterSpacing: 0.2,
  },
  primaryButton: {
    backgroundColor: '#2D7D46',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 14,
    minWidth: 280,
    alignItems: 'center',
    shadowColor: '#2D7D46',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  primaryButtonPressed: {
    opacity: 0.9,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
