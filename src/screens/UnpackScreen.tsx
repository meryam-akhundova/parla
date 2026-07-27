import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import type { RootNavigationProp } from "../navigation/types";
import { Tag } from "../components/Tag";
import { HintBox } from "../components/HintBox";
import { Button } from "../components/Button";
import { SentenceBubble } from "../components/SentenceBubble";
import { AnimatedProgressBar } from "../components/animated/AnimatedProgressBar";
import { fetchSlangWords } from "../lib/slang";
import { sessionSizeFromPace } from "../lib/sessionSize";
import { pickSessionWords } from "../lib/pickSessionWords";
import { fetchSeenWordIds, recordWordReview } from "../lib/wordProgress";
import { bumpDailyActivity } from "../lib/dailyActivity";
import {
  buildUnpackQuiz,
  buildUnpackQuizFromWord,
  isCloseTranslation,
  unpackReadyPool,
  type UnpackQuiz,
} from "../lib/buildUnpackQuiz";
import type { SlangWord } from "../data/types";
import { colors, spacing, radius, fontSize, fontWeight } from "../theme/theme";
import { useAuthStore } from "../store/authStore";

export function UnpackScreen() {
  const navigation = useNavigation<RootNavigationProp>();
  const insets = useSafeAreaInsets();
  const pace = useAuthStore((s) => s.profile?.pace);
  const language = useAuthStore((s) => s.profile?.language ?? "turkish");
  const includeSwearWords = useAuthStore(
    (s) => s.profile?.include_swear_words === true,
  );
  const awardQuizSuccess = useAuthStore((s) => s.awardQuizSuccess);
  const shineScore = useAuthStore((s) => s.profile?.shine_score ?? 0);

  const [sessionWords, setSessionWords] = useState<SlangWord[]>([]);
  const [pool, setPool] = useState<SlangWord[]>([]);
  const [index, setIndex] = useState(0);
  const [quiz, setQuiz] = useState<UnpackQuiz | null>(null);
  const [draft, setDraft] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [close, setClose] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [grading, setGrading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [{ data, error: fetchError }, seen] = await Promise.all([
          fetchSlangWords(language, { includeSwearWords }),
          fetchSeenWordIds(),
        ]);
        if (cancelled) return;

        if (fetchError) {
          setError(fetchError);
          return;
        }

        if (!data.length) {
          setError("No slang words yet for this language");
          return;
        }

        const ready = unpackReadyPool(data);

        // Prefer words with both message + translation; otherwise use meaning
        const quizPool =
          ready.length > 0
            ? ready
            : data.filter(
                (w) =>
                  (w.exampleMessage ?? "").trim() ||
                  (w.meaning ?? "").trim(),
              );

        if (quizPool.length < 1) {
          setError("Need more example sentences to unpack");
          return;
        }

        const size = sessionSizeFromPace(pace);
        const preferIds = new Set(seen.ids);
        const picked = pickSessionWords(quizPool, size, { preferIds });
        const session = picked.length > 0 ? picked : quizPool.slice(0, size);

        setPool(quizPool);
        setSessionWords(session);

        const first =
          buildUnpackQuiz(quizPool, { targetId: session[0]?.id }) ??
          buildUnpackQuizFromWord(session[0] ?? quizPool[0]);

        if (!first) {
          setError("Could not build an unpack quiz");
          return;
        }

        setQuiz(first);
        setError(null);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Failed to load unpack");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [language, pace, includeSwearWords]);

  const total = sessionWords.length;
  const isLast = index >= total - 1;
  const progressPct =
    total > 0 ? ((index + (revealed ? 1 : 0)) / total) * 100 : 0;
  const canCheck = draft.trim().length > 0 && !revealed;

  const onCheck = () => {
    if (!quiz || !canCheck) return;
    const matched = isCloseTranslation(draft, quiz.answer);
    setClose(matched);
    setRevealed(true);
    void bumpDailyActivity("ear");
  };

  const onGrade = async (gotIt: boolean) => {
    if (!quiz || !revealed || grading) return;
    setGrading(true);
    await recordWordReview(quiz.word.id, gotIt ? "good" : "again");
    if (gotIt) await awardQuizSuccess();
    setGrading(false);

    if (isLast) {
      navigation.goBack();
      return;
    }

    const nextIndex = index + 1;
    const nextWord = sessionWords[nextIndex];
    const nextQuiz = buildUnpackQuiz(pool, { targetId: nextWord?.id });
    if (!nextQuiz) {
      navigation.goBack();
      return;
    }

    setIndex(nextIndex);
    setQuiz(nextQuiz);
    setDraft("");
    setRevealed(false);
    setClose(false);
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
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={insets.top}
    >
      <View
        style={[
          styles.container,
          {
            paddingTop: insets.top + spacing.md,
            paddingBottom: Math.max(insets.bottom, spacing.md) + spacing.sm,
          },
        ]}
      >
        <View style={styles.topBar}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
            <Feather name="x" size={18} color={colors.textMuted} />
          </Pressable>
          <View style={styles.xpTrack}>
            <AnimatedProgressBar
              progress={progressPct}
              color={colors.tealStrong}
              style={styles.xpBar}
            />
          </View>
          <View style={styles.streakPill}>
            <Text style={styles.streakText}>{shineScore} ✦</Text>
          </View>
        </View>

        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.tags}>
            <Tag label="unpack" variant="teal" />
            <View style={styles.countPill}>
              <Text style={styles.countText}>
                {index + 1} / {total}
              </Text>
            </View>
          </View>

          <SentenceBubble
            sentence={quiz.sentence}
            highlight={revealed ? quiz.word.word : undefined}
            label="slang message"
          />

          <Text style={styles.question}>{quiz.question}</Text>
          <Text style={styles.prompt}>{quiz.prompt}</Text>

          <TextInput
            value={draft}
            onChangeText={setDraft}
            editable={!revealed}
            placeholder="type your translation…"
            placeholderTextColor={colors.textMuted}
            style={[styles.input, revealed && styles.inputLocked]}
            multiline
            autoCorrect
            autoCapitalize="none"
            autoComplete="off"
            returnKeyType="done"
            blurOnSubmit
            onSubmitEditing={onCheck}
          />

          {revealed ? (
            <View style={styles.revealBox}>
              <Text
                style={[
                  styles.revealBadge,
                  close ? styles.revealClose : styles.revealOpen,
                ]}
              >
                {close ? "close ✦" : "compare with answer"}
              </Text>
              <Text style={styles.revealLabel}>model answer</Text>
              <Text style={styles.revealAnswer}>{quiz.answer}</Text>
              {draft.trim() ? (
                <>
                  <Text style={styles.revealLabel}>you wrote</Text>
                  <Text style={styles.revealYours}>{draft.trim()}</Text>
                </>
              ) : null}
            </View>
          ) : null}

          {revealed ? <HintBox message={quiz.word.culturalNote} /> : null}

          <View style={styles.actions}>
            {!revealed ? (
              <Button label="check ✦" onPress={onCheck} disabled={!canCheck} />
            ) : (
              <View style={styles.gradeRow}>
                <Pressable
                  style={[
                    styles.gradeBtn,
                    styles.missBtn,
                    grading && styles.gradeDisabled,
                  ]}
                  disabled={grading}
                  onPress={() => void onGrade(false)}
                >
                  <Text style={styles.missText}>missed it</Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.gradeBtn,
                    styles.gotBtn,
                    grading && styles.gradeDisabled,
                  ]}
                  disabled={grading}
                  onPress={() => void onGrade(true)}
                >
                  <Text style={styles.gotText}>
                    {isLast ? "got it ✦" : "got it →"}
                  </Text>
                </Pressable>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
  },
  scroll: {
    paddingBottom: spacing.md,
    flexGrow: 1,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: spacing.md,
  },
  xpTrack: {
    flex: 1,
  },
  xpBar: {
    flex: 1,
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
  input: {
    minHeight: 88,
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: 14,
    fontSize: fontSize.bodyLg,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
    textAlignVertical: "top",
    marginBottom: spacing.md,
  },
  inputLocked: {
    opacity: 0.85,
    backgroundColor: colors.background,
  },
  revealBox: {
    borderRadius: radius.lg,
    borderWidth: 0.5,
    borderColor: colors.border,
    padding: 14,
    marginBottom: spacing.md,
    gap: 4,
  },
  revealBadge: {
    fontSize: fontSize.label,
    fontWeight: fontWeight.medium,
    marginBottom: spacing.sm,
  },
  revealClose: {
    color: colors.tealText,
  },
  revealOpen: {
    color: colors.amberText,
  },
  revealLabel: {
    fontSize: fontSize.micro,
    fontWeight: fontWeight.medium,
    color: colors.textMuted,
    letterSpacing: 0.4,
    textTransform: "uppercase",
    marginTop: spacing.sm,
  },
  revealAnswer: {
    fontSize: fontSize.bodyLg,
    fontWeight: fontWeight.medium,
    color: colors.tealDark,
    lineHeight: 22,
  },
  revealYours: {
    fontSize: fontSize.body,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  actions: {
    marginTop: spacing.sm,
  },
  gradeRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  gradeBtn: {
    flex: 1,
    borderRadius: radius.lg,
    paddingVertical: 14,
    alignItems: "center",
  },
  missBtn: {
    backgroundColor: colors.errorBg,
  },
  gotBtn: {
    backgroundColor: colors.tealBg,
  },
  gradeDisabled: {
    opacity: 0.5,
  },
  missText: {
    fontSize: fontSize.bodyLg,
    fontWeight: fontWeight.medium,
    color: colors.errorText,
  },
  gotText: {
    fontSize: fontSize.bodyLg,
    fontWeight: fontWeight.medium,
    color: colors.tealText,
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
