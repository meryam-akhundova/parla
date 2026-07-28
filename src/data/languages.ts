export type AppLanguageId =
  | "turkish"
  | "spanish"
  | "french"
  | "azerbaijani"
  | "italian"
  | "portuguese"
  | "german"
  | "russian";

export type AppLanguage = {
  id: AppLanguageId;
  flag: string;
  name: string;
  sub: string;
  /** Has slang_words content and can be enrolled. */
  available: boolean;
};

export const APP_LANGUAGES: AppLanguage[] = [
  {
    id: "french",
    flag: "🇫🇷",
    name: "french",
    sub: "paris + québec",
    available: true,
  },
  {
    id: "spanish",
    flag: "🇪🇸",
    name: "spanish",
    sub: "mexico + spain",
    available: true,
  },
  {
    id: "italian",
    flag: "🇮🇹",
    name: "italian",
    sub: "northern + southern",
    available: true,
  },
  {
    id: "turkish",
    flag: "🇹🇷",
    name: "turkish",
    sub: "istanbul + anatolian",
    available: true,
  },
  {
    id: "azerbaijani",
    flag: "🇦🇿",
    name: "azerbaijani",
    sub: "baku + regional",
    available: true,
  },
  {
    id: "portuguese",
    flag: "🇧🇷",
    name: "portuguese",
    sub: "coming soon",
    available: false,
  },
  {
    id: "german",
    flag: "🇩🇪",
    name: "german",
    sub: "coming soon",
    available: false,
  },
  {
    id: "russian",
    flag: "🇷🇺",
    name: "russian",
    sub: "coming soon",
    available: false,
  },
];

export function languageMeta(id: string): AppLanguage | undefined {
  return APP_LANGUAGES.find((l) => l.id === id);
}

export function normalizeLanguages(
  languages: string[] | null | undefined,
  active: string | null | undefined,
): string[] {
  if (Array.isArray(languages) && languages.length > 0) {
    return languages;
  }
  return [active?.trim() || "turkish"];
}
