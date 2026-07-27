/** Session length from onboarding pace. Fallback: steady. */
export function sessionSizeFromPace(pace: string | null | undefined): number {
  if (pace === "quick") return 3;
  if (pace === "full") return 8;
  return 5; // steady or unknown
}
