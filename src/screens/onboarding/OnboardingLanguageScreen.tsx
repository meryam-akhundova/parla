import { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

import type { RootNavigationProp } from "../../navigation/types";
import { Button } from "../../components/Button";
import { HintBox } from "../../components/HintBox";
import { StepRow } from "./StepRow";
import { OnboardingShell } from "./OnboardingShell";
import { onboardingChrome } from "./onboardingChrome";
import { APP_LANGUAGES } from "../../data/languages";
import { colors, spacing, radius, fontSize, fontWeight } from "../../theme/theme";
import { useAuthStore } from "../../store/authStore";

export function OnboardingLanguageScreen() {
  const navigation = useNavigation<RootNavigationProp>();
  const [selected, setSelected] = useState("turkish");
  const setDraft = useAuthStore((s) => s.setDraft);

  return (
    <OnboardingShell>
      <StepRow currentStep={0} totalSteps={6} />

      <Text style={onboardingChrome.sparkle}>✦</Text>
      <Text style={onboardingChrome.title}>which language?</Text>
      <Text style={onboardingChrome.subtitle}>
        pick one to start — add more later
      </Text>

      <View style={styles.grid}>
        {APP_LANGUAGES.map((lang) => {
          const isSelected = selected === lang.id;
          return (
            <Pressable
              key={lang.id}
              disabled={!lang.available}
              onPress={() => setSelected(lang.id)}
              style={[
                styles.card,
                isSelected && styles.cardSelected,
                !lang.available && styles.cardDisabled,
              ]}
            >
              <Text style={styles.flag}>{lang.flag}</Text>
              <Text style={styles.langName}>{lang.name}</Text>
              <Text style={styles.langSub}>{lang.sub}</Text>
            </Pressable>
          );
        })}
      </View>

      <HintBox message="already speak it formally? parla works for fluent speakers too — we'll tune to your level." />

      <View style={onboardingChrome.footer}>
        <View style={onboardingChrome.primaryWrap}>
          <Button
            label="continue"
            onPress={() => {
              setDraft({ language: selected });
              navigation.navigate("OnboardingGender");
            }}
          />
        </View>
      </View>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: spacing.sm,
    marginBottom: spacing.md,
  },
  card: {
    width: "48.5%",
    minHeight: 98,
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: 10,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  cardSelected: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  cardDisabled: {
    opacity: 0.45,
    backgroundColor: colors.surface,
  },
  flag: {
    fontSize: 22,
    marginBottom: spacing.xs,
  },
  langName: {
    fontSize: fontSize.small,
    fontWeight: fontWeight.medium,
    color: colors.textPrimary,
    textAlign: "center",
  },
  langSub: {
    fontSize: fontSize.micro,
    color: colors.textSecondary,
    marginTop: 2,
    textAlign: "center",
  },
});
