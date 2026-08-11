import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Google GenAI client lazily or safely
function getAiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

// API Routes

// 1. Generate custom newspaper article in vintage editorial style
app.post("/api/gemini/generate-article", async (req, res) => {
  try {
    const { topic, section, tone } = req.body;
    const ai = getAiClient();
    
    if (!ai) {
      return res.status(500).json({ error: "Gemini API key is not configured." });
    }

    const prompt = `You are the Editor-in-Chief of 'The Daily Byte — Student AI & Tech Edition', a prestigious print newspaper published in a style reminiscent of classic 19th/20th-century journalistic standards mixed with cutting-edge futuristic technology.

Write a compelling, articulate front-page style article on the topic: "${topic || "Breakthroughs in Autonomous Neural Architecture"}".
Section: ${section || "AI & Tech Innovations"}
Tone: ${tone || "In-depth investigative journalism"}

Return JSON matching this exact structure:
- title: Headline string (dramatic, authoritative, e.g. "MACHINES ACQUIRE ABSTRACT REASONING")
- subtitle: Subhead string summarizing the thesis
- author: Journalist name and credential (e.g. "Dr. Arthur Vance, Senior Cybernetics Correspondent")
- section: Category name
- date: Current date string
- leadParagraph: Dramatic opening paragraph with historic weight
- bodyParagraphs: Array of 3-4 detailed paragraphs discussing technical facts, societal impact, and future outlook
- pullQuote: An inspiring or provocative quote from an expert
- keyTakeaways: Array of 3 short bullet points summarizing key findings
- imagePrompt: A detailed description for a vintage engraving/woodcut style or retro-futuristic photo illustration.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            subtitle: { type: Type.STRING },
            author: { type: Type.STRING },
            section: { type: Type.STRING },
            date: { type: Type.STRING },
            leadParagraph: { type: Type.STRING },
            bodyParagraphs: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            pullQuote: { type: Type.STRING },
            keyTakeaways: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            imagePrompt: { type: Type.STRING }
          },
          required: ["title", "subtitle", "author", "section", "leadParagraph", "bodyParagraphs", "pullQuote", "keyTakeaways"]
        }
      }
    });

    const data = JSON.parse(response.text || "{}");
    res.json(data);
  } catch (error: any) {
    console.error("Error generating article:", error);
    res.status(500).json({ error: error.message || "Failed to generate article" });
  }
});

// 2. Reply to 'Letters to the Editor' in classic newspaper voice
app.post("/api/gemini/editorial-reply", async (req, res) => {
  try {
    const { letter, articleTitle } = req.body;
    const ai = getAiClient();
    
    if (!ai) {
      return res.status(500).json({ error: "Gemini API key is not configured." });
    }

    const prompt = `You are the Editor-in-Chief of 'The Daily Byte'. A reader wrote the following letter regarding the article "${articleTitle}":

Reader Letter: "${letter}"

Write an elegant, witty, and authoritative Editorial Response signed 'The Editor' addressing their points with journalistic poise and wisdom. Limit to 120 words.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt
    });

    res.json({ reply: response.text });
  } catch (error: any) {
    console.error("Error in editorial reply:", error);
    res.status(500).json({ error: error.message || "Failed to draft editorial response" });
  }
});

// 3. AI News Summary / Daily Briefing
app.post("/api/gemini/summarize-news", async (req, res) => {
  try {
    const { articles } = req.body;
    const ai = getAiClient();

    if (!ai) {
      return res.status(500).json({ error: "Gemini API key is not configured." });
    }

    const summaryPrompt = `Generate a 3-bullet executive summary and an 'Outlook for Tomorrow' paragraph for today's AI & Tech Gazette issue based on these headlines:
${JSON.stringify(articles)}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: summaryPrompt
    });

    res.json({ summary: response.text });
  } catch (error: any) {
    console.error("Error summarizing news:", error);
    res.status(500).json({ error: error.message || "Failed to generate news summary" });
  }
});

// 4. Generate AI Cryptic Crossword Clues & Tech Sudoku Trivia based on Issue Headlines
app.post("/api/gemini/generate-crossword", async (req, res) => {
  try {
    const { issueTitle, words } = req.body;
    const ai = getAiClient();

    if (!ai) {
      return res.status(500).json({ error: "Gemini API key is not configured." });
    }

    const targetWords = words || ["CYBER", "BYTES", "ROBOT", "CODES", "DATAS"];

    const prompt = `You are the Puzzle Master of 'The Daily Byte — Student AI & Tech Edition'.
The current issue's main headline theme is: "${issueTitle || "Artificial Intelligence & Neural Compute Breakout"}".

Create witty, clever, cryptic newspaper crossword clues for these tech terms: ${JSON.stringify(targetWords)}.
Each clue should have standard cryptic crossword flair (clever double entendre, anagram, or wordplay related to AI/tech).

Also create 4 tech trivia clues for a Sudoku puzzle (answers 1, 2, 3, 4).

Return JSON with this schema:
- crosswordClues: Array of objects for each word:
  - word: string (e.g. "CYBER")
  - clue: string (e.g. "Virtual space scrambled by early hacker (5)")
  - hint: string (e.g. "Prefix for online domain")
- sudokuClues: Array of 4 objects:
  - number: number (1 to 4)
  - question: string (e.g. "Binary value representing TRUE state")
  - clue: string (short hint)`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            crosswordClues: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  word: { type: Type.STRING },
                  clue: { type: Type.STRING },
                  hint: { type: Type.STRING }
                },
                required: ["word", "clue", "hint"]
              }
            },
            sudokuClues: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  number: { type: Type.NUMBER },
                  question: { type: Type.STRING },
                  clue: { type: Type.STRING }
                },
                required: ["number", "question", "clue"]
              }
            }
          },
          required: ["crosswordClues", "sudokuClues"]
        }
      }
    });

    const data = JSON.parse(response.text || "{}");
    res.json(data);
  } catch (error: any) {
    console.error("Error generating crossword:", error);
    res.status(500).json({ error: error.message || "Failed to generate crossword" });
  }
});

async function startServer() {
  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
