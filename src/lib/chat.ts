import { supabase } from "./supabase";
import type { PersonaId } from "../data/personas";
import type { UserGender } from "../store/authStore";
import {
  matchSlangInMessage,
  residualLikelyHasSlang,
} from "./matchSlangInMessage";
import { fetchSlangWords } from "./slang";

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

export type SlangExplainItem = {
  term: string;
  meaning: string;
  note: string;
};

function normalizeTerm(term: string): string {
  return term.toLocaleLowerCase("tr-TR").normalize("NFC").trim();
}

function mergeExplainItems(
  local: SlangExplainItem[],
  remote: SlangExplainItem[],
): SlangExplainItem[] {
  const seen = new Set(local.map((item) => normalizeTerm(item.term)));
  const merged = [...local];
  for (const item of remote) {
    const key = normalizeTerm(item.term);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    merged.push(item);
  }
  return merged;
}

/**
 * Explain slang in a chat bubble: slang_words first (fast), AI only for leftovers.
 */
export async function explainSlangInMessage(
  message: string,
  options?: {
    /** Called as soon as DB matches are ready (before any AI call). */
    onLocalMatches?: (items: SlangExplainItem[]) => void;
    /** Called only when an AI pass will run for unknown leftovers. */
    onEnriching?: () => void;
  },
): Promise<{ items: SlangExplainItem[]; error: string | null }> {
  const { data: words, error: wordsError } = await fetchSlangWords();
  if (wordsError) {
    return { items: [], error: wordsError };
  }

  const { items: localItems, residual } = matchSlangInMessage(message, words);
  options?.onLocalMatches?.(localItems);

  if (!residualLikelyHasSlang(residual)) {
    return { items: localItems, error: null };
  }

  options?.onEnriching?.();

  const knownTerms = localItems.map((item) => item.term);
  const { data, error } = await supabase.functions.invoke("chat-with-zeynep", {
    body: { action: "explain", message, knownTerms },
  });

  if (error) {
    // Prefer DB hits over failing the whole explain.
    if (localItems.length > 0) {
      return { items: localItems, error: null };
    }
    return { items: [], error: error.message };
  }
  if (data?.error) {
    if (localItems.length > 0) {
      return { items: localItems, error: null };
    }
    return { items: [], error: String(data.error) };
  }

  const remoteItems = Array.isArray(data?.items)
    ? (data.items as SlangExplainItem[]).filter(
        (item) =>
          typeof item?.term === "string" &&
          typeof item?.meaning === "string" &&
          item.term.trim() &&
          item.meaning.trim(),
      )
    : [];

  return {
    items: mergeExplainItems(localItems, remoteItems),
    error: null,
  };
}
