import { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import type { RootNavigationProp } from "../../navigation/types";
import { Button } from "../../components/Button";
import { OnboardingOption } from "./OnboardingOption";
import { StepRow } from "./StepRow";
import { colors, spacing, fontSize, fontWeight } from "../../theme/theme";

import { useAuthStore } from "../../store/authStore";

const GOALS = [
  {
    id: "connect",
    label: "connect with people",
    subtitle: "partner, family, friends — sound natural",
    icon: "heart" as const,
  },
  {
    id: "travel",
    label: "travel like a local",
    subtitle: "blend in, banter, don't sound like a tourist",
    icon: "navigation" as const,
  },
  {
    id: "media",
    label: "enjoy media without subtitles",
    subtitle: "films, music, podcasts, memes",
    icon: "tv" as const,
  },
  {
    id: "shine",
    label: "just shine brighter",
    subtitle: "already fluent, want that natural edge",
    icon: "star" as const,
  },
] as const;

export function OnboardingGoalScreen() {
  const navigation = useNavigation<RootNavigationProp>();
  const insets = useSafeAreaInsets();
  const [selectedGoal, setSelectedGoal] = useState<string>(GOALS[0].id);

  const setDraft = useAuthStore((s) => s.setDraft);

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + spacing.lg,
          paddingBottom: insets.bottom + spacing.lg,
        },
      ]}
    >
      <StepRow currentStep={1} />

      <Text style={styles.sparkle}>✦  ✦</Text>
      <Text style={styles.title}>what's your vibe?</Text>
      <Text style={styles.subtitle}>we'll shape your lessons around this</Text>

      <View style={styles.options}>
        {GOALS.map((goal) => (
          <OnboardingOption
            key={goal.id}
            label={goal.label}
            subtitle={goal.subtitle}
            selected={selectedGoal === goal.id}
            onPress={() => setSelectedGoal(goal.id)}
            icon={<Feather name={goal.icon} size={16} color={colors.primary} />}
          />
        ))}
      </View>

      <View style={styles.footer}>
        <Button
          label="continue"
          onPress={() => {
            setDraft({ goal: selectedGoal });
            navigation.navigate("OnboardingPace");
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
  },
  sparkle: {
    fontSize: 22,
    color: colors.primary,
    textAlign: "center",
    letterSpacing: 6,
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: fontSize.title,
    fontWeight: fontWeight.medium,
    color: colors.primaryDark,
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.small,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 18,
  },
  options: {
    flex: 1,
  },
  footer: {
    marginTop: "auto",
  },
});
