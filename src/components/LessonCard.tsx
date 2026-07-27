import { View, Text, StyleSheet } from "react-native";
import type { ReactNode } from "react";

import { Tag } from "./Tag";
import { PressScale } from "./animated/PressScale";
import { colors, spacing, radius, fontSize, fontWeight } from "../theme/theme";

type LessonVariant = "purple" | "coral" | "neutral";

interface LessonCardProps {
  tag: string;
  tagVariant?: "purple" | "coral" | "teal" | "amber";
  title: string;
  subtitle: string;
  icon: ReactNode;
  progressFilled: number; // 0–1 share of filled segment
  progressTotal?: number; // segments in the bar (default 5)
  variant?: LessonVariant;
  onPress?: () => void;
}

export function LessonCard({
  tag,
  tagVariant = "purple",
  title,
  subtitle,
  icon,
  progressFilled,
  progressTotal = 5,
  variant = "purple",
  onPress,
}: LessonCardProps) {
  const filled = Math.round(progressFilled * progressTotal);
  const empty = progressTotal - filled;

  return (
    <PressScale
      onPress={onPress}
      pressedScale={0.98}
      style={[styles.base, variantStyles[variant]]}
    >
      <View style={styles.row}>
        <View style={styles.textBlock}>
          <Tag label={tag} variant={tagVariant} />
          <Text style={[styles.title, titleStyles[variant]]}>{title}</Text>
          <Text style={[styles.subtitle, subtitleStyles[variant]]}>
            {subtitle}
          </Text>
        </View>
        <View style={[styles.iconBox, iconStyles[variant]]}>{icon}</View>
      </View>

      <View style={styles.progressRow}>
        {filled > 0 ? (
          <View
            style={[
              styles.progressSeg,
              { flex: filled, backgroundColor: progressColors[variant].filled },
            ]}
          />
        ) : null}
        {empty > 0 ? (
          <View
            style={[
              styles.progressSeg,
              { flex: empty, backgroundColor: progressColors[variant].empty },
            ]}
          />
        ) : null}
      </View>
    </PressScale>
  );
}

const variantStyles = StyleSheet.create({
  purple: {
    backgroundColor: colors.primaryLight,
    borderWidth: 0,
  },
  coral: {
    backgroundColor: colors.coralBg,
    borderWidth: 0,
  },
  neutral: {
    backgroundColor: colors.white,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
});

const titleStyles = StyleSheet.create({
  purple: { color: colors.primaryDark },
  coral: { color: colors.coralDark },
  neutral: { color: colors.textPrimary },
});

const subtitleStyles = StyleSheet.create({
  purple: { color: colors.primarySoft },
  coral: { color: colors.coralStrong },
  neutral: { color: colors.textMuted },
});

const iconStyles = StyleSheet.create({
  purple: { backgroundColor: colors.primaryMid },
  coral: { backgroundColor: colors.coralMid },
  neutral: { backgroundColor: colors.background },
});

const progressColors = {
  purple: { filled: colors.primary, empty: colors.primaryMid },
  coral: { filled: colors.coralStrong, empty: colors.coralMid },
  neutral: { filled: colors.border, empty: colors.border },
};

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.lg,
    padding: 14,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  textBlock: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  title: {
    fontSize: fontSize.heading,
    fontWeight: fontWeight.medium,
    marginTop: 7,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: fontSize.label,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  progressRow: {
    flexDirection: "row",
    gap: 4,
    marginTop: 10,
  },
  progressSeg: {
    height: 4,
    borderRadius: 2,
  },
});
