import type { Metadata } from "next";
import { buildIssue } from "../../lib/issue";
import DeskPage from "../components/gazette/DeskPage";

export const metadata: Metadata = {
  title: "AI Publishing Desk — The Daily Byte",
  description: "Draft a front-page dispatch with Gemini AI, in authentic vintage journalistic style.",
};

export default function Desk() {
  const issue = buildIssue();
  if (!issue) {
    return (
      <main className="wrap">
        <p className="notice">No dispatches yet — the desk opens with the first pipeline run.</p>
      </main>
    );
  }
  return <DeskPage issue={issue} />;
}