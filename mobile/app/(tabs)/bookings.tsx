import { useCallback, useState } from 'react';

import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { supabase } from '@/lib/supabase';
import { colors, radius } from '@/lib/theme';
import { formatDateTime, formatPrice } from '@/lib/format';
import { type Booking, type BookingStatus } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar } from '@/components/Avatar';
import { Loading } from '@/components/Loading';

const STATUS_STYLE: Record<BookingStatus, { label: string; bg: string; fg: string }> = {
  pending: { label: 'Pending', bg: '#FEF3C7', fg: '#B45309' },
  confirmed: { label: 'Confirmed', bg: '#FDECE8', fg: colors.primary },
  completed: { label: 'Completed', bg: '#DCFCE7', fg: '#15803D' },
  cancelled: { label: 'Cancelled', bg: '#FEE2E2', fg: '#B91C1C' },
  no_show: { label: 'No show', bg: colors.surface, fg: colors.muted },
};

const SELECT = `
  *,
  coach:coach_profiles(id, profile:profiles(full_name, avatar_url)),
  sport:sports(name, icon)
`;

export default function Bookings() {
  const { session } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!session) return;
    const { data } = await supabase
      .from('bookings')
      .select(SELECT)
      .order('starts_at', { ascending: false });
    setBookings((data ?? []) as unknown as Booking[]);
    setLoading(false);
  }, [session]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load();
    }, [load]),
  );

  if (loading) return <Loading />;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Text style={styles.title}>My bookings</Text>
      <FlatList
        data={bookings}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const s = STATUS_STYLE[item.status];
          const name = item.coach?.profile?.full_name ?? 'Coach';
          return (
            <View style={styles.card}>
              <Avatar
                uri={item.coach?.profile?.avatar_url}
                name={name}
                size={48}
              />
              <View style={styles.cardBody}>
                <View style={styles.cardTop}>
                  <Text style={styles.coachName}>{name}</Text>
                  <View style={[styles.pill, { backgroundColor: s.bg }]}>
                    <Text style={[styles.pillText, { color: s.fg }]}>{s.label}</Text>
                  </View>
                </View>
                <Text style={styles.sport}>
                  {item.sport?.icon} {item.sport?.name}
                </Text>
                <Text style={styles.when}>{formatDateTime(item.starts_at)}</Text>
              </View>
              <Text style={styles.price}>
                {formatPrice(Number(item.price), item.currency)}
              </Text>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="calendar-outline" size={30} color={colors.muted} />
            <Text style={styles.emptyText}>No bookings yet.</Text>
            <Text style={styles.emptySub}>Book your first session from Discover.</Text>
          </View>
        }
      />
    </SafeAreaView>
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
    paddingBottom: 8,
  },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: 14,
    marginBottom: 12,
  },
  cardBody: { flex: 1, gap: 2 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  coachName: { fontSize: 15, fontWeight: '700', color: colors.text },
  pill: { borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 2 },
  pillText: { fontSize: 11, fontWeight: '700' },
  sport: { fontSize: 13, color: colors.muted },
  when: { fontSize: 13, color: colors.muted },
  price: { fontSize: 15, fontWeight: '700', color: colors.text },
  empty: { alignItems: 'center', paddingVertical: 70, gap: 8 },
  emptyText: { fontSize: 16, fontWeight: '600', color: colors.text },
  emptySub: { fontSize: 13, color: colors.muted },
});
