export type VibeLevel = "good" | "caution" | "avoid";

export type SlangCategory =
  "slang" | "expression" | "contraction" | "filler" | "reaction";

/** Regional tag on a slang word — values vary by language. */
export type Dialect =
  | "istanbul"
  | "anatolian"
  | "general"
  | "spain"
  | "mexico"
  | "argentina"
  | "paris"
  | "quebec"
  | "milan"
  | "southern"
  | "baku"
  | "regional"
  | (string & {});

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
  language: "turkish" | "french" | "spanish" | "azerbaijani" | "italian";
  similarWords: string[];
  culturalNote: string;
  /** True when the entry is a swear / strong profanity. */
  isSwear: boolean;
  /** Public URL for ear-training clip; null until audio is uploaded. */
  audioUrl: string | null;
}
