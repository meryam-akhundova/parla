import { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { RootNavigationProp } from "../../navigation/types";
import { Button } from "../../components/Button";
import { HintBox } from "../../components/HintBox";
import { StepRow } from "./StepRow";
import { colors, spacing, radius, fontSize, fontWeight } from "../../theme/theme";

import { useAuthStore } from "../../store/authStore";

const LANGUAGES = [
  {
    id: "turkish",
    flag: "🇹🇷",
    name: "turkish",
    sub: "istanbul + anatolian",
    available: true,
  },
  {
    id: "spanish",
    flag: "🇪🇸",
    name: "spanish",
    sub: "mx, arg, spain",
    available: false,
  },
  {
    id: "french",
    flag: "🇫🇷",
    name: "french",
    sub: "paris + québec",
    available: false,
  },
  {
    id: "italian",
    flag: "🇮🇹",
    name: "italian",
    sub: "coming soon",
    available: false,
  },
] as const;

export function OnboardingLanguageScreen() {
  const navigation = useNavigation<RootNavigationProp>();
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState("turkish");

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
      <StepRow currentStep={0} />

      <Text style={styles.sparkle}>✦</Text>
      <Text style={styles.title}>which language?</Text>
      <Text style={styles.subtitle}>pick one to start — add more later</Text>

      <View style={styles.grid}>
        {LANGUAGES.map((lang) => {
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

      <View style={styles.footer}>
        <Button
          label="continue"
          onPress={() => {
            setDraft({ language: selected });
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
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  card: {
    width: "48%",
    flexGrow: 1,
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: 10,
    backgroundColor: colors.white,
    alignItems: "center",
  },
  cardSelected: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  cardDisabled: {
    opacity: 0.45,
  },
  flag: {
    fontSize: 22,
    marginBottom: spacing.xs,
  },
  langName: {
    fontSize: fontSize.small,
    fontWeight: fontWeight.medium,
    color: colors.textPrimary,
  },
  langSub: {
    fontSize: fontSize.micro,
    color: colors.textSecondary,
    marginTop: 2,
  },
  footer: {
    marginTop: "auto",
  },
});
