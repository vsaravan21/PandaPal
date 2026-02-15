import { Stack } from 'expo-router';
import { LESSONS } from '@/features/lessons/data/lessons';

export default function LessonLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitle: 'Back',
        headerTintColor: '#2D7D46',
      }}
    >
      <Stack.Screen
        name="[id]"
        options={({ route }: { route: { params?: { id?: string } } }) => {
          const id = route.params?.id;
          const lesson = LESSONS.find((l) => l.id === id);
          return { title: lesson?.title ?? 'Lesson' };
        }}
      />
    </Stack>
  );
}
