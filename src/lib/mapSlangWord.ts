import type { Dialect, SlangCategory, SlangWord, VibeLevel } from "../data/types";

export type SlangWordRow = {
    id: string;
    word: string;
    romanization: string;
    meaning: string;
    example_message: string;
    example_translation: string;
    vibe_friends: string;
    vibe_strangers: string;
    vibe_formal: string;
    category: string;
    dialect: string;
    language: string;
    similar_words: string[] | null;
    cultural_note: string;
    is_swear?: boolean | null;
    audio_url?: string | null;
};

export function mapSlangWord(row: SlangWordRow): SlangWord {
    return {
        id: row.id,
        word: row.word ?? "",
        romanization: row.romanization ?? "",
        meaning: row.meaning ?? "",
        exampleMessage: row.example_message ?? "",
        exampleTranslation: row.example_translation ?? "",
        vibeFriends: row.vibe_friends as VibeLevel,
        vibeStrangers: row.vibe_strangers as VibeLevel,
        vibeFormal: row.vibe_formal as VibeLevel,
        category: row.category as SlangCategory,
        dialect: (row.dialect as Dialect) || "general",
        language: row.language as SlangWord["language"],
        similarWords: row.similar_words ?? [],
        culturalNote: row.cultural_note ?? "",
        isSwear: Boolean(row.is_swear),
        audioUrl:
          typeof row.audio_url === "string" && row.audio_url.trim()
            ? row.audio_url.trim()
            : null,
    };
}