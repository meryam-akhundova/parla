import { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

import type { RootNavigationProp } from "../../navigation/types";
import { Button } from "../../components/Button";
import { StepRow } from "./StepRow";
import { OnboardingShell } from "./OnboardingShell";
import { onboardingChrome } from "./onboardingChrome";
import { useAuthStore } from "../../store/authStore";
import { spacing } from "../../theme/theme";

const OPTIONS: { id: boolean; label: string; sub: string }[] = [
  {
    id: false,
    label: "keep it clean",
    sub: "casual slang only — no swear words or strong profanity",
  },
  {
    id: true,
    label: "include swears",
    sub: "learn the spicy stuff too, with coaching on when not to use it",
  },
];

export function OnboardingSwearWordsScreen() {
  const navigation = useNavigation<RootNavigationProp>();
  const setDraft = useAuthStore((s) => s.setDraft);
  const [selected, setSelected] = useState(false);

  return (
    <OnboardingShell>
      <StepRow currentStep={4} totalSteps={6} />

      <Text style={onboardingChrome.sparkle}>✦</Text>
      <Text style={onboardingChrome.title}>teach swear words?</Text>
      <Text style={onboardingChrome.subtitle}>
        you can change this anytime in profile
      </Text>

      <View style={styles.options}>
        {OPTIONS.map((option) => {
          const isSelected = selected === option.id;
          return (
            <Pressable
              key={String(option.id)}
              style={[
                onboardingChrome.option,
                isSelected && onboardingChrome.optionSelected,
              ]}
              onPress={() => setSelected(option.id)}
            >
              <Text
                style={[
                  onboardingChrome.optionLabel,
                  isSelected && onboardingChrome.optionLabelSelected,
                ]}
              >
                {option.label}
              </Text>
              <Text style={onboardingChrome.optionSub}>{option.sub}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={onboardingChrome.footer}>
        <View style={onboardingChrome.primaryWrap}>
          <Button
            label="continue"
            onPress={() => {
              setDraft({ includeSwearWords: selected });
              navigation.navigate("OnboardingFirstWord");
            }}
          />
        </View>
      </View>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  options: {
    gap: spacing.sm,
    flex: 1,
  },
});
