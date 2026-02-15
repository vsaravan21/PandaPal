import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { auth } from '@/lib/firebase';

export default function LoginScreen() {
  const { setHasPanda } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(true);
  const [loading, setLoading] = useState(false);

  const canSubmit = email.trim().length > 0 && password.length > 0;

  const handleSignIn = useCallback(async () => {
    if (!canSubmit || loading) return;
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      setHasPanda(true);
      router.replace('/role-select');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Sign in failed. Try again.';
      Alert.alert('Sign in', message);
    } finally {
      setLoading(false);
    }
  }, [canSubmit, loading, setHasPanda, email, password]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={20}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable style={styles.backWrap} onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.backText}>←</Text>
        </Pressable>

        <Text style={styles.title}>Sign In</Text>
        <Image
          source={require('../assets/images/MamaPanda.png')}
          style={styles.mamaPandaImage}
          resizeMode="contain"
        />

        <View style={styles.card}>
          <Text style={styles.label}>Parent email</Text>
          <TextInput
            style={styles.input}
            placeholder="name@example.com"
            placeholderTextColor="#999"
            value={email}
            onChangeText={(t) => setEmail(t.toLowerCase())}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
          />

          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordWrap}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Enter your password"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="password"
            />
            <Pressable style={styles.eyeBtn} onPress={() => setShowPassword((s) => !s)} hitSlop={8}>
              <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={22} color="#6B6B7B" />
            </Pressable>
          </View>

          <Pressable
            style={[styles.primaryBtn, (!canSubmit || loading) && styles.primaryBtnDisabled]}
            onPress={handleSignIn}
            disabled={!canSubmit || loading}
            hitSlop={12}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.primaryBtnText}>Sign in</Text>
            )}
          </Pressable>
        </View>

        <Pressable style={styles.secondaryLink} onPress={() => router.replace('/parent-signup')} hitSlop={12}>
          <Text style={styles.secondaryLinkText}>Don't have an account? Create account</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E0EEEE' },
  scrollContent: { paddingHorizontal: 24, paddingTop: 52, paddingBottom: 44 },
  backWrap: { alignSelf: 'flex-start', paddingVertical: 10, paddingRight: 16, minHeight: 44, justifyContent: 'center' },
  backText: { color: '#2D7D46', fontSize: 16, fontWeight: '600', letterSpacing: 0.2 },
  title: { fontSize: 24, fontWeight: '700', color: '#1a1a1a', textAlign: 'center', marginBottom: 20, letterSpacing: 0.3 },
  mamaPandaImage: { width: 200, height: 200, alignSelf: 'center', marginBottom: 20 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  label: { fontSize: 14, fontWeight: '600', color: '#2C2C2C', marginBottom: 8, letterSpacing: 0.2 },
  input: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1a1a1a',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  passwordWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 12,
    marginBottom: 16,
    minHeight: 52,
    paddingLeft: 16,
    paddingRight: 4,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  passwordInput: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    color: '#1a1a1a',
    paddingVertical: 14,
    paddingRight: 8,
    backgroundColor: 'transparent',
  },
  eyeBtn: { padding: 14 },
  primaryBtn: {
    backgroundColor: '#2D7D46',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#2D7D46',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  primaryBtnDisabled: { opacity: 0.5 },
  primaryBtnText: { color: '#fff', fontSize: 17, fontWeight: '700', letterSpacing: 0.3 },
  secondaryLink: { alignItems: 'center', paddingVertical: 14 },
  secondaryLinkText: { fontSize: 15, color: '#2D7D46', fontWeight: '600', letterSpacing: 0.2 },
});
