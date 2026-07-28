import { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";

import { Button } from "../../components/Button";
import { FlipWordCard } from "../../components/FlipWordCard";
import { StepRow } from "./StepRow";
import { OnboardingShell } from "./OnboardingShell";
import { onboardingChrome } from "./onboardingChrome";
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
      <OnboardingShell style={styles.centered}>
        <Text style={styles.statusText}>loading…</Text>
      </OnboardingShell>
    );
  }

  if (wordError || !word) {
    return (
      <OnboardingShell style={styles.centered}>
        <Text style={styles.statusText}>{wordError ?? "No word found"}</Text>
      </OnboardingShell>
    );
  }

  return (
    <OnboardingShell>
      <StepRow currentStep={5} totalSteps={6} />

      <View style={styles.header}>
        <Text style={onboardingChrome.sparkle}>✦</Text>
        <Text style={onboardingChrome.title}>you're ready to shine</Text>
        <Text style={onboardingChrome.subtitle}>
          {flipped
            ? "nice — you've got your first word ✦"
            : "tap the card to reveal your first word"}
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
        <View style={onboardingChrome.primaryWrap}>
          <Button
            label={loading ? "saving…" : "start learning ✦"}
            onPress={() => void finishOnboarding()}
            disabled={!flipped || loading}
          />
        </View>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    marginBottom: spacing.sm,
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
    justifyContent: "center",
    alignItems: "center",
  },
  statusText: {
    fontSize: fontSize.bodyLg,
    fontWeight: fontWeight.regular,
    color: colors.textSecondary,
  },
});
