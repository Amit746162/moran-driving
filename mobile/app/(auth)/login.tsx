import { useState } from 'react';

import { Link } from 'expo-router';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/Button';
import { colors, radius } from '@/lib/theme';

export default function Login() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    setError(null);
    setLoading(true);
    const err = await signIn(email.trim(), password);
    setLoading(false);
    if (err) setError(err);
    // On success the AuthGate redirects automatically.
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <View style={styles.container}>
          <View style={styles.brand}>
            <View style={styles.mark}>
              <Text style={styles.markText}>🏋️</Text>
            </View>
            <Text style={styles.logo}>Coachly</Text>
          </View>

          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Log in to manage your sessions.</Text>

          <View style={styles.form}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor={colors.muted}
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={colors.muted}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Button title="Log in" onPress={onSubmit} loading={loading} style={styles.btn} />
          </View>

          <Text style={styles.footer}>
            New to Coachly?{' '}
            <Link href="/(auth)/register" style={styles.link}>
              Create an account
            </Link>
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 28 },
  mark: {
    width: 40,
    height: 40,
    borderRadius: 11,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markText: { fontSize: 20 },
  logo: { fontSize: 22, fontWeight: '800', color: colors.text },
  title: { fontSize: 26, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: 15, color: colors.muted, marginTop: 4 },
  form: { marginTop: 28, gap: 6 },
  label: { fontSize: 13, fontWeight: '600', color: colors.text, marginTop: 10 },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.card,
  },
  error: { color: '#DC2626', fontSize: 13, marginTop: 8 },
  btn: { marginTop: 18 },
  footer: { textAlign: 'center', marginTop: 24, color: colors.muted, fontSize: 14 },
  link: { color: colors.primary, fontWeight: '700' },
});
