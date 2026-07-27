export type PersonaId = "zeynep" | "mehmet" | "ayse";

export type Persona = {
  id: PersonaId;
  name: string;
  status: string;
  scenario: string;
  openers: string[];
  /** Starter reply chips shown before the model returns suggestions. */
  suggestedReplies: string[];
};

export const PERSONAS: Persona[] = [
  {
    id: "zeynep",
    name: "zeynep",
    status: "casual · istanbul turkish",
    scenario: "scenario: your friend is venting about a bad day",
    openers: [
      "ya knk bugün bittim — jefa son dk iş yağdırdı",
      "aşko kahve şart, gün berbat geçti",
      "nbr duydun mu yarın plan iptal olmuş ya",
      "aklıma takıldı — sence 'aynen' her yerde olur mu?",
      "ya bu trafikte eridim neredesin",
      "bişey sorcam: 'yok artık' ne zaman fazla kaçar?",
    ],
    suggestedReplies: [
      "ya anladım knk",
      "valla mı?",
      "gel bi kahve içelim",
    ],
  },
  {
    id: "mehmet",
    name: "mehmet",
    status: "warm · anatolian turkish",
    scenario: "scenario: texting a friendly anatolian guy (regional vibe)",
    openers: [
      "he he naber, işler yolunda mı oralarda?",
      "valla bugün yorgun düştüm ha, sen ne yaptın?",
      "selam kardeş, aklıma geldin — ne var ne yok?",
      "kolay gelsin, günün nasıl geçti?",
      "memlekette hava güzel vallahi, senin orası nasıl?",
      "hayırdır, uzun zamandır yazmamıştın — iyisin inşallah?",
    ],
    suggestedReplies: [
      "iyiyiz vallahi, sen nasılsın?",
      "kolay gelsin",
      "eyvallah kardeş",
    ],
  },
  {
    id: "ayse",
    name: "ayşe hanım",
    status: "formal · polite turkish",
    scenario: "scenario: practicing polite texting (siz forms)",
    openers: [
      "Merhaba, nasılsınız? Umarım gününüz iyi geçiyordur.",
      "İyi günler. Size kısa bir mesaj yazmak istedim.",
      "Merhaba — müsait misiniz, bir şey sormak istiyorum.",
      "İyi akşamlar. Nasılsınız bugün?",
      "Merhaba, umarım rahatsız etmiyorum. Nasılsınız?",
    ],
    suggestedReplies: [
      "Merhaba, iyiyim teşekkür ederim.",
      "Tabii, buyurun.",
      "Ben de iyiyim, siz nasılsınız?",
    ],
  },
];

export function getPersona(id: PersonaId): Persona {
  return PERSONAS.find((p) => p.id === id) ?? PERSONAS[0];
}

export function pickOpener(persona: Persona): string {
  return persona.openers[Math.floor(Math.random() * persona.openers.length)];
}
