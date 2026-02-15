import React from 'react';
import { StyleSheet, Text, Pressable, View } from 'react-native';
import type { RecapNode as RecapNodeType } from '../models';
import { LessonsTheme } from '../../constants';

interface Props {
  node: RecapNodeType;
  onClose: () => void;
}

export function RecapNodeView({ node, onClose }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🎉</Text>
      <Text style={styles.title}>Mission Complete!</Text>
      <Text style={styles.summary}>{node.summary}</Text>
      <View style={styles.rewards}>
        <Text style={styles.reward}>🌟 +{node.rewards.xp} XP</Text>
        <Text style={styles.reward}>🪙 +{node.rewards.coins} coins</Text>
        {node.rewards.relics?.length ? (
          <Text style={styles.reward}>🎁 {node.rewards.relics.length} relic(s)</Text>
        ) : null}
      </View>
      <Pressable style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]} onPress={onClose}>
        <Text style={styles.buttonText}>Awesome!</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, alignItems: 'center' },
  emoji: { fontSize: 48, marginBottom: 16 },
  title: { fontSize: 22, fontWeight: '700', color: LessonsTheme.text, marginBottom: 12 },
  summary: { fontSize: 16, color: LessonsTheme.textMuted, textAlign: 'center', lineHeight: 24, marginBottom: 24 },
  rewards: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 16, marginBottom: 24 },
  reward: { fontSize: 16, fontWeight: '600', color: LessonsTheme.text },
  button: { backgroundColor: LessonsTheme.primary, paddingVertical: 14, paddingHorizontal: 32, borderRadius: 14 },
  buttonPressed: { opacity: 0.9 },
  buttonText: { fontSize: 18, fontWeight: '700', color: '#fff' },
});
