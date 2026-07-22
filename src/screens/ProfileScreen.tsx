import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors, spacing, radius, fontSize, fontWeight } from "../theme/theme";
import { Button } from "../components/Button";

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

const BADGES = [
  { icon: "✦", label: "first shine", earned: true },
  { icon: "🔥", label: "7-day streak", earned: true },
  { icon: "💬", label: "first chat", earned: true },
  { icon: "🌍", label: "polyglot", earned: false },
  { icon: "✨", label: "full shine", earned: false },
];

export function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const profile = useAuthStore((s) => s.profile);
  const signOut = useAuthStore((s) => s.signOut);
  const updateGender = useAuthStore((s) => s.updateGender);

  const name = profile?.display_name?.trim() || "you";
  const language = profile?.language ?? "turkish";
  const paceKey = profile?.pace ?? "steady";
  const paceLabel = PACE_LABELS[paceKey] ?? paceKey;
  const gender = profile?.gender ?? "neutral";

  const streakDays = profile?.streak_days ?? 0;
  const shineScore = profile?.shine_score ?? 0;
  const wordsLearned = profile?.words_learned ?? 0;

  const stats = [
    { num: String(streakDays), label: "day streak" },
    { num: String(shineScore), label: "shine score" },
    { num: String(wordsLearned), label: "words earned" },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.lg }]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <View style={styles.avatar}>
            <Text style={styles.avatarEmoji}>👩</Text>
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

        <Text style={styles.sectionLabel}>ADDRESS ME AS</Text>
        <View style={styles.genderRow}>
          {GENDERS.map((g) => {
            const selected = gender === g.id;
            return (
              <Pressable
                key={g.id}
                style={[styles.genderChip, selected && styles.genderChipSelected]}
                onPress={() => void updateGender(g.id)}
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

        <Text style={styles.sectionLabel}>THIS WEEK</Text>
        <View style={styles.weekCard}>
          <View style={styles.weekRow}>
            <Text style={styles.weekLabel}>lessons completed</Text>
            <Text style={styles.weekValue}>6 / 7</Text>
          </View>
          <View style={styles.xpTrack}>
            <View style={[styles.xpFill, { width: "86%" }]} />
          </View>
          <Text style={styles.weekHint}>one more for a perfect week ✦</Text>
        </View>

        <Text style={styles.sectionLabel}>BADGES</Text>
        <View style={styles.badgeRow}>
          {BADGES.map((badge) => (
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
  avatarEmoji: {
    fontSize: 28,
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
    marginBottom: spacing.lg,
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
    width: 56,
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
