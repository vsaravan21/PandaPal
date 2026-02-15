import { Stack } from 'expo-router';

export default function LearnTabLayout() {
  return (
    <Stack screenOptions={{ headerShown: true, headerBackTitle: 'Back', headerTintColor: '#2D7D46' }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="quick" options={{ title: 'Quick Lessons' }} />
    </Stack>
  );
}
