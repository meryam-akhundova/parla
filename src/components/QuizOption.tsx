import { Pressable, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors, spacing, radius, fontSize, fontWeight } from "../theme/theme";

type QuizOptionState = "default" | "correct" | "wrong" | "dim";

interface QuizOptionProps {
  label: string;
  state?: QuizOptionState;
  onPress?: () => void;
  disabled?: boolean;
}

export function QuizOption({
  label,
  state = "default",
  onPress,
  disabled = false,
}: QuizOptionProps) {
  const iconName =
    state === "correct" ? "check" : state === "wrong" ? "x" : "circle";
  const iconColor =
    state === "correct"
      ? colors.tealStrong
      : state === "wrong"
        ? colors.errorStrong
        : colors.textMuted;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || state !== "default"}
      style={({ pressed }) => [
        styles.base,
        stateStyles[state],
        pressed && state === "default" && styles.pressed,
      ]}
    >
      <Feather name={iconName} size={16} color={iconColor} />
      <Text style={[styles.label, labelStyles[state]]}>{label}</Text>
    </Pressable>
  );
}

const stateStyles = StyleSheet.create({
  default: {
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  correct: {
    borderColor: colors.tealStrong,
    backgroundColor: colors.tealBg,
  },
  wrong: {
    borderColor: colors.errorStrong,
    backgroundColor: colors.errorBg,
  },
  dim: {
    borderColor: colors.border,
    backgroundColor: colors.white,
    opacity: 0.45,
  },
});

const labelStyles = StyleSheet.create({
  default: { color: colors.textPrimary },
  correct: { color: colors.tealDark },
  wrong: { color: colors.errorDark },
  dim: { color: colors.textPrimary },
});

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: 0.5,
    borderRadius: radius.md,
    paddingVertical: 11,
    paddingHorizontal: 14,
    marginBottom: 7,
  },
  pressed: {
    opacity: 0.85,
  },
  label: {
    flex: 1,
    fontSize: fontSize.body,
    fontWeight: fontWeight.regular,
  },
});
