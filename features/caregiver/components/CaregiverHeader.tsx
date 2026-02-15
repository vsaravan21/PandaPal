/**
 * Caregiver header - Back, badge, Switch Role
 */

import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { LessonsTheme } from '@/features/lessons/constants';
import { Ionicons } from '@expo/vector-icons';

export function CaregiverHeader() {
  const { clearRole } = useAuth();

  const handleSwitchRole = async () => {
    await clearRole();
    router.replace('/role-select');
  };

  return (
    <SafeAreaView style={styles.safeWrap} edges={['top']}>
      <View style={styles.wrap}>
        <View style={styles.row}>
        {router.canGoBack() ? (
          <Pressable onPress={() => router.back()} hitSlop={12} style={styles.btn}>
            <Ionicons name="chevron-back" size={24} color={LessonsTheme.primary} />
          </Pressable>
        ) : (
          <View style={styles.btn} />
        )}
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Caregiver Mode</Text>
        </View>
        <Pressable onPress={handleSwitchRole} hitSlop={12} style={[styles.btn, styles.btnRight]}>
          <Text style={styles.switchText}>Switch Role</Text>
        </Pressable>
      </View>
      <Text style={styles.disclaimer}>Routine support + education only. Not medical advice.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeWrap: { backgroundColor: LessonsTheme.calmBg },
  wrap: { paddingHorizontal: 16, paddingVertical: 12, paddingBottom: 8, backgroundColor: LessonsTheme.calmBg, borderBottomWidth: 1, borderBottomColor: LessonsTheme.border },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  btn: { minWidth: 80 },
  btnRight: { alignItems: 'flex-end', paddingRight: 4 },
  badge: { backgroundColor: LessonsTheme.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  badgeText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  switchText: { color: LessonsTheme.primary, fontSize: 14, fontWeight: '600' },
  disclaimer: { fontSize: 11, color: LessonsTheme.textMuted, marginTop: 8, textAlign: 'center' },
});
