import type { SlangWord } from "../data/types";

/** Shuffle and take up to `count` words without mutating the original. */
export function pickSessionWords(words: SlangWord[], count: number): SlangWord[] {
  if (count <= 0 || words.length === 0) return [];
  const copy = [...words];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, Math.min(count, copy.length));
}
