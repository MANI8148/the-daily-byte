import type { Metadata } from "next";
import { buildIssue } from "../../lib/issue";
import { TechPuzzleSection } from "../components/gazette/TechPuzzleSection";

export const metadata: Metadata = {
  title: "Pastimes & Puzzles — The Daily Byte",
  description: "Cryptic tech crossword and AI-history sudoku from the Byte copy desk.",
};

export default function Puzzles() {
  const issue = buildIssue();
  if (!issue) {
    return (
      <main className="wrap">
        <p className="notice">No dispatches yet — puzzles arrive with the first pipeline run.</p>
      </main>
    );
  }
  return (
    <div className="newspaper-paper min-h-screen py-8">
      <div className="max-w-5xl mx-auto px-4">
        <TechPuzzleSection issue={issue} />
      </div>
    </div>
  );
}