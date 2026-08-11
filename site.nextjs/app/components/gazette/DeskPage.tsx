"use client";
import { useState } from "react";
import { GazetteIssue, Article } from "../../types";
import { AiEditorialDesk } from "./AiEditorialDesk";

export default function DeskPage({ issue }: { issue: GazetteIssue }) {
  const [published, setPublished] = useState<Article[]>([]);

  return (
    <div className="newspaper-paper min-h-screen">
      <AiEditorialDesk
        selectedDateStr={issue.dateStr}
        onPublishArticle={(a) => setPublished((prev) => [a, ...prev])}
      />
      {published.length > 0 && (
        <div className="max-w-3xl mx-auto px-4 pb-16">
          <span className="font-sans text-xs font-bold uppercase tracking-widest text-[#b91c1c]">
            This session&apos;s desk dispatches
          </span>
          <div className="mt-3 space-y-3">
            {published.map((a, i) => {
              const slug = a.id.replace(/^pipeline-/, "");
              const href = slug !== a.id ? `/posts/${slug}` : null;
              return (
                <div key={a.id + i} className="p-4 bg-[#EEEBE1] border-2 border-[#1A1A1A]">
                  <span className="font-cinzel text-[10px] tracking-widest text-[#78716c] uppercase">{a.section}</span>
                  <h3 className="font-headline font-bold text-lg text-[#1A1A1A] leading-tight mt-1">{a.title}</h3>
                  <p className="font-serif text-sm text-[#1A1A1A]/80 mt-1">{a.leadParagraph}</p>
                  {href ? (
                    <a className="inline-block mt-2 text-xs font-sans font-bold uppercase tracking-wider text-[#b91c1c] hover:underline" href={href}>
                      Read in the paper →
                    </a>
                  ) : (
                    <span className="inline-block mt-2 text-xs font-sans font-bold uppercase tracking-wider text-[#78716c]">
                      {a.author} · {a.date}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}