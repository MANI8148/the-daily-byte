import React from 'react';
import { GazetteIssue, SECTIONS } from '../types';
import { Search, Archive } from 'lucide-react';

interface MastheadProps {
  issue: GazetteIssue;
  selectedDate: string;
  onDateChange: (dateStr: string) => void;
  activeCategory: string | null;
  onSelectCategory: (key: string | null) => void;
  onOpenArchives: () => void;
  onOpenSearch: () => void;
}

export const Masthead: React.FC<MastheadProps> = ({
  issue,
  selectedDate,
  onDateChange,
  activeCategory,
  onSelectCategory,
  onOpenArchives,
  onOpenSearch,
}) => {
  return (
    <header className="w-full border-b-4 border-[#1A1A1A] bg-[#F9F7F2] no-print">
      {/* Newspaper Title */}
      <div className="max-w-7xl mx-auto px-4 pt-8 pb-2 text-center">
        <h1 className="font-magik text-5xl sm:text-7xl md:text-8xl lg:text-9xl tracking-tight text-[#1A1A1A] leading-[1.05] select-none drop-shadow-xs pt-3">
          The Daily Byte
        </h1>
        <p className="font-sans text-xs sm:text-sm md:text-base tracking-[0.25em] text-[#1A1A1A] font-extrabold uppercase mt-3">
          The Student Edition — AI, ML &amp; Open-Source Tech, Pipe&rsquo;d Fresh Daily
        </p>
      </div>

      {/* Date, Search and Edition Bar */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="newspaper-divider-double py-2 my-2 flex flex-wrap justify-between items-center gap-3 text-xs sm:text-sm font-serif font-semibold text-[#1A1A1A]">
          <div className="flex items-center gap-2">
            <span className="font-sans font-bold text-xs uppercase tracking-wider">Issue Date:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => onDateChange(e.target.value)}
              className="bg-[#EEEBE1] border border-[#1A1A1A] px-2 py-0.5 rounded text-xs font-mono-tech cursor-pointer hover:border-[#b91c1c]"
            />
            <span className="hidden sm:inline font-bold">({issue.displayDate})</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-sans font-bold text-xs uppercase tracking-wider hidden sm:inline">Search:</span>
            <button
              onClick={onOpenSearch}
              className="flex items-center gap-2 bg-[#EEEBE1] border border-[#1A1A1A] px-3 py-1 rounded text-xs font-mono-tech hover:border-[#b91c1c] hover:bg-[#F9F7F2] cursor-pointer transition-colors"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search The Byte</span>
            </button>
          </div>

          <span className="font-sans uppercase text-xs font-bold tracking-wider">Free forever &middot; 100% open stack</span>
        </div>
      </div>

      {/* Section Navigation — the five categories + archives */}
      <nav className="border-t-2 border-b-2 border-[#1A1A1A] bg-[#EEEBE1] mt-1">
        <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap justify-center items-center gap-1">
          <button
            onClick={() => onSelectCategory(null)}
            className={`px-3 py-1.5 font-sans text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer border ${
              !activeCategory ? 'bg-[#1A1A1A] text-[#F9F7F2]' : 'text-[#1A1A1A] hover:bg-[#1A1A1A]/10 border-transparent'
            }`}
          >
            Front Page
          </button>
          {SECTIONS.map((s) => (
            <button
              key={s.key}
              onClick={() => onSelectCategory(s.key)}
              className={`px-3 py-1.5 font-sans text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer border ${
                activeCategory === s.key ? 'bg-[#1A1A1A] text-[#F9F7F2]' : 'text-[#1A1A1A] hover:bg-[#1A1A1A]/10 border-transparent'
              }`}
            >
              {s.label}
            </button>
          ))}
          <button
            onClick={onOpenArchives}
            className="flex items-center gap-1.5 px-3 py-1.5 font-sans text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer border text-[#b91c1c] hover:bg-[#b91c1c] hover:text-[#F9F7F2]"
          >
            <Archive className="w-3.5 h-3.5" />
            Archives
          </button>
        </div>
      </nav>
    </header>
  );
};