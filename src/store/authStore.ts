import { create } from "zustand";
import type { Session } from "@supabase/supabase-js";
import { normalizeLanguages } from "../data/languages";
import { supabase } from "../lib/supabase";
import { nextStreak } from "../lib/streak";

export type UserGender = "female" | "male" | "neutral";

type Profile = {
  id: string;
  display_name: string | null;
  language: string | null;
  /** Enrolled languages; always starts as one item from onboarding. */
  languages: string[];
  goal: string | null;
  pace: string | null;
  gender: UserGender | null;
  /** When true, practice + chat may teach swear / strong-profanity words. */
  include_swear_words: boolean;
  onboarding_completed: boolean;
  streak_days: number;
  shine_score: number;
  words_learned: number;
  last_active_date: string | null;
};

function normalizeProfile(row: Omit<Profile, "languages" | "include_swear_words"> & {
  languages?: string[] | null;
  include_swear_words?: boolean | null;
}): Profile {
  return {
    ...row,
    languages: normalizeLanguages(row.languages, row.language),
    include_swear_words: Boolean(row.include_swear_words),
  };
}

type OnboardingDraft = {
  language: string;
  goal: string;
  pace: string;
  gender: UserGender;
  includeSwearWords: boolean;
};

type AuthState = {
  session: Session | null;
  profile: Profile | null;
  initialized: boolean;
  draft: OnboardingDraft;
  profileLoaded: boolean;
  setSession: (session: Session | null) => void;
  setInitialized: (value: boolean) => void;
  setDraft: (partial: Partial<OnboardingDraft>) => void;
  loadProfile: () => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<string | null>;
  signIn: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  saveOnboarding: () => Promise<string | null>;
  awardQuizSuccess: () => Promise<string | null>;
  awardSlangDropComplete: () => Promise<string | null>;
  updateGender: (gender: UserGender) => Promise<string | null>;
  updateIncludeSwearWords: (include: boolean) => Promise<string | null>;
  setActiveLanguage: (language: string) => Promise<string | null>;
  addLanguage: (language: string) => Promise<string | null>;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  profile: null,
  initialized: false,
  draft: {
    language: "turkish",
    goal: "connect",
    pace: "steady",
    gender: "neutral",
    includeSwearWords: false,
  },
  profileLoaded: false,

  setSession: (session) => set({ session }),
  setInitialized: (initialized) => set({ initialized }),
  setDraft: (partial) => set({ draft: { ...get().draft, ...partial } }),

  loadProfile: async () => {
    const userId = get().session?.user.id;
    if (!userId) {
      set({ profile: null, profileLoaded: true });
      return;
    }
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    set({
      profile: data ? normalizeProfile(data) : null,
      profileLoaded: true,
    });
  },

  signUp: async (email, password, displayName) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { display_name: displayName } },
      });
      return error?.message ?? null; // null = success
    } catch (e) {
      const message = e instanceof Error ? e.message : "sign up failed";
      return message === "Network request failed"
        ? "can't reach the server — check your connection and restart expo"
        : message;
    }
  },

  signIn: async (email, password) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return error?.message ?? null;
    } catch (e) {
      const message = e instanceof Error ? e.message : "sign in failed";
      return message === "Network request failed"
        ? "can't reach the server — check your connection and restart expo"
        : message;
    }
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, profile: null, profileLoaded: false });
  },

  saveOnboarding: async () => {
    const userId = get().session?.user.id;
    if (!userId) return "Not signed in";
    const { draft } = get();
    // Start with exactly one language; more can be added later from Profile.
    const languages = [draft.language];
    const { error } = await supabase
      .from("profiles")
      .update({
        language: draft.language,
        languages,
        goal: draft.goal,
        pace: draft.pace,
        gender: draft.gender,
        include_swear_words: draft.includeSwearWords,
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);
    if (error) return error.message;
    await get().loadProfile();
    return null;
  },

  updateGender: async (gender) => {
    const userId = get().session?.user.id;
    const { profile } = get();
    if (!userId || !profile) return "Not signed in";
    if (profile.gender === gender) return null;

    // Optimistic — chip updates before the network round-trip
    set({ profile: { ...profile, gender } });

    const { error } = await supabase
      .from("profiles")
      .update({
        gender,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) {
      set({ profile }); // revert
      return error.message;
    }
    await get().loadProfile();
    return null;
  },

  updateIncludeSwearWords: async (include) => {
    const userId = get().session?.user.id;
    const { profile } = get();
    if (!userId || !profile) return "Not signed in";
    if (profile.include_swear_words === include) return null;

    set({ profile: { ...profile, include_swear_words: include } });

    const { error } = await supabase
      .from("profiles")
      .update({
        include_swear_words: include,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) {
      set({ profile });
      return error.message;
    }
    await get().loadProfile();
    return null;
  },

  setActiveLanguage: async (language) => {
    const userId = get().session?.user.id;
    const { profile } = get();
    if (!userId || !profile) return "Not signed in";
    if (profile.language === language) return null;
    if (!profile.languages.includes(language)) {
      return "Add this language before switching to it";
    }

    set({ profile: { ...profile, language } });

    const { error } = await supabase
      .from("profiles")
      .update({
        language,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) {
      set({ profile });
      return error.message;
    }
    await get().loadProfile();
    return null;
  },

  addLanguage: async (language) => {
    const userId = get().session?.user.id;
    const { profile } = get();
    if (!userId || !profile) return "Not signed in";

    const alreadyEnrolled = profile.languages.includes(language);
    if (alreadyEnrolled && profile.language === language) return null;

    const languages = alreadyEnrolled
      ? profile.languages
      : [...profile.languages, language];

    set({ profile: { ...profile, language, languages } });

    const { error } = await supabase
      .from("profiles")
      .update({
        language,
        languages,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) {
      set({ profile });
      return error.message;
    }
    await get().loadProfile();
    return null;
  },

  awardQuizSuccess: async () => {
    const { session, profile } = get();
    const userId = session?.user.id;
    if (!userId || !profile) return "Not signed in";

    const streak = nextStreak(profile.streak_days, profile.last_active_date);

    const { error } = await supabase
      .from("profiles")
      .update({
        shine_score: profile.shine_score + 10,
        streak_days: streak.streak_days,
        last_active_date: streak.last_active_date,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) return error.message;
    await get().loadProfile();
    return null;
  },

  /** Shine + streak only — words_learned is owned by markWordsSeen. */
  awardSlangDropComplete: async () => {
    const { session, profile } = get();
    const userId = session?.user.id;
    if (!userId || !profile) return "Not signed in";

    const streak = nextStreak(profile.streak_days, profile.last_active_date);

    const { error } = await supabase
      .from("profiles")
      .update({
        shine_score: profile.shine_score + 10,
        streak_days: streak.streak_days,
        last_active_date: streak.last_active_date,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) return error.message;
    await get().loadProfile();
    return null;
  },
}));