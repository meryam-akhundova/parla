import { Pressable, Text, StyleSheet } from "react-native";
import { colors, spacing, radius, fontSize, fontWeight } from "../theme/theme";

// describes the shape of a button
interface ButtonProps {
  label: string;
  onPress: () => void; // must be a function that returns nothing
  variant?: "primary" | "ghost"; // optional
}

export function Button({ label, onPress, variant = "primary" }: ButtonProps) {
  const isPrimary = variant === "primary";

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        isPrimary ? styles.primary : styles.ghost,
        pressed && styles.pressed, // short-circuit evaluation
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
