import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { chatRequestSchema } from "@/lib/validation";
import { checkRateLimit } from "@/lib/rateLimit";

const MAX_RESPONSE_BYTES = 10 * 1024;

function getClientIp() {
  const headerList = headers();
  const forwardedFor = headerList.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? "unknown";
  }
  return headerList.get("x-real-ip") ?? "unknown";
}

function trimToByteSize(text: string, maxBytes: number) {
  const encoder = new TextEncoder();
  let result = text;
  while (encoder.encode(result).length > maxBytes) {
    result = result.slice(0, Math.max(0, result.length - 1));
  }
  return result;
}

export async function POST(request: Request) {
  const ip = getClientIp();
  const rateLimit = checkRateLimit(ip);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Rate limit überschritten. Bitte kurz warten." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterMs) } }
    );
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Ungültiges JSON." }, { status: 400 });
  }

  const parsed = chatRequestSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  const { message } = parsed.data;
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    const dummy = `Dummy-Antwort (kein OPENAI_API_KEY gesetzt). Du sagtest: "${message}"`;
    const reply = trimToByteSize(dummy, MAX_RESPONSE_BYTES);
    return NextResponse.json({ reply });
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: message }
      ],
      temperature: 0.2
    })
  });

  if (!response.ok) {
    return NextResponse.json({ error: "OpenAI request fehlgeschlagen." }, { status: 502 });
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const replyText = payload.choices?.[0]?.message?.content ?? "Keine Antwort.";
  const reply = trimToByteSize(replyText, MAX_RESPONSE_BYTES);

  return NextResponse.json({ reply });
}
