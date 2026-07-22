import { useEffect, useRef } from "react";
import { View, Animated, StyleSheet } from "react-native";
import { colors, radius, spacing } from "../theme/theme";

function Dot({ delay }: { delay: number }) {
  const opacity = useRef(new Animated.Value(0.3)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 1,
            duration: 280,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: -3,
            duration: 280,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0.3,
            duration: 280,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: 0,
            duration: 280,
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(420 - delay),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [delay, opacity, translateY]);

  return (
    <Animated.View
      style={[
        styles.dot,
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
    />
  );
}

/** Left chat bubble with bouncing dots — same shape as BubbleLeft. */
export function TypingBubble() {
  return (
    <View style={styles.bubble} accessibilityLabel="typing">
      <View style={styles.row}>
        <Dot delay={0} />
        <Dot delay={140} />
        <Dot delay={280} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    alignSelf: "flex-start",
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    borderBottomLeftRadius: 4,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 6,
    minWidth: 64,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.textMuted,
  },
});
