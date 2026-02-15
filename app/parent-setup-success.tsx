import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';

export default function ParentSetupSuccessScreen() {
  return (
    <View style={styles.container}>
      <Pressable style={styles.backWrap} onPress={() => router.replace('/(tabs)')} hitSlop={12}>
        <Text style={styles.backText}>←</Text>
      </Pressable>
      <Text style={styles.title}>You're all set</Text>
      <Text style={styles.subtitle}>Your parent account is ready. Use your PIN to open the parent dashboard.</Text>
      <Pressable
        style={({ pressed }) => [styles.primaryBtn, pressed && styles.primaryBtnPressed]}
        onPress={() => router.replace('/(tabs)')}
        hitSlop={12}
      >
        <Text style={styles.primaryBtnText}>Go to dashboard</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F4F0',
    paddingHorizontal: 24,
    paddingTop: 56,
    alignItems: 'center',
  },
  backWrap: { alignSelf: 'flex-start', paddingVertical: 12, paddingRight: 16, minHeight: 48, justifyContent: 'center', marginBottom: 24 },
  backText: { color: '#8BC34A', fontSize: 17, fontWeight: '600' },
  title: { fontSize: 24, fontWeight: '700', color: '#2C2C2C', textAlign: 'center', marginBottom: 12 },
  subtitle: { fontSize: 15, color: '#6B6B7B', textAlign: 'center', marginBottom: 48, maxWidth: 320 },
  primaryBtn: {
    backgroundColor: '#8BC34A',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 28,
    minWidth: 280,
    alignItems: 'center',
  },
  primaryBtnPressed: { opacity: 0.9 },
  primaryBtnText: { color: '#fff', fontSize: 18, fontWeight: '700' },
});
