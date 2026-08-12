import React, { useState } from 'react';
import { GazetteIssue, SECTIONS, categoryMatches } from '../types';
import { Calendar, Search, Clock, ArrowRight, History, Newspaper } from 'lucide-react';
import { imgError } from '../lib/img';
import { allArticles } from '../data/buildIssues';

interface ArchiveBrowserProps {
  issues: Record<string, GazetteIssue>;
  currentDateStr: string;
  onSelectDate: (dateStr: string) => void;
  onSelectArticle: (article: Article) => void;
}

export const ArchiveBrowser: React.FC<ArchiveBrowserProps> = ({
  issues,
  currentDateStr,
  onSelectDate,
  onSelectArticle,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [yearFilter, setYearFilter] = useState<string>('all');
  const [sectionFilter, setSectionFilter] = useState<string>('all');

  const issueList = (Object.values(issues) as GazetteIssue[]).sort((a, b) => b.dateStr.localeCompare(a.dateStr));
  const years = [...new Set(issueList.map((i) => i.dateStr.slice(0, 4)))].sort().reverse();

  // Every article across all editions, keyed for filtering.
  const allArts = allArticles();

  const filteredIssues = issueList.filter((issue) => {
    if (yearFilter !== 'all' && !issue.dateStr.startsWith(yearFilter)) return false;
    if (sectionFilter !== 'all') {
      const activeCat = SECTIONS.find((s) => s.key === sectionFilter) ?? null;
      const arts = allArts.filter((a) => a.date === issue.dateStr);
      if (activeCat && !arts.some((a) => categoryMatches(activeCat, a.section))) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const arts = allArts.filter((a) => a.date === issue.dateStr);
      return arts.some(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.leadParagraph.toLowerCase().includes(q) ||
          a.section.toLowerCase().includes(q),
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 newspaper-paper">
      {/* Archive Header */}
      <div className="border-b-4 border-[#1A1A1A] pb-6 mb-8 text-center">
        <span className="font-sans text-xs font-bold text-[#b91c1c] tracking-widest uppercase">
          THE DAILY BYTE HISTORICAL REPOSITORY
        </span>
        <h2 className="font-gothic text-4xl sm:text-6xl text-[#1A1A1A] my-2">
          Editions & Timeline Archive
        </h2>
        <p className="font-serif text-sm sm:text-base text-[#1A1A1A]/80 max-w-2xl mx-auto italic">
          Explore every daily issue of The Daily Byte — each date is its own numbered edition, archived in full.
          {issueList.length > 0 && (
            <span className="font-bold"> {issueList.length} edition{issueList.length === 1 ? '' : 's'} on file.</span>
          )}
          Missing a date? Drop a request in the Reader Suggestion Box at the bottom of the page.
        </p>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">

        {/* Edition Pipeline Notice */}
        <div className="p-6 bg-[#EEEBE1] border-2 border-[#1A1A1A]">
          <div className="flex items-center gap-2 text-xs font-sans font-bold text-[#1A1A1A] uppercase tracking-wider mb-2">
            <Newspaper className="w-4 h-4 text-[#b91c1c]" />
            <span>NEW EDITIONS DROP EVERY 1–2 HOURS</span>
          </div>
          <p className="font-serif text-xs text-[#1A1A1A]/80 mb-4">
            The wire room scans blogs, repos and feeds around the clock, and each fresh dispatch lands here as its own dated edition. Want a story covered — or a date revisited? Send a note through the Reader Suggestion Box below.
          </p>
          <div className="flex items-center gap-2 text-[10px] font-sans font-bold uppercase tracking-widest text-[#b91c1c]">
            <Clock className="w-3.5 h-3.5" />
            <span>No AI reconstruction — real pipeline dispatches only</span>
          </div>
        </div>

        {/* Filter + Search Repository */}
        <div className="p-6 bg-[#EEEBE1] border-2 border-[#1A1A1A] flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-sans font-bold text-[#1A1A1A] uppercase tracking-wider mb-2">
              <Search className="w-4 h-4 text-[#b91c1c]" />
              <span>FILTER ARCHIVE BY DATE & TOPIC</span>
            </div>
            <p className="font-serif text-xs text-[#1A1A1A]/80 mb-4">
              Narrow editions by year, beat (section), or headline keywords. Every date is its own archived edition.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className="font-sans text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]/60">Year</span>
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="bg-[#F9F7F2] border border-[#1A1A1A] px-2 py-2 text-xs font-serif text-[#1A1A1A]"
              >
                <option value="all">All years</option>
                {years.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1">
              <span className="font-sans text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]/60">Section</span>
              <select
                value={sectionFilter}
                onChange={(e) => setSectionFilter(e.target.value)}
                className="bg-[#F9F7F2] border border-[#1A1A1A] px-2 py-2 text-xs font-serif text-[#1A1A1A]"
              >
                <option value="all">All sections</option>
                {SECTIONS.map((s) => (
                  <option key={s.key} value={s.key}>{s.label}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Search e.g. Quantum, ChatGPT, Superconductor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#F9F7F2] border border-[#1A1A1A] px-3 py-2 pl-9 text-xs font-serif text-[#1A1A1A]"
            />
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#1A1A1A]/60" />
          </div>

          <div className="flex items-center justify-between text-[10px] font-sans font-bold uppercase tracking-widest text-[#1A1A1A]/70">
            <span>{filteredIssues.length} of {issueList.length} editions shown</span>
            {(yearFilter !== 'all' || sectionFilter !== 'all' || searchQuery.trim()) && (
              <button
                onClick={() => { setYearFilter('all'); setSectionFilter('all'); setSearchQuery(''); }}
                className="text-[#b91c1c] hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Issues Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredIssues.map((issue) => {
          const isSelected = issue.dateStr === currentDateStr;
          return (
            <div
              key={issue.dateStr}
              onClick={() => onSelectDate(issue.dateStr)}
              className={`group cursor-pointer p-6 border-2 transition-all flex flex-col justify-between ${
                isSelected
                  ? 'border-[#b91c1c] bg-[#EEEBE1] shadow-md ring-2 ring-[#b91c1c]/30'
                  : 'border-[#1A1A1A] bg-[#F9F7F2] hover:bg-[#EEEBE1] hover:shadow-xs'
              }`}
            >
              <div>
                <div className="flex justify-between items-center text-xs font-mono-tech text-[#1A1A1A]/60 border-b border-[#1A1A1A]/30 pb-2 mb-3">
                  <span className="font-bold text-[#1A1A1A]">VOL. {issue.volumeNumber || 'CLXXV'}</span>
                  <span>NO. {issue.issueNumber}</span>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-[#b91c1c]" />
                  <span className="font-serif font-bold text-sm text-[#1A1A1A]">
                    {issue.displayDate}
                  </span>
                </div>

                <h3 className="font-headline text-xl font-bold text-[#1A1A1A] group-hover:text-[#b91c1c] leading-snug my-3">
                  "{issue.leadHeroArticle.title}"
                </h3>

                <p className="font-serif text-xs text-[#1A1A1A]/80 line-clamp-3 mb-4 leading-relaxed italic">
                  {issue.leadHeroArticle.leadParagraph}
                </p>

                {issue.leadHeroArticle.imageUrl && (
                  <img
                    src={issue.leadHeroArticle.imageUrl}
                    onError={imgError}
                    alt="Archive preview"
                    className="w-full h-36 object-cover border border-[#1A1A1A]/30 vintage-sepia mb-4"
                  />
                )}

                {/* Archive body: left half = The Daily Byte identity, right half = archives 2-per-row */}
                <div className="mb-4 border-t border-[#1A1A1A]/20 pt-4 grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                  {/* Left half: The Daily Byte */}
                  <div className="flex flex-col gap-3 p-6 bg-[#1A1A1A] text-[#F9F7F2] border-2 border-[#1A1A1A]">
                    <span className="font-cinzel text-3xl font-black tracking-wide leading-none">THE DAILY BYTE</span>
                    <span className="font-sans text-[10px] font-bold uppercase tracking-[0.3em] text-[#b91c1c]">Vol. {issue.volumeNumber || 'CLXXV'} &nbsp;·&nbsp; No. {issue.issueNumber}</span>
                    <p className="font-serif text-xs italic opacity-80 leading-relaxed mt-1">
                      All the Intelligence Fit to Print — a student daily covering AI, ML, open source,
                      GitHub, and developer skills. Every dispatch tracked fresh from the open web and
                      rewritten from primary sources.
                    </p>
                    <div className="mt-2 pt-3 border-t border-[#F9F7F2]/20 text-[10px] font-mono-tech uppercase tracking-wider opacity-70">
                      {allArts.filter((a) => a.date === issue.dateStr).length} dispatches filed · {issue.displayDate}
                    </div>
                  </div>
                  {/* Right half: archives — 2 per row, fitted boxes */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {allArts
                      .filter((a) => a.date === issue.dateStr)
                      .map((a) => (
                        <button
                          key={a.id}
                          onClick={(e) => { e.stopPropagation(); onSelectArticle(a); }}
                          className="text-left group flex flex-col gap-2 p-4 border-2 border-[#1A1A1A] bg-[#F9F7F2] hover:bg-[#1A1A1A] hover:text-[#F9F7F2] transition-colors"
                        >
                          {a.imageUrl && a.imageUrl.startsWith('/images/') && (
                            <img src={a.imageUrl} onError={imgError} alt={a.title} className="w-full h-32 object-cover border-2 border-[#1A1A1A] vintage-sepia" />
                          )}
                          <span className="font-serif text-base font-bold leading-snug line-clamp-3">{a.title}</span>
                          <div className="flex justify-between items-center text-[9px] font-sans uppercase tracking-wider">
                            <span className="text-[#b91c1c]">{a.section}</span>
                            <span className="opacity-70">{a.date}</span>
                          </div>
                        </button>
                      ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#1A1A1A]/30 flex justify-between items-center text-xs font-sans font-bold uppercase tracking-wider">
                <span className={isSelected ? 'text-[#b91c1c]' : 'text-[#1A1A1A]'}>
                  {isSelected ? 'Current Active Edition' : 'Load This Edition'}
                </span>
                <ArrowRight className="w-4 h-4 text-[#1A1A1A] group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
