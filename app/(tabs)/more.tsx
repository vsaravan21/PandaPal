/**
 * My Care Plan tab - kid-friendly view (mock data only).
 */

import { carePlanMock } from '@/features/carePlan/carePlanMock';
import { LessonsTheme } from '@/features/lessons/constants';
import * as Linking from 'expo-linking';
import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const theme = LessonsTheme;

export default function CarePlanTabScreen() {
  const plan = carePlanMock;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Care Plan</Text>
        <Text style={styles.subtitle}>Made just for you 💚</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* A) Panda intro bubble */}
        <View style={styles.bubbleWrap}>
          <Text style={styles.bubbleText}>
            Here's your plan to stay safe and strong! 💪🐼
          </Text>
        </View>

        {/* B) My Daily Routine */}
        <Text style={styles.sectionTitle}>My Daily Routine</Text>
        {plan.dailyRoutine.map((item) => (
          <View key={item.id} style={styles.routineCard}>
            <View style={styles.checkCircle} />
            <Text style={styles.cardText}>{item.text}</Text>
          </View>
        ))}

        {/* C) If I Feel Weird */}
        <Text style={styles.sectionTitle}>If I Feel Weird</Text>
        <View style={styles.safetyCard}>
          {plan.feelWeirdSteps.map((step, i) => (
            <View key={i} style={styles.stepRow}>
              <Text style={styles.stepNum}>{i + 1}.</Text>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </View>

        {/* D) My Medicines */}
        <Text style={styles.sectionTitle}>My Medicines</Text>
        {plan.medicines.map((m, i) => (
          <View key={i} style={styles.card}>
            <Text style={styles.medName}>{m.name}</Text>
            <Text style={styles.medTime}>{m.timeOfDay}</Text>
          </View>
        ))}

        {/* E) My Helpers */}
        <Text style={styles.sectionTitle}>My Helpers</Text>
        {plan.helpers.map((h, i) => (
          <View key={i} style={styles.card}>
            <Text style={styles.helperTitle}>{h.title}</Text>
            {h.name ? <Text style={styles.helperName}>{h.name}</Text> : null}
            {h.note ? <Text style={styles.helperNote}>{h.note}</Text> : null}
          </View>
        ))}

        {/* F) Helpful Tips */}
        <Text style={styles.sectionTitle}>Helpful Tips</Text>
        {plan.tips.map((tip, i) => (
          <View key={i} style={styles.tipCard}>
            <Text style={styles.tipText}>✨ {tip}</Text>
          </View>
        ))}

        {/* G) Resources */}
        <Text style={styles.sectionTitle}>Resources</Text>
        {plan.resources.map((r, i) => (
          <Pressable
            key={i}
            style={({ pressed }) => [styles.resourceCard, pressed && styles.cardPressed]}
            onPress={() => Linking.openURL(r.url)}
            accessibilityRole="link"
            accessibilityLabel={`${r.title}: ${r.description}`}
          >
            <Text style={styles.resourceTitle}>{r.title}</Text>
            <Text style={styles.resourceDesc}>{r.description}</Text>
          </Pressable>
        ))}

        {/* Edit hint */}
        <Text style={styles.editHint}>Edit in caregiver mode</Text>
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.background },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    backgroundColor: theme.calmBg,
  },
  headerTitle: { fontSize: 22, fontWeight: '700', color: theme.text },
  subtitle: { fontSize: 16, color: theme.textMuted, marginTop: 4 },
  scroll: { flex: 1 },
  scrollContent: { padding: 24, paddingBottom: 48 },
  bubbleWrap: {
    backgroundColor: theme.primaryLight,
    borderRadius: 20,
    padding: 18,
    marginBottom: 24,
    alignSelf: 'flex-start',
    maxWidth: '100%',
  },
  bubbleText: { fontSize: 17, color: theme.text, lineHeight: 24 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 12,
  },
  card: {
    backgroundColor: theme.cardBg,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  routineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.cardBg,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: theme.primary,
    marginRight: 12,
  },
  cardText: { flex: 1, fontSize: 16, color: theme.text, lineHeight: 22 },
  safetyCard: {
    backgroundColor: theme.primaryLight,
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: theme.primary,
  },
  stepRow: { flexDirection: 'row', marginBottom: 10 },
  stepNum: { fontSize: 16, fontWeight: '700', color: theme.primary, marginRight: 8, minWidth: 20 },
  stepText: { flex: 1, fontSize: 16, color: theme.text, lineHeight: 22 },
  medName: { fontSize: 17, fontWeight: '600', color: theme.text },
  medTime: { fontSize: 15, color: theme.textMuted, marginTop: 4 },
  helperTitle: { fontSize: 15, fontWeight: '600', color: theme.primary },
  helperName: { fontSize: 17, color: theme.text, marginTop: 4 },
  helperNote: { fontSize: 14, color: theme.textMuted, marginTop: 4, fontStyle: 'italic' },
  tipCard: {
    backgroundColor: theme.cardBg,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: theme.primary,
  },
  tipText: { fontSize: 15, color: theme.text, lineHeight: 22 },
  resourceCard: {
    backgroundColor: theme.cardBg,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.border,
  },
  resourceTitle: { fontSize: 17, fontWeight: '600', color: theme.primary },
  resourceDesc: { fontSize: 14, color: theme.textMuted, marginTop: 6, lineHeight: 20 },
  cardPressed: { opacity: 0.9 },
  editHint: {
    fontSize: 14,
    color: theme.textMuted,
    textAlign: 'center',
    marginTop: 32,
    fontStyle: 'italic',
  },
  bottomSpacer: { height: 24 },
});
