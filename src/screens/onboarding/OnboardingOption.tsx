import { Pressable, View, Text, StyleSheet } from "react-native";
import type { ReactNode } from "react";
import { Tag } from "../../components/Tag";
import { colors, spacing, radius, fontSize, fontWeight } from "../../theme/theme";

interface OnboardingOptionProps {
  label: string;
  subtitle?: string;
  icon?: ReactNode;
  badge?: string;
  selected?: boolean;
  onPress: () => void;
}

export function OnboardingOption({
  label,
  subtitle,
  icon,
  badge,
  selected = false,
  onPress,
}: OnboardingOptionProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        selected && styles.selected,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.left}>
        {icon ? <View style={styles.icon}>{icon}</View> : null}
        <View style={styles.textBlock}>
          <Text style={styles.label}>{label}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      </View>
      {badge ? <Tag label={badge} variant="purple" /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: radius.md,
    borderWidth: 0.5,
    borderColor: colors.border,
    backgroundColor: colors.white,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  selected: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  pressed: {
    opacity: 0.85,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  icon: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  textBlock: {
    flex: 1,
    gap: 2,
  },
  label: {
    color: colors.textPrimary,
    fontSize: fontSize.body,
    fontWeight: fontWeight.medium,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: fontSize.label,
    fontWeight: fontWeight.regular,
  },
});
