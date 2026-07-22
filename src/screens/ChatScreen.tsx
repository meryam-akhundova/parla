import { useRef, useState } from "react";
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
import { TypingBubble } from "../components/TypingBubble";
import { PERSONAS, getPersona, type PersonaId } from "../data/personas";
import { chatWithPersona, type ChatTurn } from "../lib/chat";
import { useAuthStore } from "../store/authStore";
import { useChatStore, type UiMessage } from "../store/chatStore";
import { colors, spacing, radius, fontSize, fontWeight } from "../theme/theme";

export function ChatScreen() {
  const insets = useSafeAreaInsets();
  const profile = useAuthStore((s) => s.profile);
  const selectedPersona = useChatStore((s) => s.selectedPersona);
  const setPersona = useChatStore((s) => s.setPersona);
  const messages = useChatStore((s) => s.threads[s.selectedPersona]);
  const setMessages = useChatStore((s) => s.setMessages);
  const persona = getPersona(selectedPersona);

  const [draft, setDraft] = useState("");
  const [sendingFor, setSendingFor] = useState<PersonaId | null>(null);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const sending = sendingFor !== null;

  const selectPersona = (id: PersonaId) => {
    if (id === selectedPersona) return;
    setPersona(id);
    setError(null);
  };

  const toHistory = (msgs: UiMessage[]): ChatTurn[] =>
    msgs
      .filter((m): m is { id: string; role: "them" | "you"; text: string } =>
        m.role === "them" || m.role === "you",
      )
      .map((m) => ({
        role: m.role === "them" ? "assistant" : "user",
        content: m.text,
      }));

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    const personaId = selectedPersona;
    const historySnapshot = toHistory(messages);
    const youMsg: UiMessage = {
      id: `${Date.now()}-you`,
      role: "you",
      text: trimmed,
    };

    setMessages((prev) => [...prev, youMsg], personaId);
    setDraft("");
    setError(null);
    setSendingFor(personaId);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);

    const startedAt = Date.now();
    const { reply, feedback, error: chatError } = await chatWithPersona(
      trimmed,
      historySnapshot,
      {
        persona: personaId,
        gender: profile?.gender ?? "neutral",
        displayName: profile?.display_name,
      },
    );

    // Keep the typing bubble visible briefly so it feels like real messaging
    const elapsed = Date.now() - startedAt;
    const minTypingMs = 700 + Math.floor(Math.random() * 500);
    if (elapsed < minTypingMs) {
      await new Promise((r) => setTimeout(r, minTypingMs - elapsed));
    }

    setSendingFor(null);

    if (chatError || !reply) {
      setError(chatError ?? "No reply");
      return;
    }

    setMessages((prev) => {
      const next: UiMessage[] = [
        ...prev,
        { id: `${Date.now()}-them`, role: "them", text: reply },
      ];
      if (feedback) {
        next.push({
          id: `${Date.now()}-badge`,
          role: "badge",
          text: feedback,
        });
      }
      return next;
    }, personaId);
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
          <Text style={styles.title}>chat with {persona.name}</Text>
          <Text style={styles.status}>● {persona.status}</Text>
        </View>
        <Feather name="info" size={18} color={colors.textMuted} />
      </View>

      <View style={styles.personaRow}>
        {PERSONAS.map((p) => {
          const selected = p.id === selectedPersona;
          return (
            <Pressable
              key={p.id}
              style={[styles.personaChip, selected && styles.personaChipSelected]}
              onPress={() => selectPersona(p.id)}
            >
              <Text
                style={[
                  styles.personaChipText,
                  selected && styles.personaChipTextSelected,
                ]}
              >
                {p.name}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.scenario}>
        <Text style={styles.scenarioSpark}>✦</Text>
        <Text style={styles.scenarioText}>{persona.scenario}</Text>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.thread}
        contentContainerStyle={styles.threadContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.timestamp}>today</Text>
        {messages.map((m) => {
          if (m.role === "badge") {
            return <NaturalnessBadge key={m.id} message={m.text} />;
          }
          if (m.role === "them") {
            return <BubbleLeft key={m.id} text={m.text} />;
          }
          return <BubbleRight key={m.id} text={m.text} />;
        })}
        {sendingFor === selectedPersona ? <TypingBubble /> : null}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </ScrollView>

      <View style={styles.composer}>
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
  personaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: spacing.sm,
  },
  personaChip: {
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: radius.full,
    paddingVertical: 5,
    paddingHorizontal: 11,
    backgroundColor: colors.surface,
  },
  personaChipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  personaChipText: {
    fontSize: fontSize.label,
    color: colors.textSecondary,
  },
  personaChipTextSelected: {
    color: colors.primaryText,
    fontWeight: fontWeight.medium,
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
