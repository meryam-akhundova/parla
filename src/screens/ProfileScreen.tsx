import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCallback, useState } from "react";
import { useFocusEffect, useNavigation } from "@react-navigation/native";

import type { MainTabNavigationProp } from "../navigation/types";
import { colors, spacing, radius, fontSize, fontWeight } from "../theme/theme";
import { Button } from "../components/Button";
import { AnimatedProgressBar } from "../components/animated/AnimatedProgressBar";
import { avatarInitialFromName } from "../lib/avatar";
import { buildProfileBadges } from "../lib/buildProfileBadges";
import { APP_LANGUAGES, languageMeta } from "../data/languages";
import { useChatStore } from "../store/chatStore";
import { fetchSlangWords } from "../lib/slang";
import { fetchProgressStats, fetchSeenWordIds } from "../lib/wordProgress";

import { useAuthStore, type UserGender } from "../store/authStore";

const PACE_LABELS: Record<string, string> = {
  quick: "quick spark",
  steady: "steady glow",
  full: "full shine",
};

const GENDERS: { id: UserGender; label: string }[] = [
  { id: "female", label: "she / her" },
  { id: "male", label: "he / him" },
  { id: "neutral", label: "they / them" },
];

const SWEAR_OPTIONS: { id: boolean; label: string }[] = [
  { id: false, label: "keep it clean" },
  { id: true, label: "include swears" },
];

