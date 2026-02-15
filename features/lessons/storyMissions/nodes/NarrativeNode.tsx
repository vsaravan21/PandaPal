import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NarrativeNode as NarrativeNodeType } from '../models';
import { LessonsTheme } from '../../constants';

interface Props {
  node: NarrativeNodeType;
  calmMode?: boolean;
}

export function NarrativeNodeView({ node, calmMode }: Props) {
  return (
    <View style={[styles.container, calmMode && styles.calm]}>
      {node.illustrationPlaceholder && (
        <View style={styles.art}>
          <Text style={styles.artEmoji}>🐼</Text>
        </View>
      )}
      <Text style={styles.text}>{node.text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, alignItems: 'center' },
  calm: { opacity: 0.95 },
  art: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: LessonsTheme.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  artEmoji: { fontSize: 40 },
  text: { fontSize: 18, lineHeight: 28, color: LessonsTheme.text, textAlign: 'center' },
});
