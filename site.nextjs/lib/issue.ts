import { getAllPosts } from "./posts";
import type { GazetteIssue, Article } from "../app/types";

function mdToText(s = ""): string {
  return s
    .replace(/`([^`]*)`/g, "$1")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/^\s*>\s?/gm, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/^\s*[-•]\s+/gm, "")
    .replace(/\s+/g, " ")
    .trim();
}

function mapSection(kicker = ""): Article["section"] {
  const k = kicker.toUpperCase();
  if (k.includes("AI")) return "AI & Neural Nets";
  if (k.includes("ML") || k.includes("MODEL") || k.includes("LLM")) return "AI & Neural Nets";
  if (k.includes("GITHUB") || k.includes("OPEN SOURCE") || k.includes("OSS") || k.includes("REPO") || k.includes("STARTUP")) return "Disruptions & Startups";
  if (k.includes("SKILL") || k.includes("GUIDE") || k.includes("HOW") || k.includes("CAREER")) return "Editorial & Ethics";
  return "AI & Neural Nets";
}

function fmtDisplay(dateStr: string): string {
  try {
    const d = new Date(`${dateStr}T00:00:00`);
    return d.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  } catch {
    return `Edition of ${dateStr}`;
  }
}

function postToArticle(p: { title: string; slug: string; kicker: string; description: string; author: string; date: string; tags: string[]; body: string }): Article {
  const paragraphs = p.body.split(/\n\s*\n/).map((x) => x.replace(/\n/g, " ").trim()).filter(Boolean);
  const lead = mdToText(paragraphs[0] || p.description);
  const rest = paragraphs.slice(1);
  const pulllike = mdToText(rest.find((x) => x.length > 110 && (x.includes("—") || x.includes('"') || x.includes(":"))) || rest[1] || "");
  const bullets = rest.filter((x) => /^[-•*]|^###/.test(x)).slice(0, 3).map((x) => mdToText(x.replace(/^[-•*]\s*/, "").replace(/^###\s*/, "")).slice(0, 140));

  return {
    id: `pipeline-${p.slug}`,
    date: p.date,
    section: mapSection(p.kicker),
    title: mdToText(p.title).toUpperCase(),
    subtitle: mdToText(p.description).slice(0, 180),
    author: `By ${p.author}`,
    leadParagraph: lead.slice(0, 600),
    bodyParagraphs: rest.slice(0, 6).map((x) => mdToText(x).slice(0, 1400)),
    pullQuote: pulllike.slice(0, 260) || undefined,
    keyTakeaways: bullets.length ? bullets : undefined,
    readTimeMinutes: Math.max(3, Math.ceil(p.body.split(/\s+/).length / 220)),
    likesCount: 0,
    comments: [],
    tags: p.tags && p.tags.length ? p.tags : ["AI"],
    stamp: "PIPELINE DISPATCH",
  };
}

/** Builds the current GazetteIssue straight from the pipeline's content/*.md. */
export function buildIssue(): GazetteIssue | null {
  const posts = getAllPosts();
  if (!posts.length) return null;

  const arts = posts.map(postToArticle);
  const [hero, ...rest] = arts;
  const dateStr = hero.date;

  return {
    dateStr,
    displayDate: fmtDisplay(dateStr),
    issueNumber: 60000 + arts.length * 7,
    volumeNumber: "BYTE-01",
    weatherForecast: "News Wire: High Throughput / Clear Headlines",
    leadHeroArticle: { ...hero, isHero: true },
    featuredArticles: rest.slice(0, 4),
    opinionPieces: [],
    techBriefs: rest.slice(4).map((a) => ({
      headline: a.title.replace(/:.*$/, "").slice(0, 60),
      snippet: (a.subtitle || a.leadParagraph).slice(0, 110),
      timeAgo: "PIPELINE",
      category: a.section.replace(" & ", "/"),
    })),
    marketTicker: [
      { symbol: "NVDA", name: "Nvidia Corp", value: "$148.50", change: "+3.2%", isPositive: true },
      { symbol: "BYTE", name: "Daily Byte Index", value: "1.0.0", change: "+∞%", isPositive: true },
    ],
  };
}

export function postSlugFromId(articleId: string): string | null {
  return articleId.startsWith("pipeline-") ? articleId.slice("pipeline-".length) : null;
}