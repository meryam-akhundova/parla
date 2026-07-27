import type { SlangWord } from "../data/types";

/**
 * How we will play ear-training audio.
 * - url: clip from slang_words.audio_url (Storage/CDN)
 * - tts: future device/cloud TTS over the stimulus text
 * - none: no source yet
 */
export type EarAudioSource =
  | { kind: "url"; uri: string }
  | { kind: "tts"; text: string }
  | { kind: "none" };

/** Pick the best available audio source for a quiz item. */
export function resolveEarAudio(
  word: SlangWord,
  stimulus: string,
): EarAudioSource {
  if (word.audioUrl) {
    return { kind: "url", uri: word.audioUrl };
  }
  // When TTS ships, prefer: return { kind: "tts", text: stimulus };
  void stimulus;
  return { kind: "none" };
}

export function earAudioAvailable(source: EarAudioSource): boolean {
  return source.kind === "url" || source.kind === "tts";
}

/**
 * Play ear-training audio.
 * Wire expo-audio / expo-av (url) or Speech.speak (tts) here later.
 */
export async function playEarAudio(
  source: EarAudioSource,
): Promise<{ ok: boolean; error: string | null }> {
  if (source.kind === "none") {
    return { ok: false, error: "audio coming soon" };
  }

  if (source.kind === "url") {
    // TODO: play remote clip with expo-audio, e.g.
    // const player = createAudioPlayer({ uri: source.uri });
    // player.play();
    void source.uri;
    return { ok: false, error: "playback not wired yet" };
  }

  // TODO: Speech.speak(source.text, { language: "tr-TR" });
  void source.text;
  return { ok: false, error: "tts not wired yet" };
}
