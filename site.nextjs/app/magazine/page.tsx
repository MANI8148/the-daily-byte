import type { Metadata } from "next";
import { buildIssue } from "../../lib/issue";
import MagazineViewer from "../components/gazette/MagazineViewer";

export const metadata: Metadata = {
  title: "Brochure Magazine Reader — The Daily Byte",
  description: "Flip through today's edition as a glossy magazine: cover story, features, columns and pull-quotes.",
};

export default function Magazine() {
  const issue = buildIssue();
  if (!issue) {
    return (
      <main className="wrap">
        <p className="notice">No dispatches yet — the worker is at the news desk. Check back after the first pipeline run.</p>
      </main>
    );
  }
  return (
    <div className="newspaper-paper min-h-screen py-8">
      <MagazineViewer issue={issue} />
    </div>
  );
}