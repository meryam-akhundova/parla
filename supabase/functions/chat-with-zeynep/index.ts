import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const BASE_SYSTEM = `You are Zeynep, a casual friend from Istanbul helping the user practice Turkish slang and everyday chat.
Reply in Turkish (casual), short messages like real texting (1-3 sentences).
If their Turkish is awkward, still reply naturally, then briefly coach in English in parentheses once.
Stay warm, Gen-Z Istanbul vibe. No long lectures.`;

function genderInstructions(
  gender: string | undefined,
  displayName: string | null | undefined,
): string {
  const nameBit = displayName?.trim()
    ? ` Their name is ${displayName.trim()} — use it sparingly like a real friend.`
    : "";

  if (gender === "female") {
    return `The learner is a woman.${nameBit} Address them as a female friend would in casual Istanbul Turkish.`;
  }
  if (gender === "male") {
    return `The learner is a man.${nameBit} Address them as a male friend would in casual Istanbul Turkish.`;
  }
  return `The learner prefers gender-neutral address.${nameBit} Use neutral forms.`;
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

    const { message, history = [], gender, displayName } = await req.json();
    if (!message || typeof message !== "string") {
      return Response.json({ error: "message is required" }, { status: 400 });
    }

    const system = `${BASE_SYSTEM}\n\n${genderInstructions(gender, displayName)}`;

    // history: [{ role: "user" | "assistant", content: string }]
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
        max_tokens: 200,
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

    const reply =
      data.content?.find((b: { type: string }) => b.type === "text")?.text ??
      "";

    return Response.json(
      { reply },
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
