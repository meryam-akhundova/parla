import type { SlangWord, VibeLevel } from "../data/types";

export type VibeQuizOption = {
  id: string;
  label: string;
  correct: boolean;
};

export type VibeQuiz = {
  word: SlangWord;
  question: string;
  prompt: string;
  scenarioLabel: string;
  scenarioText: string;
  options: VibeQuizOption[];
};

const LEVEL_LABEL: Record<VibeLevel, string> = {
  good: "totally fine",
  caution: "use caution",
  avoid: "avoid",
};

const LEVEL_RANK: Record<VibeLevel, number> = {
  good: 2,
  caution: 1,
  avoid: 0,
};

type Setting = "friends" | "strangers" | "formal";

const SETTING_LABEL: Record<Setting, string> = {
  friends: "friends",
  strangers: "strangers",
  formal: "formal",
};

function vibeForSetting(word: SlangWord, setting: Setting): VibeLevel {
  if (setting === "friends") return word.vibeFriends;
  if (setting === "strangers") return word.vibeStrangers;
  return word.vibeFormal;
}

function safestSetting(word: SlangWord): Setting {
  const settings: Setting[] = ["friends", "strangers", "formal"];
  return settings.reduce((best, next) =>
    LEVEL_RANK[vibeForSetting(word, next)] > LEVEL_RANK[vibeForSetting(word, best)]
      ? next
      : best,
  );
}

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

function buildContextVerdict(word: SlangWord): VibeQuiz {
  const settings: Setting[] = ["friends", "strangers", "formal"];
  const setting = settings[Math.floor(Math.random() * settings.length)];
  const correctLevel = vibeForSetting(word, setting);

  const scenarioBySetting: Record<Setting, string> = {
    friends: "you're texting a close friend",
    strangers: "you're texting a stranger",
    formal: "you're messaging someone formally",
  };

  const levels: VibeLevel[] = ["good", "caution", "avoid"];
  const options = shuffle(
    levels.map((level) => ({
      id: level,
      label: LEVEL_LABEL[level],
      correct: level === correctLevel,
    })),
  );

  return {
    word,
    question: `is "${word.word}" okay here?`,
    prompt: "pick the right vibe",
    scenarioLabel: "✦ vibe check",
    scenarioText: scenarioBySetting[setting],
    options,
  };
}

function buildSafestSetting(word: SlangWord): VibeQuiz {
  const correct = safestSetting(word);
  const settings: Setting[] = ["friends", "strangers", "formal"];
  const options = shuffle(
    settings.map((setting) => ({
      id: setting,
      label: SETTING_LABEL[setting],
      correct: setting === correct,
    })),
  );

  return {
    word,
    question: `where is "${word.word}" safest?`,
    prompt: "pick the most natural setting",
    scenarioLabel: "✦ vibe check",
    scenarioText: `"${word.exampleMessage}"`,
    options,
  };
}

function buildPickSafeWord(
  word: SlangWord,
  pool: SlangWord[],
): VibeQuiz | null {
  const others = pool.filter((w) => w.id !== word.id);
  if (others.length < 2) return null;

  // Prefer a target that is actually good (or at least caution) in formal
  let target = word;
  if (word.vibeFormal === "avoid") {
    const safer = pool.find((w) => w.vibeFormal === "good")
      ?? pool.find((w) => w.vibeFormal === "caution");
    if (safer) target = safer;
  }

  const distractors = pickRandom(
    pool.filter(
      (w) =>
        w.id !== target.id &&
        LEVEL_RANK[w.vibeFormal] < LEVEL_RANK[target.vibeFormal],
    ),
    2,
  );

  // If we couldn't find worse distractors, fall back to any other words
  const filled =
    distractors.length >= 2
      ? distractors
      : pickRandom(
          pool.filter((w) => w.id !== target.id),
          2,
        );

  if (filled.length < 2) return null;

  const options = shuffle([
    { id: target.id, label: target.word, correct: true },
    ...filled.map((d, i) => ({
      id: `wrong-${i}`,
      label: d.word,
      correct: false,
    })),
  ]);

  return {
    word: target,
    question: "which word is safest here?",
    prompt: "pick the one that fits the vibe",
    scenarioLabel: "✦ vibe check",
    scenarioText: "you're messaging a professor",
    options,
  };
}

/**
 * Build one register-focused quiz question.
 * Uses `target` when provided; otherwise picks from the pool.
 */
export function buildVibeQuiz(
  words: SlangWord[],
  options?: { targetId?: string },
): VibeQuiz | null {
  if (words.length < 1) return null;

  let word: SlangWord;
  if (options?.targetId) {
    const target = words.find((w) => w.id === options.targetId);
    if (!target) return null;
    word = target;
  } else {
    word = pickRandom(words, 1)[0];
  }

  const builders = [
    () => buildContextVerdict(word),
    () => buildSafestSetting(word),
    () => buildPickSafeWord(word, words),
  ];

  // Try a random type; fall back through the list if one can't be built
  const order = shuffle([0, 1, 2]);
  for (const i of order) {
    const quiz = builders[i]();
    if (quiz) return quiz;
  }

  return buildContextVerdict(word);
}
