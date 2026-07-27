import { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { RootNavigationProp } from "../../navigation/types";
import { Button } from "../../components/Button";
import { StepRow } from "./StepRow";
import { useAuthStore, type UserGender } from "../../store/authStore";
import { colors, spacing, radius, fontSize, fontWeight } from "../../theme/theme";

const GENDERS: { id: UserGender; label: string; sub: string }[] = [
  { id: "female", label: "she / her", sub: "zeynep will address you as a woman friend" },
  { id: "male", label: "he / him", sub: "zeynep will address you as a guy friend" },
  { id: "neutral", label: "they / them", sub: "zeynep keeps it gender-neutral" },
];

export function OnboardingGenderScreen() {
  const navigation = useNavigation<RootNavigationProp>();
  const insets = useSafeAreaInsets();
  const setDraft = useAuthStore((s) => s.setDraft);
  const [selected, setSelected] = useState<UserGender>("neutral");

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
      <StepRow currentStep={1} totalSteps={6} />

      <Text style={styles.sparkle}>✦  ✦</Text>
      <Text style={styles.title}>how should friends address you?</Text>
      <Text style={styles.subtitle}>
        turkish chat shifts with gender — this tunes zeynep
      </Text>

      <View style={styles.options}>
        {GENDERS.map((g) => {
          const isSelected = selected === g.id;
          return (
            <Pressable
              key={g.id}
              style={[styles.option, isSelected && styles.optionSelected]}
              onPress={() => setSelected(g.id)}
            >
              <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                {g.label}
              </Text>
              <Text style={styles.optionSub}>{g.sub}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.footer}>
        <Button
          label="continue"
          onPress={() => {
            setDraft({ gender: selected });
            navigation.navigate("OnboardingGoal");
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
    gap: spacing.sm,
    flex: 1,
  },
  option: {
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    backgroundColor: colors.surface,
  },
  optionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  optionLabel: {
    fontSize: fontSize.heading,
    fontWeight: fontWeight.medium,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  optionLabelSelected: {
    color: colors.primaryText,
  },
  optionSub: {
    fontSize: fontSize.small,
    color: colors.textSecondary,
  },
  footer: {
    marginTop: "auto",
  },
});
