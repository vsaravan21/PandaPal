/**
 * Sparkline mini - simple bar sparkline
 */

import { View, StyleSheet } from 'react-native';
import { LessonsTheme } from '@/features/lessons/constants';

interface SparklineMiniProps {
  values: number[]; // 0–100
  height?: number;
}

export function SparklineMini({ values, height = 24 }: SparklineMiniProps) {
  const max = Math.max(1, ...values);
  return (
    <View style={[styles.wrap, { height }]}>
      {values.map((v, i) => (
        <View
          key={i}
          style={[
            styles.bar,
            { height: Math.max(4, (v / max) * height * 0.9) },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'flex-end', gap: 2 },
  bar: { flex: 1, backgroundColor: LessonsTheme.primary, borderRadius: 2, minWidth: 4 },
});
