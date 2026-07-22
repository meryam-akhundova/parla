import type { SlangWord } from "../data/types";

export type QuizOption = {
  id: string;
  label: string;
  correct: boolean;
};

export type MeaningQuiz = {
  word: SlangWord;
  question: string;
  prompt: string;
  scenarioLabel: string;
  scenarioText: string;
  options: QuizOption[];
};

/** Pick `count` items from `items` without mutating the original. */
function pickRandom<T>(items: T[], count: number): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, count);
}

export function buildMeaningQuiz(
  words: SlangWord[],
  options?: { targetId?: string },
): MeaningQuiz | null {
  if (words.length < 2) return null; // need at least 1 distractor; ideally 3+

  let word: SlangWord;
  let distractors: SlangWord[];

  if (options?.targetId) {
    const target = words.find((w) => w.id === options.targetId);
    if (!target) return null;
    word = target;
    distractors = pickRandom(
      words.filter((w) => w.id !== target.id),
      Math.min(2, words.length - 1),
    );
  } else {
    const picked = pickRandom(words, Math.min(3, words.length));
    word = picked[0];
    distractors = picked.slice(1, 3);
  }

  const quizOptions: QuizOption[] = pickRandom(
    [
      { id: "correct", label: word.meaning, correct: true },
      ...distractors.map((d, i) => ({
        id: `wrong-${i}`,
        label: d.meaning,
        correct: false,
      })),
    ],
    1 + distractors.length,
  );

  return {
    word,
    question: `what does "${word.word}" mean?`,
    prompt: "pick the closest meaning",
    scenarioLabel: "📱 in a message:",
    scenarioText: `"${word.exampleMessage}"`,
    options: quizOptions,
  };
}