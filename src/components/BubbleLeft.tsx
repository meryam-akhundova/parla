import { View, Text, Pressable, StyleSheet } from "react-native";
import { colors, radius, fontSize } from "../theme/theme";

interface BubbleLeftProps {
  text: string;
  onPress?: () => void;
}

export function BubbleLeft({ text, onPress }: BubbleLeftProps) {
  const content = (
    <View style={styles.bubble}>
      <Text style={styles.text}>{text}</Text>
    </View>
  );

  if (!onPress) return content;

  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityHint="explain slang">
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
