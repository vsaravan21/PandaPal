/**
 * Avatar tab - Large panda, whimsical chat bubble, input + Send.
 * Uses pandaAvatarId from profile (fallback panda_default). XP header from profile or placeholder.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useProfile } from '@/features/profile/context/ProfileContext';
import { getPandaAvatarById, PANDA_DEFAULT_ID } from '@/features/avatar/pandaAssets';
import { generateWhimsicalResponse } from '@/features/avatar/pandaResponses';
import { LessonsTheme } from '@/features/lessons/constants';

const DEFAULT_BUBBLE = "Hiya! I'm your panda 🐼✨ Ask me anything!";
const PLACEHOLDER_LEVEL = 1;
const PLACEHOLDER_XP = 25;
const PLACEHOLDER_XP_NEEDED = 50;

export default function AvatarScreen() {
  const { profile, loading, level, xpProgress } = useProfile();
  const [inputText, setInputText] = useState('');
  const [pandaMessage, setPandaMessage] = useState(DEFAULT_BUBBLE);
  const [messageHistory, setMessageHistory] = useState<string[]>([DEFAULT_BUBBLE]);

  const displayLevel = profile ? level : PLACEHOLDER_LEVEL;
  const displayXpCurrent = profile ? xpProgress.current : PLACEHOLDER_XP;
  const displayXpNeeded = profile ? (xpProgress.needed || PLACEHOLDER_XP_NEEDED) : PLACEHOLDER_XP_NEEDED;
  const displayPct = profile ? xpProgress.pct : Math.round((PLACEHOLDER_XP / PLACEHOLDER_XP_NEEDED) * 100);

  const pandaAvatar = getPandaAvatarById(profile?.pandaAvatarId ?? PANDA_DEFAULT_ID);

  const handleSend = () => {
    const trimmed = inputText.trim();
    if (!trimmed) return;
    const reply = generateWhimsicalResponse(trimmed);
    setPandaMessage(reply);
    setMessageHistory((prev) => [...prev.slice(-9), reply]);
    setInputText('');
  };

  if (loading && !profile) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={LessonsTheme.primary} />
          <Text style={styles.loadingText}>Loading your panda…</Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* (A) XP header */}
      <View style={styles.xpHeader}>
        <Text style={styles.levelText}>Level {displayLevel}</Text>
        <View style={styles.xpBarWrap}>
          <View style={[styles.xpBarFill, { width: `${Math.min(100, displayPct)}%` }]} />
        </View>
        <Text style={styles.xpLabel}>
          {displayXpCurrent}/{displayXpNeeded} XP
        </Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* (B) Large centered panda */}
        <View style={styles.pandaWrap}>
          <Image source={pandaAvatar.source} style={styles.pandaImage} resizeMode="contain" />
        </View>

        {/* (C) Whimsical output bubble */}
        <View style={styles.bubbleCard}>
          <Text style={styles.bubbleText}>{pandaMessage}</Text>
        </View>

        {/* Spacer for keyboard */}
        <View style={styles.spacer} />
      </ScrollView>

      {/* (D) Input + Send row */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Ask your panda anything..."
          placeholderTextColor={LessonsTheme.textMuted}
          value={inputText}
          onChangeText={setInputText}
          multiline={false}
          maxLength={200}
          returnKeyType="send"
          onSubmitEditing={handleSend}
        />
        <Pressable
          style={({ pressed }) => [styles.sendBtn, pressed && styles.sendBtnPressed]}
          onPress={handleSend}
        >
          <Text style={styles.sendBtnText}>Send</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LessonsTheme.background,
  },
  loadingWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: LessonsTheme.textMuted,
  },
  xpHeader: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
    backgroundColor: LessonsTheme.calmBg,
    borderBottomWidth: 1,
    borderBottomColor: LessonsTheme.border,
  },
  levelText: {
    fontSize: 18,
    fontWeight: '700',
    color: LessonsTheme.text,
    marginBottom: 6,
  },
  xpBarWrap: {
    height: 10,
    backgroundColor: LessonsTheme.border,
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 4,
  },
  xpBarFill: {
    height: '100%',
    backgroundColor: LessonsTheme.primary,
    borderRadius: 5,
  },
  xpLabel: {
    fontSize: 13,
    color: LessonsTheme.textMuted,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    alignItems: 'center',
  },
  pandaWrap: {
    width: 240,
    height: 240,
    marginBottom: 20,
    borderRadius: 120,
    backgroundColor: LessonsTheme.cardBg,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: LessonsTheme.primaryLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  pandaImage: {
    width: '100%',
    height: '100%',
  },
  bubbleCard: {
    width: '100%',
    backgroundColor: LessonsTheme.cardBg,
    borderRadius: 20,
    padding: 18,
    borderWidth: 2,
    borderColor: LessonsTheme.primaryLight,
    minHeight: 72,
  },
  bubbleText: {
    fontSize: 16,
    color: LessonsTheme.text,
    lineHeight: 24,
  },
  spacer: { height: 24 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 12,
    backgroundColor: LessonsTheme.calmBg,
    borderTopWidth: 1,
    borderTopColor: LessonsTheme.border,
  },
  input: {
    flex: 1,
    backgroundColor: LessonsTheme.cardBg,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: LessonsTheme.text,
    borderWidth: 1,
    borderColor: LessonsTheme.border,
    maxHeight: 100,
  },
  sendBtn: {
    backgroundColor: LessonsTheme.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    justifyContent: 'center',
  },
  sendBtnPressed: { opacity: 0.9 },
  sendBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});
