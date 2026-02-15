/**
 * Stability label - score + trend
 */

import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LessonsTheme } from '@/features/lessons/constants';
import type { StabilityTrend } from '../logic/routineStability';

interface StabilityLabelProps {
  score: number;
  trend: StabilityTrend;
  label: string;
}

export function StabilityLabel({ score, trend, label }: StabilityLabelProps) {
  const icon = trend === 'up' ? 'trending-up' : trend === 'down' ? 'trending-down' : 'remove';
  return (
    <View style={styles.wrap}>
      <Text style={styles.score}>{score}</Text>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.trend}>
        <Ionicons name={icon} size={16} color={LessonsTheme.textMuted} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  score: { fontSize: 20, fontWeight: '700', color: LessonsTheme.primary },
  label: { fontSize: 14, color: LessonsTheme.textMuted },
  trend: {},
});
