import { Text, StyleSheet } from "react-native";

import { PressScale } from "./animated/PressScale";
import { colors, spacing, radius, fontSize, fontWeight } from "../theme/theme";

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: "primary" | "ghost";
  disabled?: boolean;
}

export function Button({
  label,
  onPress,
  variant = "primary",
  disabled = false,
}: ButtonProps) {
  const isPrimary = variant === "primary";

  return (
    <PressScale
      onPress={onPress}
      disabled={disabled}
      pressedScale={0.97}
      style={[
        styles.base,
        isPrimary ? styles.primary : styles.ghost,
        disabled && styles.disabled,
      ]}
    >
      <Text
        style={[
          styles.label,
          isPrimary ? styles.primaryLabel : styles.ghostLabel,
        ]}
      >
        {label}
      </Text>
    </PressScale>
  );
}

const styles = StyleSheet.create({
  base: {
    width: "100%",
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  primary: {
    backgroundColor: colors.primary,
  },
  ghost: {
    backgroundColor: "transparent",
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  disabled: {
    opacity: 0.45,
  },
  label: {
    fontWeight: fontWeight.medium,
  },
  primaryLabel: {
    color: colors.primaryLight,
    fontSize: fontSize.bodyLg,
  },
  ghostLabel: {
    color: colors.textSecondary,
    fontSize: fontSize.body,
  },
});
