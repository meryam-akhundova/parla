export type VibeLevel = "good" | "caution" | "avoid";

export type SlangCategory =
  "slang" | "expression" | "contraction" | "filler" | "reaction";

export type Dialect = "istanbul" | "anatolian" | "general";

export interface SlangWord {
  id: string;
  word: string;
  romanization: string;
  meaning: string;
  exampleMessage: string;
  exampleTranslation: string;
  vibeFriends: VibeLevel;
  vibeStrangers: VibeLevel;
  vibeFormal: VibeLevel;
  category: SlangCategory;
  dialect: Dialect;
  language: "turkish";
  similarWords: string[];
  culturalNote: string;
  /** Public URL for ear-training clip; null until audio is uploaded. */
  audioUrl: string | null;
}
