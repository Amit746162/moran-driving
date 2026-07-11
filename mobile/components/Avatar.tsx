import { Image, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/lib/theme';
import { initials } from '@/lib/format';

export function Avatar({
  uri,
  name,
  size = 44,
}: {
  uri?: string | null;
  name?: string | null;
  size?: number;
}) {
  const dim = { width: size, height: size, borderRadius: size / 2 };
  if (uri) {
    return <Image source={{ uri }} style={[styles.img, dim]} />;
  }
  return (
    <View style={[styles.fallback, dim]}>
      <Text style={[styles.txt, { fontSize: size * 0.36 }]}>{initials(name)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  img: { backgroundColor: colors.surface },
  fallback: {
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txt: { fontWeight: '700', color: colors.text },
});
