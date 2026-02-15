import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { router } from 'expo-router';
import { PinInput } from '@/components/PinInput';
import { setPendingPin } from '@/lib/parentAuthStore';
import { useAuth } from '@/contexts/AuthContext';
import { hashPin } from '@/features/backend/hashPin';
import { setCaregiverPinHash } from '@/features/backend/parents';

export default function CreatePinScreen() {
  const { uid } = useAuth();
  const [pin, setPin] = useState('');
  const [saving, setSaving] = useState(false);

  const canContinue = pin.length === 4;

  const handleContinue = async () => {
    if (!canContinue) return;
    setPendingPin(pin);
    if (uid) {
      setSaving(true);
      try {
        const pinHash = await hashPin(pin);
        await setCaregiverPinHash(uid, pinHash);
      } catch {
        Alert.alert('Save PIN', 'Could not save PIN to cloud. It was saved on this device.');
      } finally {
        setSaving(false);
      }
    }
    router.replace('/create-panda-intro-child');
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <Pressable style={styles.backWrap} onPress={() => router.back()} hitSlop={12}>
        <Text style={styles.backText}>←</Text>
      </Pressable>
      <Text style={styles.title}>Create Parent PIN</Text>
      <Text style={styles.subtitle}>This PIN unlocks the parent dashboard</Text>

      <View style={styles.card}>
        <PinInput length={4} value={pin} onChange={setPin} masked />
        <Text style={styles.helper}>Use a 4 digit PIN you can remember</Text>
        <Pressable
          style={[styles.primaryBtn, (!canContinue || saving) && styles.primaryBtnDisabled]}
          onPress={handleContinue}
          disabled={!canContinue || saving}
          hitSlop={12}
        >
          <Text style={styles.primaryBtnText}>{saving ? 'Saving…' : 'Continue'}</Text>
        </Pressable>
      </View>

      <Pressable style={styles.secondaryLink} onPress={() => router.replace('/parent-signup')} hitSlop={12}>
        <Text style={styles.secondaryLinkText}>Use different login method</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#E0EEEE' },
  container: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 52, paddingBottom: 44, alignItems: 'center' },
  backWrap: { alignSelf: 'flex-start', paddingVertical: 10, paddingRight: 16, minHeight: 44, justifyContent: 'center', marginBottom: 8 },
  backText: { color: '#2D7D46', fontSize: 16, fontWeight: '600', letterSpacing: 0.2 },
  title: { fontSize: 24, fontWeight: '700', color: '#1a1a1a', textAlign: 'center', marginBottom: 8, letterSpacing: 0.3 },
  subtitle: { fontSize: 14, color: '#6B6B7B', textAlign: 'center', marginBottom: 28, lineHeight: 20 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  helper: { fontSize: 13, color: '#6B6B7B', marginTop: 10, marginBottom: 24, letterSpacing: 0.2 },
  primaryBtn: {
    backgroundColor: '#2D7D46',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 14,
    alignSelf: 'stretch',
    alignItems: 'center',
    shadowColor: '#2D7D46',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  primaryBtnDisabled: { opacity: 0.5 },
  primaryBtnText: { color: '#fff', fontSize: 17, fontWeight: '700', letterSpacing: 0.3 },
  secondaryLink: { marginTop: 24, paddingVertical: 14 },
  secondaryLinkText: { fontSize: 15, color: '#2D7D46', fontWeight: '600', letterSpacing: 0.2 },
});
