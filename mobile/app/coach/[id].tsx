import { useEffect, useMemo, useState } from 'react';

import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { supabase } from '@/lib/supabase';
import { colors, radius } from '@/lib/theme';
import { formatPrice } from '@/lib/format';
import { type Coach, type Sport } from '@/lib/types';
import { getCoachSlots, groupByDay, type Slot } from '@/lib/slots';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { Loading } from '@/components/Loading';

const COACH_SELECT = `
  *,
  profile:profiles!inner(full_name, avatar_url),
  coach_sports!inner(sport:sports!inner(id, slug, name, icon))
`;

export default function CoachDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { session } = useAuth();

  const [coach, setCoach] = useState<Coach | null>(null);
  const [slotsByDay, setSlotsByDay] = useState<Record<string, Slot[]>>({});
  const [selectedDay, setSelectedDay] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data } = await supabase
        .from('coach_profiles')
        .select(COACH_SELECT)
        .eq('id', id)
        .single();

      if (data) {
        const raw = data as { coach_sports?: { sport: Sport | null }[] };
        const sports = (raw.coach_sports ?? [])
          .map((cs) => cs.sport)
          .filter((s): s is Sport => Boolean(s));
        setCoach({ ...(data as unknown as Coach), sports });
      }

      const slots = await getCoachSlots(id);
      const grouped = groupByDay(slots);
      setSlotsByDay(grouped);
      setSelectedDay(Object.keys(grouped).sort()[0] ?? '');
      setLoading(false);
    })();
  }, [id]);

  const days = useMemo(() => Object.keys(slotsByDay).sort(), [slotsByDay]);

  async function handleBook() {
    if (!coach || !selectedSlot) return;
    if (!session) {
      router.push('/(auth)/login');
      return;
    }
    setBooking(true);
    const { error } = await supabase.from('bookings').insert({
      coach_id: coach.id,
      athlete_id: session.user.id,
      sport_id: coach.sports[0]?.id,
      starts_at: selectedSlot.start,
      ends_at: selectedSlot.end,
      mode: coach.mode === 'online' ? 'online' : 'in_person',
      status: 'pending',
      price: coach.price_per_session,
      currency: coach.currency,
    });
    setBooking(false);

    if (error) {
      Alert.alert(
        'Slot unavailable',
        error.code === '23P01'
          ? 'That slot was just booked. Please pick another time.'
          : 'Could not create the booking. Please try again.',
      );
      // refresh slots
      const slots = await getCoachSlots(coach.id);
      setSlotsByDay(groupByDay(slots));
      setSelectedSlot(null);
      return;
    }

    Alert.alert('Booking requested!', 'The coach will confirm your session shortly.', [
      { text: 'View bookings', onPress: () => router.replace('/(tabs)/bookings') },
    ]);
  }

  if (loading) return <Loading />;
  if (!coach)
    return (
      <View style={styles.center}>
        <Text style={{ color: colors.muted }}>Coach not found.</Text>
      </View>
    );

  const name = coach.profile?.full_name ?? 'Coach';
  const location = [coach.city, coach.country].filter(Boolean).join(', ');

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {coach.cover_image_url ? (
        <Image source={{ uri: coach.cover_image_url }} style={styles.cover} />
      ) : (
        <View style={[styles.cover, styles.coverFallback]} />
      )}

      <View style={styles.content}>
        <View style={styles.headRow}>
          <Avatar uri={coach.profile?.avatar_url} name={name} size={64} />
          <View style={styles.headInfo}>
            <Text style={styles.name}>{name}</Text>
            {coach.headline ? <Text style={styles.headline}>{coach.headline}</Text> : null}
            <View style={styles.metaRow}>
              <Ionicons name="star" size={13} color={colors.amber} />
              <Text style={styles.metaText}>
                {coach.rating_count > 0
                  ? `${coach.rating_avg.toFixed(1)} (${coach.rating_count})`
                  : 'New'}
              </Text>
              {location ? <Text style={styles.metaText}>· {location}</Text> : null}
            </View>
          </View>
        </View>

        <View style={styles.badges}>
          {coach.sports.map((s) => (
            <View key={s.id} style={styles.badge}>
              <Text style={styles.badgeText}>
                {s.icon} {s.name}
              </Text>
            </View>
          ))}
        </View>

        {coach.bio ? (
          <>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.bio}>{coach.bio}</Text>
          </>
        ) : null}

        {coach.certifications.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Certifications</Text>
            <Text style={styles.bio}>{coach.certifications.join(' · ')}</Text>
          </>
        )}
        {coach.languages.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Languages</Text>
            <Text style={styles.bio}>{coach.languages.join(', ')}</Text>
          </>
        )}

        {/* Booking */}
        <View style={styles.bookCard}>
          <Text style={styles.price}>
            {formatPrice(coach.price_per_session, coach.currency)}
            <Text style={styles.per}> / session</Text>
          </Text>

          {days.length === 0 ? (
            <View style={styles.noSlots}>
              <Ionicons name="calendar-outline" size={22} color={colors.muted} />
              <Text style={styles.noSlotsText}>No availability in the next two weeks.</Text>
            </View>
          ) : (
            <>
              <Text style={styles.pickLabel}>Select a day</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.daysRow}>
                  {days.map((day) => {
                    const d = new Date(`${day}T00:00:00Z`);
                    const active = day === selectedDay;
                    return (
                      <Pressable
                        key={day}
                        onPress={() => {
                          setSelectedDay(day);
                          setSelectedSlot(null);
                        }}
                        style={[styles.dayBtn, active && styles.dayBtnActive]}
                      >
                        <Text style={styles.dayWeekday}>
                          {d.toLocaleDateString('en', { weekday: 'short', timeZone: 'UTC' })}
                        </Text>
                        <Text style={styles.dayNum}>{d.getUTCDate()}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </ScrollView>

              <Text style={styles.pickLabel}>Available times</Text>
              <View style={styles.timesGrid}>
                {(slotsByDay[selectedDay] ?? []).map((slot) => {
                  const active = selectedSlot?.start === slot.start;
                  return (
                    <Pressable
                      key={slot.start}
                      onPress={() => setSelectedSlot(slot)}
                      style={[styles.slot, active && styles.slotActive]}
                    >
                      <Text style={[styles.slotText, active && styles.slotTextActive]}>
                        {new Date(slot.start).toLocaleTimeString('en', {
                          hour: '2-digit',
                          minute: '2-digit',
                          timeZone: 'UTC',
                        })}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Button
                title={
                  selectedSlot
                    ? `Book for ${formatPrice(coach.price_per_session, coach.currency)}`
                    : 'Select a time'
                }
                disabled={!selectedSlot}
                loading={booking}
                onPress={handleBook}
                style={{ marginTop: 16 }}
              />
              <Text style={styles.fineprint}>
                You won’t be charged yet — the coach confirms first.
              </Text>
            </>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  cover: { width: '100%', height: 200 },
  coverFallback: { backgroundColor: colors.primary },
  content: { padding: 16 },
  headRow: { flexDirection: 'row', gap: 14, alignItems: 'center' },
  headInfo: { flex: 1 },
  name: { fontSize: 22, fontWeight: '800', color: colors.text },
  headline: { fontSize: 14, color: colors.muted, marginTop: 2 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  metaText: { fontSize: 13, color: colors.muted },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16 },
  badge: {
    backgroundColor: '#FDECE8',
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeText: { color: colors.primary, fontWeight: '600', fontSize: 13 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginTop: 20, marginBottom: 6 },
  bio: { fontSize: 14, color: colors.muted, lineHeight: 21 },
  bookCard: {
    marginTop: 24,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: 16,
  },
  price: { fontSize: 24, fontWeight: '800', color: colors.text },
  per: { fontSize: 14, color: colors.muted, fontWeight: '500' },
  pickLabel: { fontSize: 14, fontWeight: '600', color: colors.text, marginTop: 16, marginBottom: 8 },
  daysRow: { flexDirection: 'row', gap: 8 },
  dayBtn: {
    minWidth: 60,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: 8,
    alignItems: 'center',
  },
  dayBtnActive: { borderColor: colors.primary, backgroundColor: '#FDECE8' },
  dayWeekday: { fontSize: 11, color: colors.muted },
  dayNum: { fontSize: 18, fontWeight: '700', color: colors.text },
  timesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  slot: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingVertical: 10,
    paddingHorizontal: 14,
    minWidth: 88,
    alignItems: 'center',
  },
  slotActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  slotText: { fontSize: 14, fontWeight: '600', color: colors.text },
  slotTextActive: { color: '#fff' },
  fineprint: { textAlign: 'center', fontSize: 12, color: colors.muted, marginTop: 8 },
  noSlots: { alignItems: 'center', gap: 8, paddingVertical: 24 },
  noSlotsText: { color: colors.muted, fontSize: 13 },
});
