import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, radius, fontSize, fontWeight } from '../theme/theme';
import { Tag } from './Tag';

interface WordCardProps {
  word: string;
  romanization: string;
  meaning: string;
  exampleMessage: string;
  exampleTranslation?: string;
  category?: string;
  categoryVariant?: 'purple' | 'coral' | 'teal' | 'amber';
}

export function WordCard({
  word,
  romanization,
  meaning,
  exampleMessage,
  exampleTranslation,
  category,
  categoryVariant = 'purple',
}: WordCardProps) {
  return (
    <View style={styles.container}>
      {category ? (
        <Tag label={category} variant={categoryVariant} />
      ) : null}

      <Text style={styles.word}>{word}</Text>
      <Text style={styles.romanization}>{romanization}</Text>
      <Text style={styles.meaning}>{meaning}</Text>

      <View style={styles.exampleSection}>
        <Text style={styles.exampleLabel}>in a message</Text>
        <Text style={styles.exampleMessage}>"{exampleMessage}"</Text>
        {exampleTranslation ? (
          <Text style={styles.exampleTranslation}>{exampleTranslation}</Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  word: {
    color: colors.textPrimary,
    fontSize: fontSize.display,
    fontWeight: fontWeight.semibold,
    marginTop: spacing.xs,
  },
  romanization: {
    color: colors.textSecondary,
    fontSize: fontSize.bodyLg,
    fontWeight: fontWeight.regular,
  },
  meaning: {
    color: colors.textPrimary,
    fontSize: fontSize.heading,
    fontWeight: fontWeight.medium,
  },
  exampleSection: {
    marginTop: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 0.5,
    borderTopColor: colors.borderLight,
    gap: spacing.xs,
  },
  exampleLabel: {
    color: colors.textMuted,
    fontSize: fontSize.small,
    fontWeight: fontWeight.medium,
  },
  exampleMessage: {
    color: colors.textSecondary,
    fontSize: fontSize.body,
    fontWeight: fontWeight.regular,
  },
  exampleTranslation: {
    color: colors.textMuted,
    fontSize: fontSize.small,
    fontWeight: fontWeight.regular,
  },
});