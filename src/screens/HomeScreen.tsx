import { useCallback, useState } from "react";
import { View, Text, ScrollView, StyleSheet, Pressable } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import type { MainTabNavigationProp } from "../navigation/types";
import { LessonCard } from "../components/LessonCard";
import { FadeSlideIn } from "../components/animated/FadeSlideIn";
import { avatarInitialFromName } from "../lib/avatar";
import { fetchSlangWords } from "../lib/slang";
import { fetchProgressStats } from "../lib/wordProgress";
import {
  fetchTodayActivity,
  homeProgressFromActivity,
} from "../lib/dailyActivity";
import { colors, spacing, radius, fontSize, fontWeight } from "../theme/theme";

import type { SlangWord } from "../data/types";
import { useAuthStore } from "../store/authStore";

const DAYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

/** Fallback teasers when the word fetch is still loading / empty. */
const HOME_TEASERS: Record<
  string,
  { slang: string; vibe: string; unpack: string }
> = {
  turkish: {
    slang: "ya bro · eyw · kanka · lan",
    vibe: "aynen · kesinlikle · yok artık",
    unpack: "ya bro geliyom · eyw kral",
  },
  french: {
    slang: "mdr · wesh · grave · tkt",
    vibe: "ouf · relou · nickel · flemme",
    unpack: "tkt j'arrive · grave relou",
  },
  spanish: {
    slang: "qué onda · chido · wey · vale",
    vibe: "jajaja · no manches · qué fuerte",
    unpack: "qué onda wey · vale dale",
  },
  azerbaijani: {
    slang: "zəhmli · neynirsen · vallah · lap",
    vibe: "salam · maşallah · boşla",
    unpack: "neynirsen vallah · lap boşla",
  },
  italian: {
    slang: "raga · vabbè · boh · pazzesco",
    vibe: "che palle · top · una bomba",
    unpack: "raga boh · vabbè top",
  },
};

function getGreeting(hour: number): string {
  if (hour < 12) return "good morning";
  if (hour < 17) return "good afternoon";
  return "good evening";
}

function joinWords(words: SlangWord[], count: number): string {
  return words
    .slice(0, count)
    .map((w) => w.word)
    .join(" · ");
}

function teasersFor(language: string, words: SlangWord[]) {
  const fallback = HOME_TEASERS[language] ?? HOME_TEASERS.turkish;
  if (words.length === 0) return fallback;

  const reactions = words.filter(
    (w) => w.category === "reaction" || w.category === "expression",
  );
  const withLines = words.filter((w) => w.exampleMessage.trim().length >= 8);

  return {
    slang: joinWords(words, 4) || fallback.slang,
    vibe:
      joinWords(reactions.length >= 3 ? reactions : words, 3) || fallback.vibe,
    unpack:
      withLines
        .slice(0, 2)
        .map((w) => w.exampleMessage)
        .join(" · ") || fallback.unpack,
  };
}

