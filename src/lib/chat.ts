import { supabase } from "./supabase";
import type { PersonaId } from "../data/personas";
import type { UserGender } from "../store/authStore";

export type ChatTurn = {
  role: "user" | "assistant";
  content: string;
};

/** Unwrap model JSON if the bubble text is still raw {"reply":...} */
function unwrapPayload(
  reply: unknown,
  feedback: unknown,
): { reply: string | null; feedback: string | null } {
  let text = typeof reply === "string" ? reply.trim() : "";
  let tip =
    typeof feedback === "string" && feedback.trim() ? feedback.trim() : null;

  if (!text) return { reply: null, feedback: tip };

  const looksLikeJson =
    text.includes('"reply"') ||
    text.startsWith("{") ||
    text.startsWith("```");

  if (looksLikeJson) {
    let cleaned = text
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start >= 0 && end > start) {
      cleaned = cleaned.slice(start, end + 1);
    }
    try {
      const parsed = JSON.parse(cleaned) as {
        reply?: unknown;
        feedback?: unknown;
      };
      if (typeof parsed.reply === "string" && parsed.reply.trim()) {
        text = parsed.reply.trim();
        if (typeof parsed.feedback === "string" && parsed.feedback.trim()) {
          tip = parsed.feedback.trim();
        } else if (parsed.feedback === null) {
          tip = tip ?? null;
        }
      }
    } catch {
      // keep original text
    }
  }

  return { reply: text, feedback: tip };
}

export async function chatWithPersona(
  message: string,
  history: ChatTurn[] = [],
  options?: {
    persona?: PersonaId;
    gender?: UserGender | null;
    displayName?: string | null;
  },
): Promise<{
  reply: string | null;
  feedback: string | null;
  error: string | null;
}> {
  const { data, error } = await supabase.functions.invoke("chat-with-zeynep", {
    body: {
      message,
      history,
      persona: options?.persona ?? "zeynep",
      gender: options?.gender ?? "neutral",
      displayName: options?.displayName ?? null,
    },
  });

  if (error) {
    return { reply: null, feedback: null, error: error.message };
  }

  if (data?.error) {
    return { reply: null, feedback: null, error: String(data.error) };
  }

  // Sometimes the whole body is a string of JSON
  if (typeof data === "string") {
    return { ...unwrapPayload(data, null), error: null };
  }

  return {
    ...unwrapPayload(data?.reply, data?.feedback),
    error: null,
  };
}

/** @deprecated use chatWithPersona */
export const chatWithZeynep = chatWithPersona;
