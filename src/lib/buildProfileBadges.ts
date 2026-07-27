export type ProfileBadge = {
  icon: string;
  label: string;
  earned: boolean;
};

type BadgeProfile = {
  shine_score: number;
  streak_days: number;
  pace: string | null;
};

/**
 * Derive achievement badges from profile (+ optional chat activity).
 * No new DB tables — unlocks are computed on the fly.
 */
export function buildProfileBadges(
  profile: BadgeProfile | null | undefined,
  hasChatted: boolean,
): ProfileBadge[] {
  const shine = profile?.shine_score ?? 0;
  const streak = profile?.streak_days ?? 0;
  const pace = profile?.pace ?? null;

  return [
    { icon: "✦", label: "first shine", earned: shine >= 10 },
    { icon: "🔥", label: "7-day streak", earned: streak >= 7 },
    { icon: "💬", label: "first chat", earned: hasChatted },
    { icon: "🌍", label: "polyglot", earned: false }, // multi-language later
    {
      icon: "✨",
      label: "full shine",
      earned: pace === "full" || shine >= 100,
    },
  ];
}
