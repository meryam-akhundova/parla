import { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

import type { RootNavigationProp } from "../../navigation/types";
import { Button } from "../../components/Button";
import { StepRow } from "./StepRow";
import { OnboardingShell } from "./OnboardingShell";
import { onboardingChrome } from "./onboardingChrome";
import { useAuthStore, type UserGender } from "../../store/authStore";
import { spacing } from "../../theme/theme";

const GENDERS: { id: UserGender; label: string; sub: string }[] = [
  {
    id: "female",
    label: "she / her",
    sub: "friends will address you as a girl",
  },
  {
    id: "male",
    label: "he / him",
    sub: "friends will address you as a guy",
  },
  {
    id: "neutral",
    label: "they / them",
    sub: "friends keep it gender-neutral",
  },
];

export function OnboardingGenderScreen() {
  const navigation = useNavigation<RootNavigationProp>();
  const setDraft = useAuthStore((s) => s.setDraft);
  const language = useAuthStore((s) => s.draft.language);
  const [selected, setSelected] = useState<UserGender>("neutral");

  return (
    <OnboardingShell>
      <StepRow currentStep={1} totalSteps={6} />

      <Text style={onboardingChrome.sparkle}>✦</Text>
      <Text style={onboardingChrome.title}>how should friends address you?</Text>
      <Text style={onboardingChrome.subtitle}>
        {language} chat shifts with gender — this tunes how friends talk to you
      </Text>

      <View style={styles.options}>
        {GENDERS.map((g) => {
          const isSelected = selected === g.id;
          return (
            <Pressable
              key={g.id}
              style={[
                onboardingChrome.option,
                isSelected && onboardingChrome.optionSelected,
              ]}
              onPress={() => setSelected(g.id)}
            >
              <Text
                style={[
                  onboardingChrome.optionLabel,
                  isSelected && onboardingChrome.optionLabelSelected,
                ]}
              >
                {g.label}
              </Text>
              <Text style={onboardingChrome.optionSub}>{g.sub}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={onboardingChrome.footer}>
        <View style={onboardingChrome.primaryWrap}>
          <Button
            label="continue"
            onPress={() => {
              setDraft({ gender: selected });
              navigation.navigate("OnboardingGoal");
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
