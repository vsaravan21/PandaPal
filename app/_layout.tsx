import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProfileProvider } from '@/features/profile/context/ProfileContext';
import { PandaFriendProvider } from '@/features/pandaFriend/context/PandaFriendContext';
import { LessonsProvider } from '@/features/lessons/context/LessonsContext';
import { useColorScheme } from '@/components/useColorScheme';

export {
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: 'index',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ProfileProvider>
          <PandaFriendProvider>
            <LessonsProvider>
              <RootLayoutNav />
            </LessonsProvider>
          </PandaFriendProvider>
        </ProfileProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const headerBackOptions = {
  headerShown: true,
  headerBackTitle: 'Back',
  headerTintColor: '#2D7D46',
  headerStyle: { backgroundColor: '#e8f4f0' },
  headerShadowVisible: false,
};

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="role-select" options={{ ...headerBackOptions, title: 'Who\'s using PandaPal?' }} />
        <Stack.Screen name="caregiver-pin-gate" options={{ ...headerBackOptions, title: 'Caregiver PIN' }} />
        <Stack.Screen name="set-caregiver-pin" options={{ ...headerBackOptions, title: 'Set PIN' }} />
        <Stack.Screen name="(caregiver)" options={{ headerShown: false }} />
        <Stack.Screen name="create-panda" options={headerBackOptions} />
        <Stack.Screen name="create-panda-intro" options={{ ...headerBackOptions, title: 'Create a New Panda' }} />
        <Stack.Screen name="caregiver-upload" options={{ ...headerBackOptions, title: 'Upload care plan' }} />
        <Stack.Screen name="ai-parsing" options={{ ...headerBackOptions, title: 'Processing' }} />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="lesson" options={{ headerShown: false }} />
        <Stack.Screen name="story-missions" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', ...headerBackOptions }} />
      </Stack>
    </ThemeProvider>
  );
}
