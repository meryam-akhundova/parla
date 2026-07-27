import { create } from "zustand";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { nextStreak } from "../lib/streak";

export type UserGender = "female" | "male" | "neutral";

type Profile = {
  id: string;
  display_name: string | null;
  language: string | null;
  goal: string | null;
  pace: string | null;
  gender: UserGender | null;
  onboarding_completed: boolean;
  streak_days: number;
  shine_score: number;
  words_learned: number;
  last_active_date: string | null;
};

type OnboardingDraft = {
  language: string;
  goal: string;
  pace: string;
  gender: UserGender;
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
  awardSlangDropComplete: (count: number) => Promise<string | null>;
  updateGender: (gender: UserGender) => Promise<string | null>;
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
    set({ profile: data, profileLoaded: true });
  },

  signUp: async (email, password, displayName) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    });
    return error?.message ?? null; // null = success
  },

  signIn: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error?.message ?? null;
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, profile: null, profileLoaded: false });
  },

  saveOnboarding: async () => {
    const userId = get().session?.user.id;
    if (!userId) return "Not signed in";
    const { draft } = get();
    const { error } = await supabase
      .from("profiles")
      .update({
        language: draft.language,
        goal: draft.goal,
        pace: draft.pace,
        gender: draft.gender,
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

  awardQuizSuccess: async () => {
    const { session, profile } = get();
    const userId = session?.user.id;
    if (!userId || !profile) return "Not signed in";

    const streak = nextStreak(profile.streak_days, profile.last_active_date);

    const { error } = await supabase
      .from("profiles")
      .update({
        shine_score: profile.shine_score + 10,
        words_learned: profile.words_learned + 1,
        streak_days: streak.streak_days,
        last_active_date: streak.last_active_date,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) return error.message;
    await get().loadProfile();
    return null;
  },

  awardSlangDropComplete: async (count) => {
    const { session, profile } = get();
    const userId = session?.user.id;
    if (!userId || !profile) return "Not signed in";
    if (count <= 0) return null;

    const streak = nextStreak(profile.streak_days, profile.last_active_date);

    const { error } = await supabase
      .from("profiles")
      .update({
        shine_score: profile.shine_score + 10,
        words_learned: profile.words_learned + count,
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