import { View, Text, TextInput, ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Tag } from "../components/Tag";
import { colors, spacing, radius, fontSize, fontWeight } from "../theme/theme";

const TRENDING = [
  {
    tag: "✦ slang drop",
    tagVariant: "purple" as const,
    learners: "2.1k learners",
    title: "gen-z texting essentials",
    subtitle: "ya bro · eyw · kanka · bitti benim",
  },
  {
    tag: "vibe check",
    tagVariant: "coral" as const,
    learners: "1.4k learners",
    title: "words that can backfire",
    subtitle: "lan · ulan · orospu çocuğu — know when not to",
  },
  {
    tag: "regional",
    tagVariant: "teal" as const,
    learners: "980 learners",
    title: "istanbul vs anatolian",
    subtitle: "same word, totally different energy",
  },
  {
    tag: "expressions",
    tagVariant: "amber" as const,
    learners: "730 learners",
    title: "filler sounds & hesitation",
    subtitle: "şey · yani · falan filan · işte",
  },
];

export function ExploreScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.lg }]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>
          explore <Text style={styles.spark}>✦</Text>
        </Text>
        <Text style={styles.subtitle}>browse by mood, topic, or region</Text>

        <TextInput
          placeholder="search slang, topics, phrases..."
          placeholderTextColor={colors.textMuted}
          style={styles.search}
        />

        <Text style={styles.sectionLabel}>TRENDING IN TURKISH</Text>

        {TRENDING.map((item) => (
          <View key={item.title} style={styles.card}>
            <View style={styles.cardTop}>
              <Tag label={item.tag} variant={item.tagVariant} />
              <Text style={styles.learners}>{item.learners}</Text>
            </View>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize.title,
    fontWeight: fontWeight.medium,
    color: colors.primaryDark,
    marginBottom: 4,
  },
  spark: {
    color: colors.primary,
  },
  subtitle: {
    fontSize: fontSize.small,
    color: colors.textSecondary,
    marginBottom: 14,
  },
  search: {
    width: "100%",
    fontSize: fontSize.body,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: radius.md,
    borderWidth: 0.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    color: colors.textPrimary,
    marginBottom: 14,
  },
  sectionLabel: {
    fontSize: fontSize.micro,
    fontWeight: fontWeight.medium,
    color: colors.textMuted,
    letterSpacing: 0.6,
    marginBottom: spacing.sm,
  },
  card: {
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: 14,
    backgroundColor: colors.white,
    marginBottom: spacing.sm,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  learners: {
    fontSize: fontSize.micro,
    color: colors.textMuted,
  },
  cardTitle: {
    fontSize: fontSize.bodyLg,
    fontWeight: fontWeight.medium,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: fontSize.label,
    color: colors.textSecondary,
  },
});
