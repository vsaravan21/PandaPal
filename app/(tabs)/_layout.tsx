import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function TabLayout() {
  const { role } = useAuth();
  const showCaregiverTab = role === 'caregiver';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2D7D46',
        tabBarInactiveTintColor: '#8E8E93',
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Quests',
          tabBarIcon: ({ color, size }) => <Ionicons name="flag" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="avatar"
        options={{
          title: 'Avatar',
          tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="learn"
        options={{
          title: 'Learn',
          tabBarIcon: ({ color, size }) => <Ionicons name="book" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="caregiver"
        options={{
          title: 'Caregiver',
          tabBarIcon: ({ color, size }) => <Ionicons name="heart" size={size} color={color} />,
          href: showCaregiverTab ? '/caregiver' : null,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'My Care Plan',
          tabBarIcon: ({ color, size }) => <Ionicons name="document-text" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
