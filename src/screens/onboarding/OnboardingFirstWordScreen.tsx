import { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "../../components/Button";
import { FlipWordCard } from "../../components/FlipWordCard";
import { StepRow } from "./StepRow";
import { fetchSlangWords } from "../../lib/slang";
import { pickSessionWords } from "../../lib/pickSessionWords";
import { markWordsSeen } from "../../lib/wordProgress";
import type { SlangWord } from "../../data/types";
import { colors, spacing, fontSize, fontWeight } from "../../theme/theme";
import { useAuthStore } from "../../store/authStore";

export function OnboardingFirstWordScreen() {
  const saveOnboarding = useAuthStore((s) => s.saveOnboarding);
  const draftLanguage = useAuthStore((s) => s.draft.language);
  const includeSwearWords = useAuthStore((s) => s.draft.includeSwearWords);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [flipped, setFlipped] = useState(false);

  const [word, setWord] = useState<SlangWord | null>(null);
  const [wordLoading, setWordLoading] = useState(true);
  const [wordError, setWordError] = useState<string | null>(null);

  const insets = useSafeAreaInsets();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { data, error: fetchError } = await fetchSlangWords(draftLanguage, {
        includeSwearWords,
      });
      if (cancelled) return;

      if (fetchError) {
        setWordError(fetchError);
        setWordLoading(false);
        return;
      }

      const pick = pickSessionWords(data, 1)[0] ?? null;
      setWord(pick);
      if (!pick) setWordError("No slang words yet");
      setWordLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [draftLanguage, includeSwearWords]);

  const finishOnboarding = async () => {
    if (!word || !flipped) return;
    setError(null);
    setLoading(true);

    // Save prefs first, then credit the reveal as their first seen word
    const err = await saveOnboarding();
    if (err) {
      setLoading(false);
      setError(err);
      return;
    }

    await markWordsSeen([word.id]);
    setLoading(false);
  };

  if (wordLoading) {
    return (
      <View
        style={[
          styles.container,
          styles.centered,
          { paddingTop: insets.top + spacing.lg },
        ]}
      >
        <Text style={styles.statusText}>loading…</Text>
      </View>
    );
  }

  if (wordError || !word) {
    return (
      <View
        style={[
          styles.container,
          styles.centered,
          { paddingTop: insets.top + spacing.lg },
        ]}
      >
        <Text style={styles.statusText}>{wordError ?? "No word found"}</Text>
      </View>
    );
  }

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
      <StepRow currentStep={5} totalSteps={6} />

      <View style={styles.header}>
        <Text style={styles.sparkle}>✦  ✦  ✦</Text>
        <Text style={styles.title}>you're ready to shine</Text>
        <Text style={styles.subtitle}>
          {flipped
            ? "nice — you've got your first word ✦"
            : "tap the card to reveal your first turkish word"}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <FlipWordCard
          word={word}
          flipped={flipped}
          onFlip={() => setFlipped((f) => !f)}
        />
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label={loading ? "saving…" : "start learning ✦"}
          onPress={() => void finishOnboarding()}
          disabled={!flipped || loading}
        />
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
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
    textAlign: "center",
    paddingHorizontal: spacing.md,
  },
  scroll: {
    paddingBottom: spacing.md,
  },
  footer: {
    marginTop: "auto",
    gap: spacing.sm,
  },
  errorText: {
    color: colors.errorStrong,
    fontSize: fontSize.small,
    textAlign: "center",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  statusText: {
    fontSize: fontSize.bodyLg,
    color: colors.textSecondary,
  },
});
