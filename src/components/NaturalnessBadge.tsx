import { View, Text, StyleSheet } from "react-native";
import { colors, spacing, fontSize } from "../theme/theme";

interface NaturalnessBadgeProps {
  message: string;
}

export function NaturalnessBadge({ message }: NaturalnessBadgeProps) {
  return (
    <View style={styles.badge}>
      <Text style={styles.text}>✦ {message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-end",
    maxWidth: "90%",
    backgroundColor: colors.tealBg,
    borderRadius: 10,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  text: {
    fontSize: fontSize.label,
    color: colors.tealDark,
    lineHeight: 18,
  },
});
