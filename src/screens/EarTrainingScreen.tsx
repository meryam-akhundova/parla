import { useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import type { RootNavigationProp } from "../navigation/types";
import { Tag } from "../components/Tag";
import { HintBox } from "../components/HintBox";
import { QuizOption } from "../components/QuizOption";
import { Button } from "../components/Button";
import { EarStimulusCard } from "../components/EarStimulusCard";
import { fetchSlangWords } from "../lib/slang";
import { sessionSizeFromPace } from "../lib/sessionSize";
import { pickSessionWords } from "../lib/pickSessionWords";
import { fetchSeenWordIds } from "../lib/wordProgress";
import {
  buildEarQuiz,
  earPreferredPool,
  type EarQuiz,
} from "../lib/buildEarQuiz";
import type { SlangWord } from "../data/types";
import { colors, spacing, radius, fontSize, fontWeight } from "../theme/theme";
import { useAuthStore } from "../store/authStore";

export function EarTrainingScreen() {
  const navigation = useNavigation<RootNavigationProp>();
  const insets = useSafeAreaInsets();
  const pace = useAuthStore((s) => s.profile?.pace);
  const awardQuizSuccess = useAuthStore((s) => s.awardQuizSuccess);
  const shineScore = useAuthStore((s) => s.profile?.shine_score ?? 0);

  const [sessionWords, setSessionWords] = useState<SlangWord[]>([]);
  const [pool, setPool] = useState<SlangWord[]>([]);
  const [index, setIndex] = useState(0);
  const [quiz, setQuiz] = useState<EarQuiz | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const [{ data, error: fetchError }, seen] = await Promise.all([
        fetchSlangWords(),
        fetchSeenWordIds(),
      ]);
      if (cancelled) return;

      if (fetchError) {
        setError(fetchError);
        setLoading(false);
        return;
      }

      if (data.length < 2) {
        setError("Need more slang words for ear training");
        setLoading(false);
        return;
      }

      const size = sessionSizeFromPace(pace);
      const focused = earPreferredPool(data);
      const preferIds = new Set(seen.ids);
      const picked = pickSessionWords(focused, size, { preferIds });

      setPool(data);
      setSessionWords(picked);

      const first = buildEarQuiz(data, { targetId: picked[0]?.id });
      if (!first) {
        setError("Could not build ear training");
        setLoading(false);
        return;
      }

      setQuiz(first);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [pace]);

  const total = sessionWords.length;
  const answered = selectedId !== null;
  const isLast = index >= total - 1;
  const progressPct =
    total > 0 ? ((index + (answered ? 1 : 0)) / total) * 100 : 0;

  const optionState = (id: string, correct: boolean) => {
    if (!answered) return "default" as const;
    if (correct) return "correct" as const;
    if (id === selectedId) return "wrong" as const;
    return "dim" as const;
  };

  const onSelect = (id: string, correct: boolean) => {
    if (answered) return;
    setSelectedId(id);
    if (correct) {
      void awardQuizSuccess();
    }
  };

  const onNext = () => {
    if (!answered) return;
    if (isLast) {
      navigation.goBack();
      return;
    }

    const nextIndex = index + 1;
    const nextWord = sessionWords[nextIndex];
    const nextQuiz = buildEarQuiz(pool, { targetId: nextWord?.id });
    if (!nextQuiz) {
      navigation.goBack();
      return;
    }

    setIndex(nextIndex);
    setQuiz(nextQuiz);
    setSelectedId(null);
  };

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
          <View style={[styles.xpFill, { width: `${progressPct}%` }]} />
        </View>
        <View style={styles.streakPill}>
          <Text style={styles.streakText}>{shineScore} ✦</Text>
        </View>
      </View>

      <View style={styles.tags}>
        <Tag label="ear training" variant="teal" />
        <View style={styles.countPill}>
          <Text style={styles.countText}>
            {index + 1} / {total}
          </Text>
        </View>
      </View>

      <EarStimulusCard
        word={quiz.word}
        stimulus={quiz.stimulus}
        // Hide text once real clips exist so it becomes listen-first
        revealText={!quiz.word.audioUrl || answered}
        autoPlay={!!quiz.word.audioUrl}
      />

      <Text style={styles.question}>{quiz.question}</Text>
      <Text style={styles.prompt}>{quiz.prompt}</Text>

      <View style={styles.options}>
        {quiz.options.map((opt) => (
          <QuizOption
            key={opt.id}
            label={opt.label}
            state={optionState(opt.id, opt.correct)}
            onPress={() => onSelect(opt.id, opt.correct)}
          />
        ))}
      </View>

      {answered ? <HintBox message={quiz.word.culturalNote} /> : null}

      <View style={styles.footer}>
        <Button
          label={isLast ? "done ✦" : "next →"}
          onPress={onNext}
          disabled={!answered}
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
    backgroundColor: colors.tealStrong,
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
