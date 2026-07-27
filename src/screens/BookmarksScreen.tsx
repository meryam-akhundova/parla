import { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import type { RootNavigationProp } from "../navigation/types";
import { FlipWordCard } from "../components/FlipWordCard";
import {
  fetchBookmarkedWords,
  setWordBookmarked,
} from "../lib/wordProgress";
import type { SlangWord } from "../data/types";
import { useAuthStore } from "../store/authStore";
import { colors, spacing, radius, fontSize, fontWeight } from "../theme/theme";

export function BookmarksScreen() {
  const navigation = useNavigation<RootNavigationProp>();
  const insets = useSafeAreaInsets();
  const language = useAuthStore((s) => s.profile?.language ?? "turkish");
  const includeSwearWords = useAuthStore(
    (s) => s.profile?.include_swear_words === true,
  );

  const [words, setWords] = useState<SlangWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [flipped, setFlipped] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await fetchBookmarkedWords(language, {
      includeSwearWords,
    });
    if (fetchError) {
      setError(fetchError);
      setWords([]);
    } else {
      setWords(data);
    }
    setLoading(false);
  }, [language, includeSwearWords]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const onRemove = async (id: string) => {
    setWords((prev) => prev.filter((w) => w.id !== id));
    if (expandedId === id) {
      setExpandedId(null);
      setFlipped(false);
    }
    const err = await setWordBookmarked(id, false);
    if (err) void load();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.md }]}>
      <View style={styles.topBar}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Feather name="arrow-left" size={18} color={colors.textMuted} />
        </Pressable>
        <Text style={styles.topTitle}>saved slang</Text>
        <View style={styles.countPill}>
          <Text style={styles.countText}>{words.length}</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + spacing.xxl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>
          words you pinned — tap to flip, unpin anytime
        </Text>

        {loading ? (
          <View style={styles.stateBox}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : error ? (
          <View style={styles.stateBox}>
            <Text style={styles.stateError}>{error}</Text>
          </View>
        ) : words.length === 0 ? (
          <View style={styles.stateBox}>
            <Text style={styles.stateEmpty}>
              no bookmarks yet — tap the bookmark on any word card
            </Text>
          </View>
        ) : (
          words.map((word) => {
            const expanded = expandedId === word.id;
            return (
              <View key={word.id} style={styles.wordBlock}>
                <Pressable
                  style={[styles.wordRow, expanded && styles.wordRowExpanded]}
                  onPress={() => {
                    if (expanded) {
                      setExpandedId(null);
                      setFlipped(false);
                    } else {
                      setExpandedId(word.id);
                      setFlipped(false);
                    }
                  }}
                >
                  <View style={styles.wordText}>
                    <Text style={styles.wordTerm}>{word.word}</Text>
                    <Text style={styles.wordMeaning} numberOfLines={1}>
                      {word.meaning}
                    </Text>
                  </View>
                  <Pressable
                    hitSlop={8}
                    onPress={() => void onRemove(word.id)}
                    style={styles.unpin}
                  >
                    <Feather name="bookmark" size={16} color={colors.primary} />
                  </Pressable>
                </Pressable>
                {expanded ? (
                  <View style={styles.detail}>
                    <FlipWordCard
                      word={word}
                      flipped={flipped}
                      onFlip={() => setFlipped((v) => !v)}
                      bookmarked
                      onToggleBookmark={() => void onRemove(word.id)}
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
    paddingHorizontal: spacing.lg,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: spacing.sm,
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
  scroll: {
    gap: spacing.sm,
  },
  subtitle: {
    fontSize: fontSize.small,
    color: colors.textSecondary,
    marginBottom: spacing.md,
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
  unpin: {
    padding: 4,
  },
  detail: {
    marginTop: spacing.sm,
  },
});
