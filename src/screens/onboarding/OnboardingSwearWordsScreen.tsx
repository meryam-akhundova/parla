import { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { RootNavigationProp } from "../../navigation/types";
import { Button } from "../../components/Button";
import { StepRow } from "./StepRow";
import { useAuthStore } from "../../store/authStore";
import { colors, spacing, radius, fontSize, fontWeight } from "../../theme/theme";

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
  const insets = useSafeAreaInsets();
  const setDraft = useAuthStore((s) => s.setDraft);
  const [selected, setSelected] = useState(false);

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
      <StepRow currentStep={4} totalSteps={6} />

      <Text style={styles.sparkle}>✦  ✦</Text>
      <Text style={styles.title}>teach swear words?</Text>
      <Text style={styles.subtitle}>
        you can change this anytime in profile
      </Text>

      <View style={styles.options}>
        {OPTIONS.map((option) => {
          const isSelected = selected === option.id;
          return (
            <Pressable
              key={String(option.id)}
              style={[styles.option, isSelected && styles.optionSelected]}
              onPress={() => setSelected(option.id)}
            >
              <Text
                style={[
                  styles.optionLabel,
                  isSelected && styles.optionLabelSelected,
                ]}
              >
                {option.label}
              </Text>
              <Text style={styles.optionSub}>{option.sub}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.footer}>
        <Button
          label="continue"
          onPress={() => {
            setDraft({ includeSwearWords: selected });
            navigation.navigate("OnboardingFirstWord");
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
