export type PersonaRole = "casual" | "warm" | "formal";

export type GenderHints = {
  female: string;
  male: string;
  neutral: string;
};

export type Persona = {
  role: PersonaRole;
  id: string;
  name: string;
  status: string;
  scenario: string;
  openers: string[];
  suggestedReplies: string[];
  systemPrompt: string;
  genderHints: GenderHints;
};

export type LanguagePersonaPack = {
  language: string;
  personas: Persona[];
  outputFormatNotes: string[];
  explainSystemNotes: string[];
};

export const PERSONA_ROLES: PersonaRole[] = ["casual", "warm", "formal"];