export function HomeScreen() {
  const navigation = useNavigation<MainTabNavigationProp>();
  const insets = useSafeAreaInsets();
  const profile = useAuthStore((s) => s.profile);

  const name = profile?.display_name?.trim() || "you";
  const language = profile?.language ?? "turkish";
  const includeSwearWords = profile?.include_swear_words === true;
  const pace = profile?.pace;

  const now = new Date();
  const dayName = DAYS[now.getDay()];
  const greeting = getGreeting(now.getHours());

  const streakDays = profile?.streak_days ?? 0;
  const shineScore = profile?.shine_score ?? 0;

  const [pool, setPool] = useState<SlangWord[]>([]);
  const [slangProgress, setSlangProgress] = useState(0);
  const [vibeProgress, setVibeProgress] = useState(0);
  const [earProgress, setEarProgress] = useState(0);
  const [target, setTarget] = useState(5);
  const [dueCount, setDueCount] = useState(0);
  const [bookmarkCount, setBookmarkCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        const [words, activity, stats] = await Promise.all([
          fetchSlangWords(language, { includeSwearWords }),
          fetchTodayActivity(),
          fetchProgressStats(),
        ]);
        if (!active) return;

        setPool(words.data);
        const langIds = new Set(words.data.map((w) => w.id));
        const scoped =
          langIds.size > 0
            ? await fetchProgressStats(langIds)
            : stats;
        if (!active) return;

        const progress = homeProgressFromActivity(
          activity.activity,
          pace,
          scoped.stats.dueCount,
        );
        setSlangProgress(progress.slang);
        setVibeProgress(progress.vibe);
        setEarProgress(progress.ear);
        setTarget(progress.target);
        setDueCount(progress.dueCount);
        setBookmarkCount(scoped.stats.bookmarkedCount);
      })();
      return () => {
        active = false;
      };
    }, [language, includeSwearWords, pace]),
  );

  const livePool =
    pool.length > 0 && pool[0]?.language === language ? pool : [];
  const teasers = teasersFor(language, livePool);

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.lg }]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <FadeSlideIn>
          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text style={styles.eyebrow}>
                {dayName} · {language}
              </Text>
              <Text style={styles.greeting}>
                {greeting}, {name} <Text style={styles.spark}>✦</Text>
              </Text>
            </View>
            <View style={styles.avatar}>
              <Text style={styles.avatarInitial}>
                {avatarInitialFromName(name)}
              </Text>
            </View>
          </View>
        </FadeSlideIn>

        <FadeSlideIn delay={80}>
          <View style={styles.streakBanner}>
            <View>
              <Text style={styles.streakLabel}>your streak</Text>
              <Text style={styles.streakValue}>{streakDays} days</Text>
            </View>
            <View style={styles.streakRight}>
              <Text style={styles.streakLabel}>shine score</Text>
              <Text style={styles.streakValue}>✦ {shineScore}</Text>
            </View>
          </View>
        </FadeSlideIn>

        {(dueCount > 0 || bookmarkCount > 0) && (
          <FadeSlideIn delay={140}>
            <View style={styles.quickRow}>
              {dueCount > 0 ? (
                <Pressable
                  style={({ pressed }) => [
                    styles.quickCard,
                    styles.reviewCard,
                    pressed && styles.quickPressed,
                  ]}
                  onPress={() => navigation.navigate("Review")}
                >
                  <Text style={styles.reviewLabel}>review due</Text>
                  <Text style={styles.quickValue}>{dueCount} words</Text>
                </Pressable>
              ) : null}
              {bookmarkCount > 0 ? (
                <Pressable
                  style={({ pressed }) => [
                    styles.quickCard,
                    styles.bookmarkCard,
                    pressed && styles.quickPressed,
                  ]}
                  onPress={() => navigation.navigate("Bookmarks")}
                >
                  <Text style={styles.bookmarkLabel}>saved</Text>
                  <Text style={styles.quickValueBk}>{bookmarkCount}</Text>
                </Pressable>
              ) : null}
            </View>
          </FadeSlideIn>
        )}

        <FadeSlideIn delay={180}>
          <Text style={styles.sectionLabel}>
            TODAY'S DROPS · {target} each
          </Text>
        </FadeSlideIn>

        <FadeSlideIn delay={220}>
          <LessonCard
            tag="✦ slang drop"
            tagVariant="purple"
            title="texting like a local"
            subtitle={teasers.slang}
            variant="purple"
            progressFilled={slangProgress}
            progressTotal={target}
            icon={
              <Feather
                name="message-square"
                size={18}
                color={colors.primaryText}
              />
            }
            onPress={() => navigation.navigate("SlangDrop")}
          />
        </FadeSlideIn>

        <FadeSlideIn delay={300}>
          <LessonCard
            tag="vibe check"
            tagVariant="coral"
            title="reacting naturally"
            subtitle={teasers.vibe}
            variant="coral"
            progressFilled={vibeProgress}
            progressTotal={target}
            icon={<Feather name="smile" size={18} color={colors.coralText} />}
            onPress={() => navigation.navigate("VibeCheck")}
          />
        </FadeSlideIn>

        <FadeSlideIn delay={380}>
          <LessonCard
            tag="unpack"
            tagVariant="teal"
            title="translate the slang line"
            subtitle={teasers.unpack}
            variant="neutral"
            progressFilled={earProgress}
            progressTotal={target}
            icon={
              <Feather name="type" size={18} color={colors.tealStrong} />
            }
            onPress={() => navigation.navigate("Unpack")}
          />
        </FadeSlideIn>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  headerText: {
    flex: 1,
  },
  eyebrow: {
    fontSize: fontSize.label,
    color: colors.primaryFaint,
    marginBottom: 2,
  },
  greeting: {
    fontSize: fontSize.title,
    fontWeight: fontWeight.medium,
    color: colors.primaryDark,
  },
  spark: {
    color: colors.primary,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    fontSize: fontSize.body,
    fontWeight: fontWeight.medium,
    color: colors.primaryText,
  },
  streakBanner: {
    backgroundColor: colors.amberBg,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  streakRight: {
    alignItems: "flex-end",
  },
  streakLabel: {
    fontSize: fontSize.label,
    color: colors.amberText,
    marginBottom: 2,
  },
  streakValue: {
    fontSize: 22,
    fontWeight: fontWeight.medium,
    color: colors.amberStrong,
  },
  quickRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  quickCard: {
    flex: 1,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: 14,
  },
  reviewCard: {
    backgroundColor: colors.coralBg,
  },
  bookmarkCard: {
    backgroundColor: colors.primaryLight,
  },
  quickPressed: {
    opacity: 0.85,
  },
  reviewLabel: {
    fontSize: fontSize.label,
    color: colors.coralText,
    marginBottom: 2,
  },
  bookmarkLabel: {
    fontSize: fontSize.label,
    color: colors.primaryText,
    marginBottom: 2,
  },
  quickValue: {
    fontSize: fontSize.headingLg,
    fontWeight: fontWeight.medium,
    color: colors.coralStrong,
  },
  quickValueBk: {
    fontSize: fontSize.headingLg,
    fontWeight: fontWeight.medium,
    color: colors.primaryText,
  },
  sectionLabel: {
    fontSize: fontSize.micro,
    fontWeight: fontWeight.medium,
    color: colors.textMuted,
    letterSpacing: 0.6,
    marginBottom: 10,
  },
});
