import React, { useEffect, useMemo, useState } from 'react';
import { Article, GazetteIssue } from '../types';
import { Search, X } from 'lucide-react';

interface SearchOverlayProps {
  issues: Record<string, GazetteIssue>;
  onClose: () => void;
  onSelectArticle: (article: Article) => void;
}

/** AI-Studio style search: full-screen overlay, live results across every edition. */
export const SearchOverlay: React.FC<SearchOverlayProps> = ({ issues, onClose, onSelectArticle }) => {
  const [query, setQuery] = useState('');

  const allArticles = useMemo(
    () =>
      (Object.values(issues) as GazetteIssue[])
        .flatMap((iss) => [iss.leadHeroArticle, ...iss.featuredArticles, ...iss.opinionPieces])
        .filter(Boolean),
    [issues]
  );

  const results = query.trim()
    ? allArticles.filter((a) =>
        `${a.title} ${a.leadParagraph} ${a.section}`.toLowerCase().includes(query.trim().toLowerCase())
      )
    : [];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 bg-[#1A1A1A]/85 flex items-start justify-center p-4 pt-[12vh] overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-[#F9F7F2] border-4 border-[#1A1A1A] w-full max-w-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b-2 border-[#1A1A1A] px-5 py-3">
          <span className="font-sans text-[10px] font-bold text-[#b91c1c] uppercase tracking-widest flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5" /> Search The Byte — every edition
          </span>
          <button
            onClick={onClose}
            className="cursor-pointer text-[#1A1A1A] hover:text-[#b91c1c] transition-colors"
            aria-label="Close search"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5">
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a story, a repo, a section…"
            className="w-full bg-[#EEEBE1] border-2 border-[#1A1A1A] px-4 py-3 text-lg font-serif-body outline-none focus:bg-[#F9F7F2]"
          />

          <div className="mt-4 space-y-2 max-h-[45vh] overflow-y-auto">
            {query.trim() ? (
              results.length > 0 ? (
                results.slice(0, 12).map((a) => (
                  <button
                    key={a.id}
                    onClick={() => onSelectArticle(a)}
                    className="block w-full text-left group cursor-pointer p-3 bg-[#EEEBE1] hover:bg-[#1A1A1A] hover:text-[#F9F7F2] transition-colors"
                  >
                    <div className="flex justify-between text-[10px] font-mono-tech text-[#9a3412] font-bold group-hover:text-[#f59e0b]">
                      <span>{a.section}</span>
                      <span>{a.date}</span>
                    </div>
                    <h5 className="font-headline text-sm font-bold mt-0.5 leading-snug">{a.title}</h5>
                  </button>
                ))
              ) : (
                <p className="font-serif italic text-sm text-[#78716c]">No dispatches match &ldquo;{query}&rdquo;.</p>
              )
            ) : (
              <p className="font-serif italic text-sm text-[#78716c]">
                Search all editions, stories and topics — every dispatch ever set in type.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};