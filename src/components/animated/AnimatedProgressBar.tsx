import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View, type ViewStyle } from "react-native";

import { colors, radius } from "../../theme/theme";

interface AnimatedProgressBarProps {
  /** Progress from 0–100. */
  progress: number;
  color: string;
  trackColor?: string;
  height?: number;
  style?: ViewStyle;
}

/** Soft spring-filled track — use for XP / session progress bars. */
export function AnimatedProgressBar({
  progress,
  color,
  trackColor = colors.borderLight,
  height = 8,
  style,
}: AnimatedProgressBarProps) {
  const value = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(value, {
      toValue: Math.max(0, Math.min(100, progress)),
      friction: 9,
      tension: 48,
      useNativeDriver: false,
    }).start();
  }, [progress, value]);

  return (
    <View
      style={[
        styles.track,
        { height, backgroundColor: trackColor, borderRadius: radius.full },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.fill,
          {
            backgroundColor: color,
            borderRadius: radius.full,
            width: value.interpolate({
              inputRange: [0, 100],
              outputRange: ["0%", "100%"],
            }),
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: "100%",
    overflow: "hidden",
  },
  fill: {
    height: "100%",
  },
});
