export type AppLanguageId =
  | "turkish"
  | "spanish"
  | "french"
  | "azerbaijani"
  | "italian";

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
    id: "turkish",
    flag: "🇹🇷",
    name: "turkish",
    sub: "istanbul + anatolian",
    available: true,
  },
  {
    id: "spanish",
    flag: "🇪🇸",
    name: "spanish",
    sub: "mx, arg, spain",
    available: true,
  },
  {
    id: "french",
    flag: "🇫🇷",
    name: "french",
    sub: "paris + québec",
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
    id: "italian",
    flag: "🇮🇹",
    name: "italian",
    sub: "milan + southern",
    available: true,
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
