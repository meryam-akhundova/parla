import { supabase } from "./supabase";
import type { UserGender } from "../store/authStore";

export type ChatTurn = {
  role: "user" | "assistant";
  content: string;
};

export async function chatWithZeynep(
  message: string,
  history: ChatTurn[] = [],
  options?: {
    gender?: UserGender | null;
    displayName?: string | null;
  },
): Promise<{ reply: string | null; error: string | null }> {
  const { data, error } = await supabase.functions.invoke("chat-with-zeynep", {
    body: {
      message,
      history,
      gender: options?.gender ?? "neutral",
      displayName: options?.displayName ?? null,
    },
  });

  if (error) {
    return { reply: null, error: error.message };
  }

  if (data?.error) {
    return { reply: null, error: String(data.error) };
  }

  return { reply: data?.reply ?? null, error: null };
}
