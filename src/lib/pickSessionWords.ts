import type { SlangWord } from "../data/types";

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export type PickSessionOptions = {
  /** Prefer these ids first (e.g. seen words for Vibe Check). */
  preferIds?: Set<string>;
  /** Avoid these ids first (e.g. seen words for Slang Drop → unseen-first). */
  avoidIds?: Set<string>;
};

/**
 * Shuffle and take up to `count` words.
 * With preferIds: take from preferred bucket first, then fill from the rest.
 * With avoidIds: take from non-avoided first, then fill from avoided.
 */
export function pickSessionWords(
  words: SlangWord[],
  count: number,
  options?: PickSessionOptions,
): SlangWord[] {
  if (count <= 0 || words.length === 0) return [];

  const prefer = options?.preferIds;
  const avoid = options?.avoidIds;

  let primary: SlangWord[];
  let secondary: SlangWord[];

  if (prefer && prefer.size > 0) {
    primary = words.filter((w) => prefer.has(w.id));
    secondary = words.filter((w) => !prefer.has(w.id));
  } else if (avoid && avoid.size > 0) {
    primary = words.filter((w) => !avoid.has(w.id));
    secondary = words.filter((w) => avoid.has(w.id));
  } else {
    return shuffle(words).slice(0, Math.min(count, words.length));
  }

  const picked = [
    ...shuffle(primary),
    ...shuffle(secondary),
  ].slice(0, Math.min(count, words.length));

  return picked;
}
