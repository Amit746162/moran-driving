import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radius } from '@/lib/theme';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';

export default function Profile() {
  const { profile, session, signOut } = useAuth();
  const name = profile?.full_name ?? 'Athlete';
  const roleLabel =
    profile?.role === 'coach' ? 'Coach' : profile?.role === 'admin' ? 'Admin' : 'Athlete';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Text style={styles.title}>Profile</Text>

      <View style={styles.card}>
        <Avatar uri={profile?.avatar_url} name={name} size={72} />
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.email}>{session?.user.email}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{roleLabel}</Text>
        </View>
      </View>

      <View style={styles.menu}>
        <Row icon="calendar-outline" label="My bookings" />
        <Row icon="heart-outline" label="Favorites" />
        <Row icon="settings-outline" label="Account settings" />
        {profile?.role === 'coach' && (
          <Row icon="time-outline" label="My availability" />
        )}
      </View>

      <View style={styles.signout}>
        <Button title="Sign out" variant="outline" onPress={signOut} />
      </View>
    </SafeAreaView>
  );
}

function Row({
  icon,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}) {
  return (
    <View style={styles.row}>
      <Ionicons name={icon} size={20} color={colors.muted} />
      <Text style={styles.rowLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={colors.muted} />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  card: { alignItems: 'center', padding: 24, gap: 6 },
  name: { fontSize: 20, fontWeight: '700', color: colors.text, marginTop: 8 },
  email: { fontSize: 14, color: colors.muted },
  roleBadge: {
    backgroundColor: '#FDECE8',
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginTop: 4,
  },
  roleText: { color: colors.primary, fontWeight: '700', fontSize: 12 },
  menu: {
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rowLabel: { flex: 1, fontSize: 15, color: colors.text },
  signout: { padding: 16, marginTop: 'auto' },
});
