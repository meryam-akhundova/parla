import { useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import type { RootNavigationProp } from "../navigation/types";
import { FlipWordCard } from "../components/FlipWordCard";
import { Tag } from "../components/Tag";
import { Button } from "../components/Button";
import { fetchSlangWords } from "../lib/slang";
import { sessionSizeFromPace } from "../lib/sessionSize";
import { pickSessionWords } from "../lib/pickSessionWords";
import { fetchSeenWordIds, markWordsSeen, setWordBookmarked, fetchBookmarkIds } from "../lib/wordProgress";
import { bumpDailyActivity } from "../lib/dailyActivity";
import type { SlangWord } from "../data/types";
import { useAuthStore } from "../store/authStore";
import { colors, spacing, radius, fontSize, fontWeight } from "../theme/theme";

export function SlangDropScreen() {
  const navigation = useNavigation<RootNavigationProp>();
  const insets = useSafeAreaInsets();
  const pace = useAuthStore((s) => s.profile?.pace);
  const language = useAuthStore((s) => s.profile?.language ?? "turkish");
  const includeSwearWords = useAuthStore(
    (s) => s.profile?.include_swear_words === true,
  );
  const awardSlangDropComplete = useAuthStore((s) => s.awardSlangDropComplete);

  const [words, setWords] = useState<SlangWord[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [finishing, setFinishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const [{ data, error: fetchError }, seen, marks] = await Promise.all([
        fetchSlangWords(language, { includeSwearWords }),
        fetchSeenWordIds(),
        fetchBookmarkIds(),
      ]);
      if (cancelled) return;

      if (fetchError) {
        setError(fetchError);
        setLoading(false);
        return;
      }

      if (data.length === 0) {
        setError("No slang words yet");
        setLoading(false);
        return;
      }

      const size = sessionSizeFromPace(pace);
      const avoidIds = new Set(seen.ids);
      setWords(pickSessionWords(data, size, { avoidIds }));
      setBookmarks(marks.ids);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [language, pace, includeSwearWords]);

  const word = words[index] ?? null;
  const total = words.length;
  const isLast = index >= total - 1;

  const finishSession = async () => {
    if (finishing || !word) return;
    setFinishing(true);
    await markWordsSeen([word.id]);
    await bumpDailyActivity("slang");
    await awardSlangDropComplete();
    navigation.goBack();
  };

  const onNext = () => {
    if (!flipped || !word) return;
    if (isLast) {
      void finishSession();
      return;
    }
    const currentId = word.id;
    void markWordsSeen([currentId]);
    void bumpDailyActivity("slang");
    setIndex((i) => i + 1);
    setFlipped(false);
  };

  const onToggleBookmark = async () => {
    if (!word) return;
    const next = !bookmarks.has(word.id);
    setBookmarks((prev) => {
      const copy = new Set(prev);
      if (next) copy.add(word.id);
      else copy.delete(word.id);
      return copy;
    });
    const err = await setWordBookmarked(word.id, next);
    if (err) {
      setBookmarks((prev) => {
        const copy = new Set(prev);
        if (next) copy.delete(word.id);
        else copy.add(word.id);
        return copy;
      });
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { paddingTop: insets.top }]}>
        <Text style={styles.statusText}>loading…</Text>
      </View>
    );
  }

  if (error || !word) {
    return (
      <View style={[styles.container, styles.centered, { paddingTop: insets.top }]}>
        <Text style={styles.statusText}>{error ?? "No word found"}</Text>
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
          <Feather name="arrow-left" size={18} color={colors.textMuted} />
        </Pressable>
        <Text style={styles.topTitle}>slang drop</Text>
        <View style={styles.countPill}>
          <Text style={styles.countText}>
            {index + 1} / {total}
          </Text>
        </View>
      </View>

      <View style={styles.tags}>
        <Tag label="✦ slang drop" variant="purple" />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <FlipWordCard
          word={word}
          flipped={flipped}
          onFlip={() => setFlipped((f) => !f)}
          bookmarked={bookmarks.has(word.id)}
          onToggleBookmark={() => void onToggleBookmark()}
        />
      </ScrollView>

      <Button
        label={isLast ? "finish ✦" : "next →"}
        onPress={onNext}
        disabled={!flipped || finishing}
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
    justifyContent: "center",
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
  scroll: {
    gap: spacing.md,
    paddingBottom: spacing.lg,
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
