import { NextRequest } from "next/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "AI service not configured" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  let body: { messages?: { role: string; content: string }[]; prompt?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid request body" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  let messages: { role: string; content: string }[];
  if (body.messages && Array.isArray(body.messages) && body.messages.length > 0) {
    messages = body.messages;
  } else if (body.prompt && typeof body.prompt === "string") {
    messages = [{ role: "user", content: body.prompt }];
  } else {
    return new Response(
      JSON.stringify({ error: "Missing messages or prompt" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const upstream = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages,
      max_tokens: 1024,
      temperature: 0.7,
    }),
  });

  if (!upstream.ok) {
    const err = await upstream.text();
    console.log("Groq error:", upstream.status, err);
    return new Response(
      JSON.stringify({ error: "AI error", detail: err }),
      { status: upstream.status, headers: { "Content-Type": "application/json" } }
    );
  }

  const json = await upstream.json() as {
    choices?: { message?: { content?: string } }[];
  };
  const text = json.choices?.[0]?.message?.content ?? "";

  return new Response(JSON.stringify({ text }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}