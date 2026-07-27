import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import {
  buildExplainSystem,
  buildOutputFormat,
  genderInstructions,
  getPack,
  getPersona,
  isPersonaRole,
  swearInstructions,
} from "./packs/index.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function stripFences(raw: string): string {
  return raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

function parseSuggestions(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((s): s is string => typeof s === "string" && s.trim().length > 0)
    .map((s) => s.trim())
    .slice(0, 3);
}

function parseModelOutput(raw: string): {
  reply: string;
  feedback: string | null;
  suggestions: string[];
} {
  let text = stripFences(raw);

  const tryParse = (slice: string) => {
    const parsed = JSON.parse(slice) as {
      reply?: unknown;
      feedback?: unknown;
      suggestions?: unknown;
    };
    const reply = typeof parsed.reply === "string" ? parsed.reply.trim() : "";
    const feedback =
      typeof parsed.feedback === "string" && parsed.feedback.trim()
        ? parsed.feedback.trim()
        : null;
    const suggestions = parseSuggestions(parsed.suggestions);
    return reply ? { reply, feedback, suggestions } : null;
  };

  try {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start >= 0 && end > start) {
      const result = tryParse(text.slice(start, end + 1));
      if (result) {
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

  return { reply: text, feedback: null, suggestions: [] };
}

function parseExplainOutput(
  raw: string,
): { term: string; meaning: string; note: string }[] {
  let text = stripFences(raw);
  try {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start >= 0 && end > start) text = text.slice(start, end + 1);
    const parsed = JSON.parse(text) as {
      items?: { term?: unknown; meaning?: unknown; note?: unknown }[];
    };
    if (!Array.isArray(parsed.items)) return [];
    return parsed.items
      .map((item) => ({
        term: typeof item.term === "string" ? item.term.trim() : "",
        meaning: typeof item.meaning === "string" ? item.meaning.trim() : "",
        note: typeof item.note === "string" ? item.note.trim() : "",
      }))
      .filter((item) => item.term && item.meaning);
  } catch {
    return [];
  }
}

async function callAnthropic(
  apiKey: string,
  system: string,
  userMessage: string,
  maxTokens: number,
) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: maxTokens,
      system,
      messages: [{ role: "user", content: userMessage }],
    }),
  });
  const data = await res.json();
  return { res, data };
}

/** Map legacy persona ids from older clients onto roles. */
function legacyPersonaToRole(persona: unknown): string | null {
  if (persona === "zeynep") return "casual";
  if (persona === "mehmet") return "warm";
  if (persona === "ayse" || persona === "ayse_hanim") return "formal";
  return null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!apiKey) {
      return Response.json({ error: "Missing ANTHROPIC_API_KEY" }, { status: 500 });
    }

    const body = await req.json();
    const { message, action } = body;

    if (!message || typeof message !== "string") {
      return Response.json({ error: "message is required" }, { status: 400 });
    }

    const language =
      typeof body.language === "string" && body.language.trim()
        ? body.language.trim()
        : "turkish";
    const pack = getPack(language);

    // Tap-to-explain slang in a bubble (unknowns only — app already matched slang_words)
    if (action === "explain") {
      const knownTerms = Array.isArray(body.knownTerms)
        ? body.knownTerms.filter((t: unknown) => typeof t === "string" && t.trim())
        : [];
      const knownBlock =
        knownTerms.length > 0
          ? `\n\nAlready explained (do not repeat): ${knownTerms.join(", ")}`
          : "";
      const { res, data } = await callAnthropic(
        apiKey,
        buildExplainSystem(pack),
        `Explain slang/abbreviations in this message:\n\n${message}${knownBlock}`,
        500,
      );
      if (!res.ok) {
        return Response.json(
          { error: data?.error?.message ?? "Anthropic error" },
          { status: 502 },
        );
      }
      const rawText =
        data.content?.find((b: { type: string }) => b.type === "text")?.text ??
        "";
      const items = parseExplainOutput(rawText);
      return Response.json({ items }, { headers: corsHeaders });
    }

    const {
      history = [],
      role: rawRole,
      persona: rawPersona,
      gender,
      displayName,
      includeSwearWords,
    } = body;

    const role = isPersonaRole(rawRole)
      ? rawRole
      : legacyPersonaToRole(rawPersona) ?? "casual";
    const persona = getPersona(language, role);
    const allowSwears = includeSwearWords === true;

    const system = `${persona.systemPrompt}\n\n${genderInstructions(
      persona,
      gender,
      displayName,
    )}\n\n${swearInstructions(allowSwears)}\n\n${buildOutputFormat(pack)}`;

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

    const { reply, feedback, suggestions } = parseModelOutput(rawText);

    return Response.json(
      { reply, feedback, suggestions },
      { headers: corsHeaders },
    );
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 },
    );
  }
});
