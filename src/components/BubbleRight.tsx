import { View, Text, StyleSheet } from "react-native";
import { colors, radius, fontSize } from "../theme/theme";

interface BubbleRightProps {
  text: string;
}

export function BubbleRight({ text }: BubbleRightProps) {
  return (
    <View style={styles.bubble}>
      <Text style={styles.text}>{text}</Text>
    </View>
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
