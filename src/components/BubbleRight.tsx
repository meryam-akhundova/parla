import { useEffect, useRef } from "react";
import { Animated, Easing, Text, StyleSheet } from "react-native";

import { colors, radius, fontSize } from "../theme/theme";

interface BubbleRightProps {
  text: string;
}

export function BubbleRight({ text }: BubbleRightProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(10)).current;
  const translateX = useRef(new Animated.Value(6)).current;

  useEffect(() => {
    opacity.setValue(0);
    translateY.setValue(10);
    translateX.setValue(6);
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

  return (
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
}

const styles = StyleSheet.create({
  bubble: {
    alignSelf: "flex-end",
    maxWidth: "85%",
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    borderBottomRightRadius: 4,
    paddingVertical: 10,
    paddingHorizontal: 13,
    marginBottom: 6,
  },
  text: {
    fontSize: fontSize.body,
    color: colors.primaryLight,
    lineHeight: 20,
  },
});
