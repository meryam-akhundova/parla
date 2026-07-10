import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import type { MainTabNavigationProp } from "../navigation/types";
import { LessonCard } from "../components/LessonCard";
import { colors, spacing, radius, fontSize, fontWeight } from "../theme/theme";

export function HomeScreen() {
  const navigation = useNavigation<MainTabNavigationProp>();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.lg }]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.eyebrow}>monday · turkish</Text>
            <Text style={styles.greeting}>
              good morning, sofia <Text style={styles.spark}>✦</Text>
            </Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarEmoji}>👩</Text>
          </View>
        </View>

        <View style={styles.streakBanner}>
          <View>
            <Text style={styles.streakLabel}>your streak</Text>
            <Text style={styles.streakValue}>12 days</Text>
          </View>
          <View style={styles.streakRight}>
            <Text style={styles.streakLabel}>shine score</Text>
            <Text style={styles.streakValue}>✦ 840</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>TODAY'S DROPS</Text>

        <LessonCard
          tag="✦ slang drop"
          tagVariant="purple"
          title="texting like a local"
          subtitle="ya bro · eyw · kanka · lan"
          variant="purple"
          progressFilled={0.6}
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
          progressFilled={0.2}
          icon={<Feather name="smile" size={18} color={colors.coralText} />}
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
