import { View, Text, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "../../components/Button";
import { HintBox } from "../../components/HintBox";
import { WordCard } from "../../components/WordCard";
import { StepRow } from "./StepRow";
import { mockSlangWords } from "../../data/mockSlang";
import { colors, spacing, fontSize, fontWeight } from "../../theme/theme";

import { useState } from "react";
import { useAuthStore } from "../../store/authStore";

export function OnboardingFirstWordScreen() {
  const saveOnboarding = useAuthStore((s) => s.saveOnboarding);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const insets = useSafeAreaInsets();
  const word = mockSlangWords[0];

  const finishOnboarding = async () => {
  setError(null);
  setLoading(true);
  const err = await saveOnboarding();
  setLoading(false);
  if (err) {
    setError(err);
    return;
  }
};

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + spacing.lg,
          paddingBottom: insets.bottom + spacing.lg,
        },
      ]}
    >
      <StepRow currentStep={3} />

      <View style={styles.header}>
        <Text style={styles.sparkle}>✦  ✦  ✦</Text>
        <Text style={styles.title}>you're ready to shine</Text>
        <Text style={styles.subtitle}>here's your first turkish word</Text>
      </View>

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

      <View style={styles.footer}>
      <Button
        label={loading ? "saving…" : "start my first lesson"}
        onPress={finishOnboarding}
      />
      {error ? <Text style={{ color: colors.errorStrong }}>{error}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  header: {
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  sparkle: {
    fontSize: 28,
    color: colors.primary,
    letterSpacing: 6,
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: fontSize.title,
    fontWeight: fontWeight.medium,
    color: colors.primaryDark,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.small,
    color: colors.textSecondary,
  },
  footer: {
    marginTop: "auto",
  },
});
