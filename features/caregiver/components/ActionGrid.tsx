/**
 * Action grid - Insights / Timeline / Export / Settings
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { LessonsTheme } from '@/features/lessons/constants';
import { Ionicons } from '@expo/vector-icons';

interface Action {
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  route: string;
}

const ACTIONS: Action[] = [
  { label: 'Insights', icon: 'analytics-outline', route: '/(caregiver)/trends' },
  { label: 'Timeline', icon: 'time-outline', route: '/(caregiver)/logs' },
  { label: 'Export', icon: 'document-text-outline', route: '__export__' },
  { label: 'Settings', icon: 'settings-outline', route: '/(caregiver)/settings' },
];

interface ActionGridProps {
  onExportPress?: () => void;
}

export function ActionGrid({ onExportPress }: ActionGridProps) {
  return (
    <View style={styles.grid}>
      {ACTIONS.map((a) => (
        <Pressable
          key={a.label}
          style={({ pressed }) => [styles.cell, pressed && styles.cellPressed]}
          onPress={() => (a.route === '__export__' ? onExportPress?.() : router.push(a.route as any))}
        >
          <Ionicons name={a.icon} size={24} color={LessonsTheme.primary} />
          <Text style={styles.cellLabel}>{a.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  cell: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: LessonsTheme.cardBg,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: LessonsTheme.border,
  },
  cellPressed: { opacity: 0.9 },
  cellLabel: { fontSize: 14, fontWeight: '600', color: LessonsTheme.text, marginTop: 8 },
});
