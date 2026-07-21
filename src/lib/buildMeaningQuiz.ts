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

export function buildMeaningQuiz(words: SlangWord[]): MeaningQuiz | null {
  if (words.length < 2) return null; // need at least 1 distractor; ideally 3+

  const [word, ...rest] = pickRandom(words, Math.min(3, words.length));
  const distractors = rest.slice(0, 2);

  const options: QuizOption[] = pickRandom(
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
    options,
  };
}