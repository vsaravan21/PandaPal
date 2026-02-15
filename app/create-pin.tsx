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
  container: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 56, paddingBottom: 40, alignItems: 'center' },
  backWrap: { alignSelf: 'flex-start', paddingVertical: 12, paddingRight: 16, minHeight: 48, justifyContent: 'center', marginBottom: 8 },
  backText: { color: '#8BC34A', fontSize: 17, fontWeight: '600' },
  title: { fontSize: 24, fontWeight: '700', color: '#2C2C2C', textAlign: 'center', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#6B6B7B', textAlign: 'center', marginBottom: 32 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  helper: { fontSize: 13, color: '#6B6B7B', marginTop: 8, marginBottom: 24 },
  primaryBtn: { backgroundColor: '#8BC34A', paddingVertical: 18, paddingHorizontal: 48, borderRadius: 28, alignSelf: 'stretch', alignItems: 'center' },
  primaryBtnDisabled: { opacity: 0.6 },
  primaryBtnText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  secondaryLink: { marginTop: 24, paddingVertical: 12 },
  secondaryLinkText: { fontSize: 15, color: '#8BC34A', fontWeight: '600' },
});
