import { Stack, router } from 'expo-router';
import { Pressable, Text, StyleSheet } from 'react-native';

export default function StoryMissionsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitle: 'Back',
        headerTintColor: '#2D7D46',
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Story Missions',
          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
              <Text style={styles.backText}>← Back</Text>
            </Pressable>
          ),
        }}
      />
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

const styles = StyleSheet.create({
  backBtn: { paddingVertical: 8, paddingRight: 16, marginLeft: 8 },
  backText: { fontSize: 17, fontWeight: '600', color: '#2D7D46' },
});
