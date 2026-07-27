import { useCallback, useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import type { RootNavigationProp } from "../navigation/types";
import { FlipWordCard } from "../components/FlipWordCard";
import { Tag } from "../components/Tag";
import { Button } from "../components/Button";
import {
  fetchReviewWords,
  recordWordReview,
  setWordBookmarked,
  type ReviewWord,
} from "../lib/wordProgress";
import { useAuthStore } from "../store/authStore";
import { colors, spacing, radius, fontSize, fontWeight } from "../theme/theme";

export function ReviewScreen() {
  const navigation = useNavigation<RootNavigationProp>();
  const insets = useSafeAreaInsets();
  const language = useAuthStore((s) => s.profile?.language ?? "turkish");
  const includeSwearWords = useAuthStore(
    (s) => s.profile?.include_swear_words === true,
  );

  const [queue, setQueue] = useState<ReviewWord[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookmarked, setBookmarked] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await fetchReviewWords(language, {
      includeSwearWords,
      limit: 20,
    });
    if (fetchError) {
      setError(fetchError);
      setQueue([]);
      setLoading(false);
      return;
    }
    setQueue(data);
    setIndex(0);
    setFlipped(false);
    setBookmarked(data[0]?.progress.bookmarked === true);
    setLoading(false);
  }, [language, includeSwearWords]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const word = queue[index] ?? null;
  const total = queue.length;
  const isLast = index >= total - 1;

  const advance = () => {
    if (isLast) {
      navigation.goBack();
      return;
    }
    const next = index + 1;
    setIndex(next);
    setFlipped(false);
    setBookmarked(queue[next]?.progress.bookmarked === true);
  };

  const onGrade = async (grade: "again" | "good") => {
    if (!word || busy) return;
    setBusy(true);
    await recordWordReview(word.id, grade);
    setBusy(false);
    advance();
  };

  const onToggleBookmark = async () => {
    if (!word) return;
    const next = !bookmarked;
    setBookmarked(next);
    const err = await setWordBookmarked(word.id, next);
    if (err) setBookmarked(!next);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { paddingTop: insets.top }]}>
        <Text style={styles.statusText}>loading review…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centered, { paddingTop: insets.top }]}>
        <Text style={styles.statusText}>{error}</Text>
        <Pressable onPress={() => navigation.goBack()} style={{ marginTop: spacing.md }}>
          <Text style={styles.backLink}>go back</Text>
        </Pressable>
      </View>
    );
  }

  if (!word) {
    return (
      <View
        style={[
          styles.container,
          styles.centered,
          {
            paddingTop: insets.top + spacing.md,
            paddingBottom: insets.bottom + spacing.lg,
            paddingHorizontal: spacing.lg,
          },
        ]}
      >
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.emptyBack}
          hitSlop={8}
        >
          <Feather name="arrow-left" size={18} color={colors.textMuted} />
        </Pressable>
        <Text style={styles.emptyTitle}>all caught up ✦</Text>
        <Text style={styles.emptyBody}>
          no weak or due words right now. miss a quiz or finish a slang drop to
          build your review queue.
        </Text>
        <Button label="back home" onPress={() => navigation.goBack()} />
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
          paddingHorizontal: spacing.lg,
        },
      ]}
    >
      <View style={styles.topBar}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Feather name="arrow-left" size={18} color={colors.textMuted} />
        </Pressable>
        <Text style={styles.topTitle}>review</Text>
        <View style={styles.countPill}>
          <Text style={styles.countText}>
            {index + 1} / {total}
          </Text>
        </View>
      </View>

      <View style={styles.tags}>
        <Tag label="spaced review" variant="amber" />
        {word.weak ? <Tag label="weak" variant="coral" /> : null}
      </View>

      <View style={styles.cardWrap}>
        <FlipWordCard
          word={word}
          flipped={flipped}
          onFlip={() => setFlipped((f) => !f)}
          bookmarked={bookmarked}
          onToggleBookmark={() => void onToggleBookmark()}
        />
      </View>

      <View style={styles.actions}>
        <Pressable
          style={[styles.gradeBtn, styles.againBtn, (!flipped || busy) && styles.gradeDisabled]}
          disabled={!flipped || busy}
          onPress={() => void onGrade("again")}
        >
          <Text style={styles.againText}>again</Text>
        </Pressable>
        <Pressable
          style={[styles.gradeBtn, styles.goodBtn, (!flipped || busy) && styles.gradeDisabled]}
          disabled={!flipped || busy}
          onPress={() => void onGrade("good")}
        >
          <Text style={styles.goodText}>got it ✦</Text>
        </Pressable>
      </View>
      {!flipped ? (
        <Text style={styles.flipHint}>flip the card before grading</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  centered: {
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
  emptyBack: {
    position: "absolute",
    top: spacing.md,
    left: spacing.lg,
  },
  emptyTitle: {
    fontSize: fontSize.title,
    fontWeight: fontWeight.medium,
    color: colors.primaryDark,
    marginBottom: spacing.sm,
  },
  emptyBody: {
    fontSize: fontSize.body,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: spacing.xl,
    lineHeight: 20,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: spacing.md,
  },
  topTitle: {
    flex: 1,
    fontSize: fontSize.bodyLg,
    fontWeight: fontWeight.medium,
    color: colors.primaryDark,
  },
  countPill: {
    backgroundColor: colors.background,
    borderRadius: radius.full,
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
  },
  countText: {
    fontSize: fontSize.micro,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
  },
  tags: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 14,
  },
  cardWrap: {
    flex: 1,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  gradeBtn: {
    flex: 1,
    borderRadius: radius.lg,
    paddingVertical: 14,
    alignItems: "center",
  },
  againBtn: {
    backgroundColor: colors.errorBg,
  },
  goodBtn: {
    backgroundColor: colors.tealBg,
  },
  gradeDisabled: {
    opacity: 0.45,
  },
  againText: {
    fontSize: fontSize.bodyLg,
    fontWeight: fontWeight.medium,
    color: colors.errorText,
  },
  goodText: {
    fontSize: fontSize.bodyLg,
    fontWeight: fontWeight.medium,
    color: colors.tealText,
  },
  flipHint: {
    marginTop: spacing.sm,
    fontSize: fontSize.label,
    color: colors.textMuted,
    textAlign: "center",
  },
});
