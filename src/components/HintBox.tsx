import { View, Text, StyleSheet } from "react-native";
import { colors, spacing, radius, fontSize, fontWeight } from "../theme/theme";

interface HintBoxProps {
  message: string;
}

export function HintBox({ message }: HintBoxProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        <Text style={styles.sparkle}>✦ </Text>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primaryLight,
    borderWidth: 0.5,
    borderColor: colors.primaryMid,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  text: {
    color: colors.primaryText,
    fontSize: fontSize.body,
    fontWeight: fontWeight.regular,
    lineHeight: 20,
  },
  sparkle: {
    color: colors.primary,
    fontWeight: fontWeight.semibold,
  },
});
