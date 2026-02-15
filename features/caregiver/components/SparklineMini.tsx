/**
 * 7-day mini bar chart - lightweight, no chart lib
 */

import { View, StyleSheet } from 'react-native';
import { LessonsTheme } from '@/features/lessons/constants';

interface SparklineMiniProps {
  values: number[];
  maxHeight?: number;
}

export function SparklineMini({ values, maxHeight = 24 }: SparklineMiniProps) {
  return (
    <View style={styles.row}>
      {values.map((v, i) => (
        <View
          key={i}
          style={[
            styles.bar,
            { height: Math.max(4, v * maxHeight) },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    height: 28,
  },
  bar: {
    flex: 1,
    minWidth: 6,
    backgroundColor: LessonsTheme.primary,
    opacity: 0.6,
    borderRadius: 2,
  },
});
