import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
} from 'react-native';

import { colors, radius } from '@/lib/theme';

interface ButtonProps extends PressableProps {
  title: string;
  variant?: 'primary' | 'outline' | 'ghost';
  loading?: boolean;
}

export function Button({
  title,
  variant = 'primary',
  loading,
  disabled,
  style,
  ...props
}: ButtonProps) {
  return (
    <Pressable
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' && styles.primary,
        variant === 'outline' && styles.outline,
        variant === 'ghost' && styles.ghost,
        (disabled || loading) && styles.disabled,
        pressed && styles.pressed,
        typeof style === 'object' ? style : null,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#fff' : colors.primary} />
      ) : (
        <Text
          style={[
            styles.text,
            variant === 'primary' ? styles.textPrimary : styles.textDark,
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 50,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  primary: { backgroundColor: colors.primary },
  outline: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card },
  ghost: { backgroundColor: 'transparent' },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.85 },
  text: { fontSize: 15, fontWeight: '700' },
  textPrimary: { color: '#fff' },
  textDark: { color: colors.text },
});
