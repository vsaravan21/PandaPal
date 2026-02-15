import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

import { AuthProvider } from '@/contexts/AuthContext';
import { ProfileProvider } from '@/features/profile/context/ProfileContext';
import { LessonsProvider } from '@/features/lessons/context/LessonsContext';
import { useColorScheme } from '@/components/useColorScheme';

export {
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: 'index',
};

SplashScreen.preventAutoHideAsync();

const FONT_LOAD_TIMEOUT_MS = 5000;

export default function RootLayout() {
  const [timedOut, setTimedOut] = useState(false);
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // If fonts take too long, show app anyway so we don't stay stuck on splash
  useEffect(() => {
    const t = setTimeout(() => setTimedOut(true), FONT_LOAD_TIMEOUT_MS);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  const ready = loaded || timedOut;
  useEffect(() => {
    if (ready) {
      SplashScreen.hideAsync();
    }
  }, [ready]);

  if (!ready) {
    return null;
  }

  return (
    <AuthProvider>
      <ProfileProvider>
        <LessonsProvider>
          <RootLayoutNav />
        </LessonsProvider>
      </ProfileProvider>
    </AuthProvider>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="create-panda" />
        <Stack.Screen name="create-panda-intro" />
        <Stack.Screen name="caregiver-upload" />
        <Stack.Screen name="ai-parsing" />
        <Stack.Screen name="review-care-plan" />
        <Stack.Screen name="parent-signup" />
        <Stack.Screen name="create-pin" />
        <Stack.Screen name="create-panda-intro-child" />
        <Stack.Screen name="parent-setup-success" />
        <Stack.Screen name="role-select" />
        <Stack.Screen name="caregiver-pin-gate" />
        <Stack.Screen name="set-caregiver-pin" />
        <Stack.Screen name="(caregiver)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="lesson" options={{ headerShown: false }} />
        <Stack.Screen name="story-missions" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
    </ThemeProvider>
  );
}
