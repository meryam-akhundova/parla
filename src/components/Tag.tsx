import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, radius, fontSize, fontWeight } from '../theme/theme';

interface TagProps {
  label: string;
  variant?: 'purple' | 'coral' | 'teal' | 'amber';
}

export function Tag({ label, variant = 'purple' }: TagProps) {
  const variantStyles = {
    purple: styles.purple,
    coral: styles.coral,
    teal: styles.teal,
    amber: styles.amber,
  }[variant];

  const labelStyles = {
    purple: styles.purpleLabel,
    coral: styles.coralLabel,
    teal: styles.tealLabel,
    amber: styles.amberLabel,
  }[variant];

  return (
    <View style={[styles.base, variantStyles]}>
      <Text style={[styles.label, labelStyles]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.full,
  },
  label: {
    fontSize: fontSize.label,
    fontWeight: fontWeight.medium,
  },
  purple: {
    backgroundColor: colors.primaryLight,
  },
  purpleLabel: {
    color: colors.primaryText,
  },
  coral: {
    backgroundColor: colors.coralBg,
  },
  coralLabel: {
    color: colors.coralText,
  },
  teal: {
    backgroundColor: colors.tealBg,
  },
  tealLabel: {
    color: colors.tealText,
  },
  amber: {
    backgroundColor: colors.amberBg,
  },
  amberLabel: {
    color: colors.amberText,
  },
});