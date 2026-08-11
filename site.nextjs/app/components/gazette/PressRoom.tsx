"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { GazetteIssue, Article } from "../../types";
import { PressSheetSimulation } from "./PressSheetSimulation";

const SAVED_KEY = "byte-saved";
const LIKED_KEY = "byte-liked";

function readIds(key: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}

function speak(article: Article) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const text = `${article.title}. ${article.leadParagraph}`;
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 0.98;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

export default function PressRoom({ issue }: { issue: GazetteIssue }) {
  const router = useRouter();
  const [saved, setSaved] = useState<string[]>([]);
  const [liked, setLiked] = useState<string[]>([]);

  useEffect(() => {
    setSaved(readIds(SAVED_KEY));
    setLiked(readIds(LIKED_KEY));
  }, []);

  return (
    <PressSheetSimulation
      issue={issue}
      onClose={() => router.push("/")}
      onSelectArticle={(a) => {
        const slug = a.id.replace(/^pipeline-/, "");
        if (slug !== a.id) window.location.href = `/posts/${slug}`;
      }}
      onPlayAudio={speak}
      onLikeArticle={(id) => {
        const next = liked.includes(id) ? liked.filter((x) => x !== id) : [...liked, id];
        setLiked(next);
        localStorage.setItem(LIKED_KEY, JSON.stringify(next));
      }}
      savedArticleIds={saved}
      onToggleSave={(id) => {
        const next = saved.includes(id) ? saved.filter((x) => x !== id) : [...saved, id];
        setSaved(next);
        localStorage.setItem(SAVED_KEY, JSON.stringify(next));
      }}
    />
  );
}