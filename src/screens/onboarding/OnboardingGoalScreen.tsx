import { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";

import type { RootNavigationProp } from "../../navigation/types";
import { Button } from "../../components/Button";
import { OnboardingOption } from "./OnboardingOption";
import { StepRow } from "./StepRow";
import { OnboardingShell } from "./OnboardingShell";
import { onboardingChrome } from "./onboardingChrome";
import { colors } from "../../theme/theme";
import { useAuthStore } from "../../store/authStore";

const GOALS = [
  {
    id: "connect",
    label: "connect with people",
    subtitle: "family, friends — sound natural",
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

type GoalId = (typeof GOALS)[number]["id"];

export function OnboardingGoalScreen() {
  const navigation = useNavigation<RootNavigationProp>();
  const [selected, setSelected] = useState<GoalId[]>([GOALS[0].id]);
  const setDraft = useAuthStore((s) => s.setDraft);

  function toggleGoal(id: GoalId) {
    setSelected((prev) => {
      if (prev.includes(id)) {
        if (prev.length === 1) return prev; // keep at least one
        return prev.filter((g) => g !== id);
      }
      return [...prev, id];
    });
  }

  return (
    <OnboardingShell>
      <StepRow currentStep={2} totalSteps={6} />

      <Text style={onboardingChrome.sparkle}>✦</Text>
      <Text style={onboardingChrome.title}>what's your vibe?</Text>
      <Text style={onboardingChrome.subtitle}>
        pick as many as you like — we'll shape lessons around them
      </Text>

      <View style={styles.options}>
        {GOALS.map((goal) => (
          <OnboardingOption
            key={goal.id}
            label={goal.label}
            subtitle={goal.subtitle}
            selected={selected.includes(goal.id)}
            onPress={() => toggleGoal(goal.id)}
            icon={<Feather name={goal.icon} size={16} color={colors.primary} />}
          />
        ))}
      </View>

      <View style={onboardingChrome.footer}>
        <View style={onboardingChrome.primaryWrap}>
          <Button
            label="continue"
            onPress={() => {
              setDraft({ goal: selected.join(",") });
              navigation.navigate("OnboardingPace");
            }}
          />
        </View>
      </View>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  options: {
    flex: 1,
  },
});
