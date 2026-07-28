import { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";

import type { RootNavigationProp } from "../../navigation/types";
import { Button } from "../../components/Button";
import { HintBox } from "../../components/HintBox";
import { OnboardingOption } from "./OnboardingOption";
import { StepRow } from "./StepRow";
import { OnboardingShell } from "./OnboardingShell";
import { onboardingChrome } from "./onboardingChrome";
import { colors, spacing } from "../../theme/theme";
import { useAuthStore } from "../../store/authStore";

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
  const [selectedPace, setSelectedPace] = useState<string>("steady");
  const setDraft = useAuthStore((s) => s.setDraft);

  return (
    <OnboardingShell>
      <StepRow currentStep={3} totalSteps={6} />

      <Text style={onboardingChrome.sparkle}>✦</Text>
      <Text style={onboardingChrome.title}>how much time?</Text>
      <Text style={onboardingChrome.subtitle}>
        a little every day goes a long way
      </Text>

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

      <View style={onboardingChrome.footer}>
        <View style={onboardingChrome.primaryWrap}>
          <Button
            label="continue"
            onPress={() => {
              setDraft({ pace: selectedPace });
              navigation.navigate("OnboardingSwearWords");
            }}
          />
        </View>
      </View>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  options: {
    marginBottom: spacing.md,
  },
});
