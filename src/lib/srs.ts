/** Lightweight SM-2–style scheduling for slang review. */

export type SrsGrade = "again" | "good";

export type SrsState = {
  ease_factor: number;
  interval_days: number;
  repetitions: number;
  due_at: string; // ISO
  correct_count: number;
  wrong_count: number;
};

const MIN_EASE = 1.3;

export function defaultSrsState(now = new Date()): SrsState {
  return {
    ease_factor: 2.5,
    interval_days: 0,
    repetitions: 0,
    due_at: now.toISOString(),
    correct_count: 0,
    wrong_count: 0,
  };
}

function addDays(from: Date, days: number): Date {
  const d = new Date(from.getTime());
  d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
  return d;
}

function addMinutes(from: Date, minutes: number): Date {
  const d = new Date(from.getTime());
  d.setTime(d.getTime() + minutes * 60 * 1000);
  return d;
}

/**
 * Apply a review grade and return the next SRS fields.
 * - again: reset reps, short delay (~10 min), bump wrong_count
 * - good: advance interval (1 → 3 → ease×prev days), bump correct_count
 */
export function nextSrsState(
  prev: Partial<SrsState> | null | undefined,
  grade: SrsGrade,
  now = new Date(),
): SrsState {
  const base = {
    ...defaultSrsState(now),
    ...prev,
    ease_factor: prev?.ease_factor ?? 2.5,
    interval_days: prev?.interval_days ?? 0,
    repetitions: prev?.repetitions ?? 0,
    correct_count: prev?.correct_count ?? 0,
    wrong_count: prev?.wrong_count ?? 0,
  };

  if (grade === "again") {
    return {
      ease_factor: Math.max(MIN_EASE, base.ease_factor - 0.2),
      interval_days: 0,
      repetitions: 0,
      due_at: addMinutes(now, 10).toISOString(),
      correct_count: base.correct_count,
      wrong_count: base.wrong_count + 1,
    };
  }

  const repetitions = base.repetitions + 1;
  let interval_days: number;
  if (repetitions === 1) interval_days = 1;
  else if (repetitions === 2) interval_days = 3;
  else {
    interval_days = Math.max(
      1,
      Math.round(base.interval_days * base.ease_factor),
    );
  }

  const ease_factor = Math.min(3.0, base.ease_factor + 0.1);

  return {
    ease_factor,
    interval_days,
    repetitions,
    due_at: addDays(now, interval_days).toISOString(),
    correct_count: base.correct_count + 1,
    wrong_count: base.wrong_count,
  };
}

/** Weak if more wrongs than rights, or due now with prior failures. */
export function isWeakWord(row: {
  correct_count?: number | null;
  wrong_count?: number | null;
}): boolean {
  const wrong = row.wrong_count ?? 0;
  const right = row.correct_count ?? 0;
  return wrong > right || (wrong > 0 && right === 0);
}
