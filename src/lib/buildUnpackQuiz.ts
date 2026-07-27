import type { SlangWord } from "../data/types";

export type UnpackQuiz = {
  word: SlangWord;
  /** Full slang sentence to translate. */
  sentence: string;
  /** Expected plain-English translation. */
  answer: string;
  question: string;
  prompt: string;
};

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Words that have a real message + translation to quiz on. */
export function unpackReadyPool(words: SlangWord[]): SlangWord[] {
  return words.filter((w) => {
    const message = (w.exampleMessage ?? "").trim();
    const translation = (w.exampleTranslation ?? "").trim();
    // Prefer full sentences; fall back to shorter lines if needed
    return message.length >= 4 && translation.length >= 2;
  });
}

/**
 * Build a free-text slang→plain translation prompt.
 */
export function buildUnpackQuizFromWord(word: SlangWord | undefined | null): UnpackQuiz | null {
  if (!word) return null;

  const sentence =
    (word.exampleMessage ?? "").trim() ||
    (word.word ?? "").trim();
  const answer =
    (word.exampleTranslation ?? "").trim() ||
    (word.meaning ?? "").trim();

  if (!sentence || !answer) return null;

  return {
    word,
    sentence,
    answer,
    question: "what are they saying?",
    prompt: "type a plain english translation (case doesn't matter)",
  };
}

/**
 * Build a free-text slang→plain translation prompt.
 */
export function buildUnpackQuiz(
  words: SlangWord[],
  options?: { targetId?: string },
): UnpackQuiz | null {
  const ready = unpackReadyPool(words);
  const pool = ready.length >= 1 ? ready : words;
  if (pool.length < 1) return null;

  let word: SlangWord;
  if (options?.targetId) {
    const target =
      pool.find((w) => w.id === options.targetId) ??
      words.find((w) => w.id === options.targetId);
    if (!target) return null;
    word = target;
  } else {
    word = shuffle(pool)[0];
  }

  return buildUnpackQuizFromWord(word);
}

/** Normalize for fuzzy compare — always case-insensitive. */
export function normalizeTranslation(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s']/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const STOP = new Set([
  "a",
  "an",
  "the",
  "to",
  "of",
  "and",
  "or",
  "is",
  "are",
  "was",
  "were",
  "be",
  "i",
  "you",
  "he",
  "she",
  "it",
  "we",
  "they",
  "my",
  "your",
  "im",
  "i'm",
  "dont",
  "don't",
  "just",
  "so",
  "in",
  "on",
  "at",
  "for",
]);

function contentTokens(text: string): string[] {
  return normalizeTranslation(text)
    .split(" ")
    .filter((t) => t.length > 1 && !STOP.has(t));
}

/**
 * Soft check — used as a hint after reveal, not as the only grade.
 * Returns how close the typed answer is (0–1).
 */
export function translationOverlap(user: string, expected: string): number {
  const a = contentTokens(user);
  const b = contentTokens(expected);
  if (a.length === 0 || b.length === 0) {
    const na = normalizeTranslation(user);
    const nb = normalizeTranslation(expected);
    if (!na || !nb) return 0;
    if (na === nb) return 1;
    if (na.includes(nb) || nb.includes(na)) return 0.85;
    return 0;
  }

  const setB = new Set(b);
  const hits = a.filter((t) => setB.has(t)).length;
  return hits / Math.max(b.length, 1);
}

export function isCloseTranslation(user: string, expected: string): boolean {
  const na = normalizeTranslation(user);
  const nb = normalizeTranslation(expected);
  if (!na) return false;
  if (na === nb) return true;
  if (na.includes(nb) || nb.includes(na)) return true;
  return translationOverlap(user, expected) >= 0.55;
}
