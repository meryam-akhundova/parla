import { StyleSheet } from "react-native";

import { colors, spacing, radius, fontSize, fontWeight } from "../../theme/theme";

/** Shared type + chrome for onboarding steps (matches splash tone). */
export const onboardingChrome = StyleSheet.create({
  sparkle: {
    fontSize: 20,
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
    color: colors.primarySoft,
    textAlign: "center",
    marginBottom: 18,
  },
  footer: {
    marginTop: "auto",
  },
  primaryWrap: {
    borderRadius: radius.lg,
    shadowColor: colors.primaryDark,
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  option: {
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    backgroundColor: colors.white,
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
});
