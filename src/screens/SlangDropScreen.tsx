import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import type { RootNavigationProp } from "../navigation/types";
import { WordCard } from "../components/WordCard";
import { HintBox } from "../components/HintBox";
import { VibeMeter } from "../components/VibeMeter";
import { Button } from "../components/Button";
import { mockSlangWords } from "../data/mockSlang";
import { colors, spacing, radius, fontSize, fontWeight } from "../theme/theme";

export function SlangDropScreen() {
  const navigation = useNavigation<RootNavigationProp>();
  const insets = useSafeAreaInsets();
  const word = mockSlangWords[0];

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + spacing.md,
          paddingBottom: insets.bottom + spacing.lg,
        },
      ]}
    >
      <View style={styles.topBar}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Feather name="arrow-left" size={18} color={colors.textMuted} />
        </Pressable>
        <Text style={styles.topTitle}>word detail</Text>
        <Feather name="bookmark" size={18} color={colors.primary} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <WordCard
          word={word.word}
          romanization={word.romanization}
          meaning={word.meaning}
          exampleMessage={word.exampleMessage}
          exampleTranslation={word.exampleTranslation}
          category="✦ slang drop"
          categoryVariant="purple"
        />

        <HintBox message={word.culturalNote} />

        <Text style={styles.sectionLabel}>VIBE METER</Text>
        <VibeMeter
          friends={word.vibeFriends}
          strangers={word.vibeStrangers}
          formal={word.vibeFormal}
        />

        <Text style={[styles.sectionLabel, styles.sectionSpaced]}>
          SIMILAR WORDS
        </Text>
        <View style={styles.chipRow}>
          {word.similarWords.map((similar) => (
            <View key={similar} style={styles.chip}>
              <Text style={styles.chipText}>{similar}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <Button
        label="practice this word"
        onPress={() => navigation.navigate("Quiz")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: spacing.lg,
  },
  topTitle: {
    flex: 1,
    fontSize: fontSize.bodyLg,
    fontWeight: fontWeight.medium,
    color: colors.primaryDark,
  },
  scroll: {
    gap: spacing.md,
    paddingBottom: spacing.lg,
  },
  sectionLabel: {
    fontSize: fontSize.micro,
    fontWeight: fontWeight.medium,
    color: colors.textMuted,
    letterSpacing: 0.6,
  },
  sectionSpaced: {
    marginTop: spacing.sm,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  chip: {
    backgroundColor: colors.primaryLight,
    borderRadius: radius.full,
    paddingVertical: 5,
    paddingHorizontal: spacing.md,
  },
  chipText: {
    fontSize: fontSize.small,
    color: colors.primaryText,
  },
});
