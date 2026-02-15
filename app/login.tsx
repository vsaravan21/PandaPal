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
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginScreen() {
  const { setHasPanda } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(true);
  const [loading, setLoading] = useState(false);

  const canSubmit = email.trim().length > 0 && password.length > 0;

  const handleSignIn = useCallback(() => {
    if (!canSubmit || loading) return;
    setLoading(true);
    // No backend yet – any email/password accepted
    setHasPanda(true);
    router.replace('/role-select');
    setLoading(false);
  }, [canSubmit, loading, setHasPanda]);

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
  scrollContent: { paddingHorizontal: 24, paddingTop: 56, paddingBottom: 40 },
  backWrap: { alignSelf: 'flex-start', paddingVertical: 12, paddingRight: 16, minHeight: 48, justifyContent: 'center' },
  backText: { color: '#8BC34A', fontSize: 17, fontWeight: '600' },
  title: { fontSize: 24, fontWeight: '700', color: '#2C2C2C', textAlign: 'center', marginBottom: 16 },
  mamaPandaImage: { width: 200, height: 200, alignSelf: 'center', marginBottom: 24 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  label: { fontSize: 15, fontWeight: '600', color: '#2C2C2C', marginBottom: 8 },
  input: {
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#2C2C2C',
    marginBottom: 16,
  },
  passwordWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderRadius: 12,
    marginBottom: 16,
    minHeight: 52,
    paddingLeft: 14,
    paddingRight: 4,
  },
  passwordInput: {
    flex: 1,
    minWidth: 0,
    fontSize: 15,
    color: '#2C2C2C',
    paddingVertical: 14,
    paddingRight: 8,
    backgroundColor: 'transparent',
  },
  eyeBtn: { padding: 14 },
  primaryBtn: {
    backgroundColor: '#8BC34A',
    paddingVertical: 18,
    borderRadius: 28,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryBtnDisabled: { opacity: 0.6 },
  primaryBtnText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  secondaryLink: { alignItems: 'center', paddingVertical: 12 },
  secondaryLinkText: { fontSize: 15, color: '#8BC34A', fontWeight: '600' },
});
