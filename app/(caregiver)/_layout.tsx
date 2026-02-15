/**
 * Caregiver stack - guarded by role === 'caregiver'
 */

import { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { CaregiverHeader } from '@/features/caregiver/components/CaregiverHeader';
import { LessonsTheme } from '@/features/lessons/constants';

export default function CaregiverLayout() {
  const { role, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (role !== 'caregiver') {
      router.replace('/role-select');
    }
  }, [role, loading]);

  if (loading || role !== 'caregiver') return null;

  return (
    <Stack
      screenOptions={{
        header: () => <CaregiverHeader />,
        contentStyle: { backgroundColor: LessonsTheme.background },
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
