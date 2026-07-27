/** First letter of display name for avatar (fallback: "?"). */
export function avatarInitialFromName(
  name: string | null | undefined,
): string {
  const trimmed = name?.trim();
  if (!trimmed) return "?";
  return trimmed.charAt(0).toLocaleUpperCase();
}
