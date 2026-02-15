/**
 * Caregiver Settings - Change PIN, Switch Role, Export Summary
 */

import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert } from 'react-native';
import { ExportSummaryModal } from '@/features/caregiver/components/ExportSummaryModal';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { verifyCaregiverPin, setCaregiverPin, clearCaregiverPin } from '@/features/auth/storage/caregiverPinStorage';
import { LessonsTheme } from '@/features/lessons/constants';

export default function CaregiverSettingsScreen() {
  const { clearRole } = useAuth();
  const [showExport, setShowExport] = useState(false);
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');

  const handleChangePin = async () => {
    setError('');
    const ok = await verifyCaregiverPin(oldPin);
    if (!ok) {
      setError('Incorrect current PIN');
      return;
    }
    if (newPin.length < 4) {
      setError('New PIN must be at least 4 digits');
      return;
    }
    if (newPin !== confirmPin) {
      setError('New PINs do not match');
      return;
    }
    await setCaregiverPin(newPin);
    setOldPin('');
    setNewPin('');
    setConfirmPin('');
    Alert.alert('Done', 'PIN changed successfully.');
  };

  const handleSwitchRole = async () => {
    await clearRole();
    router.replace('/role-select');
  };

  const handleResetPin = async () => {
    Alert.alert(
      'Reset Caregiver PIN',
      'This will clear the PIN. You will need to set a new one next time you enter caregiver mode.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await clearCaregiverPin();
            await clearRole();
            router.replace('/role-select');
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>Export Summary</Text>
      <Text style={styles.sectionDesc}>Generate a copyable summary for doctor visits. Last 30 days.</Text>
      <Pressable style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]} onPress={() => setShowExport(true)}>
        <Text style={styles.btnText}>Export Summary</Text>
      </Pressable>

      <Text style={styles.sectionTitle}>Change Caregiver PIN</Text>
      <TextInput
        style={styles.input}
        placeholder="Current PIN"
        placeholderTextColor="#999"
        value={oldPin}
        onChangeText={(t) => { setOldPin(t); setError(''); }}
        secureTextEntry
        keyboardType="number-pad"
      />
      <TextInput
        style={styles.input}
        placeholder="New PIN"
        placeholderTextColor="#999"
        value={newPin}
        onChangeText={(t) => { setNewPin(t); setError(''); }}
        secureTextEntry
        keyboardType="number-pad"
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm new PIN"
        placeholderTextColor="#999"
        value={confirmPin}
        onChangeText={(t) => { setConfirmPin(t); setError(''); }}
        secureTextEntry
        keyboardType="number-pad"
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable
        style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
        onPress={handleChangePin}
      >
        <Text style={styles.btnText}>Change PIN</Text>
      </Pressable>

      <Text style={styles.sectionTitle}>Role</Text>
      <Pressable style={({ pressed }) => [styles.btn, styles.outlineBtn, pressed && styles.btnPressed]} onPress={handleSwitchRole}>
        <Text style={styles.outlineBtnText}>Switch Role</Text>
      </Pressable>

      {__DEV__ && (
        <>
          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Dev</Text>
          <Pressable style={({ pressed }) => [styles.btn, styles.devBtn, pressed && styles.btnPressed]} onPress={handleResetPin}>
            <Text style={styles.btnText}>Reset Caregiver PIN</Text>
          </Pressable>
        </>
      )}

      <ExportSummaryModal visible={showExport} onClose={() => setShowExport(false)} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: LessonsTheme.background },
  content: { padding: 16, paddingBottom: 40 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: LessonsTheme.text, marginBottom: 12 },
  sectionDesc: { fontSize: 14, color: LessonsTheme.textMuted, marginBottom: 12 },
  input: {
    backgroundColor: LessonsTheme.cardBg,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    marginBottom: 12,
  },
  error: { fontSize: 14, color: LessonsTheme.error, marginBottom: 12 },
  btn: {
    backgroundColor: LessonsTheme.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  outlineBtn: { backgroundColor: 'transparent', borderWidth: 2, borderColor: LessonsTheme.primary },
  outlineBtnText: { color: LessonsTheme.primary, fontSize: 16, fontWeight: '600' },
  btnPressed: { opacity: 0.9 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  devBtn: { backgroundColor: LessonsTheme.error },
});
