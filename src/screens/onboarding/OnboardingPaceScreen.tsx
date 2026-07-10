import { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import type { RootNavigationProp } from "../../navigation/types";
import { Button } from "../../components/Button";
import { HintBox } from "../../components/HintBox";
import { OnboardingOption } from "./OnboardingOption";
import { StepRow } from "./StepRow";
import { colors, spacing, fontSize, fontWeight } from "../../theme/theme";

const PACE_OPTIONS = [
  {
    id: "quick",
    label: "quick spark",
    subtitle: "5 min · one word a day",
    icon: "zap" as const,
  },
  {
    id: "steady",
    label: "steady glow",
    subtitle: "10 min · a handful of phrases",
    icon: "sun" as const,
    badge: "popular",
  },
  {
    id: "full",
    label: "full shine",
    subtitle: "20 min · deep dives + chat practice",
    icon: "star" as const,
  },
] as const;

export function OnboardingPaceScreen() {
  const navigation = useNavigation<RootNavigationProp>();
  const insets = useSafeAreaInsets();
  const [selectedPace, setSelectedPace] = useState<string>("steady");

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
      <StepRow currentStep={2} />

      <Text style={styles.sparkle}>✦  ✦  ✦</Text>
      <Text style={styles.title}>how much time?</Text>
      <Text style={styles.subtitle}>a little every day goes a long way</Text>

      <View style={styles.options}>
        {PACE_OPTIONS.map((pace) => (
          <OnboardingOption
            key={pace.id}
            label={pace.label}
            subtitle={pace.subtitle}
            badge={"badge" in pace ? pace.badge : undefined}
            selected={selectedPace === pace.id}
            onPress={() => setSelectedPace(pace.id)}
            icon={<Feather name={pace.icon} size={16} color={colors.primary} />}
          />
        ))}
      </View>

      <HintBox message="consistency beats intensity — even 5 minutes a day builds a real glow over time" />

      <View style={styles.footer}>
        <Button
          label="continue"
          onPress={() => navigation.navigate("OnboardingFirstWord")}
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
    marginBottom: spacing.md,
  },
  footer: {
    marginTop: "auto",
  },
});
