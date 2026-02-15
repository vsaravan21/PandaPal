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
    paddingVertical: 12,
    paddingRight: 16,
    marginBottom: 8,
    minHeight: 48,
    justifyContent: 'center',
  },
  backText: {
    color: '#8BC34A',
    fontSize: 17,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2C2C2C',
    textAlign: 'center',
    marginBottom: 2,
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
    fontSize: 13,
    color: '#6B6B7B',
    lineHeight: 19,
    fontStyle: 'italic',
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
    fontSize: 13,
    color: '#2C2C2C',
    lineHeight: 19,
    fontWeight: '500',
    fontStyle: 'italic',
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
