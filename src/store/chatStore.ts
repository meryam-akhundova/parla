import { create } from "zustand";
import {
  getPersona,
  pickOpener,
  type PersonaId,
} from "../data/personas";

export type UiMessage =
  | { id: string; role: "them" | "you"; text: string }
  | { id: string; role: "badge"; text: string };

export function makeOpenerMessage(personaId: PersonaId): UiMessage {
  const persona = getPersona(personaId);
  return {
    id: `opener-${personaId}-${Date.now()}`,
    role: "them",
    text: pickOpener(persona),
  };
}

function emptyThreads(): Record<PersonaId, UiMessage[]> {
  return {
    zeynep: [],
    mehmet: [],
    ayse: [],
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
  resetThread: (personaId?: PersonaId) => void;
};

export const useChatStore = create<ChatUiState>((set, get) => ({
  selectedPersona: "zeynep",
  threads: emptyThreads(),

  setPersona: (id) => set({ selectedPersona: id }),

  setMessages: (updater, personaId) => {
    const { selectedPersona, threads } = get();
    const id = personaId ?? selectedPersona;
    const prev = threads[id] ?? [];
    const next = typeof updater === "function" ? updater(prev) : updater;
    set({
      threads: {
        ...threads,
        [id]: next,
      },
    });
  },

  resetThread: (personaId) => {
    const { selectedPersona, threads } = get();
    const id = personaId ?? selectedPersona;
    set({
      threads: {
        ...threads,
        [id]: [],
      },
    });
  },
}));
