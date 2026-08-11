import type { Metadata } from "next";
import { buildIssue } from "../../lib/issue";
import PressRoom from "../components/gazette/PressRoom";

export const metadata: Metadata = {
  title: "Press Room — The Daily Byte",
  description: "Ink, smears, loupe and print — the physical press sheet simulation of today's edition.",
};

export default function PressRoomPage() {
  const issue = buildIssue();
  if (!issue) {
    return (
      <main className="wrap">
        <p className="notice">No dispatches yet — nothing to put on the press.</p>
      </main>
    );
  }
  return <PressRoom issue={issue} />;
}