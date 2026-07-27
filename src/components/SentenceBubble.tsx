import { useEffect, useRef } from "react";
import { Animated, Easing, Text, StyleSheet, View } from "react-native";

import { colors, spacing, radius, fontSize, fontWeight } from "../theme/theme";

interface SentenceBubbleProps {
  /** The line shown in the bubble (slang or plain, depending on quiz direction). */
  sentence: string;
  /** Optional secondary line (e.g. highlighted slang word). */
  highlight?: string;
  label?: string;
}

/** Fake text-message bubble for unpack quizzes. */
export function SentenceBubble({
  sentence,
  highlight,
  label = "in a message",
}: SentenceBubbleProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.96)).current;
  const translateY = useRef(new Animated.Value(8)).current;

  useEffect(() => {
    opacity.setValue(0);
    scale.setValue(0.96);
    translateY.setValue(8);
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 7,
        tension: 90,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [sentence, opacity, scale, translateY]);

  return (
    <Animated.View
      style={[
        styles.wrap,
        {
          opacity,
          transform: [{ translateY }, { scale }],
        },
      ]}
    >
      <Text style={styles.label}>{label}</Text>
      <View style={styles.bubble}>
        <Text style={styles.sentence}>"{sentence}"</Text>
      </View>
      {highlight ? (
        <Text style={styles.highlight}>focus: {highlight}</Text>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  label: {
    fontSize: fontSize.micro,
    fontWeight: fontWeight.medium,
    color: colors.textMuted,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  bubble: {
    backgroundColor: colors.tealBg,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: 14,
    borderBottomLeftRadius: 4,
  },
  sentence: {
    fontSize: fontSize.headingLg,
    fontWeight: fontWeight.medium,
    color: colors.tealDark,
    lineHeight: 24,
  },
  highlight: {
    fontSize: fontSize.label,
    color: colors.tealText,
  },
});
