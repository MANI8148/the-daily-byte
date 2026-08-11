"use client";
import { GazetteIssue, Article } from "../../types";
import { MagazineFlipReader } from "./MagazineFlipReader";

function speak(article: Article) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const text = `${article.title}. ${article.leadParagraph} ${(article.bodyParagraphs || []).slice(0, 2).join(" ")}`;
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 0.98;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

export default function MagazineViewer({ issue }: { issue: GazetteIssue }) {
  return (
    <MagazineFlipReader
      issue={issue}
      onSelectArticle={(a) => {
        const slug = a.id.replace(/^pipeline-/, "");
        if (slug !== a.id) window.location.href = `/posts/${slug}`;
      }}
      onPlayAudio={speak}
    />
  );
}