export function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<MainTabNavigationProp>();
  const profile = useAuthStore((s) => s.profile);
  const signOut = useAuthStore((s) => s.signOut);
  const updateGender = useAuthStore((s) => s.updateGender);
  const updateIncludeSwearWords = useAuthStore((s) => s.updateIncludeSwearWords);
  const setActiveLanguage = useAuthStore((s) => s.setActiveLanguage);
  const addLanguage = useAuthStore((s) => s.addLanguage);
  const threads = useChatStore((s) => s.threads);
  const [genderError, setGenderError] = useState<string | null>(null);
  const [swearError, setSwearError] = useState<string | null>(null);
  const [languageError, setLanguageError] = useState<string | null>(null);
  const [addingLanguage, setAddingLanguage] = useState(false);
  const [badgeExtras, setBadgeExtras] = useState({
    bookmarkedCount: 0,
    weakRecovered: 0,
    totalCorrect: 0,
    dialectCount: 0,
    fillerSeen: 0,
  });

  const name = profile?.display_name?.trim() || "you";
  const language = profile?.language ?? "turkish";
  const enrolled = profile?.languages?.length
    ? profile.languages
    : [language];
  const addable = APP_LANGUAGES.filter(
    (l) => l.available && !enrolled.includes(l.id),
  );
  const paceKey = profile?.pace ?? "steady";
  const paceLabel = PACE_LABELS[paceKey] ?? paceKey;
  const gender = profile?.gender ?? "neutral";
  const includeSwearWords = profile?.include_swear_words === true;

  const streakDays = profile?.streak_days ?? 0;
  const shineScore = profile?.shine_score ?? 0;
  const wordsLearned = profile?.words_learned ?? 0;

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        const [{ data: words }, stats, seen] = await Promise.all([
          fetchSlangWords(language, { includeSwearWords: true }),
          fetchProgressStats(),
          fetchSeenWordIds(),
        ]);
        if (!active) return;

        const langIds = new Set(words.map((w) => w.id));
        const scoped = await fetchProgressStats(langIds);
        if (!active) return;

        const seenSet = new Set(seen.ids);
        const seenWords = words.filter((w) => seenSet.has(w.id));
        const dialects = new Set(
          seenWords.map((w) => w.dialect).filter((d) => d && d !== "general"),
        );
        const fillers = seenWords.filter((w) => w.category === "filler").length;

        setBadgeExtras({
          bookmarkedCount: scoped.stats.bookmarkedCount,
          weakRecovered: scoped.stats.recoveredCount,
          totalCorrect: scoped.stats.totalCorrect || stats.stats.totalCorrect,
          dialectCount: dialects.size,
          fillerSeen: fillers,
        });
      })();
      return () => {
        active = false;
      };
    }, [language]),
  );

  const streakGoal = 7;
  const streakTowardWeek = Math.min(streakDays, streakGoal);
  const streakFillPct = (streakTowardWeek / streakGoal) * 100;
  const streakHint =
    streakTowardWeek >= streakGoal
      ? "7-day streak unlocked ✦"
      : streakDays === 0
        ? "complete a quiz to start your streak ✦"
        : `${streakGoal - streakTowardWeek} more for a 7-day streak ✦`;

  const hasChatted = Object.values(threads).some((msgs) =>
    msgs.some((m) => m.role === "you"),
  );
  const badges = buildProfileBadges(profile, {
    hasChatted,
    ...badgeExtras,
  });

  const stats = [
    { num: String(streakDays), label: "day streak" },
    { num: String(shineScore), label: "shine score" },
    { num: String(wordsLearned), label: "words earned" },
  ];

  const onPickGender = async (id: UserGender) => {
    setGenderError(null);
    const err = await updateGender(id);
    if (err) setGenderError(err);
  };

  const onPickSwearWords = async (include: boolean) => {
    setSwearError(null);
    const err = await updateIncludeSwearWords(include);
    if (err) setSwearError(err);
  };

  const onPickLanguage = async (id: string) => {
    setLanguageError(null);
    const err = await setActiveLanguage(id);
    if (err) setLanguageError(err);
  };

  const onAddLanguage = async (id: string) => {
    setLanguageError(null);
    const err = await addLanguage(id);
    if (err) {
      setLanguageError(err);
      return;
    }
    setAddingLanguage(false);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.lg }]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <View style={styles.avatar}>
            <Text style={styles.avatarInitial}>
              {avatarInitialFromName(name)}
            </Text>
          </View>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.meta}>learning {language}</Text>
          <View style={styles.pacePill}>
            <Text style={styles.paceText}>✦ {paceLabel}</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          {stats.map((stat) => (
            <View key={stat.label} style={styles.stat}>
              <Text style={styles.statNum}>{stat.num}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.quickRow}>
          <Pressable
            style={styles.quickChip}
            onPress={() => navigation.navigate("Review")}
          >
            <Text style={styles.quickChipText}>review weak</Text>
          </Pressable>
          <Pressable
            style={styles.quickChip}
            onPress={() => navigation.navigate("Bookmarks")}
          >
            <Text style={styles.quickChipText}>
              saved · {badgeExtras.bookmarkedCount}
            </Text>
          </Pressable>
        </View>

        <Text style={styles.sectionLabel}>LANGUAGES</Text>
        <View style={styles.genderRow}>
          {enrolled.map((id) => {
            const meta = languageMeta(id);
            const selected = language === id;
            return (
              <Pressable
                key={id}
                style={[styles.genderChip, selected && styles.genderChipSelected]}
                onPress={() => void onPickLanguage(id)}
              >
                <Text
                  style={[
                    styles.genderChipText,
                    selected && styles.genderChipTextSelected,
                  ]}
                >
                  {meta ? `${meta.flag} ${meta.name}` : id}
                </Text>
              </Pressable>
            );
          })}
          {addable.length > 0 ? (
            <Pressable
              style={[
                styles.genderChip,
                addingLanguage && styles.genderChipSelected,
              ]}
              onPress={() => {
                setLanguageError(null);
                setAddingLanguage((open) => !open);
              }}
            >
              <Text
                style={[
                  styles.genderChipText,
                  addingLanguage && styles.genderChipTextSelected,
                ]}
              >
                + add
              </Text>
            </Pressable>
          ) : null}
        </View>
        {addingLanguage && addable.length > 0 ? (
          <View style={styles.addLanguageRow}>
            {addable.map((lang) => (
              <Pressable
                key={lang.id}
                style={styles.genderChip}
                onPress={() => void onAddLanguage(lang.id)}
              >
                <Text style={styles.genderChipText}>
                  {lang.flag} {lang.name}
                </Text>
              </Pressable>
            ))}
          </View>
        ) : null}
        {languageError ? (
          <Text style={styles.languageError}>{languageError}</Text>
        ) : null}

        <Text style={styles.sectionLabel}>ADDRESS ME AS</Text>
        <View style={styles.genderRow}>
          {GENDERS.map((g) => {
            const selected = gender === g.id;
            return (
              <Pressable
                key={g.id}
                style={[styles.genderChip, selected && styles.genderChipSelected]}
                onPress={() => void onPickGender(g.id)}
              >
                <Text
                  style={[
                    styles.genderChipText,
                    selected && styles.genderChipTextSelected,
                  ]}
                >
                  {g.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        {genderError ? (
          <Text style={styles.genderError}>{genderError}</Text>
        ) : null}

        <Text style={styles.sectionLabel}>SWEAR WORDS</Text>
        <View style={styles.genderRow}>
          {SWEAR_OPTIONS.map((option) => {
            const selected = includeSwearWords === option.id;
            return (
              <Pressable
                key={String(option.id)}
                style={[styles.genderChip, selected && styles.genderChipSelected]}
                onPress={() => void onPickSwearWords(option.id)}
              >
                <Text
                  style={[
                    styles.genderChipText,
                    selected && styles.genderChipTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        {swearError ? (
          <Text style={styles.genderError}>{swearError}</Text>
        ) : null}

        <Text style={styles.sectionLabel}>STREAK</Text>
        <View style={styles.weekCard}>
          <View style={styles.weekRow}>
            <Text style={styles.weekLabel}>toward 7 days</Text>
            <Text style={styles.weekValue}>
              {streakTowardWeek} / {streakGoal}
            </Text>
          </View>
          <View style={styles.xpTrack}>
            <AnimatedProgressBar
              progress={streakFillPct}
              color={colors.amberStrong}
              trackColor={colors.amberBg}
            />
          </View>
          <Text style={styles.weekHint}>{streakHint}</Text>
        </View>

        <Text style={styles.sectionLabel}>BADGES</Text>
        <View style={styles.badgeRow}>
          {badges.map((badge) => (
            <View key={badge.label} style={styles.badgeItem}>
              <View
                style={[
                  styles.badge,
                  badge.earned ? styles.badgeEarned : styles.badgeLocked,
                ]}
              >
                <Text style={styles.badgeIcon}>{badge.icon}</Text>
              </View>
              <Text
                style={[
                  styles.badgeLabel,
                  !badge.earned && styles.badgeLabelLocked,
                ]}
              >
                {badge.label}
              </Text>
            </View>
          ))}
        </View>
        <View style={styles.signOut}>
          <Button label="sign out" variant="ghost" onPress={() => signOut()} />
        </View>
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
    paddingBottom: spacing.lg,
  },
  hero: {
    alignItems: "center",
    paddingVertical: 10,
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: radius.full,
    backgroundColor: colors.primaryLight,
    borderWidth: 2,
    borderColor: colors.primaryMid,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  avatarInitial: {
    fontSize: fontSize.title,
    fontWeight: fontWeight.medium,
    color: colors.primaryText,
  },
  name: {
    fontSize: fontSize.headingLg,
    fontWeight: fontWeight.medium,
    color: colors.primaryDark,
  },
  meta: {
    fontSize: fontSize.label,
    color: colors.primaryFaint,
    marginTop: 2,
  },
  pacePill: {
    backgroundColor: colors.amberBg,
    borderRadius: radius.full,
    paddingVertical: 4,
    paddingHorizontal: spacing.md,
    marginTop: spacing.sm,
  },
  paceText: {
    fontSize: fontSize.small,
    fontWeight: fontWeight.medium,
    color: colors.amberStrong,
  },
  statsRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  quickRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  quickChip: {
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: radius.full,
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
  },
  quickChipText: {
    fontSize: fontSize.small,
    color: colors.primaryText,
    fontWeight: fontWeight.medium,
  },
  genderRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  genderChip: {
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: radius.full,
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
  },
  genderChipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  genderChipText: {
    fontSize: fontSize.small,
    color: colors.textSecondary,
  },
  genderChipTextSelected: {
    color: colors.primaryText,
    fontWeight: fontWeight.medium,
  },
  genderError: {
    marginTop: -spacing.sm,
    marginBottom: spacing.lg,
    fontSize: fontSize.small,
    color: colors.coralStrong,
  },
  languageError: {
    marginTop: -spacing.sm,
    marginBottom: spacing.lg,
    fontSize: fontSize.small,
    color: colors.coralStrong,
  },
  addLanguageRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: -spacing.sm,
    marginBottom: spacing.lg,
  },
  stat: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: "center",
  },
  statNum: {
    fontSize: 22,
    fontWeight: fontWeight.medium,
    color: colors.primary,
  },
  statLabel: {
    fontSize: fontSize.micro,
    color: colors.textSecondary,
    marginTop: 2,
  },
  sectionLabel: {
    fontSize: fontSize.micro,
    fontWeight: fontWeight.medium,
    color: colors.textMuted,
    letterSpacing: 0.6,
    marginBottom: spacing.sm,
  },
  weekCard: {
    backgroundColor: colors.surface,
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: 14,
    marginBottom: 14,
  },
  weekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  weekLabel: {
    fontSize: fontSize.body,
    color: colors.textPrimary,
  },
  weekValue: {
    fontSize: fontSize.body,
    fontWeight: fontWeight.medium,
    color: colors.primary,
  },
  xpTrack: {
    width: "100%",
  },
  weekHint: {
    fontSize: fontSize.micro,
    color: colors.primaryFaint,
    marginTop: 5,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  badgeItem: {
    alignItems: "center",
    width: 72,
  },
  badge: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeEarned: {
    backgroundColor: colors.primaryLight,
    borderWidth: 0.5,
    borderColor: colors.primaryMid,
  },
  badgeLocked: {
    backgroundColor: colors.background,
    borderWidth: 0.5,
    borderColor: colors.border,
    opacity: 0.45,
  },
  badgeIcon: {
    fontSize: 20,
  },
  badgeLabel: {
    fontSize: 9,
    color: colors.primary,
    marginTop: 4,
    textAlign: "center",
  },
  badgeLabelLocked: {
    color: colors.textMuted,
  },
  signOut: {
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
});
