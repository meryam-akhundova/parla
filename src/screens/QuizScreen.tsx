import { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import type { RootNavigationProp } from "../navigation/types";
import { Tag } from "../components/Tag";
import { HintBox } from "../components/HintBox";
import { QuizOption } from "../components/QuizOption";
import { Button } from "../components/Button";
import { colors, spacing, radius, fontSize, fontWeight } from "../theme/theme";

const OPTIONS = [
  { id: "a", label: "wow / seriously? (disbelief)", correct: true },
  { id: "b", label: "hey bro, what's up", correct: false },
  { id: "c", label: "sounds good / agreed", correct: false },
] as const;

export function QuizScreen() {
  const navigation = useNavigation<RootNavigationProp>();
  const insets = useSafeAreaInsets();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const answered = selectedId !== null;

  const optionState = (id: string, correct: boolean) => {
    if (!answered) return "default" as const;
    if (correct) return "correct" as const;
    if (id === selectedId) return "wrong" as const;
    return "dim" as const;
  };

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
          <Feather name="x" size={18} color={colors.textMuted} />
        </Pressable>
        <View style={styles.xpTrack}>
          <View style={[styles.xpFill, { width: "55%" }]} />
        </View>
        <View style={styles.streakPill}>
          <Text style={styles.streakText}>12 ✦</Text>
        </View>
      </View>

      <View style={styles.tags}>
        <Tag label="✦ slang drop" variant="purple" />
        <View style={styles.countPill}>
          <Text style={styles.countText}>3 / 5</Text>
        </View>
      </View>

      <View style={styles.scenario}>
        <Text style={styles.scenarioLabel}>📱 your friend texts:</Text>
        <Text style={styles.scenarioText}>
          "ya bro bu iş çok saçma değil mi?"
        </Text>
      </View>

      <Text style={styles.question}>what does "ya bro" express here?</Text>
      <Text style={styles.prompt}>pick the closest meaning</Text>

      <View style={styles.options}>
        {OPTIONS.map((opt) => (
          <QuizOption
            key={opt.id}
            label={opt.label}
            state={optionState(opt.id, opt.correct)}
            onPress={() => setSelectedId(opt.id)}
          />
        ))}
      </View>

      {answered ? (
        <HintBox message='"ya bro" is borrowed from english but used all over turkish gen-z texting — pure surprise or exasperation, not a greeting.' />
      ) : null}

      <View style={styles.footer}>
        <Button label="next →" onPress={() => navigation.navigate("Main")} />
      </View>
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
    marginBottom: spacing.md,
  },
  xpTrack: {
    flex: 1,
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.borderLight,
    overflow: "hidden",
  },
  xpFill: {
    height: "100%",
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },
  streakPill: {
    backgroundColor: colors.amberBg,
    borderRadius: radius.full,
    paddingVertical: 3,
    paddingHorizontal: 10,
  },
  streakText: {
    fontSize: fontSize.label,
    fontWeight: fontWeight.medium,
    color: colors.amberText,
  },
  tags: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 14,
  },
  countPill: {
    backgroundColor: colors.background,
    borderRadius: radius.full,
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
    justifyContent: "center",
  },
  countText: {
    fontSize: fontSize.micro,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
  },
  scenario: {
    backgroundColor: colors.amberBg,
    borderRadius: radius.lg,
    padding: 14,
    marginBottom: spacing.lg,
  },
  scenarioLabel: {
    fontSize: fontSize.micro,
    fontWeight: fontWeight.medium,
    color: colors.amberText,
    marginBottom: 6,
  },
  scenarioText: {
    fontSize: 16,
    fontWeight: fontWeight.medium,
    color: colors.amberDark,
    lineHeight: 22,
  },
  question: {
    fontSize: fontSize.bodyLg,
    fontWeight: fontWeight.medium,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  prompt: {
    fontSize: fontSize.small,
    color: colors.textSecondary,
    marginBottom: 14,
  },
  options: {
    marginBottom: spacing.md,
  },
  footer: {
    marginTop: "auto",
  },
});
