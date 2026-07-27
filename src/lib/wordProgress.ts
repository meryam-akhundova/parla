import { supabase } from "./supabase";
import { useAuthStore } from "../store/authStore";

/** Fetch word ids the current user has already seen in Slang Drop. */
export async function fetchSeenWordIds(): Promise<{
  ids: string[];
  error: string | null;
}> {
  const userId = useAuthStore.getState().session?.user.id;
  if (!userId) return { ids: [], error: "Not signed in" };

  const { data, error } = await supabase
    .from("user_word_progress")
    .select("word_id")
    .eq("user_id", userId);

  if (error) return { ids: [], error: error.message };

  const ids = (data ?? [])
    .map((row) => row.word_id)
    .filter((id): id is string => typeof id === "string");

  return { ids, error: null };
}

/**
 * Mark words as seen (upsert), then sync profiles.words_learned to the
 * user's total seen count and refresh the auth profile.
 */
export async function markWordsSeen(
  wordIds: string[],
): Promise<string | null> {
  const { session, loadProfile } = useAuthStore.getState();
  const userId = session?.user.id;
  if (!userId) return "Not signed in";

  const unique = [...new Set(wordIds.filter(Boolean))];
  if (unique.length === 0) return null;

  const rows = unique.map((word_id) => ({
    user_id: userId,
    word_id,
    seen_at: new Date().toISOString(),
  }));

  const { error: upsertError } = await supabase
    .from("user_word_progress")
    .upsert(rows, { onConflict: "user_id,word_id" });

  if (upsertError) return upsertError.message;

  const { count, error: countError } = await supabase
    .from("user_word_progress")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  if (countError) return countError.message;

  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      words_learned: count ?? 0,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (updateError) return updateError.message;

  await loadProfile();
  return null;
}
