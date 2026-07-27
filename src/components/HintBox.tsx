import { useEffect, useRef } from "react";
import { Animated, Easing, Text, StyleSheet } from "react-native";

import { colors, spacing, radius, fontSize, fontWeight } from "../theme/theme";

interface HintBoxProps {
  message: string;
}

export function HintBox({ message }: HintBoxProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(8)).current;

  useEffect(() => {
    opacity.setValue(0);
    translateY.setValue(8);
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 280,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 280,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [message, opacity, translateY]);

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity, transform: [{ translateY }] },
      ]}
    >
      <Text style={styles.text}>
        <Text style={styles.sparkle}>✦ </Text>
        {message}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primaryLight,
    borderWidth: 0.5,
    borderColor: colors.primaryMid,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  text: {
    color: colors.primaryText,
    fontSize: fontSize.body,
    fontWeight: fontWeight.regular,
    lineHeight: 20,
  },
  sparkle: {
    color: colors.primary,
    fontWeight: fontWeight.semibold,
  },
});
