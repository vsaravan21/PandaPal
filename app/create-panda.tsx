import { useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Image,
  Animated,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const AVATAR_DISPLAY_SIZE = 180;

const AVATARS = [
  { id: 'detective', label: 'Detective', source: require('../assets/images/detective_panda-Photoroom.png') },
  { id: 'treasure', label: 'Treasure Hunter', source: require('../assets/images/treasure panda-Photoroom.png') },
  { id: 'artist', label: 'Artist', source: require('../assets/images/aritst_panda-Photoroom.png') },
  { id: 'doctor', label: 'Doctor', source: require('../assets/images/doctor panda.jpg') },
  { id: 'astronaut', label: 'Astronaut', source: require('../assets/images/astronaut Panda-Photoroom.png') },
  { id: 'diver', label: 'Deep Sea Diver', source: require('../assets/images/deepsea diver panda-Photoroom.png') },
];

export default function CreatePandaScreen() {
  const { setHasPanda } = useAuth();
  const [childName, setChildName] = useState('');
  const [pandaName, setPandaName] = useState('');
  const [selectedAvatarIndex, setSelectedAvatarIndex] = useState<number>(0);
  const [pastimeText, setPastimeText] = useState('');
  const [strengthText, setStrengthText] = useState('');
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const hasChildName = childName.trim().length > 0;
  const hasPandaName = pandaName.trim().length > 0;
  const canMeet = hasChildName && hasPandaName;

  const goPrev = () => {
    const next = selectedAvatarIndex === 0 ? AVATARS.length - 1 : selectedAvatarIndex - 1;
    Animated.timing(fadeAnim, { toValue: 0, duration: 120, useNativeDriver: true }).start(({ finished }) => {
      if (finished) {
        setSelectedAvatarIndex(next);
        Animated.timing(fadeAnim, { toValue: 1, duration: 180, useNativeDriver: true }).start();
      }
    });
  };

  const goNext = () => {
    const next = selectedAvatarIndex === AVATARS.length - 1 ? 0 : selectedAvatarIndex + 1;
    Animated.timing(fadeAnim, { toValue: 0, duration: 120, useNativeDriver: true }).start(({ finished }) => {
      if (finished) {
        setSelectedAvatarIndex(next);
        Animated.timing(fadeAnim, { toValue: 1, duration: 180, useNativeDriver: true }).start();
      }
    });
  };

  const handleMeetMyPanda = () => {
    if (!canMeet) return;
    setHasPanda(true);
    router.replace('/role-select');
  };

  const currentAvatar = AVATARS[selectedAvatarIndex];

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable style={styles.backWrap} onPress={() => router.back()} hitSlop={20}>
          <Text style={styles.backText}>←</Text>
        </Pressable>

        {/* Section 1 — Child Name */}
        <Text style={styles.sectionLabel}>Child Name</Text>
        <TextInput
          style={styles.inputLarge}
          placeholder="Type your name"
          placeholderTextColor="#B0BEC5"
          value={childName}
          onChangeText={setChildName}
          autoCapitalize="words"
        />

        {/* Section 2 — Name Your Panda */}
        <Text style={styles.sectionLabel}>Name Your Panda</Text>
        <TextInput
          style={styles.input}
          placeholder="Give your panda a name"
          placeholderTextColor="#B0BEC5"
          value={pandaName}
          onChangeText={setPandaName}
          autoCapitalize="words"
        />

        {/* Section 3 — Panda Avatar (arrow carousel) */}
        <Text style={styles.sectionLabel}>Choose your panda</Text>
        <View style={styles.carouselWrap}>
          <Pressable style={styles.arrowBtn} onPress={goPrev} hitSlop={20} accessibilityLabel="Previous panda">
            <Ionicons name="chevron-back" size={36} color="#7CB342" />
          </Pressable>

          <View style={styles.avatarCenterWrap}>
            <Animated.View style={[styles.avatarImageWrap, { opacity: fadeAnim }]}>
              <Image source={currentAvatar.source} style={styles.avatarImage} resizeMode="contain" />
            </Animated.View>
            <Text style={styles.avatarLabel}>{currentAvatar.label}</Text>
          </View>

          <Pressable style={styles.arrowBtn} onPress={goNext} hitSlop={20} accessibilityLabel="Next panda">
            <Ionicons name="chevron-forward" size={36} color="#7CB342" />
          </Pressable>
        </View>

        {/* Section 4 — Favorite Pastime (free text) */}
        <Text style={styles.sectionTitle}>Favorite Pastime</Text>
        <TextInput
          style={styles.inputMultiline}
          placeholder="What does your panda love to do?"
          placeholderTextColor="#B0BEC5"
          value={pastimeText}
          onChangeText={setPastimeText}
          multiline
          numberOfLines={3}
        />

        {/* Section 5 — Panda Superpower (free text) */}
        <Text style={styles.sectionTitle}>Panda Superpower</Text>
        <TextInput
          style={styles.inputMultiline}
          placeholder="What is your panda especially good at?"
          placeholderTextColor="#B0BEC5"
          value={strengthText}
          onChangeText={setStrengthText}
          multiline
          numberOfLines={3}
        />

        <Pressable
          style={[styles.primaryBtn, !canMeet && styles.primaryBtnDisabled]}
          onPress={handleMeetMyPanda}
          disabled={!canMeet}
          hitSlop={20}
        >
          <Text style={styles.primaryBtnText}>Meet My Panda</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#E0EEEE',
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 48,
  },
  backWrap: {
    alignSelf: 'flex-start',
    paddingVertical: 16,
    paddingRight: 24,
    minHeight: 56,
    justifyContent: 'center',
    marginBottom: 8,
  },
  backText: {
    color: '#689F38',
    fontSize: 20,
    fontWeight: '600',
  },
  sectionLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: '#33691E',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#33691E',
    marginTop: 28,
    marginBottom: 10,
  },
  inputLarge: {
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingVertical: 20,
    paddingHorizontal: 20,
    fontSize: 14,
    fontStyle: 'italic',
    color: '#2E7D32',
    marginBottom: 20,
    minHeight: 56,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingVertical: 18,
    paddingHorizontal: 20,
    fontSize: 14,
    fontStyle: 'italic',
    color: '#2E7D32',
    marginBottom: 24,
    minHeight: 56,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  carouselWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 28,
    paddingVertical: 16,
  },
  arrowBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarCenterWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: AVATAR_DISPLAY_SIZE + 32,
  },
  avatarImageWrap: {
    width: AVATAR_DISPLAY_SIZE,
    height: AVATAR_DISPLAY_SIZE,
    borderRadius: AVATAR_DISPLAY_SIZE / 2,
    overflow: 'hidden',
    backgroundColor: '#fff',
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 5,
    borderColor: 'rgba(129, 199, 132, 0.9)',
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#33691E',
  },
  inputMultiline: {
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 18,
    fontSize: 14,
    fontStyle: 'italic',
    color: '#2E7D32',
    minHeight: 72,
    textAlignVertical: 'top',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  primaryBtn: {
    backgroundColor: '#689F38',
    paddingVertical: 22,
    borderRadius: 32,
    alignItems: 'center',
    marginTop: 36,
    minHeight: 60,
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryBtnDisabled: {
    opacity: 0.5,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
});
