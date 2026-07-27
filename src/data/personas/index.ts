import { azerbaijaniPack } from "./azerbaijani";
import { frenchPack } from "./french";
import { italianPack } from "./italian";
import { spanishPack } from "./spanish";
import { turkishPack } from "./turkish";
import type {
  LanguagePersonaPack,
  Persona,
  PersonaRole,
} from "./types";

export type { GenderHints, LanguagePersonaPack, Persona, PersonaRole } from "./types";
export { PERSONA_ROLES } from "./types";

export const personasByLanguage: Record<string, LanguagePersonaPack> = {
  turkish: turkishPack,
  french: frenchPack,
  spanish: spanishPack,
  azerbaijani: azerbaijaniPack,
  italian: italianPack,
};

export function getPersonaPack(language: string): LanguagePersonaPack {
  return personasByLanguage[language] ?? turkishPack;
}

export function getPersonas(language: string): Persona[] {
  return getPersonaPack(language).personas;
}

export function getPersona(
  language: string,
  role: PersonaRole = "casual",
): Persona {
  const personas = getPersonas(language);
  return personas.find((p) => p.role === role) ?? personas[0];
}

export function pickOpener(persona: Persona): string {
  return persona.openers[Math.floor(Math.random() * persona.openers.length)];
}

/** @deprecated Prefer getPersonas(language) */
export const PERSONAS = turkishPack.personas;
