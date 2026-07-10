import type { SlangWord } from "./types";

export const mockSlangWords: SlangWord[] = [
  {
    id: "1",
    word: "naber",
    romanization: "nah-behr",
    meaning: "what's up? (very casual)",
    exampleMessage: "selam naber?",
    exampleTranslation: "hey, what's up?",
    vibeFriends: "good",
    vibeStrangers: "caution",
    vibeFormal: "avoid",
    category: "slang",
    dialect: "istanbul",
    language: "turkish",
    similarWords: ["n'aber", "ne haber", "nbr"],
    culturalNote:
      'short for "ne haber" — super common with friends. fine with people your age, but too casual for bosses or strangers in formal settings.',
  },
  {
    id: "2",
    word: "aynen",
    romanization: "eye-nen",
    meaning: "exactly / totally agree",
    exampleMessage: "bugün çok yorucuydu ya\naynen öyle",
    exampleTranslation: "today was so exhausting\nexactly, same",
    vibeFriends: "good",
    vibeStrangers: "good",
    vibeFormal: "caution",
    category: "reaction",
    dialect: "general",
    language: "turkish",
    similarWords: ["kesinlikle", "harbiden"],
    culturalNote:
      'used constantly in chat to show you agree. feels natural in almost any conversation, but in a job interview you\'d say "kesinlikle" instead.',
  },
];
