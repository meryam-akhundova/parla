import { View, Text, StyleSheet } from "react-native";
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

export function VibeMeter({ friends, strangers, formal }: VibeMeterProps) {
  const tiles = [
    { key: "friends" as const, label: "friends", level: friends },
    { key: "strangers" as const, label: "strangers", level: strangers },
    { key: "formal" as const, label: "formal", level: formal },
  ];

  return (
    <View style={styles.row}>
      {tiles.map((tile) => (
        <View key={tile.key} style={[styles.tile, levelStyles[tile.level]]}>
          <Text style={styles.emoji}>{LEVEL_EMOJI[tile.key]}</Text>
          <Text style={[styles.label, labelStyles[tile.level]]}>
            {tile.label}
          </Text>
          <Text style={[styles.copy, copyStyles[tile.level]]}>
            {LEVEL_COPY[tile.level]}
          </Text>
        </View>
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
