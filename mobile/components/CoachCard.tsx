import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius } from '@/lib/theme';
import { formatPrice } from '@/lib/format';
import { type Coach } from '@/lib/types';

export function CoachCard({ coach, onPress }: { coach: Coach; onPress: () => void }) {
  const name = coach.profile?.full_name ?? 'Coach';
  const location = [coach.city, coach.country].filter(Boolean).join(', ');

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.cover}>
        {coach.cover_image_url ? (
          <Image source={{ uri: coach.cover_image_url }} style={styles.coverImg} />
        ) : (
          <View style={[styles.coverImg, styles.coverFallback]} />
        )}
        <View style={styles.modeTags}>
          {(coach.mode === 'online' || coach.mode === 'both') && (
            <Tag icon="videocam" label="Online" />
          )}
          {(coach.mode === 'in_person' || coach.mode === 'both') && (
            <Tag icon="location" label="In person" />
          )}
        </View>
      </View>

      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
        {coach.headline ? (
          <Text style={styles.headline} numberOfLines={1}>
            {coach.headline}
          </Text>
        ) : null}

        <View style={styles.sports}>
          {coach.sports.slice(0, 3).map((s) => (
            <View key={s.id} style={styles.sportBadge}>
              <Text style={styles.sportText}>
                {s.icon} {s.name}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <View>
            <View style={styles.rating}>
              <Ionicons name="star" size={13} color={colors.amber} />
              <Text style={styles.ratingText}>
                {coach.rating_count > 0 ? coach.rating_avg.toFixed(1) : 'New'}
              </Text>
              {coach.rating_count > 0 && (
                <Text style={styles.ratingCount}>({coach.rating_count})</Text>
              )}
            </View>
            {location ? <Text style={styles.location}>{location}</Text> : null}
          </View>
          <View style={styles.priceWrap}>
            <Text style={styles.price}>
              {formatPrice(coach.price_per_session, coach.currency)}
            </Text>
            <Text style={styles.per}>/ session</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

function Tag({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  return (
    <View style={styles.tag}>
      <Ionicons name={icon} size={11} color={colors.text} />
      <Text style={styles.tagText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: 16,
  },
  cover: { height: 140 },
  coverImg: { width: '100%', height: '100%' },
  coverFallback: { backgroundColor: colors.primary, opacity: 0.85 },
  modeTags: { position: 'absolute', top: 10, left: 10, flexDirection: 'row', gap: 6 },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tagText: { fontSize: 11, fontWeight: '600', color: colors.text },
  body: { padding: 14, gap: 8 },
  name: { fontSize: 16, fontWeight: '700', color: colors.text },
  headline: { fontSize: 13, color: colors.muted },
  sports: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  sportBadge: {
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  sportText: { fontSize: 12, color: colors.text, fontWeight: '500' },
  footer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 10,
    marginTop: 2,
  },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontSize: 13, fontWeight: '700', color: colors.text },
  ratingCount: { fontSize: 12, color: colors.muted },
  location: { fontSize: 12, color: colors.muted, marginTop: 2 },
  priceWrap: { alignItems: 'flex-end' },
  price: { fontSize: 18, fontWeight: '800', color: colors.text },
  per: { fontSize: 11, color: colors.muted },
});
