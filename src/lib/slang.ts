import { supabase } from "./supabase";
import { mapSlangWord, type SlangWordRow } from "./mapSlangWord";
import type { SlangWord } from "../data/types";

export async function fetchSlangWords(
  language = "turkish",
): Promise<{ data: SlangWord[]; error: string | null }> {
  const { data, error } = await supabase
    .from("slang_words")
    .select("*")
    .eq("language", language)
    .order("created_at", { ascending: true });

  if (error) {
    return { data: [], error: error.message };
  }

  const words = (data as SlangWordRow[]).map(mapSlangWord);
  return { data: words, error: null };
}