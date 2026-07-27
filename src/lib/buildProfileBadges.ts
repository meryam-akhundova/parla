export type ProfileBadge = {
  icon: string;
  label: string;
  earned: boolean;
};

type BadgeProfile = {
  shine_score: number;
  streak_days: number;
  pace: string | null;
  languages?: string[] | null;
  words_learned?: number | null;
  include_swear_words?: boolean | null;
};

export type BadgeExtras = {
  hasChatted?: boolean;
  bookmarkedCount?: number;
  weakRecovered?: number;
  totalCorrect?: number;
  dialectCount?: number;
  fillerSeen?: number;
  dueClearedToday?: boolean;
};

/**
 * Derive achievement badges from profile + optional progress extras.
 * No new badge tables — unlocks are computed on the fly.
 */
export function buildProfileBadges(
  profile: BadgeProfile | null | undefined,
  extras: BadgeExtras | boolean = {},
): ProfileBadge[] {
  // Back-compat: second arg used to be `hasChatted: boolean`
  const e: BadgeExtras =
    typeof extras === "boolean" ? { hasChatted: extras } : extras;

  const shine = profile?.shine_score ?? 0;
  const streak = profile?.streak_days ?? 0;
  const pace = profile?.pace ?? null;
  const languageCount = profile?.languages?.length ?? 1;
  const words = profile?.words_learned ?? 0;
  const hasChatted = e.hasChatted === true;
  const bookmarks = e.bookmarkedCount ?? 0;
  const recovered = e.weakRecovered ?? 0;
  const correct = e.totalCorrect ?? 0;
  const dialects = e.dialectCount ?? 0;
  const fillers = e.fillerSeen ?? 0;

  return [
    { icon: "✦", label: "first shine", earned: shine >= 10 },
    { icon: "🔥", label: "7-day streak", earned: streak >= 7 },
    { icon: "💬", label: "first chat", earned: hasChatted },
    { icon: "🌍", label: "polyglot", earned: languageCount >= 2 },
    {
      icon: "✨",
      label: "full shine",
      earned: pace === "full" || shine >= 100,
    },
    { icon: "📚", label: "50 words", earned: words >= 50 },
    { icon: "📌", label: "collector", earned: bookmarks >= 3 },
    { icon: "🗺️", label: "dialect hopper", earned: dialects >= 2 },
    { icon: "💪", label: "bounce back", earned: recovered >= 1 },
    { icon: "🎯", label: "vibe sensei", earned: correct >= 20 },
    { icon: "🫧", label: "filler fan", earned: fillers >= 5 },
    {
      icon: "🌶️",
      label: "spice unlocked",
      earned: profile?.include_swear_words === true && words >= 1,
    },
  ];
}
