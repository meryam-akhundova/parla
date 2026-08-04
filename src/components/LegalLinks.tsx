import { View, Text, Pressable, StyleSheet } from "react-native";

import { openLegalUrl } from "../lib/legal";
import { colors, fontSize, fontWeight, spacing } from "../theme/theme";

type Props = {
  /** Compact line for signup; fuller row for profile. */
  variant?: "inline" | "stack";
};

export function LegalLinks({ variant = "inline" }: Props) {
  if (variant === "stack") {
    return (
      <View style={styles.stack}>
        <Pressable onPress={() => void openLegalUrl("privacy")}>
          <Text style={styles.link}>privacy policy</Text>
        </Pressable>
        <Pressable onPress={() => void openLegalUrl("terms")}>
          <Text style={styles.link}>terms of use</Text>
        </Pressable>
        <Pressable onPress={() => void openLegalUrl("support")}>
          <Text style={styles.link}>support</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <Text style={styles.inline}>
      by continuing you agree to our{" "}
      <Text style={styles.link} onPress={() => void openLegalUrl("terms")}>
        terms
      </Text>{" "}
      and{" "}
      <Text style={styles.link} onPress={() => void openLegalUrl("privacy")}>
        privacy policy
      </Text>
    </Text>
  );
}

const styles = StyleSheet.create({
  inline: {
    textAlign: "center",
    fontSize: fontSize.small,
    color: colors.textSecondary,
    lineHeight: 18,
    marginTop: spacing.sm,
  },
  stack: {
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  link: {
    color: colors.primary,
    fontWeight: fontWeight.medium,
    fontSize: fontSize.small,
  },
});
