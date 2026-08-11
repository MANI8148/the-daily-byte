"use client";
import { useEffect, useState } from "react";

const SAVED_KEY = "byte-saved";

function mdToText(s: string): string {
  return s
    .replace(/`([^`]*)`/g, "$1")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

export default function ArticleTools({ title, body, slug }: { title: string; body: string; slug: string }) {
  const [saved, setSaved] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    try {
      const ids: string[] = JSON.parse(localStorage.getItem(SAVED_KEY) || "[]");
      setSaved(ids.includes(slug));
    } catch {
      /* ignore */
    }
  }, [slug]);

  const listen = () => {
    if (!("speechSynthesis" in window)) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const u = new SpeechSynthesisUtterance(`${title}. ${mdToText(body).slice(0, 3000)}`);
    u.rate = 0.98;
    u.onend = () => setSpeaking(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
    setSpeaking(true);
  };

  const toggleSave = () => {
    try {
      const ids: string[] = JSON.parse(localStorage.getItem(SAVED_KEY) || "[]");
      const next = saved ? ids.filter((x) => x !== slug) : [...ids, slug];
      localStorage.setItem(SAVED_KEY, JSON.stringify(next));
      setSaved(!saved);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="toolbar" style={{ display: "flex", gap: 8, margin: "12px 0" }}>
      <button className="tool-btn" onClick={listen}>{speaking ? "Stop Narration" : "Listen"}</button>
      <button className={`tool-btn${saved ? " saved" : ""}`} onClick={toggleSave}>{saved ? "Saved ✓" : "Save"}</button>
    </div>
  );
}