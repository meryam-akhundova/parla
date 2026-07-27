import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  Easing,
} from "react-native";
import { Feather } from "@expo/vector-icons";

import type { SlangWord } from "../data/types";
import { HintBox } from "./HintBox";
import { VibeMeter } from "./VibeMeter";
import { colors, spacing, radius, fontSize, fontWeight } from "../theme/theme";

interface FlipWordCardProps {
  word: SlangWord;
  flipped: boolean;
  onFlip: () => void;
  bookmarked?: boolean;
  onToggleBookmark?: () => void;
}

export function FlipWordCard({
  word,
  flipped,
  onFlip,
  bookmarked = false,
  onToggleBookmark,
}: FlipWordCardProps) {
  // 0 → open, 0.5 → edge-on (swap face), 1 → open again
  const progress = useRef(new Animated.Value(0)).current;
  const [face, setFace] = useState<"front" | "back">(flipped ? "back" : "front");
  const [busy, setBusy] = useState(false);
  const generation = useRef(0);

  // New word → snap to front (invalidate any in-flight flip)
  useEffect(() => {
    generation.current += 1;
    progress.stopAnimation();
    progress.setValue(0);
    setFace("front");
    setBusy(false);
  }, [word.id, progress]);

  useEffect(() => {
    const target: "front" | "back" = flipped ? "back" : "front";
    if (face === target || busy) return;

    const gen = generation.current;
    setBusy(true);

    Animated.timing(progress, {
      toValue: 0.5,
      duration: 160,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (!finished || gen !== generation.current) {
        setBusy(false);
        return;
      }
      setFace(target);
      Animated.timing(progress, {
        toValue: 1,
        duration: 180,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start(() => {
        if (gen !== generation.current) return;
        progress.setValue(0);
        setBusy(false);
      });
    });
  }, [flipped, face, busy, progress]);

  const rotateY = progress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ["0deg", "90deg", "0deg"],
  });

  const scaleX = progress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0.85, 1],
  });

  return (
    <View style={styles.wrap}>
      <Pressable onPress={onFlip} disabled={busy}>
        <Animated.View
          style={[
            styles.card,
            {
              transform: [{ perspective: 1000 }, { rotateY }, { scaleX }],
            },
          ]}
        >
          {face === "front" ? (
            <View style={styles.face}>
              <Text style={styles.word}>{word.word}</Text>
              <Text style={styles.romanization}>{word.romanization}</Text>

              <View style={styles.exampleSection}>
                <Text style={styles.exampleLabel}>in a message</Text>
                <View style={styles.exampleBubble}>
                  <Text style={styles.exampleMessage}>
                    "{word.exampleMessage}"
                  </Text>
                </View>
              </View>

              <Text style={styles.hint}>tap to flip ✦</Text>
            </View>
          ) : (
            <View style={styles.face}>
              <Text style={styles.word}>{word.word}</Text>
              <Text style={styles.romanization}>{word.romanization}</Text>
              <Text style={styles.meaning}>{word.meaning}</Text>

              <View style={styles.exampleSection}>
                <Text style={styles.exampleLabel}>in a message</Text>
                <View style={styles.exampleBubble}>
                  <Text style={styles.exampleMessage}>
                    "{word.exampleMessage}"
                    {word.exampleTranslation ? (
                      <Text style={styles.exampleTranslation}>
                        {" "}
                        → "{word.exampleTranslation}"
                      </Text>
                    ) : null}
                  </Text>
                </View>
              </View>

              <Text style={styles.sectionLabel}>VIBE METER</Text>
              <VibeMeter
                friends={word.vibeFriends}
                strangers={word.vibeStrangers}
                formal={word.vibeFormal}
              />

              <HintBox message={word.culturalNote} />

              <Text style={styles.hint}>tap to flip back</Text>
            </View>
          )}
        </Animated.View>
      </Pressable>
      {onToggleBookmark ? (
        <Pressable
          onPress={onToggleBookmark}
          hitSlop={10}
          style={styles.bookmarkBtn}
        >
          <Feather
            name="bookmark"
            size={18}
            color={bookmarked ? colors.primary : colors.textMuted}
          />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "relative",
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: radius.xl,
    padding: spacing.lg,
  },
  face: {
    gap: spacing.sm,
  },
  bookmarkBtn: {
    position: "absolute",
    top: spacing.md,
    right: spacing.md,
    padding: spacing.xs,
    zIndex: 2,
  },
  word: {
    color: colors.primary,
    fontSize: fontSize.display,
    fontWeight: fontWeight.medium,
    marginTop: spacing.xs,
    paddingRight: 28,
  },
  romanization: {
    color: colors.primaryFaint,
    fontSize: fontSize.small,
    fontWeight: fontWeight.regular,
    fontStyle: "italic",
  },
  meaning: {
    color: colors.textPrimary,
    fontSize: fontSize.bodyLg,
    fontWeight: fontWeight.regular,
  },
  exampleSection: {
    marginTop: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 0.5,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
  exampleLabel: {
    color: colors.textSecondary,
    fontSize: fontSize.label,
    fontWeight: fontWeight.medium,
  },
  exampleBubble: {
    backgroundColor: colors.primaryLight,
    borderRadius: 10,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  exampleMessage: {
    color: colors.primaryText,
    fontSize: fontSize.body,
    fontWeight: fontWeight.regular,
    lineHeight: 20,
  },
  exampleTranslation: {
    color: colors.primaryFaint,
  },
  sectionLabel: {
    fontSize: fontSize.micro,
    fontWeight: fontWeight.medium,
    color: colors.textMuted,
    letterSpacing: 0.6,
    marginTop: spacing.sm,
  },
  hint: {
    marginTop: spacing.sm,
    fontSize: fontSize.label,
    color: colors.textMuted,
    textAlign: "center",
  },
});
