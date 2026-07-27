import { azerbaijaniPack } from "./azerbaijani.ts";
import { frenchPack } from "./french.ts";
import { italianPack } from "./italian.ts";
import { spanishPack } from "./spanish.ts";
import { turkishPack } from "./turkish.ts";
import type {
  LanguagePersonaPack,
  Persona,
  PersonaRole,
} from "./types.ts";

export type { LanguagePersonaPack, Persona, PersonaRole } from "./types.ts";

const PACKS: Record<string, LanguagePersonaPack> = {
  turkish: turkishPack,
  french: frenchPack,
  spanish: spanishPack,
  azerbaijani: azerbaijaniPack,
  italian: italianPack,
};

export function getPack(language: string): LanguagePersonaPack {
  return PACKS[language] ?? turkishPack;
}

export function getPersona(
  language: string,
  role: string,
): Persona {
  const pack = getPack(language);
  const personas = pack.personas;
  const match = personas.find((p) => p.role === role);
  return match ?? personas[0];
}

export function isPersonaRole(value: unknown): value is PersonaRole {
  return value === "casual" || value === "warm" || value === "formal";
}

export function buildOutputFormat(pack: LanguagePersonaPack): string {
  const lang = pack.language;
  const notes = pack.outputFormatNotes.map((n) => `- ${n}`).join("\n");
  return `
Always respond with ONLY a raw JSON object. Do NOT wrap it in markdown or code fences. No \`\`\`json. No other text.
Exact shape:
{"reply":"<${lang} text message only>","feedback":"<optional short english coaching, or null>","suggestions":["<short ${lang} reply option>", "<...>", "<...>"]}

Rules:
- "reply" is what appears in the chat bubble: ${lang} only, like a real text. Never put English coaching inside reply. Never put JSON syntax in reply.
- "feedback" is a separate tip for the learner (naturalness, better wording, register). Use null if their message was already fine.
- Keep feedback to one short sentence when present.
- "suggestions" is 2–3 short ${lang} replies the learner could send next (same register as this persona). No English. Keep each under ~40 characters.
${notes}`;
}

export function buildExplainSystem(pack: LanguagePersonaPack): string {
  const lang = pack.language;
  const notes = pack.explainSystemNotes.map((n) => `- ${n}`).join("\n");
  return `You help language learners understand ${lang} chat slang and abbreviations.
Given one ${lang} WhatsApp-style message, extract slang, abbreviations, particles, and culturally loaded phrases.
Respond with ONLY raw JSON (no markdown fences):
{"items":[{"term":"<exact form from the message>","meaning":"<short english gloss>","note":"<one short tip on when/how it's used>"}]}

Rules:
- Only include terms that need explaining for a learner (skip plain function words unless slangy).
- Prefer 1–6 items. If nothing slangy, return {"items":[]}.
- Keep meanings/notes concise.
- If the user lists "already explained" terms, do NOT repeat those (or close variants). Only return additional unknowns.
${notes}`;
}

export function genderInstructions(
  persona: Persona,
  gender: string | undefined,
  displayName: string | null | undefined,
): string {
  const nameBit = displayName?.trim()
    ? ` Their name is ${displayName.trim()} — use it sparingly when natural.`
    : "";
  const key =
    gender === "female" || gender === "male" ? gender : "neutral";
  return `The learner's preferred address style: ${key}.${nameBit} ${persona.genderHints[key]}`;
}

export function swearInstructions(includeSwearWords: boolean): string {
  if (includeSwearWords) {
    return `The learner opted in to learning swear words and strong profanity. You may use and teach them when they fit this persona's register, and briefly coach when a word is too harsh for the situation.`;
  }
  return `Content boundary: do NOT use swear words, strong profanity, or slurs in reply, feedback, or suggestions. Keep slang casual but clean. If the learner uses a swear word, you may briefly note register without repeating or teaching the swear.`;
}
