#!/usr/bin/env node
/**
 * Bloggy → THE DAILY BYTE content bridge.
 * Reads the pipeline's markdown files in ../content/*.md (frontmatter +
 * body, the exact files the worker writes and the git-PR review gates) and
 * emits src/data/generated-content.ts so the vintage front page renders the
 * real pipeline dispatches. Runs automatically as `prebuild` / `predev`.
 */
import { readdirSync, readFileSync, writeFileSync, mkdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const CONTENT_DIR = join(here, "..", "..", "content");
const OUT_DIR = join(here, "..", "src", "data");
const OUT_FILE = join(OUT_DIR, "generated-content.ts");

const SECTIONS = ["AI & ML", "Tech", "Open Source", "GitHub", "Dev Skills"];

function mapSection(kicker = "") {
  const k = kicker.toUpperCase();
  // AI / ML family
  if (k.includes("AI") || k.includes("ML") || k.includes("LLM") || k.includes("MODEL") || k.includes("NEURAL") || k.includes("GEMINI") || k.includes("OPENAI") || k.includes("GPT")) return "AI & ML";
  // Security / crypto / quantum -> Tech (UI has no dedicated security bucket)
  if (k.includes("SECUR") || k.includes("CYBER") || k.includes("CRYPTO") || k.includes("QUANTUM") || k.includes("HARDWARE") || k.includes("CHIP") || k.includes("ROBOT") || k.includes("HEALTH TECH") || k.includes("FINANCE")) return "Tech";
  // Open source
  if (k.includes("OPEN SOURCE") || k.includes("OSS")) return "Open Source";
  // GitHub
  if (k.includes("GITHUB") || k.includes("REPO")) return "GitHub";
  // Dev skills
  if (k.includes("SKILL") || k.includes("GUIDE") || k.includes("HOW") || k.includes("CAREER") || k.includes("TUTORIAL") || k.includes("LEARN")) return "Dev Skills";
  return "AI & ML";
}

function parseFrontmatter(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return { fm: {}, body: raw };
  const fm = {};
  for (const line of m[1].split("\n")) {
    const kv = line.match(/^([A-Za-z_]+):\s*(.*)$/);
    if (!kv) continue;
    let val = kv[2].trim();
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1).replace(/\\"/g, '"');
    else if (val.startsWith("[") && val.endsWith("]")) {
      val = val.slice(1, -1).split(",").map((s) => s.trim().replace(/^"|"$/g, "")).filter(Boolean);
    }
    fm[kv[1]] = val;
  }
  return { fm, body: m[2].trim() };
}

function mdToText(s = "") {
  return s
    .replace(/`([^`]*)`/g, "$1")               // code spans
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")   // [text](url) -> text
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/^\s*>\s?/gm, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/^\s*[-•]\s+/gm, "")
    .replace(/\s+/g, " ")
    .trim();
}

function buildArticle(file, raw) {
  const { fm, body } = parseFrontmatter(raw);
  const title = String(fm.title || file.replace(/\.md$/, "").replace(/[-_]/g, " ")).slice(0, 90);
  const slug = String(fm.slug || file.replace(/\.md$/, ""));
  const date = String(fm.date || new Date().toISOString().slice(0, 10));
  const paragraphs = body.split(/\n\s*\n/).map((p) => p.replace(/\n/g, " ").trim()).filter(Boolean);
  const lead = mdToText(paragraphs[0] || String(fm.description || ""));
  const rest = paragraphs.slice(1);
  const pulllike = mdToText(rest.find((p) => p.length > 110 && (p.includes("—") || p.includes('"') || p.includes(":"))) || rest[1] || "");
  const bullets = rest.filter((p) => /^[-•*]|^###/.test(p)).slice(0, 3).map((p) => mdToText(p.replace(/^[-•*]\s*/, "").replace(/^###\s*/, "")).slice(0, 140));
  const tags = Array.isArray(fm.tags) ? fm.tags : [fm.kicker, "AI"].filter(Boolean);

  return {
    id: `pipeline-${slug}`,
    date,
    section: mapSection(fm.kicker),
    title: mdToText(title).toUpperCase(),
    subtitle: mdToText(String(fm.description || "")).slice(0, 180),
    author: String(fm.author || "The Daily Byte Newsroom"),
    leadParagraph: lead.slice(0, 600),
    bodyParagraphs: rest.slice(0, 6).map((p) => mdToText(p).slice(0, 1400)),
    pullQuote: pulllike.slice(0, 260) || undefined,
    keyTakeaways: bullets.length ? bullets : undefined,
    readTimeMinutes: Math.max(3, Math.ceil(body.split(/\s+/).length / 220)),
    likesCount: 0,
    comments: [],
    tags,
    stamp: "Darklord",
    imageUrl: fm.image_url ? String(fm.image_url) : undefined,
    sourceUrl: fm.url ? String(fm.url) : undefined,
    sourceName: fm.source ? String(fm.source) : undefined,
  };
}

let files = [];
try {
  files = readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".md") && !f.startsWith("_"));
} catch (e) {
  console.warn(`[generate-site-data] content/ not found at ${CONTENT_DIR} — emitting empty pipeline data.`);
}

const articles = files
  .map((f) => {
    try {
      return buildArticle(f, readFileSync(join(CONTENT_DIR, f), "utf8"));
    } catch (e) {
      console.warn(`[generate-site-data] skipping ${f}: ${e.message}`);
      return null;
    }
  })
  .filter(Boolean)
  .sort((a, b) => (a.date < b.date ? 1 : -1));

mkdirSync(OUT_DIR, { recursive: true });
const ts = `// GENERATED by scripts/generate-site-data.mjs — do not edit by hand.
// Rebuilt from ../content/*.md during prebuild/predev so the vintage
// front page always shows the latest Bloggy pipeline dispatches.
import type { Article } from '../types';

export const PIPELINE_ARTICLES: Article[] = ${JSON.stringify(articles, null, 2)};

export const PIPELINE_LATEST_DATE: string = ${JSON.stringify(articles[0]?.date || "")};
`;
writeFileSync(OUT_FILE, ts);
console.log(`[generate-site-data] ${articles.length} pipeline article(s) → src/data/generated-content.ts`);

// --- Reader-facing feeds (zero-dep, hand-rolled XML) ---
const SITE_URL = "https://thedailybyte.vercel.app"; // update when a custom domain lands
const esc = (s) =>
  String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
<title>The Daily Byte</title>
<link>${SITE_URL}</link>
<description>All the intelligence fit to print — AI, ML, open source, GitHub, and dev skills, written in English.</description>
<language>en</language>
${articles.map((a) => `<item><title>${esc(a.title)}</title><link>${SITE_URL}</link><guid isPermaLink="false">byte-${esc(a.slug)}</guid><description>${esc(a.description)}</description><pubDate>${new Date(a.date + "T12:00:00Z").toUTCString()}</pubDate></item>`).join("\n")}
</channel>
</rss>`;
writeFileSync(new URL("../public/rss.xml", import.meta.url), rss);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<url><loc>${SITE_URL}</loc><lastmod>${articles[0]?.date || ""}</lastmod></url>
${articles.map((a) => `<url><loc>${SITE_URL}/#${esc(a.slug)}</loc><lastmod>${a.date}</lastmod></url>`).join("\n")}
</urlset>`;
writeFileSync(new URL("../public/sitemap.xml", import.meta.url), sitemap);
console.log(`[generate-site-data] rss.xml + sitemap.xml written (${articles.length} items)`);