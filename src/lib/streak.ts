/** Local calendar day as YYYY-MM-DD (device timezone). */
export function todayLocalISO(now = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Whole days from `from` to `to` (both YYYY-MM-DD, local calendar). */
function daysBetween(from: string, to: string): number {
  const [fy, fm, fd] = from.split("-").map(Number);
  const [ty, tm, td] = to.split("-").map(Number);
  const a = new Date(fy, fm - 1, fd);
  const b = new Date(ty, tm - 1, td);
  return Math.round((b.getTime() - a.getTime()) / (24 * 60 * 60 * 1000));
}

export type StreakUpdate = {
  streak_days: number;
  last_active_date: string;
};

/**
 * Same day → keep streak.
 * Yesterday → +1.
 * Gap / first activity → reset to 1.
 */
export function nextStreak(
  streakDays: number,
  lastActiveDate: string | null | undefined,
  today = todayLocalISO(),
): StreakUpdate {
  if (!lastActiveDate) {
    return { streak_days: 1, last_active_date: today };
  }
  if (lastActiveDate === today) {
    return { streak_days: Math.max(streakDays, 1), last_active_date: today };
  }
  if (daysBetween(lastActiveDate, today) === 1) {
    return { streak_days: streakDays + 1, last_active_date: today };
  }
  return { streak_days: 1, last_active_date: today };
}
