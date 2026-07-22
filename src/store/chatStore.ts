import { create } from "zustand";
import {
  getPersona,
  pickOpener,
  type Persona,
  type PersonaId,
} from "../data/personas";

export type UiMessage =
  | { id: string; role: "them" | "you"; text: string }
  | { id: string; role: "badge"; text: string };

function starterMessages(persona: Persona): UiMessage[] {
  return [{ id: `opener-${persona.id}`, role: "them", text: pickOpener(persona) }];
}

function emptyThreads(): Record<PersonaId, UiMessage[]> {
  return {
    zeynep: starterMessages(getPersona("zeynep")),
    mehmet: starterMessages(getPersona("mehmet")),
    ayse: starterMessages(getPersona("ayse")),
  };
}

type ChatUiState = {
  /** Session-only — resets when the app process dies */
  selectedPersona: PersonaId;
  threads: Record<PersonaId, UiMessage[]>;
  setPersona: (id: PersonaId) => void;
  setMessages: (
    updater: UiMessage[] | ((prev: UiMessage[]) => UiMessage[]),
    personaId?: PersonaId,
  ) => void;
};

export const useChatStore = create<ChatUiState>((set, get) => ({
  selectedPersona: "zeynep",
  threads: emptyThreads(),

  setPersona: (id) => set({ selectedPersona: id }),

  setMessages: (updater, personaId) => {
    const { selectedPersona, threads } = get();
    const id = personaId ?? selectedPersona;
    const prev = threads[id] ?? starterMessages(getPersona(id));
    const next = typeof updater === "function" ? updater(prev) : updater;
    set({
      threads: {
        ...threads,
        [id]: next,
      },
    });
  },
}));
