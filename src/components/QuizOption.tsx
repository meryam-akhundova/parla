import { useEffect, useRef } from "react";
import {
  Animated,
  Platform,
  Pressable,
  Text,
  StyleSheet,
  Vibration,
} from "react-native";
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
  const scale = useRef(new Animated.Value(1)).current;
  const shake = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (state === "correct") {
      if (Platform.OS !== "web") Vibration.vibrate(18);
      Animated.sequence([
        Animated.spring(scale, {
          toValue: 1.04,
          friction: 4,
          tension: 180,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          friction: 5,
          tension: 120,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (state === "wrong") {
      if (Platform.OS !== "web") Vibration.vibrate(40);
      Animated.sequence([
        Animated.timing(shake, {
          toValue: 7,
          duration: 45,
          useNativeDriver: true,
        }),
        Animated.timing(shake, {
          toValue: -7,
          duration: 45,
          useNativeDriver: true,
        }),
        Animated.timing(shake, {
          toValue: 5,
          duration: 40,
          useNativeDriver: true,
        }),
        Animated.timing(shake, {
          toValue: -4,
          duration: 40,
          useNativeDriver: true,
        }),
        Animated.timing(shake, {
          toValue: 0,
          duration: 40,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [state, scale, shake]);

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
        pressed && state === "default" && styles.pressed,
      ]}
    >
      <Animated.View
        style={[
          styles.base,
          stateStyles[state],
          {
            transform: [{ translateX: shake }, { scale }],
          },
        ]}
      >
        <Feather name={iconName} size={16} color={iconColor} />
        <Text style={[styles.label, labelStyles[state]]}>{label}</Text>
      </Animated.View>
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
