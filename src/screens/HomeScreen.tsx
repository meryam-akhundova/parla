import { useCallback, useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import type { MainTabNavigationProp } from "../navigation/types";
import { LessonCard } from "../components/LessonCard";
import { fetchSlangWords } from "../lib/slang";
import { fetchSeenWordIds } from "../lib/wordProgress";
import { colors, spacing, radius, fontSize, fontWeight } from "../theme/theme";

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

function getGreeting(hour: number): string {
  if (hour < 12) return "good morning";
  if (hour < 17) return "good afternoon";
  return "good evening";
}

export function HomeScreen() {
  const navigation = useNavigation<MainTabNavigationProp>();
  const insets = useSafeAreaInsets();
  const profile = useAuthStore((s) => s.profile);

  const name = profile?.display_name?.trim() || "you";
  const language = profile?.language ?? "turkish";

  const now = new Date();
  const dayName = DAYS[now.getDay()];
  const greeting = getGreeting(now.getHours());

  const streakDays = profile?.streak_days ?? 0;
  const shineScore = profile?.shine_score ?? 0;

  const [totalWords, setTotalWords] = useState(0);
  const [seenCount, setSeenCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        const [words, seen] = await Promise.all([
          fetchSlangWords(),
          fetchSeenWordIds(),
        ]);
        if (!active) return;
        setTotalWords(words.data.length);
        // Prefer live table count; fall back to profile if fetch fails
        setSeenCount(
          seen.error ? (profile?.words_learned ?? 0) : seen.ids.length,
        );
      })();
      return () => {
        active = false;
      };
    }, [profile?.words_learned]),
  );

  const progressFilled =
    totalWords > 0 ? Math.min(1, seenCount / totalWords) : 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.lg }]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerText}>
          <Text style={styles.eyebrow}>{dayName} · {language}</Text>
          <Text style={styles.greeting}>
            {greeting}, {name} <Text style={styles.spark}>✦</Text>
          </Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarEmoji}>👩</Text>
          </View>
        </View>

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

        <Text style={styles.sectionLabel}>TODAY'S DROPS</Text>

        <LessonCard
          tag="✦ slang drop"
          tagVariant="purple"
          title="texting like a local"
          subtitle="ya bro · eyw · kanka · lan"
          variant="purple"
          progressFilled={progressFilled}
          icon={
            <Feather
              name="message-square"
              size={18}
              color={colors.primaryText}
            />
          }
          onPress={() => navigation.navigate("SlangDrop")}
        />

        <LessonCard
          tag="vibe check"
          tagVariant="coral"
          title="reacting naturally"
          subtitle="aynen · kesinlikle · yok artık"
          variant="coral"
          progressFilled={seenCount > 0 ? progressFilled : 0}
          icon={<Feather name="smile" size={18} color={colors.coralText} />}
          onPress={() => navigation.navigate("VibeCheck")}
        />

        <LessonCard
          tag="ear training"
          tagVariant="teal"
          title="catch the flow"
          subtitle="fast speech · filler sounds"
          variant="neutral"
          progressFilled={0}
          icon={
            <Feather name="headphones" size={18} color={colors.textMuted} />
          }
        />
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
  avatarEmoji: {
    fontSize: 18,
  },
  streakBanner: {
    backgroundColor: colors.amberBg,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
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
  sectionLabel: {
    fontSize: fontSize.micro,
    fontWeight: fontWeight.medium,
    color: colors.textMuted,
    letterSpacing: 0.6,
    marginBottom: 10,
  },
});
