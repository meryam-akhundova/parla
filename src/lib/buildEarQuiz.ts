import type { SlangWord } from "../data/types";

export type EarQuizOption = {
  id: string;
  label: string;
  correct: boolean;
};

export type EarQuiz = {
  word: SlangWord;
  stimulus: string;
  question: string;
  prompt: string;
  options: EarQuizOption[];
};

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function pickRandom<T>(items: T[], count: number): T[] {
  return shuffle(items).slice(0, count);
}

/** Prefer the word itself for chatty forms; else the example message. */
export function earStimulus(word: SlangWord): string {
  const w = word.word.trim();
  const chattyCategory =
    word.category === "contraction" || word.category === "filler";

  if (chattyCategory || w.length <= 14) return w;
  const msg = word.exampleMessage.trim();
  return msg || w;
}

function buildOptions(correct: string, distractors: string[]): EarQuizOption[] | null {
  const correctLabel = correct.trim();
  if (!correctLabel) return null;

  const seen = new Set([correctLabel.toLocaleLowerCase("en")]);
  const wrong: string[] = [];
  for (const d of distractors) {
    const label = d.trim();
    const key = label.toLocaleLowerCase("en");
    if (!label || seen.has(key)) continue;
    seen.add(key);
    wrong.push(label);
    if (wrong.length >= 2) break;
  }
  if (wrong.length < 1) return null;

  return shuffle([
    { id: "correct", label: correctLabel, correct: true },
    ...wrong.map((label, i) => ({
      id: `wrong-${i}`,
      label,
      correct: false,
    })),
  ]);
}

function buildMeaningQuiz(word: SlangWord, pool: SlangWord[]): EarQuiz | null {
  const distractors = pickRandom(
    pool.filter((w) => w.id !== word.id),
    4,
  ).map((w) => w.meaning);

  const options = buildOptions(word.meaning, distractors);
  if (!options) return null;

  return {
    word,
    stimulus: earStimulus(word),
    question: "what does this mean?",
    prompt: "catch the flow — pick the closest meaning",
    options,
  };
}

function buildUnpackQuiz(word: SlangWord, pool: SlangWord[]): EarQuiz | null {
  const correct = word.exampleTranslation.trim() || word.meaning.trim();
  const distractors = pickRandom(
    pool.filter((w) => w.id !== word.id),
    4,
  ).map((w) => w.exampleTranslation.trim() || w.meaning.trim());

  const options = buildOptions(correct, distractors);
  if (!options) return null;

  return {
    word,
    stimulus: earStimulus(word),
    question: "what are they saying?",
    prompt: "unpack the fast / chatty form",
    options,
  };
}

/**
 * Build one decode-the-flow quiz question (text stimulus, no audio yet).
 */
export function buildEarQuiz(
  words: SlangWord[],
  options?: { targetId?: string },
): EarQuiz | null {
  if (words.length < 2) return null;

  let word: SlangWord;
  if (options?.targetId) {
    const target = words.find((w) => w.id === options.targetId);
    if (!target) return null;
    word = target;
  } else {
    word = pickRandom(words, 1)[0];
  }

  const builders = [
    () => buildMeaningQuiz(word, words),
    () => buildUnpackQuiz(word, words),
  ];

  const order = shuffle([0, 1]);
  for (const i of order) {
    const quiz = builders[i]();
    if (quiz) return quiz;
  }

  return buildMeaningQuiz(word, words);
}

/** Prefer contraction/filler words when the pool has enough. */
export function earPreferredPool(words: SlangWord[], minCount = 3): SlangWord[] {
  const focused = words.filter(
    (w) => w.category === "contraction" || w.category === "filler",
  );
  return focused.length >= minCount ? focused : words;
}
