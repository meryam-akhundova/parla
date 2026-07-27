import { useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { Feather } from "@expo/vector-icons";

import type { SlangWord } from "../data/types";
import {
  earAudioAvailable,
  playEarAudio,
  resolveEarAudio,
} from "../lib/earAudio";
import { colors, spacing, radius, fontSize, fontWeight } from "../theme/theme";

interface EarStimulusCardProps {
  word: SlangWord;
  stimulus: string;
  /** When false, hide the written form so learners rely on audio. */
  revealText?: boolean;
  /** Attempt autoplay when the quiz item changes (no-op until audio exists). */
  autoPlay?: boolean;
}

export function EarStimulusCard({
  word,
  stimulus,
  revealText = true,
  autoPlay = false,
}: EarStimulusCardProps) {
  const source = resolveEarAudio(word, stimulus);
  const canPlay = earAudioAvailable(source);
  const [playing, setPlaying] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    setStatus(null);
  }, [word.id, stimulus]);

  const play = async () => {
    if (playing) return;
    setPlaying(true);
    setStatus(null);
    const result = await playEarAudio(source);
    setPlaying(false);
    if (!result.ok) {
      setStatus(result.error ?? "could not play");
    }
  };

  useEffect(() => {
    if (!autoPlay || !canPlay) return;
    let cancelled = false;
    const clip = resolveEarAudio(word, stimulus);
    (async () => {
      setPlaying(true);
      const result = await playEarAudio(clip);
      if (cancelled) return;
      setPlaying(false);
      if (!result.ok) {
        setStatus(result.error ?? "could not play");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [word.id, word.audioUrl, stimulus, autoPlay, canPlay]);

  return (
    <View style={styles.card}>
      <Pressable
        onPress={() => void play()}
        disabled={playing}
        style={({ pressed }) => [
          styles.playButton,
          !canPlay && styles.playButtonMuted,
          pressed && canPlay && styles.playPressed,
        ]}
        accessibilityLabel={canPlay ? "play audio" : "audio coming soon"}
      >
        {playing ? (
          <ActivityIndicator color={colors.tealDark} />
        ) : (
          <Feather
            name={canPlay ? "play" : "headphones"}
            size={22}
            color={colors.tealDark}
          />
        )}
      </Pressable>

      {revealText ? (
        <Text style={styles.stimulusText}>"{stimulus}"</Text>
      ) : (
        <Text style={styles.hiddenHint}>listen, then pick an answer</Text>
      )}

      <Text style={styles.audioHint}>
        {canPlay
          ? status ?? "tap to replay ✦"
          : status ?? "audio coming soon ✦"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.tealBg,
    borderRadius: radius.lg,
    padding: 14,
    marginBottom: spacing.lg,
    alignItems: "center",
    gap: spacing.sm,
  },
  playButton: {
    width: 52,
    height: 52,
    borderRadius: radius.full,
    backgroundColor: colors.white,
    borderWidth: 0.5,
    borderColor: colors.tealStrong,
    alignItems: "center",
    justifyContent: "center",
  },
  playButtonMuted: {
    opacity: 0.85,
  },
  playPressed: {
    opacity: 0.8,
  },
  stimulusText: {
    fontSize: 18,
    fontWeight: fontWeight.medium,
    color: colors.tealDark,
    textAlign: "center",
    lineHeight: 26,
  },
  hiddenHint: {
    fontSize: fontSize.body,
    color: colors.tealText,
    textAlign: "center",
  },
  audioHint: {
    fontSize: fontSize.micro,
    color: colors.tealText,
  },
});
