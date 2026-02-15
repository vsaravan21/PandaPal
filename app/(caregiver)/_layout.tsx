/**
 * Caregiver stack - requires role === 'caregiver'
 */

import { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { CaregiverHeader } from '@/features/caregiver/components/CaregiverHeader';

export default function CaregiverLayout() {
  const { hasPanda, role, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!hasPanda || role !== 'caregiver') {
      router.replace('/role-select');
    }
  }, [hasPanda, role, loading]);

  if (loading || !hasPanda || role !== 'caregiver') {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        header: () => <CaregiverHeader />,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Dashboard' }} />
      <Stack.Screen name="trends" options={{ title: 'Insights' }} />
      <Stack.Screen name="logs" options={{ title: 'Timeline' }} />
      <Stack.Screen name="care-plan" options={{ title: 'Plan' }} />
      <Stack.Screen name="settings" options={{ title: 'Settings' }} />
    </Stack>
  );
}
