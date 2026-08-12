import React from 'react';
import { GazetteIssue, Article, SECTIONS, categoryMatches } from '../types';
import { Volume2, MessageSquare, ThumbsUp, ArrowRight, Quote, Clock, Award, Bookmark } from 'lucide-react';
import { imgError } from '../lib/img';
import { TechPuzzleSection } from './TechPuzzleSection';
import { allArticles } from '../data/buildIssues';

interface FrontPageGridProps {
  issue: GazetteIssue;
  sectionFilter: string | null;
  onSelectArticle: (article: Article) => void;
  onPlayAudio: (article: Article) => void;
  onLikeArticle: (articleId: string) => void;
  savedArticleIds: string[];
  onToggleSaveArticle: (articleId: string) => void;
}

export const FrontPageGrid: React.FC<FrontPageGridProps> = ({
  issue,
  sectionFilter,
  onSelectArticle,
  onPlayAudio,
  onLikeArticle,
  savedArticleIds,
  onToggleSaveArticle,
}) => {
  const hero = issue.leadHeroArticle;
  const feat1 = issue.featuredArticles[0];
  const feat2 = issue.featuredArticles[1];
  const opinion = issue.opinionPieces[0];

  // Section view — filter ALL articles in the current edition by section,
  // not just the front-page hero/featured subset.
  const activeCat = SECTIONS.find((s) => s.key === sectionFilter) ?? null;
  if (sectionFilter && activeCat) {
    const pool: Article[] = allArticles().filter(
      (a) => a.date === issue.dateStr && categoryMatches(activeCat, a.section),
    );
    const matches = pool;
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 newspaper-paper bg-[#F9F7F2]">
        <div className="border-b-4 border-[#1A1A1A] pb-4 mb-8 text-center">
          <span className="font-sans text-xs font-bold text-[#b91c1c] tracking-widest uppercase">Section</span>
          <h2 className="font-gothic text-4xl sm:text-6xl text-[#1A1A1A] my-2">{activeCat.label}</h2>
          <p className="font-serif italic text-sm text-[#1A1A1A]/70">Today&rsquo;s dispatches filed under {activeCat.label}.</p>
        </div>
        {matches.length === 0 ? (
          <p className="font-serif italic text-center text-[#1A1A1A]/60">
            No dispatches filed under {activeCat.label} yet — the wire room is on it.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {matches.map((a) => (
              <button
                key={a.id}
                onClick={() => onSelectArticle(a)}
                className="text-left group cursor-pointer p-5 bg-[#F9F7F2] border-2 border-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-[#F9F7F2] transition-colors"
              >
                <div className="flex justify-between items-center text-[10px] font-mono-tech text-[#9a3412] font-bold group-hover:text-[#f59e0b]">
                  <span className="uppercase tracking-widest">{a.section}</span>
                  <span>{a.date}</span>
                </div>
                <h3 className="font-headline text-lg font-bold mt-1.5 leading-snug">{a.title}</h3>
                <p className="font-serif text-xs mt-2 opacity-80 line-clamp-2">{a.leadParagraph}</p>
                <span className="inline-block mt-3 text-[10px] font-sans font-bold uppercase tracking-wider border-b border-current pb-0.5">
                  Read &rarr;
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 newspaper-paper bg-[#F9F7F2]">
      {/* Front Page Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 border-b-4 border-[#1A1A1A] pb-12">
        
        {/* Left & Center Main Columns (Cols 1 to 8): Lead Hero & Featured */}
        <div className="lg:col-span-8 flex flex-col gap-8 column-border-r pr-0 lg:pr-8">
          
          {/* Main Front Page Lead Hero Headline & Article */}
          {hero && (
            <article className="group cursor-pointer border-b-2 border-[#1A1A1A] pb-8 relative">
              <div className="flex justify-between items-center mb-2">
                <span className="font-sans text-xs text-[#b91c1c] uppercase font-bold tracking-wider">
                  {hero.section} &middot; COVER STORY
                </span>
                <div className="flex items-center gap-3">
                  <div className="ink-stamp text-[10px] py-0.5 px-2">
                    {hero.stamp || 'VERIFIED DISPATCH'}
                  </div>
                  <span className="text-xs font-serif text-[#1A1A1A]/70 flex items-center gap-1 font-semibold">
                    <Clock className="w-3.5 h-3.5" />
                    {hero.readTimeMinutes} min read
                  </span>
                </div>
              </div>

              {/* Lead Headline */}
              <h2 
                onClick={() => onSelectArticle(hero)}
                className="font-headline text-3xl sm:text-5xl lg:text-6xl font-black text-[#1A1A1A] leading-[0.98] tracking-tight hover:text-[#b91c1c] transition-colors my-3"
              >
                {hero.title}
              </h2>

              {/* Subtitle */}
              <p className="font-serif italic text-lg sm:text-xl text-[#1A1A1A]/90 font-semibold mb-4 leading-snug border-b border-[#1A1A1A] pb-3">
                {hero.subtitle}
              </p>

              {/* Author & Action Row */}
              <div className="flex flex-wrap justify-between items-center text-xs font-serif font-bold text-[#1A1A1A] mb-6">
                <span className="font-sans uppercase text-[11px] tracking-wider text-[#1A1A1A]">{hero.author}</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onPlayAudio(hero);
                    }}
                    className="flex items-center gap-1 bg-[#EEEBE1] border border-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-[#F9F7F2] px-2.5 py-1 rounded-none transition-colors cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-[#b91c1c]" />
                    <span className="font-sans uppercase text-[10px] font-bold tracking-wider">Listen</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleSaveArticle(hero.id);
                    }}
                    className="flex items-center gap-1 hover:text-[#b91c1c] cursor-pointer"
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${savedArticleIds.includes(hero.id) ? 'fill-[#b91c1c] text-[#b91c1c]' : ''}`} />
                    <span className="font-sans uppercase text-[10px] font-bold tracking-wider">{savedArticleIds.includes(hero.id) ? 'Saved' : 'Save'}</span>
                  </button>
                </div>
              </div>

              {/* Lead Image & Body Columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                {hero.imageUrl && (
                  <div className="relative overflow-hidden rounded-none border-2 border-[#1A1A1A] shadow-xs">
                    <img
                      src={hero.imageUrl}
                      onError={imgError}
                      alt={hero.title}
                      className="w-full h-64 object-cover vintage-sepia group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="p-2 bg-[#EEEBE1] text-[11px] font-sans text-[#1A1A1A] italic border-t border-[#1A1A1A]">
                      {hero.imageCaption || 'Front Page Wire Photography.'}
                    </div>
                  </div>
                )}

                <div className="flex flex-col justify-between h-full">
                  <div className="font-serif text-base text-[#1A1A1A] leading-relaxed drop-cap space-y-3">
                    <p>{hero.leadParagraph}</p>
                    {hero.bodyParagraphs[0] && <p>{hero.bodyParagraphs[0]}</p>}
                  </div>

                  {hero.pullQuote && (
                    <div className="my-4 p-4 bg-[#EEEBE1] border-l-4 border-[#b91c1c] font-headline italic text-sm text-[#1A1A1A] flex items-start gap-2">
                      <Quote className="w-5 h-5 shrink-0 text-[#b91c1c]" />
                      <span>"{hero.pullQuote}"</span>
                    </div>
                  )}

                  <button
                    onClick={() => onSelectArticle(hero)}
                    className="mt-4 inline-flex items-center gap-1 text-xs font-sans font-bold uppercase tracking-wider text-[#b91c1c] hover:underline cursor-pointer"
                  >
                    <span>Read Full Dispatch</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </article>
          )}

          {/* Secondary Featured Articles in 2 Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {feat1 && (
              <article 
                onClick={() => onSelectArticle(feat1)}
                className="group cursor-pointer flex flex-col justify-between border-r border-[#1A1A1A] pr-0 md:pr-6 relative"
              >
                <div>
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-sans text-[10px] text-[#b91c1c] font-bold uppercase tracking-widest block">
                      {feat1.section}
                    </span>
                    <div className="ink-stamp text-[9px] py-0.5 px-1.5">
                      {savedArticleIds.includes(feat1.id) ? 'ARCHIVED' : feat1.stamp || 'CONFIRMED'}
                    </div>
                  </div>
                  <h3 className="font-headline text-2xl font-bold text-[#1A1A1A] group-hover:text-[#b91c1c] transition-colors my-1 leading-snug">
                    {feat1.title}
                  </h3>
                  <p className="font-serif text-sm text-[#1A1A1A]/80 leading-relaxed line-clamp-3 mb-3">
                    {feat1.leadParagraph}
                  </p>
                </div>

                {feat1.imageUrl && (
                  <img
                    src={feat1.imageUrl}
                    onError={imgError}
                    alt={feat1.title}
                    className="w-full h-40 object-cover border border-[#1A1A1A] vintage-sepia my-2"
                  />
                )}

                <div className="flex justify-between items-center text-xs font-serif text-[#1A1A1A]/70 pt-2 border-t border-[#1A1A1A]">
                  <span className="font-sans text-[10px] uppercase">{feat1.author}</span>
                  <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-[#b91c1c] group-hover:underline">Read &rarr;</span>
                </div>
              </article>
            )}

            {feat2 && (
              <article 
                onClick={() => onSelectArticle(feat2)}
                className="group cursor-pointer flex flex-col justify-between relative"
              >
                <div>
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-sans text-[10px] text-[#b91c1c] font-bold uppercase tracking-widest block">
                      {feat2.section}
                    </span>
                    <div className="ink-stamp ink-stamp-alt text-[9px] py-0.5 px-1.5">
                      {savedArticleIds.includes(feat2.id) ? 'ARCHIVED' : feat2.stamp || 'EXCLUSIVE'}
                    </div>
                  </div>
                  <h3 className="font-headline text-2xl font-bold text-[#1A1A1A] group-hover:text-[#b91c1c] transition-colors my-1 leading-snug">
                    {feat2.title}
                  </h3>
                  <p className="font-serif text-sm text-[#1A1A1A]/80 leading-relaxed line-clamp-3 mb-3">
                    {feat2.leadParagraph}
                  </p>
                </div>

                {feat2.imageUrl && (
                  <img
                    src={feat2.imageUrl}
                    onError={imgError}
                    alt={feat2.title}
                    className="w-full h-40 object-cover border border-[#1A1A1A] vintage-sepia my-2"
                  />
                )}

                <div className="flex justify-between items-center text-xs font-serif text-[#1A1A1A]/70 pt-2 border-t border-[#1A1A1A]">
                  <span className="font-sans text-[10px] uppercase">{feat2.author}</span>
                  <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-[#b91c1c] group-hover:underline">Read &rarr;</span>
                </div>
              </article>
            )}
          </div>
        </div>

        {/* Right Column (Cols 9 to 12): Opinion, Tech Briefs & Letters to Editor */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          
          {/* Editorial & Opinion Column */}
          {opinion && (
            <div className="bg-[#EEEBE1] p-5 border-2 border-[#1A1A1A]">
              <div className="border-b-2 border-[#1A1A1A] pb-2 mb-3 flex items-center justify-between">
                <span className="font-sans text-xs font-bold uppercase tracking-widest text-[#1A1A1A]">
                  EDITORIAL & ESSAY
                </span>
                <Award className="w-4 h-4 text-[#b91c1c]" />
              </div>

              <h3 
                onClick={() => onSelectArticle(opinion)}
                className="font-headline text-2xl font-bold text-[#1A1A1A] hover:text-[#b91c1c] cursor-pointer leading-tight mb-2"
              >
                {opinion.title}
              </h3>
              
              <p className="font-serif italic text-xs text-[#1A1A1A]/70 mb-3 font-semibold">
                {opinion.author}
              </p>

              <p className="font-serif text-xs text-[#1A1A1A] leading-relaxed line-clamp-4 italic mb-4">
                "{opinion.leadParagraph}"
              </p>

              <button
                onClick={() => onSelectArticle(opinion)}
                className="w-full bg-[#1A1A1A] text-[#F9F7F2] hover:bg-[#b91c1c] py-2 text-xs font-sans font-bold uppercase tracking-widest transition-colors cursor-pointer"
              >
                Read Editorial Essay
              </button>
            </div>
          )}

          {/* Tech & AI Telegraph Wire Briefs */}
          <div className="border-2 border-[#1A1A1A] p-5 bg-[#F9F7F2]">
            <div className="border-b-2 border-[#1A1A1A] pb-2 mb-4 flex items-center justify-between">
              <span className="font-sans text-xs font-bold uppercase tracking-widest text-[#1A1A1A]">
                TELEGRAPH WIRE BRIEFS
              </span>
              <span className="font-mono-tech text-[10px] text-[#b91c1c] font-bold animate-pulse">
                &bull; LIVE
              </span>
            </div>

            <div className="divide-y divide-[#1A1A1A] space-y-3">
              {issue.techBriefs.map((brief, idx) => (
                <div key={idx} className="pt-3 first:pt-0">
                  <div className="flex justify-between items-center text-[10px] font-sans font-bold uppercase mb-1">
                    <span className="text-[#b91c1c]">{brief.category}</span>
                    <span className="text-[#1A1A1A]/60">{brief.timeAgo}</span>
                  </div>
                  <h4 className="font-headline text-sm font-bold text-[#1A1A1A] hover:text-[#b91c1c] cursor-pointer leading-snug">
                    {brief.headline}
                  </h4>
                  <p className="font-serif text-xs text-[#1A1A1A]/80 mt-1 leading-relaxed">
                    {brief.snippet}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Letters to the Editor Box */}
          <div className="border-2 border-[#1A1A1A] p-4 bg-[#EEEBE1]">
            <div className="flex items-center gap-2 text-xs font-sans font-bold uppercase tracking-widest text-[#1A1A1A] border-b border-[#1A1A1A] pb-2 mb-2">
              <MessageSquare className="w-4 h-4 text-[#b91c1c]" />
              <span>LETTERS TO THE EDITOR</span>
            </div>
            <p className="font-serif text-xs text-[#1A1A1A] italic leading-relaxed mb-3">
              Have thoughts on today's AI headlines? Submit a letter to Editor-in-Chief Gemini AI for immediate publication.
            </p>
            <button
              onClick={() => onSelectArticle(hero)}
              className="w-full border-2 border-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-[#F9F7F2] text-[#1A1A1A] py-1.5 text-xs font-sans font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              Submit Reader Letter
            </button>
          </div>

        </div>

      </div>

      {/* Gazette Daily Pastimes: Cryptic Tech Crossword & Sudoku */}
      <TechPuzzleSection issue={issue} />
    </div>
  );
};
