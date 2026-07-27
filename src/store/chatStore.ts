import { create } from "zustand";
import {
  getPersona,
  pickOpener,
  type PersonaRole,
} from "../data/personas";

export type UiMessage =
  | { id: string; role: "them" | "you"; text: string }
  | { id: string; role: "badge"; text: string };

export function threadKey(language: string, role: PersonaRole): string {
  return `${language}:${role}`;
}

export function makeOpenerMessage(
  language: string,
  role: PersonaRole,
): UiMessage {
  const persona = getPersona(language, role);
  return {
    id: `opener-${language}-${role}-${Date.now()}`,
    role: "them",
    text: pickOpener(persona),
  };
}

type ChatUiState = {
  /** Session-only — resets when the app process dies */
  selectedRole: PersonaRole;
  threads: Record<string, UiMessage[]>;
  setRole: (role: PersonaRole) => void;
  setMessages: (
    updater: UiMessage[] | ((prev: UiMessage[]) => UiMessage[]),
    language: string,
    role?: PersonaRole,
  ) => void;
  resetThread: (language: string, role?: PersonaRole) => void;
  getThread: (language: string, role?: PersonaRole) => UiMessage[];
};

export const useChatStore = create<ChatUiState>((set, get) => ({
  selectedRole: "casual",
  threads: {},

  setRole: (role) => set({ selectedRole: role }),

  getThread: (language, role) => {
    const { selectedRole, threads } = get();
    const key = threadKey(language, role ?? selectedRole);
    return threads[key] ?? [];
  },

  setMessages: (updater, language, role) => {
    const { selectedRole, threads } = get();
    const r = role ?? selectedRole;
    const key = threadKey(language, r);
    const prev = threads[key] ?? [];
    const next = typeof updater === "function" ? updater(prev) : updater;
    set({
      threads: {
        ...threads,
        [key]: next,
      },
    });
  },

  resetThread: (language, role) => {
    const { selectedRole, threads } = get();
    const key = threadKey(language, role ?? selectedRole);
    set({
      threads: {
        ...threads,
        [key]: [],
      },
    });
  },
}));
