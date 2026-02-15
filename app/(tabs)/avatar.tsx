/**
 * Avatar tab - Child-safe epilepsy chatbot. Panda hero, heading, horizontal chip rail, light message cards.
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
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
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/features/profile/context/ProfileContext';
import { getPandaAvatarById, PANDA_DEFAULT_ID } from '@/features/avatar/pandaAssets';
import { getChildren } from '@/features/backend/children';
import { fetchChildChatReply } from '@/lib/childChatApi';
import { getOrCreateChildChatId } from '@/lib/childChatStorage';
import { LessonsTheme } from '@/features/lessons/constants';

const QUICK_CHIPS = [
  'What is a seizure?',
  'Why do I take medicine?',
  'What happens at the doctor?',
  'What should I do if I feel strange?',
];

type Message = { role: 'user' | 'assistant'; content: string };

const SPACE = { xs: 4, sm: 8, md: 12, lg: 16 };

export default function AvatarScreen() {
  const { uid } = useAuth();
  const { profile, loading } = useProfile();
  const [pandaNameFromFirestore, setPandaNameFromFirestore] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const pandaAvatar = getPandaAvatarById(profile?.pandaAvatarId ?? PANDA_DEFAULT_ID);

  useEffect(() => {
    if (!uid) return;
    getChildren(uid)
      .then((children) => {
        const first = children[0];
        setPandaNameFromFirestore(first?.pandaName?.trim() ?? null);
      })
      .catch(() => setPandaNameFromFirestore(null));
  }, [uid]);

  const headingName = pandaNameFromFirestore ?? 'your panda';

  const scrollToEnd = useCallback(() => {
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || typing) return;

      setMessages((prev) => [...prev, { role: 'user', content: trimmed }]);
      setInputText('');
      setTyping(true);
      scrollToEnd();

      try {
        const childId = await getOrCreateChildChatId();
        const reply = await fetchChildChatReply(trimmed, childId);
        setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
      } catch {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: "Something went wrong. Let's try again or ask a grown up." },
        ]);
      } finally {
        setTyping(false);
        scrollToEnd();
      }
    },
    [typing, scrollToEnd]
  );

  const handleSend = useCallback(() => {
    sendMessage(inputText);
  }, [inputText, sendMessage]);

  const handleChip = useCallback(
    (chip: string) => {
      sendMessage(chip);
    },
    [sendMessage]
  );

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
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Hero panda – centered */}
        <View style={styles.hero}>
          <View style={styles.pandaWrap}>
            <Image source={pandaAvatar.source} style={styles.pandaImage} resizeMode="contain" />
          </View>
        </View>

        {/* Heading – bold, no card */}
        <Text style={styles.heading}>
          What questions do you have today, {headingName}? Ask me anything about seizures or your medicine.
        </Text>

        {/* Horizontal chip rail */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRail}
          style={styles.chipRailScroll}
        >
          {QUICK_CHIPS.map((chip) => (
            <Pressable
              key={chip}
              style={({ pressed }) => [styles.chip, pressed && styles.chipPressed]}
              onPress={() => handleChip(chip)}
            >
              <Text style={styles.chipText} numberOfLines={1}>{chip}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Conversation */}
        {messages.map((msg, i) => (
          <View key={i} style={msg.role === 'user' ? styles.userBubbleWrap : undefined}>
            <View style={msg.role === 'user' ? styles.userBubble : styles.bubble}>
              <Text style={msg.role === 'user' ? styles.userBubbleText : styles.bubbleText}>
                {msg.content}
              </Text>
            </View>
          </View>
        ))}

        {typing && (
          <View style={styles.bubble}>
            <View style={styles.typingRow}>
              <ActivityIndicator size="small" color={LessonsTheme.primary} />
              <Text style={styles.typingText}>Thinking...</Text>
            </View>
          </View>
        )}

        <View style={styles.spacer} />
      </ScrollView>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Ask your panda..."
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
    gap: SPACE.md,
  },
  loadingText: {
    fontSize: 15,
    color: LessonsTheme.textMuted,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: SPACE.lg,
    paddingTop: 40,
    paddingBottom: SPACE.lg + 8,
    alignItems: 'center',
  },
  hero: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 16,
  },
  heading: {
    fontSize: 18,
    fontWeight: '700',
    color: LessonsTheme.primary,
    textAlign: 'center',
    maxWidth: '85%',
    marginBottom: 12,
    lineHeight: 24,
  },
  pandaWrap: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: LessonsTheme.cardBg,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(45, 125, 70, 0.15)',
  },
  pandaImage: {
    width: '100%',
    height: '100%',
  },
  chipRailScroll: {
    marginBottom: SPACE.md,
    maxHeight: 44,
  },
  chipRail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACE.sm,
    paddingVertical: SPACE.xs,
    paddingHorizontal: 2,
  },
  chip: {
    backgroundColor: LessonsTheme.cardBg,
    paddingVertical: SPACE.sm,
    paddingHorizontal: SPACE.md,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(45, 125, 70, 0.2)',
  },
  chipPressed: { opacity: 0.85 },
  chipText: {
    fontSize: 13,
    color: LessonsTheme.text,
    fontWeight: '500',
    maxWidth: 160,
  },
  bubble: {
    width: '100%',
    backgroundColor: LessonsTheme.cardBg,
    borderRadius: 14,
    paddingVertical: SPACE.md,
    paddingHorizontal: SPACE.lg,
    marginBottom: SPACE.sm,
    borderWidth: 0,
  },
  bubbleText: {
    fontSize: 15,
    color: LessonsTheme.text,
    lineHeight: 22,
  },
  userBubbleWrap: {
    width: '100%',
    alignItems: 'flex-end',
    marginBottom: SPACE.sm,
  },
  userBubble: {
    maxWidth: '88%',
    backgroundColor: 'rgba(45, 125, 70, 0.08)',
    borderRadius: 14,
    paddingVertical: SPACE.sm,
    paddingHorizontal: SPACE.md,
    borderWidth: 0,
  },
  userBubbleText: {
    fontSize: 15,
    color: LessonsTheme.text,
    lineHeight: 22,
  },
  typingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACE.sm,
  },
  typingText: {
    fontSize: 14,
    color: LessonsTheme.textMuted,
  },
  spacer: { height: SPACE.lg },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACE.sm,
    paddingHorizontal: SPACE.lg,
    paddingVertical: SPACE.sm,
    paddingBottom: Platform.OS === 'ios' ? 24 : SPACE.sm,
    backgroundColor: LessonsTheme.background,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  input: {
    flex: 1,
    backgroundColor: LessonsTheme.cardBg,
    borderRadius: 12,
    paddingHorizontal: SPACE.md,
    paddingVertical: 10,
    fontSize: 15,
    color: LessonsTheme.text,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    maxHeight: 88,
  },
  sendBtn: {
    backgroundColor: LessonsTheme.primary,
    paddingHorizontal: SPACE.lg,
    paddingVertical: 10,
    borderRadius: 12,
    justifyContent: 'center',
  },
  sendBtnPressed: { opacity: 0.9 },
  sendBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
});
