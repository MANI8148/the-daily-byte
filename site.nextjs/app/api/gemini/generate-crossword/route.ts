import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const PUZZLE_PROMPT = (words: unknown, issueTitle: string) =>
  `You are the Puzzle Master of 'The Daily Byte — Student AI & Tech Edition'.
The current issue's main headline theme is: "${issueTitle || "Artificial Intelligence & Neural Compute Breakout"}".

Create witty, clever, cryptic newspaper crossword clues for these tech terms: ${JSON.stringify(words || ["CYBER", "BYTES", "ROBOT", "CODES", "DATAS"])}.
Also create 3 short sudoku-variant trivia questions about AI history (each with 4 single-letter answer options A-D).

Respond with STRICT JSON only:
{
  "crosswordClues": [ { "word": "string (uppercase)", "clue": "string (cryptic)", "hint": "string (short)" } ],
  "sudokuClues": [ { "number": 1, "question": "string", "clue": "string (single letter answer, e.g. A)" } ]
}`;

export async function POST(req: NextRequest) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return NextResponse.json({ error: "GEMINI_API_KEY is not configured." }, { status: 503 });
  }
  const { words, issueTitle } = await req.json().catch(() => ({}));
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: PUZZLE_PROMPT(words, issueTitle) }] }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.95 },
      }),
    });
    if (!res.ok) return NextResponse.json({ error: `Gemini API ${res.status}` }, { status: 502 });
    const payload = await res.json();
    const text: string | undefined = payload?.candidates?.[0]?.content?.parts?.[0]?.text;
    const data = JSON.parse(text || "{}");
    return NextResponse.json(data);
  } catch (err) {
    console.error("generate-crossword error:", err);
    return NextResponse.json({ error: "Failed to generate crossword" }, { status: 500 });
  }
}