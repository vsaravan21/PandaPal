/**
 * Persistent Caregiver header - back (when possible), badge + Switch Role
 */

import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export function CaregiverHeader() {
  const insets = useSafeAreaInsets();
  const { clearRole } = useAuth();
  const canGoBack = router.canGoBack();

  const handleBack = () => {
    if (canGoBack) router.back();
  };

  const handleSwitchRole = async () => {
    await clearRole();
    router.replace('/role-select');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
      <View style={styles.row}>
        <View style={styles.leftCol}>
          {canGoBack ? (
            <Pressable style={({ pressed }) => [styles.backBtn, pressed && styles.backBtnPressed]} onPress={handleBack}>
              <Text style={styles.backText}>← Back</Text>
            </Pressable>
          ) : (
            <View style={styles.backPlaceholder} />
          )}
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Caregiver Mode</Text>
        </View>
        <Pressable style={({ pressed }) => [styles.switchBtn, pressed && styles.switchBtnPressed]} onPress={handleSwitchRole}>
          <Text style={styles.switchText}>Switch Role</Text>
        </Pressable>
      </View>
      <Text style={styles.disclaimer}>Routine support + education only. Not medical advice.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 8,
    backgroundColor: '#e8f4f0',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftCol: {
    minWidth: 72,
    alignItems: 'flex-start',
  },
  backBtn: {
    paddingVertical: 6,
    paddingRight: 8,
  },
  backBtnPressed: {
    opacity: 0.8,
  },
  backText: {
    color: '#2D7D46',
    fontSize: 16,
    fontWeight: '600',
  },
  backPlaceholder: {
    width: 1,
  },
  badge: {
    backgroundColor: '#2D7D46',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  switchBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  switchBtnPressed: {
    opacity: 0.8,
  },
  switchText: {
    color: '#2D7D46',
    fontSize: 15,
    fontWeight: '600',
  },
  disclaimer: {
    fontSize: 10,
    color: '#888',
    textAlign: 'center',
    marginTop: 6,
  },
});
