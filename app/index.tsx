import { router } from 'expo-router';
import { Image, View, Text, StyleSheet, Pressable } from 'react-native';

export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      {/* Soft bokeh-style circles */}
      <View style={styles.bokeh1} />
      <View style={styles.bokeh2} />
      <View style={styles.bokeh3} />
      <View style={styles.bokeh4} />
      <View style={styles.bokeh5} />

      <View style={styles.content}>
        <Image
          source={require('../assets/images/panda.png')}
          style={styles.panda}
          resizeMode="contain"
        />
        <Text style={styles.title}>PandaPal</Text>
        <Text style={styles.tagline}>Care routines, turned into adventures</Text>

        <Pressable
          style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}
          onPress={() => router.push('/create-panda-intro' as const)}
        >
          <Text style={styles.primaryButtonText}>Create a New Panda</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.linkWrap, pressed && { opacity: 0.7 }]}
          onPress={() => router.push('/login')}
        >
          <Text style={styles.linkText}>I already have my Panda</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e8f4f0',
  },
  bokeh1: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    top: 60,
    left: 30,
  },
  bokeh2: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(224, 242, 247, 0.6)',
    top: 140,
    right: 20,
  },
  bokeh3: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(248, 251, 245, 0.5)',
    bottom: 180,
    left: 40,
  },
  bokeh4: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    bottom: 120,
    right: 50,
  },
  bokeh5: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(230, 248, 235, 0.45)',
    top: 200,
    left: 10,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  panda: {
    width: 220,
    height: 220,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  tagline: {
    fontSize: 16,
    fontWeight: '500',
    color: '#5a5a6e',
    marginBottom: 44,
    fontStyle: 'italic',
    letterSpacing: 0.2,
  },
  primaryButton: {
    backgroundColor: '#2D7D46',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 14,
    minWidth: 260,
    alignItems: 'center',
    shadowColor: '#2D7D46',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  primaryButtonPressed: {
    opacity: 0.92,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  linkWrap: {
    marginTop: 22,
    paddingVertical: 10,
  },
  linkText: {
    color: '#2D7D46',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
