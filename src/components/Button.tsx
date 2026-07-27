import { Pressable, Text, StyleSheet } from "react-native";
import { colors, spacing, radius, fontSize, fontWeight } from "../theme/theme";

// describes the shape of a button
interface ButtonProps {
  label: string;
  onPress: () => void; // must be a function that returns nothing
  variant?: "primary" | "ghost"; // optional
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
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        isPrimary ? styles.primary : styles.ghost,
        pressed && !disabled && styles.pressed,
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
    </Pressable>
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
  pressed: {
    opacity: 0.85,
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
