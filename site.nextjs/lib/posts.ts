import fs from "fs";
import path from "path";
import matter from "gray-matter";

// content/ lives at the repo root next to site/.
const CONTENT_DIR = path.join(process.cwd(), "..", "content");

export type Post = {
  title: string;
  kicker: string;
  description: string;
  slug: string;
  date: string;
  author: string;
  tags: string[];
  body: string;
};

export function getAllPosts(): Post[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  return fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith(".md") && !f.startsWith("_"))
    .map((f) => {
      const { data, content } = matter(fs.readFileSync(path.join(CONTENT_DIR, f), "utf8"));
      return {
        title: String(data.title || f),
        kicker: String(data.kicker || "TECH"),
        description: String(data.description || ""),
        slug: String(data.slug || f.replace(/\.md$/, "")),
        date: String(data.date || "2026-01-01"),
        author: String(data.author || "Staff Writer"),
        tags: Array.isArray(data.tags) ? data.tags.map(String) : ["tech"],
        body: content,
      };
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPost(slug: string): Post | undefined {
  return getAllPosts().find((p) => p.slug === slug);
}

export const SITE = {
  name: "The Daily Byte",
  tagline: "Student Tech Edition",
};