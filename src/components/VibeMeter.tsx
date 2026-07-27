import { useEffect, useRef } from "react";
import { Animated, Easing, Text, StyleSheet, View } from "react-native";

import type { VibeLevel } from "../data/types";
import { colors, spacing, radius, fontSize, fontWeight } from "../theme/theme";

interface VibeMeterProps {
  friends: VibeLevel;
  strangers: VibeLevel;
  formal: VibeLevel;
}

const LEVEL_COPY: Record<VibeLevel, string> = {
  good: "totally fine",
  caution: "use caution",
  avoid: "avoid",
};

const LEVEL_EMOJI = {
  friends: "👥",
  strangers: "🤝",
  formal: "💼",
} as const;

function VibeTile({
  label,
  level,
  emoji,
  delay,
}: {
  label: string;
  level: VibeLevel;
  emoji: string;
  delay: number;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    opacity.setValue(0);
    scale.setValue(0.85);
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 280,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          friction: 6,
          tension: 120,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [level, label, delay, opacity, scale]);

  return (
    <Animated.View
      style={[
        styles.tile,
        levelStyles[level],
        { opacity, transform: [{ scale }] },
      ]}
    >
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={[styles.label, labelStyles[level]]}>{label}</Text>
      <Text style={[styles.copy, copyStyles[level]]}>{LEVEL_COPY[level]}</Text>
    </Animated.View>
  );
}

export function VibeMeter({ friends, strangers, formal }: VibeMeterProps) {
  const tiles = [
    { key: "friends" as const, label: "friends", level: friends },
    { key: "strangers" as const, label: "strangers", level: strangers },
    { key: "formal" as const, label: "formal", level: formal },
  ];

  return (
    <View style={styles.row}>
      {tiles.map((tile, i) => (
        <VibeTile
          key={tile.key}
          label={tile.label}
          level={tile.level}
          emoji={LEVEL_EMOJI[tile.key]}
          delay={i * 70}
        />
      ))}
    </View>
  );
}

const levelStyles = StyleSheet.create({
  good: { backgroundColor: colors.tealBg },
  caution: { backgroundColor: colors.amberBg },
  avoid: { backgroundColor: colors.errorBg },
});

const labelStyles = StyleSheet.create({
  good: { color: colors.tealText },
  caution: { color: colors.amberText },
  avoid: { color: colors.errorText },
});

const copyStyles = StyleSheet.create({
  good: { color: colors.tealDark },
  caution: { color: colors.amberStrong },
  avoid: { color: colors.errorDark },
});

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 6,
  },
  tile: {
    flex: 1,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: 10,
    alignItems: "center",
  },
  emoji: {
    fontSize: 18,
    marginBottom: 2,
  },
  label: {
    fontSize: fontSize.micro,
    fontWeight: fontWeight.medium,
  },
  copy: {
    fontSize: fontSize.micro,
  },
});
