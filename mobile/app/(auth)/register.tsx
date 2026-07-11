import { useState } from 'react';

import { Link } from 'expo-router';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/Button';
import { colors, radius } from '@/lib/theme';

export default function Register() {
  const { signUp } = useAuth();
  const [role, setRole] = useState<'athlete' | 'coach'>('athlete');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    setError(null);
    if (fullName.trim().length < 2) return setError('Please enter your name.');
    if (password.length < 8) return setError('Password must be at least 8 characters.');
    setLoading(true);
    const err = await signUp(email.trim(), password, fullName.trim(), role);
    setLoading(false);
    if (err) setError(err);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Create your account</Text>
          <Text style={styles.subtitle}>Book coaches or grow your coaching business.</Text>

          <Text style={styles.label}>I want to join as</Text>
          <View style={styles.roles}>
            <RoleCard
              active={role === 'athlete'}
              emoji="🏃"
              title="Athlete"
              desc="Book coaches"
              onPress={() => setRole('athlete')}
            />
            <RoleCard
              active={role === 'coach'}
              emoji="🏋️"
              title="Coach"
              desc="Offer sessions"
              onPress={() => setRole('coach')}
            />
          </View>

          <Text style={styles.label}>Full name</Text>
          <TextInput
            style={styles.input}
            placeholder="Alex Morgan"
            placeholderTextColor={colors.muted}
            value={fullName}
            onChangeText={setFullName}
          />
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
            placeholder="At least 8 characters"
            placeholderTextColor={colors.muted}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button title="Create account" onPress={onSubmit} loading={loading} style={styles.btn} />

          <Text style={styles.footer}>
            Already have an account?{' '}
            <Link href="/(auth)/login" style={styles.link}>
              Log in
            </Link>
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function RoleCard({
  active,
  emoji,
  title,
  desc,
  onPress,
}: {
  active: boolean;
  emoji: string;
  title: string;
  desc: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.roleCard, active && styles.roleCardActive]}
    >
      <Text style={styles.roleEmoji}>{emoji}</Text>
      <Text style={styles.roleTitle}>{title}</Text>
      <Text style={styles.roleDesc}>{desc}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  container: { padding: 24, paddingTop: 40, gap: 4 },
  title: { fontSize: 26, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: 15, color: colors.muted, marginTop: 4, marginBottom: 8 },
  label: { fontSize: 13, fontWeight: '600', color: colors.text, marginTop: 14, marginBottom: 6 },
  roles: { flexDirection: 'row', gap: 12 },
  roleCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 14,
    gap: 2,
  },
  roleCardActive: { borderColor: colors.primary, backgroundColor: '#FDECE8' },
  roleEmoji: { fontSize: 22 },
  roleTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  roleDesc: { fontSize: 12, color: colors.muted },
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
  error: { color: '#DC2626', fontSize: 13, marginTop: 10 },
  btn: { marginTop: 20 },
  footer: { textAlign: 'center', marginTop: 20, color: colors.muted, fontSize: 14 },
  link: { color: colors.primary, fontWeight: '700' },
});
