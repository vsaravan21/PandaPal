/**
 * Stability label helper - Strong | Fair | Needs attention
 */

import { Text, StyleSheet } from 'react-native';
import { LessonsTheme } from '@/features/lessons/constants';
import { stabilityLabel as getLabel } from '../utils/dashboardHelpers';

interface StabilityLabelProps {
  score: number;
}

export function StabilityLabel({ score }: StabilityLabelProps) {
  const label = getLabel(score);
  const isStrong = score >= 70;
  const isFair = score >= 40 && score < 70;
  return (
    <Text
      style={[
        styles.label,
        isStrong && styles.labelStrong,
        isFair && styles.labelFair,
      ]}
    >
      {label}
    </Text>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: LessonsTheme.textMuted,
  },
  labelStrong: { color: LessonsTheme.primary },
  labelFair: { color: LessonsTheme.text },
});
