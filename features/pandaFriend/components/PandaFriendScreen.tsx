/**
 * Panda Friend - profile, customization, collection hub
 * Child experience: fun, playful, no medical content
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  ImageBackground,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePandaFriend } from '../context/PandaFriendContext';
import { useLessons } from '@/features/lessons/context/LessonsContext';
import { ITEM_CATALOG, STARTER_ITEM_IDS } from '../data/itemCatalog';
import type { PandaItem, ItemType } from '../types';

const PRIMARY = '#2D7D46';
const PRIMARY_LIGHT = '#8CE0A1';
const CARD_BG = '#fff';
const Bg = '#e8f4f0';

type TabId = 'avatar' | 'about' | 'wardrobe' | 'room' | 'collection';

const PANDA_DEFAULT = require('../../../assets/images/panda-default.png');

const AVATAR_SECTION_HEIGHT = Math.min(Dimensions.get('window').height * 0.55, 420);

function PandaPreview({
  equippedHat,
  equippedGlasses,
  equippedBg,
  withChatBar,
  fullHeight,
  chatInput,
  onChatInputChange,
  onSendChat,
  insetsBottom,
}: {
  equippedHat: string | null;
  equippedGlasses: string | null;
  equippedBg: string | null;
  withChatBar: boolean;
  fullHeight?: boolean;
  chatInput?: string;
  onChatInputChange?: (t: string) => void;
  onSendChat?: () => void;
  insetsBottom?: number;
}) {
  const bg = equippedBg ? ITEM_CATALOG.find((i) => i.id === equippedBg) : null;
  const bgImage = bg?.imageSource;
  const fallbackColor = bg
    ? bg.emoji === '🌿'
      ? '#d4edda'
      : bg.emoji === '🏖️' || bg.emoji === '⛺'
        ? '#fff3e0'
        : bg.emoji === '🌌'
          ? '#1a1a2e'
          : bg.emoji === '🏡'
            ? '#c8e6c9'
            : '#e3f2fd'
    : '#c8e6c9';

  const pandaContent = (
    <View style={styles.pandaWrapper}>
      <Image source={PANDA_DEFAULT} style={styles.pandaImage} resizeMode="contain" />
      {equippedHat && (
        <View style={styles.emojiOverlay}>
          <Text style={styles.emoji}>{ITEM_CATALOG.find((i) => i.id === equippedHat)?.emoji ?? '🎀'}</Text>
        </View>
      )}
      {equippedGlasses && (
        <View style={[styles.emojiOverlay, { top: '40%' }]}>
          <Text style={styles.emoji}>{ITEM_CATALOG.find((i) => i.id === equippedGlasses)?.emoji ?? '👓'}</Text>
        </View>
      )}
    </View>
  );

  const chatBar =
    withChatBar && chatInput !== undefined && onChatInputChange && onSendChat && insetsBottom !== undefined ? (
      <View style={[styles.chatBarInAvatar, { paddingBottom: insetsBottom + 12 }]}>
        <TextInput
          style={styles.chatInput}
          value={chatInput}
          onChangeText={onChatInputChange}
          placeholder="Chat with your panda..."
          placeholderTextColor="#999"
          returnKeyType="send"
          onSubmitEditing={onSendChat}
        />
        <Pressable style={({ pressed }) => [styles.chatSend, pressed && styles.chatSendPressed]} onPress={onSendChat}>
          <Text style={styles.chatSendText}>Send</Text>
        </Pressable>
      </View>
    ) : null;

  const heroStyle = [
    styles.avatarSection,
    { height: fullHeight ? undefined : AVATAR_SECTION_HEIGHT, flex: fullHeight ? 1 : undefined, backgroundColor: fallbackColor },
  ];

  if (bgImage) {
    return (
      <ImageBackground source={bgImage} style={heroStyle} resizeMode="cover">
        <View style={styles.heroOverlay}>{pandaContent}</View>
        {chatBar}
      </ImageBackground>
    );
  }

  return (
    <View style={heroStyle}>
      <View style={styles.heroOverlay}>{pandaContent}</View>
      {chatBar}
    </View>
  );
}

export function PandaFriendScreen() {
  const insets = useSafeAreaInsets();
  const {
    panda,
    profile,
    level,
    growthStageLabel,
    xpProgress,
    adventuresCompleted,
    loading,
    setPandaName,
    equipHat,
    equipGlasses,
    equipOutfit,
    equipAccessory,
    equipBackground,
    setDecorSlot,
    syncAdventuresFromLessons,
  } = usePandaFriend();
  const { progress } = useLessons();
  const [tab, setTab] = useState<TabId>('avatar');
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(panda?.pandaName ?? 'My Panda');

  const completedLessons = Object.values(progress).filter((p) => p.completed).length;
  useEffect(() => {
    syncAdventuresFromLessons(completedLessons);
  }, [completedLessons, syncAdventuresFromLessons]);

  const equipped = {
    hat: profile?.equippedItems?.hat ?? null,
    glasses: panda?.equippedGlassesId ?? null,
    outfit: profile?.equippedItems?.shirt ?? null,
    accessory: profile?.equippedItems?.accessory ?? null,
    background: profile?.equippedItems?.background ?? null,
  };
  const inventory = profile?.inventory ?? [];
  const unlockedIds = new Set([...inventory, ...STARTER_ITEM_IDS]);

  if (loading || !panda) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={PRIMARY} />
      </View>
    );
  }

  const handleSaveName = () => {
    setPandaName(nameInput);
    setEditingName(false);
  };

  const tabs: { id: TabId; label: string }[] = [
    { id: 'avatar', label: 'Avatar' },
    { id: 'about', label: 'About' },
    { id: 'wardrobe', label: 'Wardrobe' },
    { id: 'room', label: 'Nest' },
    { id: 'collection', label: 'Collection' },
  ];

  const [chatInput, setChatInput] = useState('');
  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    // MVP: store locally, show toast. Future: AI/backend
    setChatInput('');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.title}>Panda Friend</Text>
        <Text style={styles.subtitle}>Watch them grow day by day</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabRow} contentContainerStyle={styles.tabRowContent}>
        {tabs.map((t) => (
          <Pressable
            key={t.id}
            style={[styles.tab, tab === t.id && styles.tabActive]}
            onPress={() => setTab(t.id)}
          >
            <Text style={[styles.tabText, tab === t.id && styles.tabTextActive]}>{t.label}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {tab === 'avatar' ? (
        <View style={styles.avatarTabContent}>
          <PandaPreview
            equippedHat={equipped.hat}
            equippedGlasses={equipped.glasses}
            equippedBg={equipped.background}
            withChatBar={true}
            fullHeight={true}
            chatInput={chatInput}
            onChatInputChange={setChatInput}
            onSendChat={handleSendChat}
            insetsBottom={insets.bottom}
          />
        </View>
      ) : (
      <ScrollView style={styles.scroll} contentContainerStyle={[styles.content, { paddingBottom: 16 }]} keyboardShouldPersistTaps="handled">
        <PandaPreview
          equippedHat={equipped.hat}
          equippedGlasses={equipped.glasses}
          equippedBg={equipped.background}
          withChatBar={false}
        />

        <View style={styles.card}>
        {editingName ? (
          <View style={styles.nameRow}>
            <TextInput
              style={styles.nameInput}
              value={nameInput}
              onChangeText={setNameInput}
              placeholder="Panda name"
              autoFocus
              onSubmitEditing={handleSaveName}
            />
            <Pressable onPress={handleSaveName} style={styles.saveBtn}>
              <Text style={styles.saveBtnText}>Save</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable onPress={() => setEditingName(true)} style={styles.nameRow}>
            <Text style={styles.pandaName}>{panda.pandaName}</Text>
            <Text style={styles.editHint}>tap to edit</Text>
          </Pressable>
        )}
        <Text style={styles.adventures}>{adventuresCompleted} Adventures</Text>
        <Text style={styles.growth}>{growthStageLabel}</Text>
        <View style={styles.xpBar}>
          <View style={[styles.xpFill, { width: `${xpProgress.pct}%` }]} />
        </View>
        <Text style={styles.xpLabel}>Level {level} • {xpProgress.current}/{xpProgress.needed || '—'} XP</Text>
      </View>

      {tab === 'about' && (
        <AboutTab panda={panda} level={level} adventures={adventuresCompleted} unlockedIds={unlockedIds} />
      )}
      {tab === 'wardrobe' && (
        <WardrobeTab
          equipped={equipped}
          unlockedIds={unlockedIds}
          onEquipHat={equipHat}
          onEquipGlasses={equipGlasses}
          onEquipOutfit={equipOutfit}
          onEquipAccessory={equipAccessory}
        />
      )}
      {tab === 'room' && (
        <RoomTab
          equippedBg={equipped.background}
          decorSlots={panda.decorSlots}
          unlockedIds={unlockedIds}
          onEquipBg={equipBackground}
          onSetDecor={setDecorSlot}
        />
      )}
      {tab === 'collection' && (
        <CollectionTab unlockedIds={unlockedIds} seenIds={panda.seenItemIds} onMarkSeen={() => {}} />
      )}
      </ScrollView>
      )}
    </KeyboardAvoidingView>
  );
}

function AboutTab({
  panda,
  level,
  adventures,
  unlockedIds,
}: {
  panda: { pandaName: string };
  level: number;
  adventures: number;
  unlockedIds: Set<string>;
}) {
  const badges = ITEM_CATALOG.filter((i) => unlockedIds.has(i.id)).slice(0, 6);
  return (
    <View style={styles.tabContent}>
      <Text style={styles.cardTitle}>About</Text>
      <View style={styles.aboutRow}>
        <Text style={styles.aboutLabel}>Level</Text>
        <Text style={styles.aboutValue}>{level}</Text>
      </View>
      <View style={styles.aboutRow}>
        <Text style={styles.aboutLabel}>Adventures completed</Text>
        <Text style={styles.aboutValue}>{adventures}</Text>
      </View>
      <Text style={[styles.cardTitle, { marginTop: 16 }]}>Badges earned</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.badgesRow}>
        {badges.map((b) => (
          <View key={b.id} style={styles.badge}>
            <Text style={styles.badgeEmoji}>{b.emoji}</Text>
            <Text style={styles.badgeName}>{b.name}</Text>
          </View>
        ))}
        {badges.length === 0 && (
          <Text style={styles.emptyHint}>Complete quests to unlock items!</Text>
        )}
      </ScrollView>
    </View>
  );
}

function WardrobeTab({
  equipped,
  unlockedIds,
  onEquipHat,
  onEquipGlasses,
  onEquipOutfit,
  onEquipAccessory,
}: {
  equipped: Record<string, string | null>;
  unlockedIds: Set<string>;
  onEquipHat: (id: string | null) => Promise<void>;
  onEquipGlasses: (id: string | null) => Promise<void>;
  onEquipOutfit: (id: string | null) => Promise<void>;
  onEquipAccessory: (id: string | null) => Promise<void>;
}) {
  const categories: { type: ItemType; label: string; equipKey: string; onEquip: (id: string | null) => Promise<void> }[] = [
    { type: 'hat', label: 'Hats', equipKey: 'hat', onEquip: onEquipHat },
    { type: 'glasses', label: 'Glasses', equipKey: 'glasses', onEquip: onEquipGlasses },
    { type: 'outfit', label: 'Outfits', equipKey: 'outfit', onEquip: onEquipOutfit },
    { type: 'accessory', label: 'Accessories', equipKey: 'accessory', onEquip: onEquipAccessory },
  ];
  const [selectedCat, setSelectedCat] = useState<ItemType>('hat');
  const cat = categories.find((c) => c.type === selectedCat)!;
  const items = ITEM_CATALOG.filter((i) => i.type === selectedCat);

  return (
    <View style={styles.tabContent}>
      <View style={styles.chipRow}>
        {categories.map((c) => (
          <Pressable
            key={c.type}
            style={[styles.chip, selectedCat === c.type && styles.chipActive]}
            onPress={() => setSelectedCat(c.type)}
          >
            <Text style={[styles.chipText, selectedCat === c.type && styles.chipTextActive]}>{c.label}</Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.itemGrid}>
        {items.map((item) => {
          const unlocked = unlockedIds.has(item.id);
          const isEquipped = equipped[cat.equipKey] === item.id;
          return (
            <View key={item.id} style={styles.itemCard}>
              <Text style={styles.itemEmoji}>{unlocked ? item.emoji : '🔒'}</Text>
              <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
              {unlocked ? (
                <Pressable
                  style={[styles.equipBtn, isEquipped && styles.equipBtnActive]}
                  onPress={() => cat.onEquip(isEquipped ? null : item.id)}
                >
                  <Text style={[styles.equipBtnText, isEquipped && styles.equipBtnTextActive]}>
                    {isEquipped ? 'Equipped' : 'Try it on!'}
                  </Text>
                </Pressable>
              ) : (
                <Text style={styles.lockedHint}>Unlock by completing quests</Text>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

function RoomTab({
  equippedBg,
  decorSlots,
  unlockedIds,
  onEquipBg,
  onSetDecor,
}: {
  equippedBg: string | null;
  decorSlots: [string | null, string | null, string | null];
  unlockedIds: Set<string>;
  onEquipBg: (id: string | null) => Promise<void>;
  onSetDecor: (i: 0 | 1 | 2, id: string | null) => Promise<void>;
}) {
  const backgrounds = ITEM_CATALOG.filter((i) => i.type === 'background');
  const decorItems = ITEM_CATALOG.filter((i) => i.type === 'decor');

  return (
    <View style={styles.tabContent}>
      <Text style={styles.cardTitle}>Background</Text>
      <View style={styles.bgRow}>
        {backgrounds.map((b) => {
          const unlocked = unlockedIds.has(b.id);
          const isEquipped = equippedBg === b.id;
          return (
            <Pressable
              key={b.id}
              style={[styles.bgCard, !unlocked && styles.bgCardLocked, isEquipped && styles.bgCardActive]}
              onPress={() => unlocked && onEquipBg(isEquipped ? null : b.id)}
              disabled={!unlocked}
            >
              <Text style={styles.bgEmoji}>{unlocked ? b.emoji : '🔒'}</Text>
              <Text style={styles.bgName}>{b.name}</Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={[styles.cardTitle, { marginTop: 20 }]}>Decor</Text>
      <View style={styles.decorRow}>
        {([0, 1, 2] as const).map((i) => (
          <View key={i} style={styles.decorSlot}>
            {decorSlots[i] ? (
              <Pressable onPress={() => onSetDecor(i, null)}>
                <Text style={styles.decorEmoji}>{ITEM_CATALOG.find((x) => x.id === decorSlots[i])?.emoji ?? '✨'}</Text>
              </Pressable>
            ) : (
              <Text style={styles.decorPlaceholder}>+</Text>
            )}
          </View>
        ))}
      </View>
      <View style={styles.decorGrid}>
        {decorItems.map((d) => {
          const unlocked = unlockedIds.has(d.id);
          const idx = decorSlots.indexOf(d.id);
          return (
            <Pressable
              key={d.id}
              style={[styles.decorItem, !unlocked && styles.decorItemLocked]}
              onPress={() => {
                if (!unlocked) return;
                if (idx >= 0) onSetDecor(idx as 0 | 1 | 2, null);
                else {
                  const empty = decorSlots.findIndex((s) => !s);
                  if (empty >= 0) onSetDecor(empty as 0 | 1 | 2, d.id);
                }
              }}
              disabled={!unlocked}
            >
              <Text style={styles.decorItemEmoji}>{unlocked ? d.emoji : '🔒'}</Text>
              <Text style={styles.decorItemName}>{d.name}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function CollectionTab({
  unlockedIds,
  seenIds,
  onMarkSeen,
}: {
  unlockedIds: Set<string>;
  seenIds: string[];
  onMarkSeen: (id: string) => void;
}) {
  const [filter, setFilter] = useState<'all' | 'new'>('all');
  const unlocked = ITEM_CATALOG.filter((i) => unlockedIds.has(i.id));
  const newItems = unlocked.filter((i) => !seenIds.includes(i.id));
  const list = filter === 'new' ? newItems : unlocked;

  return (
    <View style={styles.tabContent}>
      <View style={styles.chipRow}>
        <Pressable style={[styles.chip, filter === 'all' && styles.chipActive]} onPress={() => setFilter('all')}>
          <Text style={[styles.chipText, filter === 'all' && styles.chipTextActive]}>All</Text>
        </Pressable>
        <Pressable style={[styles.chip, filter === 'new' && styles.chipActive]} onPress={() => setFilter('new')}>
          <Text style={[styles.chipText, filter === 'new' && styles.chipTextActive]}>New {newItems.length > 0 ? `(${newItems.length})` : ''}</Text>
        </Pressable>
      </View>
      {list.length === 0 ? (
        <Text style={styles.emptyState}>Complete quests to unlock items!</Text>
      ) : (
        <View style={styles.collectionGrid}>
          {list.map((item) => {
            const isNew = !seenIds.includes(item.id);
            return (
              <View key={item.id} style={styles.collectionItem}>
                {isNew && <View style={styles.newBadge}><Text style={styles.newBadgeText}>New</Text></View>}
                <Text style={styles.collectionEmoji}>{item.emoji}</Text>
                <Text style={styles.collectionName}>{item.name}</Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Bg },
  scroll: { flex: 1 },
  centered: { justifyContent: 'center', alignItems: 'center' },
  content: { paddingBottom: 40 },
  header: { paddingHorizontal: 20, paddingBottom: 8 },
  title: { fontSize: 24, fontWeight: '700', color: '#333' },
  subtitle: { fontSize: 14, color: '#666', marginTop: 4 },
  avatarSection: {
    overflow: 'hidden',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  heroOverlay: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatBarInAvatar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  pandaWrapper: { position: 'relative', width: 140, height: 140 },
  pandaImage: { width: 140, height: 140 },
  emojiOverlay: { position: 'absolute', top: -8, left: '50%', marginLeft: -20 },
  emoji: { fontSize: 40 },
  card: {
    backgroundColor: CARD_BG,
    marginHorizontal: 16,
    marginTop: -20,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pandaName: { fontSize: 20, fontWeight: '700', color: '#333' },
  editHint: { fontSize: 12, color: '#888' },
  nameInput: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 8, fontSize: 16 },
  saveBtn: { padding: 8 },
  saveBtnText: { color: PRIMARY, fontWeight: '600' },
  adventures: { fontSize: 14, color: '#666', marginTop: 4 },
  growth: { fontSize: 13, color: PRIMARY, fontWeight: '600', marginTop: 2 },
  xpBar: { height: 8, backgroundColor: '#e8f4f0', borderRadius: 4, marginTop: 12, overflow: 'hidden' },
  xpFill: { height: '100%', backgroundColor: PRIMARY, borderRadius: 4 },
  xpLabel: { fontSize: 12, color: '#888', marginTop: 4 },
  tabRow: { marginTop: 12, maxHeight: 44 },
  tabRowContent: { flexDirection: 'row', paddingHorizontal: 12, gap: 6 },
  avatarTabContent: { flex: 1 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: CARD_BG, alignItems: 'center' },
  tabActive: { backgroundColor: PRIMARY_LIGHT },
  tabText: { fontSize: 13, fontWeight: '600', color: '#666' },
  tabTextActive: { color: '#333' },
  tabContent: { padding: 16, marginTop: 8 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 12 },
  aboutRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  aboutLabel: { fontSize: 14, color: '#666' },
  aboutValue: { fontSize: 14, fontWeight: '600', color: '#333' },
  badgesRow: { marginTop: 8, paddingVertical: 4 },
  badge: { alignItems: 'center', marginRight: 16, minWidth: 64 },
  badgeEmoji: { fontSize: 32 },
  badgeName: { fontSize: 11, color: '#666', marginTop: 4 },
  emptyHint: { fontSize: 14, color: '#888', fontStyle: 'italic' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: CARD_BG },
  chipActive: { backgroundColor: PRIMARY_LIGHT },
  chipText: { fontSize: 14, fontWeight: '600', color: '#666' },
  chipTextActive: { color: '#333' },
  itemGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  itemCard: {
    width: '47%',
    backgroundColor: CARD_BG,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  itemEmoji: { fontSize: 36 },
  itemName: { fontSize: 13, color: '#333', marginTop: 4 },
  equipBtn: { marginTop: 8, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: PRIMARY },
  equipBtnActive: { backgroundColor: PRIMARY_LIGHT, borderColor: 'transparent' },
  equipBtnText: { fontSize: 12, fontWeight: '600', color: PRIMARY },
  equipBtnTextActive: { color: '#333' },
  lockedHint: { fontSize: 11, color: '#888', marginTop: 6 },
  bgRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  bgCard: { width: 80, padding: 12, backgroundColor: CARD_BG, borderRadius: 12, alignItems: 'center' },
  bgCardLocked: { opacity: 0.6 },
  bgCardActive: { borderWidth: 2, borderColor: PRIMARY },
  bgEmoji: { fontSize: 28 },
  bgName: { fontSize: 11, color: '#666', marginTop: 4 },
  decorRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  decorSlot: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  decorPlaceholder: { fontSize: 24, color: '#ccc' },
  decorEmoji: { fontSize: 28 },
  decorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  decorItem: { width: 70, padding: 10, backgroundColor: CARD_BG, borderRadius: 10, alignItems: 'center' },
  decorItemLocked: { opacity: 0.6 },
  decorItemEmoji: { fontSize: 24 },
  decorItemName: { fontSize: 10, color: '#666', marginTop: 4 },
  collectionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  collectionItem: {
    width: 80,
    padding: 12,
    backgroundColor: CARD_BG,
    borderRadius: 12,
    alignItems: 'center',
    position: 'relative',
  },
  newBadge: { position: 'absolute', top: 4, right: 4, backgroundColor: PRIMARY, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  newBadgeText: { fontSize: 9, color: '#fff', fontWeight: '700' },
  collectionEmoji: { fontSize: 28 },
  collectionName: { fontSize: 11, color: '#666', marginTop: 4 },
  emptyState: { fontSize: 15, color: '#888', fontStyle: 'italic', textAlign: 'center', marginTop: 24 },
  chatInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    maxHeight: 100,
  },
  chatSend: {
    backgroundColor: PRIMARY,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
  },
  chatSendPressed: { opacity: 0.8 },
  chatSendText: { color: '#fff', fontWeight: '600', fontSize: 15 },
});
