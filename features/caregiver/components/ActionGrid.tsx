/**
 * 2x2 action grid - calmer than full-width buttons
 */

import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LessonsTheme } from '@/features/lessons/constants';

export interface ActionTile {
  label: string;
  icon?: string;
  onPress: () => void;
  emphasized?: boolean;
}

interface ActionGridProps {
  tiles: ActionTile[];
}

export function ActionGrid({ tiles }: ActionGridProps) {
  return (
    <View style={styles.grid}>
      {tiles.map((tile, i) => (
        <Pressable
          key={tile.label}
          style={({ pressed }) => [
            styles.tile,
            tile.emphasized && styles.tileEmphasized,
            pressed && styles.tilePressed,
          ]}
          onPress={tile.onPress}
          accessibilityRole="button"
          accessibilityLabel={tile.label}
        >
          {tile.icon ? (
            <Ionicons name={tile.icon} size={22} color={LessonsTheme.primary} style={styles.icon} />
          ) : null}
          <Text style={[styles.tileText, tile.emphasized && styles.tileTextEmphasized]}>
            {tile.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 20,
  },
  tile: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: LessonsTheme.calmBg,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: LessonsTheme.border,
    alignItems: 'center',
  },
  tileEmphasized: {
    borderColor: LessonsTheme.primary,
    borderWidth: 1.5,
    backgroundColor: LessonsTheme.calmBg,
  },
  tilePressed: { opacity: 0.85 },
  icon: { marginBottom: 4 },
  tileText: { fontSize: 14, fontWeight: '600', color: LessonsTheme.text },
  tileTextEmphasized: { color: LessonsTheme.primary },
});
