import type { Dialect, SlangWord } from "../data/types";

export type DialectChip = {
  id: Dialect | "all";
  label: string;
};

/** Known dialects per language (filter chips). Unknown DB values still appear via pool. */
const LANGUAGE_DIALECTS: Record<string, DialectChip[]> = {
  turkish: [
    { id: "all", label: "all" },
    { id: "istanbul", label: "istanbul" },
    { id: "anatolian", label: "anatolian" },
    { id: "general", label: "general" },
  ],
  spanish: [
    { id: "all", label: "all" },
    { id: "spain", label: "spain" },
    { id: "mexico", label: "mexico" },
    { id: "argentina", label: "argentina" },
    { id: "general", label: "general" },
  ],
  french: [
    { id: "all", label: "all" },
    { id: "paris", label: "paris" },
    { id: "quebec", label: "québec" },
    { id: "general", label: "general" },
  ],
  azerbaijani: [
    { id: "all", label: "all" },
    { id: "baku", label: "baku" },
    { id: "regional", label: "regional" },
    { id: "general", label: "general" },
  ],
  italian: [
    { id: "all", label: "all" },
    { id: "milan", label: "milan" },
    { id: "southern", label: "southern" },
    { id: "general", label: "general" },
  ],
};

export function dialectChipsForLanguage(language: string): DialectChip[] {
  return LANGUAGE_DIALECTS[language] ?? [
    { id: "all", label: "all" },
    { id: "general", label: "general" },
  ];
}

/**
 * Build dialect chips from language defaults + any dialects present in the pool.
 */
export function dialectChipsFromPool(
  language: string,
  words: SlangWord[],
): DialectChip[] {
  const base = dialectChipsForLanguage(language);
  const known = new Set(base.map((c) => c.id));
  const extras: DialectChip[] = [];

  for (const word of words) {
    const d = word.dialect;
    if (!d || known.has(d) || d === "all") continue;
    known.add(d);
    extras.push({ id: d, label: d });
  }

  // Prefer chips that actually appear (keep "all")
  const present = new Set(words.map((w) => w.dialect));
  const filtered = base.filter(
    (c) => c.id === "all" || present.has(c.id as Dialect) || c.id === "general",
  );

  return [...filtered, ...extras];
}

/**
 * Filter by dialect. Selecting a regional dialect also includes `general`
 * so shared words stay visible.
 */
export function matchesDialect(
  word: SlangWord,
  dialect: Dialect | "all",
): boolean {
  if (dialect === "all") return true;
  if (word.dialect === dialect) return true;
  if (dialect !== "general" && word.dialect === "general") return true;
  return false;
}
