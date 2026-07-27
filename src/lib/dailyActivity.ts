import { supabase } from "./supabase";
import { todayLocalISO } from "./streak";
import { useAuthStore } from "../store/authStore";
import { sessionSizeFromPace } from "./sessionSize";

export type DailyActivity = {
  slang_done: number;
  vibe_done: number;
  ear_done: number;
};

export type LessonKind = "slang" | "vibe" | "ear";

export type HomeLessonProgress = {
  slang: number; // 0–1
  vibe: number;
  ear: number;
  slangDone: number;
  vibeDone: number;
  earDone: number;
  target: number;
  dueCount: number;
};

const EMPTY: DailyActivity = {
  slang_done: 0,
  vibe_done: 0,
  ear_done: 0,
};

export async function fetchTodayActivity(): Promise<{
  activity: DailyActivity;
  error: string | null;
}> {
  const userId = useAuthStore.getState().session?.user.id;
  if (!userId) return { activity: EMPTY, error: "Not signed in" };

  const day = todayLocalISO();
  const { data, error } = await supabase
    .from("user_daily_activity")
    .select("slang_done, vibe_done, ear_done")
    .eq("user_id", userId)
    .eq("activity_date", day)
    .maybeSingle();

  if (error) return { activity: EMPTY, error: error.message };
  if (!data) return { activity: EMPTY, error: null };

  return {
    activity: {
      slang_done: data.slang_done ?? 0,
      vibe_done: data.vibe_done ?? 0,
      ear_done: data.ear_done ?? 0,
    },
    error: null,
  };
}

/** Increment today's counter for a lesson type (by 1). */
export async function bumpDailyActivity(
  kind: LessonKind,
  by = 1,
): Promise<string | null> {
  const userId = useAuthStore.getState().session?.user.id;
  if (!userId) return "Not signed in";

  const day = todayLocalISO();
  const { activity } = await fetchTodayActivity();

  const next: DailyActivity = { ...activity };
  if (kind === "slang") next.slang_done += by;
  if (kind === "vibe") next.vibe_done += by;
  if (kind === "ear") next.ear_done += by;

  const { error } = await supabase.from("user_daily_activity").upsert(
    {
      user_id: userId,
      activity_date: day,
      slang_done: next.slang_done,
      vibe_done: next.vibe_done,
      ear_done: next.ear_done,
    },
    { onConflict: "user_id,activity_date" },
  );

  return error?.message ?? null;
}

export function homeProgressFromActivity(
  activity: DailyActivity,
  pace: string | null | undefined,
  dueCount = 0,
): HomeLessonProgress {
  const target = sessionSizeFromPace(pace);
  const clamp = (n: number) => Math.min(1, Math.max(0, n / Math.max(1, target)));

  return {
    slang: clamp(activity.slang_done),
    vibe: clamp(activity.vibe_done),
    ear: clamp(activity.ear_done),
    slangDone: activity.slang_done,
    vibeDone: activity.vibe_done,
    earDone: activity.ear_done,
    target,
    dueCount,
  };
}
