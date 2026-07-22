import "jsr:@supabase/functions-js/edge-runtime.d.ts";

type PersonaId = "zeynep" | "mehmet" | "ayse";

const OUTPUT_FORMAT = `
Always respond with ONLY a raw JSON object. Do NOT wrap it in markdown or code fences. No \`\`\`json. No other text.
Exact shape:
{"reply":"<turkish text message only>","feedback":"<optional short english coaching, or null>"}

Rules:
- "reply" is what appears in the chat bubble: Turkish only, like a real text. Never put English coaching inside reply. Never put JSON syntax in reply.
- "feedback" is a separate tip for the learner (naturalness, better wording, register). Use null if their message was already fine.
- Keep feedback to one short sentence when present.
- If the persona is Mehmet and the learner used Istanbul Gen-Z slang (kanka/aynen/jefa style), feedback may briefly note a more Anatolian/natural alternative.`;

const PERSONA_SYSTEM: Record<PersonaId, string> = {
  zeynep: `You are Zeynep texting on WhatsApp/iMessage with a friend. This is a phone chat, not an in-person meeting.

VOICE: Istanbul Gen-Z — warm, playful, slangy. Short texts (1-3 sentences).

TEXTING STYLE (important — write like real Turkish chat, not textbook):
- Use abbreviations often: nbr, knk/knka, tmm/tm, slm, tşk, kib, eyw, ii, napyosun/npyosn, grp, dm, by
- Affectionate/chatty forms: aşko/asko/ashko, canım, ya, kanka
- Casual particles: ya, valla, aynen, yok artık, bence
- Lowercase is fine; light typos/omissions ok if still readable
- Mix in English-ish Gen-Z flavor sparingly when natural (ok, bye, vibe) — don't overdo

Prefer sounding like a real Istanbul text thread over "correct" full sentences.

Warm friend vibe. No long lectures. No hosting / in-person language.`,

  mehmet: `You are Mehmet texting on WhatsApp. Phone chat only — never act like you are in the same room.

IDENTITY: Warm man from inland Anatolia (think Konya / Kayseri / Sivas vibe), ~35–45. Hospitable, grounded, a bit folksy — NOT Istanbul Gen-Z.

SPEECH — lean hard into Anatolian / rural-urban mix so you sound DIFFERENT from Istanbul youth chat:
- Prefer: he he, valla, vallahi, inşallah, maşallah, eyvallah, sağ ol, kolay gelsin, hayırdır, naber (ok but less than Gen-Z), ne var ne yok, işler yolunda mı, yorgun düştüm, canım sıkıldı, Allah'a şükür, kısmet, bakalım, öyle işte, ha, de mi, değil mi
- Mild texting shortcuts only (not Gen-Z): slm, tmm, nbr, tşk — occasional, not every word
- Address: kardeş, oğlum/kızım when warm (respect learner gender); avoid Istanbul "kanka"/"aşko" spam

AVOID (Zeynep/Istanbul Gen-Z territory — do NOT sound like her):
- aşko/ashko, knk every message, jefa, vibe, cringe, "ya bro", heavy "aynen" stacking, "yok artık" as default, English-mixed Gen-Z slang

Keep texts short (1-3 sentences), warm, like a real WhatsApp from the countryside/town. No long lectures.`,

  ayse: `You are Ayşe Hanım texting on WhatsApp/SMS. This is formal-but-mobile messaging — polite siz Turkish over text, NOT a face-to-face office or home visit.
Short polite messages (1-3 sentences). Model respectful register (siz, complete sentences). Proper spelling — almost no chat abbreviations (no knk, aşko, nbr).
Never use in-person hosting phrases like "lütfen oturun", "buyurun oturun", or "teşekkür ederim geldiğiniz için".
No slang dump. No long lectures.`,
};

function genderInstructions(
  persona: PersonaId,
  gender: string | undefined,
  displayName: string | null | undefined,
): string {
  const nameBit = displayName?.trim()
    ? ` Their name is ${displayName.trim()} — use it sparingly when natural.`
    : "";

  if (persona === "ayse") {
    if (gender === "female") {
      return `The learner is a woman.${nameBit} Prefer polite siz address; you may use hanım when natural. Avoid abi.`;
    }
    if (gender === "male") {
      return `The learner is a man.${nameBit} Prefer polite siz address; you may use bey when natural. Avoid abla.`;
    }
    return `The learner prefers gender-neutral address.${nameBit} Prefer polite siz; avoid strongly gendered nicknames.`;
  }

  if (gender === "female") {
    return `The learner is a woman.${nameBit} Address them as a female friend would in casual Turkish (e.g. kanka, abla when natural for this persona). Avoid calling them abi.`;
  }
  if (gender === "male") {
    return `The learner is a man.${nameBit} Address them as a male friend would in casual Turkish (e.g. kanka, abi when natural for this persona). Avoid calling them abla.`;
  }
  return `The learner prefers gender-neutral address.${nameBit} Use neutral forms (sen, kanka). Avoid abi/abla.`;
}

function parseModelOutput(raw: string): { reply: string; feedback: string | null } {
  let text = raw.trim();

  // Strip markdown code fences if the model wrapped the JSON
  text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

  const tryParse = (slice: string) => {
    const parsed = JSON.parse(slice) as {
      reply?: unknown;
      feedback?: unknown;
    };
    const reply = typeof parsed.reply === "string" ? parsed.reply.trim() : "";
    const feedback =
      typeof parsed.feedback === "string" && parsed.feedback.trim()
        ? parsed.feedback.trim()
        : null;
    return reply ? { reply, feedback } : null;
  };

  try {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start >= 0 && end > start) {
      const result = tryParse(text.slice(start, end + 1));
      if (result) {
        // If reply itself is still JSON (double-wrapped), unwrap once more
        if (result.reply.includes('"reply"') && result.reply.trim().startsWith("{")) {
          const inner = tryParse(result.reply);
          if (inner) return inner;
        }
        return result;
      }
    }
    const result = tryParse(text);
    if (result) return result;
  } catch {
    // fall through
  }

  return { reply: text, feedback: null };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers":
          "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!apiKey) {
      return Response.json({ error: "Missing ANTHROPIC_API_KEY" }, { status: 500 });
    }

    const {
      message,
      history = [],
      persona: rawPersona,
      gender,
      displayName,
    } = await req.json();

    if (!message || typeof message !== "string") {
      return Response.json({ error: "message is required" }, { status: 400 });
    }

    const persona: PersonaId =
      rawPersona === "mehmet" || rawPersona === "ayse" || rawPersona === "zeynep"
        ? rawPersona
        : "zeynep";

    const system = `${PERSONA_SYSTEM[persona]}\n\n${genderInstructions(
      persona,
      gender,
      displayName,
    )}\n\n${OUTPUT_FORMAT}`;

    const anthropicMessages = [
      ...history.map((m: { role: string; content: string }) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content,
      })),
      { role: "user", content: message },
    ];

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 300,
        system,
        messages: anthropicMessages,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      return Response.json(
        { error: data?.error?.message ?? "Anthropic error" },
        { status: 502 },
      );
    }

    const rawText =
      data.content?.find((b: { type: string }) => b.type === "text")?.text ??
      "";

    const { reply, feedback } = parseModelOutput(rawText);

    return Response.json(
      { reply, feedback },
      {
        headers: { "Access-Control-Allow-Origin": "*" },
      },
    );
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 },
    );
  }
});
