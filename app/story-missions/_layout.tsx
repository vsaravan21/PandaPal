import { Stack } from 'expo-router';

export default function StoryMissionsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitle: 'Back',
        headerTintColor: '#2D7D46',
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Story Missions' }} />
      <Stack.Screen name="guide" options={{ title: 'Choose Your Guide' }} />
      <Stack.Screen
        name="play/[missionId]"
        options={({ route }: { route: { params?: { missionId?: string } } }) => ({
          title: route.params?.missionId ? 'Mission' : 'Mission',
        })}
      />
    </Stack>
  );
}
