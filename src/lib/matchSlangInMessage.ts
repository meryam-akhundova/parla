import type { SlangWord } from "../data/types";
import type { SlangExplainItem } from "./chat";

function normalize(text: string): string {
  return text.toLocaleLowerCase("tr-TR").normalize("NFC");
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Match a slang form as its own term (not inside another word). */
function termPattern(form: string): RegExp {
  return new RegExp(`(?<![\\p{L}\\p{N}])${escapeRegExp(form)}(?![\\p{L}\\p{N}])`, "gu");
}

const STOPWORDS = new Set(
  [
    "ben",
    "sen",
    "o",
    "biz",
    "siz",
    "bu",
    "şu",
    "ne",
    "mi",
    "mı",
    "mu",
    "mü",
    "de",
    "da",
    "ki",
    "ve",
    "ama",
    "çok",
    "var",
    "yok",
    "için",
    "gibi",
    "ile",
    "olan",
    "bana",
    "sana",
    "onu",
    "bizi",
    "sizi",
    "beni",
    "seni",
    "nasıl",
    "nasılsın",
    "nasılsınız",
    "neden",
    "neyse",
    "evet",
    "hayır",
    "tamam",
    "iyi",
    "iyiyim",
    "günaydın",
    "merhaba",
    "selam",
    "teşekkürler",
    "teşekkür",
    "lütfen",
    "bugün",
    "yarın",
    "şimdi",
    "biraz",
    "daha",
    "her",
    "hiç",
    "bir",
    "şey",
    "şeyi",
    "olur",
    "olmaz",
    "gel",
    "geldim",
    "geliyorum",
    "gidiyorum",
    "bence",
    "sence",
    "yani",
    "zaten",
    "belki",
    "tabii",
    "tabi",
    "peki",
    "hadi",
    "bakalım",
    "inşallah",
    "maşallah",
    "allah",
    "the",
    "and",
    "you",
    "are",
    "ok",
    "okay",
  ].map(normalize),
);

/**
 * Find slang_words (and similar_words) that appear in the message.
 * Longer phrases win first. Matched spans are stripped into `residual`.
 */
export function matchSlangInMessage(
  message: string,
  words: SlangWord[],
): { items: SlangExplainItem[]; residual: string } {
  let residual = normalize(message);
  const items: SlangExplainItem[] = [];
  const seen = new Set<string>();

  const sorted = [...words].sort((a, b) => {
    const aLen = Math.max(
      a.word.length,
      ...a.similarWords.map((s) => s.length),
      0,
    );
    const bLen = Math.max(
      b.word.length,
      ...b.similarWords.map((s) => s.length),
      0,
    );
    return bLen - aLen;
  });

  for (const word of sorted) {
    const forms = [word.word, ...word.similarWords]
      .map((f) => normalize(f.trim()))
      .filter(Boolean)
      .sort((a, b) => b.length - a.length);

    let matched = false;
    for (const form of forms) {
      const re = termPattern(form);
      if (!re.test(residual)) continue;
      residual = residual.replace(termPattern(form), " ");
      matched = true;
      break;
    }

    if (!matched) continue;

    const key = normalize(word.word);
    if (seen.has(key)) continue;
    seen.add(key);

    items.push({
      term: word.word,
      meaning: word.meaning,
      note: word.culturalNote?.trim() ?? "",
    });
  }

  residual = residual.replace(/\s+/g, " ").trim();
  return { items, residual };
}

/** Whether leftover text still looks like it may contain slang/abbreviations. */
export function residualLikelyHasSlang(residual: string): boolean {
  if (!residual.trim()) return false;

  const tokens = normalize(residual)
    .split(/[^\p{L}\p{N}]+/u)
    .filter((t) => t.length >= 2);

  return tokens.some((token) => {
    if (STOPWORDS.has(token)) return false;
    // Short leftovers are often chat slang / abbreviations.
    if (token.length <= 6) return true;
    // Longer leftovers with digits or latin-only slangy look.
    if (/\d/.test(token)) return true;
    return false;
  });
}
