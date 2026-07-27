import type { Dialect, SlangCategory, SlangWord } from "../data/types";
import { matchesDialect } from "./dialects";

export type ExploreTopicId = "slangDrop" | "vibeCheck" | "unpack";

export type ExploreTopic = {
  id: ExploreTopicId;
  tag: string;
  tagVariant: "purple" | "coral" | "teal";
  title: string;
  subtitle: string;
  route: "SlangDrop" | "VibeCheck" | "Unpack";
};

const TEASER_FALLBACKS: Record<
  string,
  { slang: string; vibe: string; unpack: string }
> = {
  turkish: {
    slang: "ya bro · eyw · kanka · lan",
    vibe: "aynen · kesinlikle · yok artık",
    unpack: "ya bro geliyom · eyw kral",
  },
  french: {
    slang: "mdr · wesh · grave · tkt",
    vibe: "ouf · relou · nickel · flemme",
    unpack: "tkt j'arrive · grave relou",
  },
  spanish: {
    slang: "qué onda · chido · wey · vale",
    vibe: "jajaja · no manches · qué fuerte",
    unpack: "qué onda wey · vale dale",
  },
  azerbaijani: {
    slang: "zəhmli · neynirsen · vallah · lap",
    vibe: "salam · maşallah · boşla",
    unpack: "neynirsen vallah · lap boşla",
  },
  italian: {
    slang: "raga · vabbè · boh · pazzesco",
    vibe: "che palle · top · una bomba",
    unpack: "raga boh · vabbè top",
  },
};

function joinWords(words: SlangWord[], count: number): string {
  return words
    .slice(0, count)
    .map((w) => w.word)
    .join(" · ");
}

function teasersFor(language: string, words: SlangWord[]) {
  const fallback = TEASER_FALLBACKS[language] ?? TEASER_FALLBACKS.turkish;
  if (words.length === 0) return fallback;

  const reactions = words.filter(
    (w) => w.category === "reaction" || w.category === "expression",
  );
  const withLines = words.filter((w) => w.exampleMessage.trim().length >= 8);

  return {
    slang: joinWords(words, 4) || fallback.slang,
    vibe:
      joinWords(reactions.length >= 3 ? reactions : words, 3) || fallback.vibe,
    unpack:
      withLines
        .slice(0, 2)
        .map((w) => w.exampleMessage)
        .join(" · ") || fallback.unpack,
  };
}

export function buildExploreTopics(
  language: string,
  words: SlangWord[],
): ExploreTopic[] {
  const teasers = teasersFor(language, words);
  return [
    {
      id: "slangDrop",
      tag: "✦ slang drop",
      tagVariant: "purple",
      title: "texting like a local",
      subtitle: teasers.slang,
      route: "SlangDrop",
    },
    {
      id: "vibeCheck",
      tag: "vibe check",
      tagVariant: "coral",
      title: "words that can backfire",
      subtitle: teasers.vibe,
      route: "VibeCheck",
    },
    {
      id: "unpack",
      tag: "unpack",
      tagVariant: "teal",
      title: "translate the slang line",
      subtitle: teasers.unpack,
      route: "Unpack",
    },
  ];
}

export const CATEGORY_CHIPS: { id: SlangCategory | "all"; label: string }[] = [
  { id: "all", label: "all" },
  { id: "slang", label: "slang" },
  { id: "expression", label: "expression" },
  { id: "contraction", label: "contraction" },
  { id: "filler", label: "filler" },
  { id: "reaction", label: "reaction" },
];

export function filterExploreWords(
  words: SlangWord[],
  query: string,
  category: SlangCategory | "all",
  dialect: Dialect | "all" = "all",
): SlangWord[] {
  const q = query.trim().toLocaleLowerCase();
  return words.filter((word) => {
    if (category !== "all" && word.category !== category) return false;
    if (!matchesDialect(word, dialect)) return false;
    if (!q) return true;
    const haystack = [
      word.word,
      word.romanization,
      word.meaning,
      word.culturalNote,
      word.dialect,
    ]
      .join(" ")
      .toLocaleLowerCase();
    return haystack.includes(q);
  });
}
