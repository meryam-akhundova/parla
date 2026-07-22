import { useCallback, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import { BubbleLeft } from "../components/BubbleLeft";
import { BubbleRight } from "../components/BubbleRight";
import { chatWithZeynep, type ChatTurn } from "../lib/chat";
import { useAuthStore } from "../store/authStore";
import { colors, spacing, radius, fontSize, fontWeight } from "../theme/theme";

type UiMessage = {
  id: string;
  role: "zeynep" | "you";
  text: string;
};

const SUGGESTIONS = [
  "tabii ki kanka",
  "haklısın, gel bir kahve iç",
  "yok artık",
];

const OPENERS = [
  "ya bugün çok yoruldum, tamamen bittim — jefa son dakika iş yağdırdı",
  "kanka bir kahve şart, gün berbat geçti",
  "duydun mu, yarın plan iptal olmuş ya",
  "aklıma takıldı — sence 'aynen' her yerde olur mu?",
  "ya bu trafikte eridim, sen neredesin?",
  "bir şey soracağım: 'yok artık' ne zaman fazla kaçar?",
];

function pickOpener() {
  return OPENERS[Math.floor(Math.random() * OPENERS.length)];
}

export function ChatScreen() {
  const insets = useSafeAreaInsets();
  const profile = useAuthStore((s) => s.profile);
  const [messages, setMessages] = useState<UiMessage[]>(() => [
    { id: "opener", role: "zeynep", text: pickOpener() },
  ]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  useFocusEffect(
    useCallback(() => {
      setMessages((prev) => {
        const onlyOpener = prev.length === 1 && prev[0]?.id === "opener";
        if (!onlyOpener) return prev;
        return [{ id: "opener", role: "zeynep", text: pickOpener() }];
      });
    }, []),
  );

  const toHistory = (msgs: UiMessage[]): ChatTurn[] =>
    msgs.map((m) => ({
      role: m.role === "zeynep" ? "assistant" : "user",
      content: m.text,
    }));

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    const youMsg: UiMessage = {
      id: `${Date.now()}-you`,
      role: "you",
      text: trimmed,
    };

    setMessages((prev) => [...prev, youMsg]);
    setDraft("");
    setError(null);
    setSending(true);

    const { reply, error: chatError } = await chatWithZeynep(
      trimmed,
      toHistory(messages),
      {
        gender: profile?.gender ?? "neutral",
        displayName: profile?.display_name,
      },
    );

    setSending(false);

    if (chatError || !reply) {
      setError(chatError ?? "No reply");
      return;
    }

    setMessages((prev) => [
      ...prev,
      { id: `${Date.now()}-zeynep`, role: "zeynep", text: reply },
    ]);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
  };

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
        ref={scrollRef}
        style={styles.thread}
        contentContainerStyle={styles.threadContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.timestamp}>today</Text>
        {messages.map((m) =>
          m.role === "zeynep" ? (
            <BubbleLeft key={m.id} text={m.text} />
          ) : (
            <BubbleRight key={m.id} text={m.text} />
          ),
        )}
        {sending ? (
          <Text style={styles.timestamp}>zeynep is typing…</Text>
        ) : null}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </ScrollView>

      <View style={styles.composer}>
        <View style={styles.suggestions}>
          {SUGGESTIONS.map((s) => (
            <Pressable key={s} style={styles.chip} onPress={() => void send(s)}>
              <Text style={styles.chipText}>{s}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.inputRow}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="reply in turkish..."
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            editable={!sending}
            onSubmitEditing={() => void send(draft)}
          />
          <Pressable
            style={[styles.send, sending && styles.sendDisabled]}
            onPress={() => void send(draft)}
            disabled={sending}
          >
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
  errorText: {
    color: colors.errorStrong,
    fontSize: fontSize.small,
    marginTop: spacing.sm,
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
  sendDisabled: {
    opacity: 0.5,
  },
});
