import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import { BubbleLeft } from "../components/BubbleLeft";
import { BubbleRight } from "../components/BubbleRight";
import { NaturalnessBadge } from "../components/NaturalnessBadge";
import { colors, spacing, radius, fontSize, fontWeight } from "../theme/theme";

const SUGGESTIONS = ["tabii ki kanka", "haklısın, gel bir kahve iç"];

export function ChatScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + spacing.md,
        },
      ]}
    >
      <View style={styles.topBar}>
        <View style={styles.topText}>
          <Text style={styles.title}>chat with zeynep</Text>
          <Text style={styles.status}>● casual · istanbul turkish</Text>
        </View>
        <Feather name="info" size={18} color={colors.textMuted} />
      </View>

      <View style={styles.scenario}>
        <Text style={styles.scenarioSpark}>✦</Text>
        <Text style={styles.scenarioText}>
          scenario: your friend is venting about a bad day
        </Text>
      </View>

      <ScrollView
        style={styles.thread}
        contentContainerStyle={styles.threadContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.timestamp}>today 14:32</Text>

        <BubbleLeft text="ya abi bugün çok yoruldum, tamamen bittim" />
        <BubbleRight text="neta? ne oldu, anlat bakalım" />
        <NaturalnessBadge message='natural — "anlat bakalım" sounds very local' />

        <BubbleLeft text="jefa beni son dakika bir sürü iş verdi, çıldırdım ya" />
        <BubbleRight text="yok artık, bu hiç adil değil kanka" />
        <NaturalnessBadge message='great use of "yok artık" — perfect for outrage' />

        <BubbleLeft text="aynen ya... neyse mola verelim mi?" />
      </ScrollView>

      <View style={styles.composer}>
        <View style={styles.suggestions}>
          {SUGGESTIONS.map((s) => (
            <View key={s} style={styles.chip}>
              <Text style={styles.chipText}>{s}</Text>
            </View>
          ))}
        </View>
        <View style={styles.inputRow}>
          <TextInput
            placeholder="reply in turkish..."
            placeholderTextColor={colors.textMuted}
            style={styles.input}
          />
          <Pressable style={styles.send}>
            <Feather name="send" size={16} color={colors.primaryLight} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 6,
  },
  topText: {
    flex: 1,
  },
  title: {
    fontSize: fontSize.bodyLg,
    fontWeight: fontWeight.medium,
    color: colors.primaryDark,
  },
  status: {
    fontSize: fontSize.label,
    color: colors.tealStrong,
  },
  scenario: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.amberBg,
    borderRadius: 10,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: 14,
  },
  scenarioSpark: {
    fontSize: 13,
    color: colors.amberText,
  },
  scenarioText: {
    flex: 1,
    fontSize: fontSize.label,
    color: colors.amberText,
  },
  thread: {
    flex: 1,
  },
  threadContent: {
    paddingBottom: spacing.md,
  },
  timestamp: {
    fontSize: fontSize.micro,
    color: colors.textMuted,
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  composer: {
    borderTopWidth: 0.5,
    borderTopColor: colors.borderLight,
    paddingTop: 10,
  },
  suggestions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
    marginBottom: spacing.sm,
  },
  chip: {
    backgroundColor: colors.primaryLight,
    borderRadius: radius.full,
    paddingVertical: 5,
    paddingHorizontal: 11,
  },
  chipText: {
    fontSize: fontSize.label,
    color: colors.primaryText,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: fontSize.body,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: radius.md,
    borderWidth: 0.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    color: colors.textPrimary,
  },
  send: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
});
