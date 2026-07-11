import { useCallback, useEffect, useState } from 'react';

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { supabase } from '@/lib/supabase';
import { colors, radius } from '@/lib/theme';
import { type Coach, type Sport } from '@/lib/types';
import { CoachCard } from '@/components/CoachCard';
import { Loading } from '@/components/Loading';

const COACH_SELECT = `
  *,
  profile:profiles!inner(full_name, avatar_url),
  coach_sports!inner(sport:sports!inner(id, slug, name, icon))
`;

interface RawCoach {
  coach_sports?: { sport: Sport | null }[];
  [key: string]: unknown;
}

function normalize(raw: RawCoach): Coach {
  const { coach_sports, ...rest } = raw;
  const sports = (coach_sports ?? [])
    .map((cs) => cs.sport)
    .filter((s): s is Sport => Boolean(s));
  return { ...(rest as unknown as Coach), sports };
}

export default function Discover() {
  const router = useRouter();
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [activeSport, setActiveSport] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    let query = supabase
      .from('coach_profiles')
      .select(COACH_SELECT)
      .eq('is_published', true)
      .order('rating_avg', { ascending: false });

    if (activeSport) query = query.eq('coach_sports.sport.slug', activeSport);
    if (search.trim()) query = query.ilike('city', `%${search.trim()}%`);

    const { data } = await query.limit(50);
    setCoaches(((data ?? []) as unknown as RawCoach[]).map(normalize));
  }, [activeSport, search]);

  useEffect(() => {
    supabase
      .from('sports')
      .select('id, slug, name, icon')
      .eq('is_active', true)
      .order('sort_order')
      .then(({ data }) => setSports((data as Sport[]) ?? []));
  }, []);

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Find a coach</Text>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={colors.muted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by city…"
            placeholderTextColor={colors.muted}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
        </View>
      </View>

      <FlatList
        data={coaches}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CoachCard coach={item} onPress={() => router.push(`/coach/${item.id}`)} />
        )}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListHeaderComponent={
          <View style={styles.chipsRow}>
            <SportChip
              label="All"
              active={!activeSport}
              onPress={() => setActiveSport(null)}
            />
            {sports.map((s) => (
              <SportChip
                key={s.id}
                label={`${s.icon} ${s.name}`}
                active={activeSport === s.slug}
                onPress={() => setActiveSport(s.slug)}
              />
            ))}
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <Loading />
          ) : (
            <View style={styles.empty}>
              <Ionicons name="search" size={28} color={colors.muted} />
              <Text style={styles.emptyText}>No coaches match your search.</Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}

function SportChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive]}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 },
  title: { fontSize: 26, fontWeight: '800', color: colors.text, marginBottom: 12 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    height: 46,
  },
  searchInput: { flex: 1, fontSize: 15, color: colors.text },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingVertical: 12 },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 13, fontWeight: '600', color: colors.text },
  chipTextActive: { color: '#fff' },
  empty: { alignItems: 'center', paddingVertical: 60, gap: 10 },
  emptyText: { color: colors.muted, fontSize: 14 },
});
