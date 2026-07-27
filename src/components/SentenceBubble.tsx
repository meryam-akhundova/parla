import { View, Text, StyleSheet } from "react-native";

import { colors, spacing, radius, fontSize, fontWeight } from "../theme/theme";

interface SentenceBubbleProps {
  /** The line shown in the bubble (slang or plain, depending on quiz direction). */
  sentence: string;
  /** Optional secondary line (e.g. highlighted slang word). */
  highlight?: string;
  label?: string;
}

/** Fake text-message bubble for unpack quizzes. */
export function SentenceBubble({
  sentence,
  highlight,
  label = "in a message",
}: SentenceBubbleProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.bubble}>
        <Text style={styles.sentence}>"{sentence}"</Text>
      </View>
      {highlight ? (
        <Text style={styles.highlight}>focus: {highlight}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  label: {
    fontSize: fontSize.micro,
    fontWeight: fontWeight.medium,
    color: colors.textMuted,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  bubble: {
    backgroundColor: colors.tealBg,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: 14,
    borderBottomLeftRadius: 4,
  },
  sentence: {
    fontSize: fontSize.headingLg,
    fontWeight: fontWeight.medium,
    color: colors.tealDark,
    lineHeight: 24,
  },
  highlight: {
    fontSize: fontSize.label,
    color: colors.tealText,
  },
});
