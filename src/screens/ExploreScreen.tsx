import { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { MainTabNavigationProp } from "../navigation/types";
import { Tag } from "../components/Tag";
import { FlipWordCard } from "../components/FlipWordCard";
import { fetchSlangWords } from "../lib/slang";
import {
  buildExploreTopics,
  CATEGORY_CHIPS,
  filterExploreWords,
} from "../lib/exploreTopics";
import { dialectChipsFromPool } from "../lib/dialects";
import {
  fetchBookmarkIds,
  setWordBookmarked,
} from "../lib/wordProgress";
import { languageMeta } from "../data/languages";
import type { Dialect, SlangCategory, SlangWord } from "../data/types";
import { useAuthStore } from "../store/authStore";
import { colors, spacing, radius, fontSize, fontWeight } from "../theme/theme";

export function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<MainTabNavigationProp>();
  const language = useAuthStore((s) => s.profile?.language ?? "turkish");
  const includeSwearWords = useAuthStore(
    (s) => s.profile?.include_swear_words === true,
  );

  const [pool, setPool] = useState<SlangWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<SlangCategory | "all">("all");
  const [dialect, setDialect] = useState<Dialect | "all">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [flipped, setFlipped] = useState(false);
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());

  const languageName = languageMeta(language)?.name ?? language;

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      setError(null);

      (async () => {
        const [{ data, error: fetchError }, marks] = await Promise.all([
          fetchSlangWords(language, { includeSwearWords }),
          fetchBookmarkIds(),
        ]);
        if (!active) return;

        if (fetchError) {
          setError(fetchError);
          setPool([]);
          setLoading(false);
          return;
        }

        setPool(data);
        setBookmarks(marks.ids);
        setExpandedId(null);
        setFlipped(false);
        setDialect("all");
        setLoading(false);
      })();

      return () => {
        active = false;
      };
    }, [language, includeSwearWords]),
  );

  const topics = useMemo(
    () => buildExploreTopics(language, pool),
    [language, pool],
  );

  const dialectChips = useMemo(
    () => dialectChipsFromPool(language, pool),
    [language, pool],
  );

  const filtered = useMemo(
    () => filterExploreWords(pool, query, category, dialect),
    [pool, query, category, dialect],
  );

  const onToggleWord = (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
      setFlipped(false);
      return;
    }
    setExpandedId(id);
    setFlipped(false);
  };

  const onToggleBookmark = async (wordId: string) => {
    const next = !bookmarks.has(wordId);
    setBookmarks((prev) => {
      const copy = new Set(prev);
      if (next) copy.add(wordId);
      else copy.delete(wordId);
      return copy;
    });
    const err = await setWordBookmarked(wordId, next);
    if (err) {
      setBookmarks((prev) => {
        const copy = new Set(prev);
        if (next) copy.delete(wordId);
        else copy.add(wordId);
        return copy;
      });
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.lg }]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>
          explore <Text style={styles.spark}>✦</Text>
        </Text>
        <Text style={styles.subtitle}>browse {languageName} slang</Text>

        <View style={styles.quickLinks}>
          <Pressable
            style={styles.linkChip}
            onPress={() => navigation.navigate("Review")}
          >
            <Text style={styles.linkChipText}>review weak</Text>
          </Pressable>
          <Pressable
            style={styles.linkChip}
            onPress={() => navigation.navigate("Bookmarks")}
          >
            <Text style={styles.linkChipText}>saved</Text>
          </Pressable>
        </View>

        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="search slang, meanings, notes..."
          placeholderTextColor={colors.textMuted}
          style={styles.search}
          autoCorrect={false}
          autoCapitalize="none"
          clearButtonMode="while-editing"
        />

        <Text style={styles.sectionLabel}>PRACTICE</Text>
        {topics.map((topic) => (
          <Pressable
            key={topic.id}
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            onPress={() => navigation.navigate(topic.route)}
          >
            <Tag label={topic.tag} variant={topic.tagVariant} />
            <Text style={styles.cardTitle}>{topic.title}</Text>
            <Text style={styles.cardSubtitle}>{topic.subtitle}</Text>
          </Pressable>
        ))}

        <Text style={styles.sectionLabel}>DIALECT</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
          style={styles.chipScroll}
        >
          {dialectChips.map((chip) => {
            const selected = dialect === chip.id;
            return (
              <Pressable
                key={chip.id}
                style={[styles.chip, selected && styles.chipSelected]}
                onPress={() => setDialect(chip.id)}
              >
                <Text
                  style={[
                    styles.chipText,
                    selected && styles.chipTextSelected,
                  ]}
                >
                  {chip.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <Text style={styles.sectionLabel}>WORDS</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
          style={styles.chipScroll}
        >
          {CATEGORY_CHIPS.map((chip) => {
            const selected = category === chip.id;
            return (
              <Pressable
                key={chip.id}
                style={[styles.chip, selected && styles.chipSelected]}
                onPress={() => setCategory(chip.id)}
              >
                <Text
                  style={[
                    styles.chipText,
                    selected && styles.chipTextSelected,
                  ]}
                >
                  {chip.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {loading ? (
          <View style={styles.stateBox}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : error ? (
          <View style={styles.stateBox}>
            <Text style={styles.stateError}>{error}</Text>
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.stateBox}>
            <Text style={styles.stateEmpty}>
              {pool.length === 0
                ? "no slang words yet for this language"
                : "no matches — try another search, dialect, or category"}
            </Text>
          </View>
        ) : (
          filtered.map((word) => {
            const expanded = expandedId === word.id;
            return (
              <View key={word.id} style={styles.wordBlock}>
                <Pressable
                  style={({ pressed }) => [
                    styles.wordRow,
                    expanded && styles.wordRowExpanded,
                    pressed && styles.cardPressed,
                  ]}
                  onPress={() => onToggleWord(word.id)}
                >
                  <View style={styles.wordText}>
                    <Text style={styles.wordTerm}>{word.word}</Text>
                    <Text style={styles.wordMeaning} numberOfLines={1}>
                      {word.meaning}
                    </Text>
                  </View>
                  <Text style={styles.wordCategory}>{word.dialect}</Text>
                  <Pressable
                    hitSlop={8}
                    onPress={() => void onToggleBookmark(word.id)}
                    style={styles.bookmarkHit}
                  >
                    <Text
                      style={[
                        styles.bookmarkMark,
                        bookmarks.has(word.id) && styles.bookmarkMarkOn,
                      ]}
                    >
                      ✦
                    </Text>
                  </Pressable>
                </Pressable>
                {expanded ? (
                  <View style={styles.detail}>
                    <FlipWordCard
                      word={word}
                      flipped={flipped}
                      onFlip={() => setFlipped((v) => !v)}
                      bookmarked={bookmarks.has(word.id)}
                      onToggleBookmark={() => void onToggleBookmark(word.id)}
                    />
                  </View>
                ) : null}
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  title: {
    fontSize: fontSize.title,
    fontWeight: fontWeight.medium,
    color: colors.primaryDark,
    marginBottom: 4,
  },
  spark: {
    color: colors.primary,
  },
  subtitle: {
    fontSize: fontSize.small,
    color: colors.textSecondary,
    marginBottom: 10,
  },
  quickLinks: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: 14,
  },
  linkChip: {
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: radius.full,
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
  },
  linkChipText: {
    fontSize: fontSize.small,
    color: colors.primaryText,
    fontWeight: fontWeight.medium,
  },
  search: {
    width: "100%",
    fontSize: fontSize.body,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: radius.md,
    borderWidth: 0.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    color: colors.textPrimary,
    marginBottom: 14,
  },
  sectionLabel: {
    fontSize: fontSize.micro,
    fontWeight: fontWeight.medium,
    color: colors.textMuted,
    letterSpacing: 0.6,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  card: {
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: 14,
    backgroundColor: colors.white,
    marginBottom: spacing.sm,
    gap: 4,
  },
  cardPressed: {
    opacity: 0.85,
  },
  cardTitle: {
    fontSize: fontSize.bodyLg,
    fontWeight: fontWeight.medium,
    color: colors.textPrimary,
    marginTop: 4,
  },
  cardSubtitle: {
    fontSize: fontSize.label,
    color: colors.textSecondary,
  },
  chipScroll: {
    marginBottom: spacing.md,
    marginHorizontal: -spacing.lg,
  },
  chipRow: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  chip: {
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: radius.full,
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
  },
  chipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  chipText: {
    fontSize: fontSize.small,
    color: colors.textSecondary,
  },
  chipTextSelected: {
    color: colors.primaryText,
    fontWeight: fontWeight.medium,
  },
  stateBox: {
    paddingVertical: spacing.xxl,
    alignItems: "center",
  },
  stateError: {
    fontSize: fontSize.small,
    color: colors.coralStrong,
    textAlign: "center",
  },
  stateEmpty: {
    fontSize: fontSize.small,
    color: colors.textSecondary,
    textAlign: "center",
  },
  wordBlock: {
    marginBottom: spacing.sm,
  },
  wordRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: 14,
    backgroundColor: colors.white,
  },
  wordRowExpanded: {
    borderColor: colors.primaryMid,
    backgroundColor: colors.primaryLight,
  },
  wordText: {
    flex: 1,
    gap: 2,
  },
  wordTerm: {
    fontSize: fontSize.bodyLg,
    fontWeight: fontWeight.medium,
    color: colors.primaryDark,
  },
  wordMeaning: {
    fontSize: fontSize.label,
    color: colors.textSecondary,
  },
  wordCategory: {
    fontSize: fontSize.micro,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  bookmarkHit: {
    padding: 4,
  },
  bookmarkMark: {
    fontSize: fontSize.body,
    color: colors.textMuted,
  },
  bookmarkMarkOn: {
    color: colors.primary,
  },
  detail: {
    marginTop: spacing.sm,
  },
});
