import { useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import type { RootNavigationProp, RootStackParamList } from "../navigation/types";
import { Tag } from "../components/Tag";
import { HintBox } from "../components/HintBox";
import { QuizOption } from "../components/QuizOption";
import { Button } from "../components/Button";
import { fetchSlangWords } from "../lib/slang";
import { buildMeaningQuiz, type MeaningQuiz } from "../lib/buildMeaningQuiz";
import { colors, spacing, radius, fontSize, fontWeight } from "../theme/theme";

import { useAuthStore } from "../store/authStore";

export function QuizScreen() {
  const navigation = useNavigation<RootNavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, "Quiz">>();
  const wordId = route.params?.wordId;
  const insets = useSafeAreaInsets();
  const [quiz, setQuiz] = useState<MeaningQuiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const awardQuizSuccess = useAuthStore((s) => s.awardQuizSuccess);
  const shineScore = useAuthStore((s) => s.profile?.shine_score ?? 0);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { data, error: fetchError } = await fetchSlangWords();
      if (cancelled) return;

      if (fetchError) {
        setError(fetchError);
        setLoading(false);
        return;
      }

      const next = buildMeaningQuiz(data, { targetId: wordId });
      if (!next) {
        setError(
          wordId
            ? "Could not build a quiz for that word"
            : "Need at least 2 slang words for a quiz",
        );
        setLoading(false);
        return;
      }

      setQuiz(next);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [wordId]);

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { paddingTop: insets.top }]}>
        <Text style={styles.statusText}>loading…</Text>
      </View>
    );
  }

  if (error || !quiz) {
    return (
      <View style={[styles.container, styles.centered, { paddingTop: insets.top }]}>
        <Text style={styles.statusText}>{error ?? "No quiz found"}</Text>
        <Pressable onPress={() => navigation.goBack()} style={{ marginTop: spacing.md }}>
          <Text style={styles.backLink}>go back</Text>
        </Pressable>
      </View>
    );
  }

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
          <View style={[styles.xpFill, { width: answered ? "100%" : "0%" }]} />
        </View>
        <View style={styles.streakPill}>
          <Text style={styles.streakText}>{shineScore} ✦</Text>
        </View>
      </View>

      <View style={styles.tags}>
        <Tag label="✦ slang drop" variant="purple" />
        <View style={styles.countPill}>
          <Text style={styles.countText}>1 / 1</Text>
        </View>
      </View>

      <View style={styles.scenario}>
        <Text style={styles.scenarioLabel}>{quiz.scenarioLabel}</Text>
        <Text style={styles.scenarioText}>{quiz.scenarioText}</Text>
      </View>

      <Text style={styles.question}>{quiz.question}</Text>
      <Text style={styles.prompt}>{quiz.prompt}</Text>

      <View style={styles.options}>
        {quiz.options.map((opt) => (
          <QuizOption
            key={opt.id}
            label={opt.label}
            state={optionState(opt.id, opt.correct)}
            onPress={() => {
              if (answered) return;
              setSelectedId(opt.id);
              if (opt.correct) {
                void awardQuizSuccess();
              }
            }}
          />
        ))}
      </View>

      {answered ? <HintBox message={quiz.word.culturalNote} /> : null}

      <View style={styles.footer}>
        <Button
          label="next →"
          onPress={() => navigation.pop(2)}
        />
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
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  statusText: {
    fontSize: fontSize.bodyLg,
    color: colors.textSecondary,
  },
  backLink: {
    fontSize: fontSize.body,
    color: colors.primary,
  },
});
