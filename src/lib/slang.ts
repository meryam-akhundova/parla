import { supabase } from "./supabase";
import { mapSlangWord, type SlangWordRow } from "./mapSlangWord";
import type { SlangWord } from "../data/types";

export type FetchSlangOptions = {
  /** When false (default), exclude swear / strong-profanity entries. */
  includeSwearWords?: boolean;
};

export async function fetchSlangWords(
  language = "turkish",
  options?: FetchSlangOptions,
): Promise<{ data: SlangWord[]; error: string | null }> {
  const includeSwearWords = options?.includeSwearWords === true;

  // Filter swears client-side so fetch still works before `is_swear` is migrated.
  const { data, error } = await supabase
    .from("slang_words")
    .select("*")
    .eq("language", language)
    .order("created_at", { ascending: true });

  if (error) {
    return { data: [], error: error.message };
  }

  const words = (data as SlangWordRow[])
    .map(mapSlangWord)
    .filter((word) => includeSwearWords || !word.isSwear);

  return { data: words, error: null };
}
