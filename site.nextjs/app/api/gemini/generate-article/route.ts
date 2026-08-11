import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const ARTICLE_PROMPT = (topic: string, section: string) =>
  `You are the Editor-in-Chief of 'The Daily Byte — Student AI & Tech Edition', a prestigious print newspaper in the style of classic 19th/20th-century journalism mixed with cutting-edge technology.

Write a compelling, articulate front-page style article on the topic: "${topic || "Breakthroughs in Autonomous Neural Architecture"}".
Section: ${section || "AI & Tech Innovations"}
Write like a seasoned globe-trotting newspaper correspondent: rich, vivid, insightful prose for a global student audience. Include one standout pull-quote and 3 punchy key takeaways.

Respond with STRICT JSON only:
{
  "title": "string (short, punchy, newspaper headline)",
  "subtitle": "string (one sentence deck)",
  "author": "string (byline, e.g. By Amelia Chang, Byte Correspondent)",
  "section": "string",
  "date": "YYYY-MM-DD",
  "leadParagraph": "string (1-2 sentences)",
  "bodyParagraphs": ["string", "string", "string"],
  "pullQuote": "string",
  "keyTakeaways": ["string", "string", "string"],
  "imagePrompt": "string (DALL-E-style prompt for an illustration)"
}`;

export async function POST(req: NextRequest) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return NextResponse.json({ error: "GEMINI_API_KEY is not configured." }, { status: 503 });
  }
  const { topic, section } = await req.json().catch(() => ({}));
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: ARTICLE_PROMPT(topic, section) }] }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.9 },
      }),
    });
    if (!res.ok) return NextResponse.json({ error: `Gemini API ${res.status}` }, { status: 502 });
    const payload = await res.json();
    const text: string | undefined = payload?.candidates?.[0]?.content?.parts?.[0]?.text;
    const data = JSON.parse(text || "{}");
    return NextResponse.json(data);
  } catch (err) {
    console.error("generate-article error:", err);
    return NextResponse.json({ error: "Failed to generate article" }, { status: 500 });
  }
}