import { useEffect, useRef } from "react";
import { Animated, Easing, Text, Pressable, StyleSheet } from "react-native";

import { colors, radius, fontSize } from "../theme/theme";

interface BubbleLeftProps {
  text: string;
  onPress?: () => void;
}

export function BubbleLeft({ text, onPress }: BubbleLeftProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(10)).current;
  const translateX = useRef(new Animated.Value(-6)).current;

  useEffect(() => {
    opacity.setValue(0);
    translateY.setValue(10);
    translateX.setValue(-6);
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateX, {
        toValue: 0,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [text, opacity, translateX, translateY]);

  const content = (
    <Animated.View
      style={[
        styles.bubble,
        {
          opacity,
          transform: [{ translateY }, { translateX }],
        },
      ]}
    >
      <Text style={styles.text}>{text}</Text>
    </Animated.View>
  );

  if (!onPress) return content;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityHint="explain slang"
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bubble: {
    alignSelf: "flex-start",
    maxWidth: "85%",
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    borderBottomLeftRadius: 4,
    paddingVertical: 10,
    paddingHorizontal: 13,
    marginBottom: 6,
  },
  text: {
    fontSize: fontSize.body,
    color: colors.textPrimary,
    lineHeight: 20,
  },
});
