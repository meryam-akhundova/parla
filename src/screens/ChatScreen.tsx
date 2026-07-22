import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
  Modal,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import { BubbleLeft } from "../components/BubbleLeft";
import { BubbleRight } from "../components/BubbleRight";
import { NaturalnessBadge } from "../components/NaturalnessBadge";
import { TypingBubble } from "../components/TypingBubble";
import { PERSONAS, getPersona, type PersonaId } from "../data/personas";
import {
  chatWithPersona,
  explainSlangInMessage,
  type ChatTurn,
  type SlangExplainItem,
} from "../lib/chat";
import { useAuthStore } from "../store/authStore";
import {
  makeOpenerMessage,
  useChatStore,
  type UiMessage,
} from "../store/chatStore";
import { colors, spacing, radius, fontSize, fontWeight } from "../theme/theme";

/** Longer messages → longer typing indicator (capped). */
function typingDelayMs(text: string): number {
  const len = text.trim().length;
  const ms = 450 + len * 30;
  return Math.min(3500, Math.max(650, ms));
}

export function ChatScreen() {
  const insets = useSafeAreaInsets();
  const profile = useAuthStore((s) => s.profile);
  const selectedPersona = useChatStore((s) => s.selectedPersona);
  const setPersona = useChatStore((s) => s.setPersona);
  const messages = useChatStore((s) => s.threads[s.selectedPersona]);
  const setMessages = useChatStore((s) => s.setMessages);
  const resetThread = useChatStore((s) => s.resetThread);
  const persona = getPersona(selectedPersona);

  const [draft, setDraft] = useState("");
  const [sendingFor, setSendingFor] = useState<PersonaId | null>(null);
  const [introTypingFor, setIntroTypingFor] = useState<PersonaId | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [explainOpen, setExplainOpen] = useState(false);
  const [explainSource, setExplainSource] = useState("");
  const [explainItems, setExplainItems] = useState<SlangExplainItem[]>([]);
  const [explainLoading, setExplainLoading] = useState(false);
  const [explainEnriching, setExplainEnriching] = useState(false);
  const [explainError, setExplainError] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const sending = sendingFor !== null;
  const showTyping =
    sendingFor === selectedPersona || introTypingFor === selectedPersona;
  const canRestart = !showTyping && messages.length > 0;

  // First open (or first visit to a persona this session): typing, then opener
  useEffect(() => {
    if (messages.length > 0) return;

    const personaId = selectedPersona;
    const opener = makeOpenerMessage(personaId);
    let cancelled = false;
    setIntroTypingFor(personaId);

    const timer = setTimeout(() => {
      if (cancelled) return;
      setMessages([opener], personaId);
      setIntroTypingFor((current) => (current === personaId ? null : current));
    }, typingDelayMs(opener.text));

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [selectedPersona, messages.length, setMessages]);

  const selectPersona = (id: PersonaId) => {
    if (id === selectedPersona) return;
    setPersona(id);
    setError(null);
  };

  const restartChat = () => {
    if (!canRestart) return;
    setDraft("");
    setError(null);
    setIntroTypingFor(null);
    resetThread(selectedPersona);
  };

  const explainMessage = async (text: string) => {
    setExplainSource(text);
    setExplainItems([]);
    setExplainError(null);
    setExplainOpen(true);
    setExplainLoading(true);
    setExplainEnriching(false);

    const { items, error: explainErr } = await explainSlangInMessage(text, {
      onLocalMatches: (localItems) => {
        setExplainItems(localItems);
        setExplainLoading(false);
      },
      onEnriching: () => setExplainEnriching(true),
    });

    setExplainLoading(false);
    setExplainEnriching(false);
    if (explainErr) {
      setExplainError(explainErr);
      return;
    }
    setExplainItems(items);
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

    // Typing duration scales with reply length (API wait counts toward it)
    const elapsed = Date.now() - startedAt;
    const targetMs = reply ? typingDelayMs(reply) : 800;
    if (elapsed < targetMs) {
      await new Promise((r) => setTimeout(r, targetMs - elapsed));
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
        <Pressable
          onPress={restartChat}
          hitSlop={8}
          disabled={!canRestart}
          accessibilityLabel="restart chat"
          style={!canRestart ? styles.restartDisabled : undefined}
        >
          <Feather name="rotate-ccw" size={18} color={colors.textMuted} />
        </Pressable>
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
        <Text style={styles.scenarioText}>
          {persona.scenario} · tap a bubble to explain slang
        </Text>
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
            return (
              <BubbleLeft
                key={m.id}
                text={m.text}
                onPress={() => void explainMessage(m.text)}
              />
            );
          }
          return <BubbleRight key={m.id} text={m.text} />;
        })}
        {showTyping ? <TypingBubble /> : null}
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
            editable={!sending && introTypingFor !== selectedPersona}
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

      <Modal
        visible={explainOpen}
        animationType="fade"
        transparent
        onRequestClose={() => setExplainOpen(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setExplainOpen(false)}
        >
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>slang in this message</Text>
            <Text style={styles.modalQuote}>“{explainSource}”</Text>

            {explainLoading || (explainEnriching && explainItems.length === 0) ? (
              <ActivityIndicator color={colors.primary} style={{ marginVertical: spacing.lg }} />
            ) : explainError && explainItems.length === 0 ? (
              <Text style={styles.errorText}>{explainError}</Text>
            ) : explainItems.length === 0 ? (
              <Text style={styles.modalEmpty}>
                nothing slangy jumped out — looks pretty straightforward ✦
              </Text>
            ) : (
              <ScrollView style={styles.modalList} showsVerticalScrollIndicator={false}>
                {explainItems.map((item) => (
                  <View key={`${item.term}-${item.meaning}`} style={styles.explainCard}>
                    <Text style={styles.explainTerm}>{item.term}</Text>
                    <Text style={styles.explainMeaning}>{item.meaning}</Text>
                    {item.note ? (
                      <Text style={styles.explainNote}>{item.note}</Text>
                    ) : null}
                  </View>
                ))}
                {explainEnriching ? (
                  <View style={styles.enrichRow}>
                    <ActivityIndicator color={colors.primary} size="small" />
                    <Text style={styles.enrichText}>checking for more…</Text>
                  </View>
                ) : null}
              </ScrollView>
            )}

            <Pressable
              style={styles.modalClose}
              onPress={() => setExplainOpen(false)}
            >
              <Text style={styles.modalCloseText}>close</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
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
  restartDisabled: {
    opacity: 0.35,
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(44, 44, 42, 0.4)",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  modalCard: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    maxHeight: "75%",
  },
  modalTitle: {
    fontSize: fontSize.headingLg,
    fontWeight: fontWeight.medium,
    color: colors.primaryDark,
    marginBottom: spacing.xs,
  },
  modalQuote: {
    fontSize: fontSize.small,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  modalEmpty: {
    fontSize: fontSize.body,
    color: colors.textSecondary,
    marginVertical: spacing.md,
  },
  modalList: {
    marginBottom: spacing.md,
  },
  enrichRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: spacing.sm,
  },
  enrichText: {
    fontSize: fontSize.small,
    color: colors.textMuted,
  },
  explainCard: {
    backgroundColor: colors.primaryLight,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  explainTerm: {
    fontSize: fontSize.heading,
    fontWeight: fontWeight.medium,
    color: colors.primaryText,
    marginBottom: 2,
  },
  explainMeaning: {
    fontSize: fontSize.body,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  explainNote: {
    fontSize: fontSize.small,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  modalClose: {
    alignSelf: "center",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  modalCloseText: {
    fontSize: fontSize.bodyLg,
    fontWeight: fontWeight.medium,
    color: colors.primary,
  },
});
