import { supabase } from "./supabase";
import { mapSlangWord, type SlangWordRow } from "./mapSlangWord";
import { useAuthStore } from "../store/authStore";
import type { SlangWord } from "../data/types";
import {
  defaultSrsState,
  isWeakWord,
  nextSrsState,
  type SrsGrade,
  type SrsState,
} from "./srs";

export type WordProgressRow = {
  word_id: string;
  seen_at: string;
  correct_count: number;
  wrong_count: number;
  ease_factor: number;
  interval_days: number;
  repetitions: number;
  due_at: string | null;
  bookmarked: boolean;
  bookmarked_at: string | null;
};

function currentUserId(): string | null {
  return useAuthStore.getState().session?.user.id ?? null;
}

/** Fetch word ids the current user has already seen in Slang Drop. */
export async function fetchSeenWordIds(): Promise<{
  ids: string[];
  error: string | null;
}> {
  const userId = currentUserId();
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

  const now = new Date().toISOString();
  const rows = unique.map((word_id) => ({
    user_id: userId,
    word_id,
    seen_at: now,
    updated_at: now,
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
      updated_at: now,
    })
    .eq("id", userId);

  if (updateError) return updateError.message;

  await loadProfile();
  return null;
}

async function fetchProgressRow(
  userId: string,
  wordId: string,
): Promise<WordProgressRow | null> {
  const { data, error } = await supabase
    .from("user_word_progress")
    .select(
      "word_id, seen_at, correct_count, wrong_count, ease_factor, interval_days, repetitions, due_at, bookmarked, bookmarked_at",
    )
    .eq("user_id", userId)
    .eq("word_id", wordId)
    .maybeSingle();

  if (error || !data) return null;
  return data as WordProgressRow;
}

function srsFromRow(row: WordProgressRow | null): SrsState {
  if (!row) return defaultSrsState();
  return {
    ease_factor: row.ease_factor ?? 2.5,
    interval_days: row.interval_days ?? 0,
    repetitions: row.repetitions ?? 0,
    due_at: row.due_at ?? new Date().toISOString(),
    correct_count: row.correct_count ?? 0,
    wrong_count: row.wrong_count ?? 0,
  };
}

/** Record a quiz / review grade and reschedule the word. */
export async function recordWordReview(
  wordId: string,
  grade: SrsGrade,
): Promise<string | null> {
  const userId = currentUserId();
  if (!userId) return "Not signed in";
  if (!wordId) return null;

  const existing = await fetchProgressRow(userId, wordId);
  const next = nextSrsState(srsFromRow(existing), grade);
  const now = new Date().toISOString();

  const { error } = await supabase.from("user_word_progress").upsert(
    {
      user_id: userId,
      word_id: wordId,
      seen_at: existing?.seen_at ?? now,
      correct_count: next.correct_count,
      wrong_count: next.wrong_count,
      ease_factor: next.ease_factor,
      interval_days: next.interval_days,
      repetitions: next.repetitions,
      due_at: next.due_at,
      bookmarked: existing?.bookmarked ?? false,
      bookmarked_at: existing?.bookmarked_at ?? null,
      updated_at: now,
    },
    { onConflict: "user_id,word_id" },
  );

  return error?.message ?? null;
}

export type ProgressStats = {
  seenCount: number;
  bookmarkedCount: number;
  weakCount: number;
  dueCount: number;
  totalCorrect: number;
  dialectIds: string[];
  categoryCounts: Record<string, number>;
  recoveredCount: number;
};

/** Aggregate progress for badges / home. */
export async function fetchProgressStats(
  languageWordIds?: Set<string>,
): Promise<{ stats: ProgressStats; error: string | null }> {
  const empty: ProgressStats = {
    seenCount: 0,
    bookmarkedCount: 0,
    weakCount: 0,
    dueCount: 0,
    totalCorrect: 0,
    dialectIds: [],
    categoryCounts: {},
    recoveredCount: 0,
  };

  const userId = currentUserId();
  if (!userId) return { stats: empty, error: "Not signed in" };

  const { data, error } = await supabase
    .from("user_word_progress")
    .select(
      "word_id, correct_count, wrong_count, due_at, bookmarked, repetitions",
    )
    .eq("user_id", userId);

  if (error) return { stats: empty, error: error.message };

  const now = Date.now();
  let bookmarkedCount = 0;
  let weakCount = 0;
  let dueCount = 0;
  let totalCorrect = 0;
  let recoveredCount = 0;
  const ids: string[] = [];

  for (const row of data ?? []) {
    if (languageWordIds && !languageWordIds.has(row.word_id)) continue;
    ids.push(row.word_id);
    if (row.bookmarked) bookmarkedCount += 1;
    if (isWeakWord(row)) weakCount += 1;
    const due = row.due_at ? new Date(row.due_at).getTime() : 0;
    if (due > 0 && due <= now) dueCount += 1;
    totalCorrect += row.correct_count ?? 0;
    if ((row.wrong_count ?? 0) > 0 && (row.repetitions ?? 0) >= 2) {
      recoveredCount += 1;
    }
  }

  return {
    stats: {
      seenCount: ids.length,
      bookmarkedCount,
      weakCount,
      dueCount,
      totalCorrect,
      dialectIds: [],
      categoryCounts: {},
      recoveredCount,
    },
    error: null,
  };
}

export type ReviewWord = SlangWord & {
  progress: WordProgressRow;
  weak: boolean;
};

/** Due + weak words for the active language, soonest first. */
export async function fetchReviewWords(
  language: string,
  options?: { includeSwearWords?: boolean; limit?: number },
): Promise<{ data: ReviewWord[]; error: string | null }> {
  const userId = currentUserId();
  if (!userId) return { data: [], error: "Not signed in" };

  const includeSwearWords = options?.includeSwearWords === true;
  const limit = options?.limit ?? 20;
  const nowIso = new Date().toISOString();

  const { data: progress, error: progressError } = await supabase
    .from("user_word_progress")
    .select(
      "word_id, seen_at, correct_count, wrong_count, ease_factor, interval_days, repetitions, due_at, bookmarked, bookmarked_at",
    )
    .eq("user_id", userId)
    .or(`due_at.lte.${nowIso},wrong_count.gt.0`)
    .order("due_at", { ascending: true, nullsFirst: true })
    .limit(80);

  if (progressError) return { data: [], error: progressError.message };
  if (!progress?.length) return { data: [], error: null };

  const ids = progress.map((p) => p.word_id);
  const { data: words, error: wordsError } = await supabase
    .from("slang_words")
    .select("*")
    .eq("language", language)
    .in("id", ids);

  if (wordsError) return { data: [], error: wordsError.message };

  const byId = new Map(
    (words as SlangWordRow[]).map((row) => [row.id, mapSlangWord(row)]),
  );
  const progressById = new Map(
    progress.map((p) => [p.word_id, p as WordProgressRow]),
  );

  const result: ReviewWord[] = [];
  for (const p of progress) {
    const word = byId.get(p.word_id);
    if (!word) continue;
    if (!includeSwearWords && word.isSwear) continue;
    const row = progressById.get(p.word_id)!;
    result.push({
      ...word,
      progress: row,
      weak: isWeakWord(row),
    });
    if (result.length >= limit) break;
  }

  // Prefer weak words first, then due order
  result.sort((a, b) => {
    if (a.weak !== b.weak) return a.weak ? -1 : 1;
    const ad = a.progress.due_at ?? "";
    const bd = b.progress.due_at ?? "";
    return ad.localeCompare(bd);
  });

  return { data: result.slice(0, limit), error: null };
}

export async function fetchBookmarkedWords(
  language: string,
  options?: { includeSwearWords?: boolean },
): Promise<{ data: SlangWord[]; error: string | null }> {
  const userId = currentUserId();
  if (!userId) return { data: [], error: "Not signed in" };

  const includeSwearWords = options?.includeSwearWords === true;

  const { data: progress, error: progressError } = await supabase
    .from("user_word_progress")
    .select("word_id, bookmarked_at")
    .eq("user_id", userId)
    .eq("bookmarked", true)
    .order("bookmarked_at", { ascending: false });

  if (progressError) return { data: [], error: progressError.message };
  if (!progress?.length) return { data: [], error: null };

  const ids = progress.map((p) => p.word_id);
  const { data: words, error: wordsError } = await supabase
    .from("slang_words")
    .select("*")
    .eq("language", language)
    .in("id", ids);

  if (wordsError) return { data: [], error: wordsError.message };

  const byId = new Map(
    (words as SlangWordRow[])
      .map(mapSlangWord)
      .filter((w) => includeSwearWords || !w.isSwear)
      .map((w) => [w.id, w]),
  );

  const ordered = ids
    .map((id) => byId.get(id))
    .filter((w): w is SlangWord => !!w);

  return { data: ordered, error: null };
}

export async function fetchBookmarkIds(): Promise<{
  ids: Set<string>;
  error: string | null;
}> {
  const userId = currentUserId();
  if (!userId) return { ids: new Set(), error: "Not signed in" };

  const { data, error } = await supabase
    .from("user_word_progress")
    .select("word_id")
    .eq("user_id", userId)
    .eq("bookmarked", true);

  if (error) return { ids: new Set(), error: error.message };
  return {
    ids: new Set((data ?? []).map((r) => r.word_id)),
    error: null,
  };
}

export async function setWordBookmarked(
  wordId: string,
  bookmarked: boolean,
): Promise<string | null> {
  const userId = currentUserId();
  if (!userId) return "Not signed in";
  if (!wordId) return null;

  const existing = await fetchProgressRow(userId, wordId);
  const now = new Date().toISOString();

  const { error } = await supabase.from("user_word_progress").upsert(
    {
      user_id: userId,
      word_id: wordId,
      seen_at: existing?.seen_at ?? now,
      correct_count: existing?.correct_count ?? 0,
      wrong_count: existing?.wrong_count ?? 0,
      ease_factor: existing?.ease_factor ?? 2.5,
      interval_days: existing?.interval_days ?? 0,
      repetitions: existing?.repetitions ?? 0,
      due_at: existing?.due_at ?? now,
      bookmarked,
      bookmarked_at: bookmarked ? now : null,
      updated_at: now,
    },
    { onConflict: "user_id,word_id" },
  );

  return error?.message ?? null;
}
