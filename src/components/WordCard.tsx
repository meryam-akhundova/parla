import { View, Text, StyleSheet } from "react-native";
import { colors, spacing, radius, fontSize, fontWeight } from "../theme/theme";
import { Tag } from "./Tag";

interface WordCardProps {
  word: string;
  romanization: string;
  meaning: string;
  exampleMessage: string;
  exampleTranslation?: string;
  category?: string;
  categoryVariant?: "purple" | "coral" | "teal" | "amber";
}

export function WordCard({
  word,
  romanization,
  meaning,
  exampleMessage,
  exampleTranslation,
  category,
  categoryVariant = "purple",
}: WordCardProps) {
  return (
    <View style={styles.container}>
      {category ? <Tag label={category} variant={categoryVariant} /> : null}

      <Text style={styles.word}>{word}</Text>
      <Text style={styles.romanization}>{romanization}</Text>
      <Text style={styles.meaning}>{meaning}</Text>

      <View style={styles.exampleSection}>
        <Text style={styles.exampleLabel}>in a message</Text>
        <View style={styles.exampleBubble}>
          <Text style={styles.exampleMessage}>
            "{exampleMessage}"
            {exampleTranslation ? (
              <Text style={styles.exampleTranslation}>
                {" "}
                → "{exampleTranslation}"
              </Text>
            ) : null}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  word: {
    color: colors.primary,
    fontSize: fontSize.display,
    fontWeight: fontWeight.medium,
    marginTop: spacing.xs,
  },
  romanization: {
    color: colors.primaryFaint,
    fontSize: fontSize.small,
    fontWeight: fontWeight.regular,
    fontStyle: "italic",
  },
  meaning: {
    color: colors.textPrimary,
    fontSize: fontSize.bodyLg,
    fontWeight: fontWeight.regular,
  },
  exampleSection: {
    marginTop: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 0.5,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
  exampleLabel: {
    color: colors.textSecondary,
    fontSize: fontSize.label,
    fontWeight: fontWeight.medium,
  },
  exampleBubble: {
    backgroundColor: colors.primaryLight,
    borderRadius: 10,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  exampleMessage: {
    color: colors.primaryText,
    fontSize: fontSize.body,
    fontWeight: fontWeight.regular,
    lineHeight: 20,
  },
  exampleTranslation: {
    color: colors.primaryFaint,
  },
});
