import React, { useState } from 'react';
import { GazetteIssue, Article } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, BookOpen, Volume2, Bookmark, Maximize2, Layers, ListFilter } from 'lucide-react';
import { imgError } from '../lib/img';

interface MagazineFlipReaderProps {
  issue: GazetteIssue;
  onSelectArticle: (article: Article) => void;
  onPlayAudio: (article: Article) => void;
}

export const MagazineFlipReader: React.FC<MagazineFlipReaderProps> = ({
  issue,
  onSelectArticle,
  onPlayAudio,
}) => {
  // Combine all articles into pages
  const allArticles: Article[] = [
    issue.leadHeroArticle,
    ...issue.featuredArticles,
    ...issue.opinionPieces
  ].filter(Boolean);

  // Each spread contains 2 pages (Left Page and Right Page)
  // Page 0: Cover / Masthead & Table of Contents
  // Page 1: Hero Article
  // Page 2: Featured Article 1
  // Page 3: Featured Article 2
  // Page 4: Editorial & Tech Briefs Summary
  
  const totalPages = allArticles.length + 2; // Cover + Articles + Back Summary
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [isTocOpen, setIsTocOpen] = useState<boolean>(false);

  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Reader Control Toolbar */}
      <div className="flex flex-wrap justify-between items-center mb-6 bg-[#EEEBE1] p-3 border-2 border-[#1A1A1A]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsTocOpen(!isTocOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1A1A1A] text-[#F9F7F2] text-xs font-sans font-bold uppercase tracking-wider cursor-pointer hover:bg-[#b91c1c] transition-colors"
          >
            <ListFilter className="w-3.5 h-3.5" />
            <span>Contents & Index</span>
          </button>
          
          <span className="text-xs font-mono-tech text-[#1A1A1A] font-semibold">
            Spreading Pages {currentPage * 2 + 1} - {currentPage * 2 + 2} of {totalPages * 2}
          </span>
        </div>

        {/* Page Navigators */}
        <div className="flex items-center gap-2">
          <button
            onClick={prevPage}
            disabled={currentPage === 0}
            className="flex items-center gap-1 px-3 py-1.5 bg-[#1A1A1A] text-[#F9F7F2] disabled:opacity-40 text-xs font-sans font-bold uppercase tracking-wider cursor-pointer hover:bg-[#b91c1c] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Flip Prev</span>
          </button>

          <span className="font-mono-tech text-xs px-2 font-bold text-[#1A1A1A]">
            {currentPage + 1} / {totalPages}
          </span>

          <button
            onClick={nextPage}
            disabled={currentPage === totalPages - 1}
            className="flex items-center gap-1 px-3 py-1.5 bg-[#1A1A1A] text-[#F9F7F2] disabled:opacity-40 text-xs font-sans font-bold uppercase tracking-wider cursor-pointer hover:bg-[#b91c1c] transition-colors"
          >
            <span>Flip Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Table of Contents Drawer */}
      {isTocOpen && (
        <div className="mb-6 p-4 bg-[#1A1A1A] text-[#F9F7F2] border-2 border-[#1A1A1A] animate-fadeIn">
          <h4 className="font-sans text-xs font-bold uppercase tracking-widest text-[#b91c1c] border-b border-[#F9F7F2]/30 pb-2 mb-3">
            BROCHURE EDITION INDEX — {issue.displayDate}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-serif">
            <button
              onClick={() => { setCurrentPage(0); setIsTocOpen(false); }}
              className="text-left hover:text-[#b91c1c] p-2 bg-[#27272a] transition-colors cursor-pointer"
            >
              <span className="font-bold font-mono-tech text-[#F9F7F2]/70">Spread 1:</span> Cover & Edition Overview
            </button>
            {allArticles.map((art, idx) => (
              <button
                key={art.id}
                onClick={() => { setCurrentPage(idx + 1); setIsTocOpen(false); }}
                className="text-left hover:text-[#b91c1c] p-2 bg-[#27272a] transition-colors truncate cursor-pointer"
              >
                <span className="font-bold font-mono-tech text-[#F9F7F2]/70">Spread {idx + 2}:</span> {art.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Interactive 3D Brochure / Magazine Book Spread */}
      <div className="relative min-h-[600px] bg-[#EEEBE1] border-4 border-[#1A1A1A] paper-shadow p-4 sm:p-8 overflow-hidden">
        {/* Central Magazine Spine Effect */}
        <div className="absolute inset-y-0 left-1/2 w-12 -translate-x-1/2 bg-gradient-to-r from-black/10 via-black/25 to-black/10 pointer-events-none z-20 hidden md:block" />

        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ rotateY: -15, opacity: 0, scale: 0.98 }}
            animate={{ rotateY: 0, opacity: 1, scale: 1 }}
            exit={{ rotateY: 15, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 min-h-[520px]"
          >
            {/* LEFT PAGE */}
            <div className="bg-[#F9F7F2] p-6 border-2 border-[#1A1A1A] shadow-inner flex flex-col justify-between relative page-fold">
              {currentPage === 0 ? (
                /* Cover Left Page */
                <div className="flex flex-col justify-between h-full border-2 border-double border-[#1A1A1A] p-6 text-center bg-[#F9F7F2]">
                  <div>
                    <span className="font-sans text-xs font-bold text-[#b91c1c] uppercase tracking-widest">
                      SPECIAL MAGAZINE EDITION
                    </span>
                    <h2 className="font-gothic text-4xl sm:text-5xl text-[#1A1A1A] my-4 leading-none">
                      The Daily Byte
                    </h2>
                    <p className="font-serif italic text-sm text-[#1A1A1A] border-b border-t border-[#1A1A1A] py-2 my-2">
                      {issue.displayDate}
                    </p>
                  </div>

                  <div className="my-6">
                    <img
                      src={issue.leadHeroArticle.imageUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80'}
                      onError={imgError}
                      alt="Cover"
                      className="w-full h-48 object-cover vintage-sepia border-2 border-[#1A1A1A]"
                    />
                    <p className="font-headline text-lg font-bold text-[#1A1A1A] mt-3">
                      "{issue.leadHeroArticle.title}"
                    </p>
                  </div>

                  <div className="text-xs font-mono-tech text-[#1A1A1A]/70 font-bold">
                    Flip right to begin reading the full magazine spread &rarr;
                  </div>
                </div>
              ) : (
                /* Article Left Page */
                (() => {
                  const art = allArticles[currentPage - 1];
                  if (!art) return null;
                  return (
                    <div className="flex flex-col justify-between h-full">
                      <div>
                        <div className="flex justify-between items-center text-[10px] font-sans text-[#b91c1c] font-bold uppercase tracking-widest mb-2">
                          <span>{art.section}</span>
                          <span>PAGE {currentPage * 2}</span>
                        </div>

                        <h2 className="font-headline text-2xl font-bold text-[#1A1A1A] leading-tight mb-2">
                          {art.title}
                        </h2>

                        <p className="font-serif italic text-xs text-[#1A1A1A]/80 font-semibold mb-4">
                          {art.subtitle}
                        </p>

                        {art.imageUrl && (
                          <img
                            src={art.imageUrl}
                            onError={imgError}
                            alt={art.title}
                            className="w-full h-44 object-cover border border-[#1A1A1A] vintage-sepia mb-4"
                          />
                        )}

                        <div className="font-serif text-xs text-[#1A1A1A] leading-relaxed drop-cap space-y-2">
                          <p>{art.leadParagraph}</p>
                          {art.bodyParagraphs[0] && <p>{art.bodyParagraphs[0]}</p>}
                        </div>
                      </div>

                      <div className="pt-4 border-t border-[#1A1A1A] flex justify-between items-center text-xs font-serif">
                        <span className="italic font-bold">{art.author}</span>
                        <button
                          onClick={() => onPlayAudio(art)}
                          className="flex items-center gap-1 text-[#b91c1c] hover:underline cursor-pointer font-bold font-sans uppercase text-[10px]"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>Audio</span>
                        </button>
                      </div>
                    </div>
                  );
                })()
              )}
            </div>

            {/* RIGHT PAGE */}
            <div className="bg-[#F9F7F2] p-6 border-2 border-[#1A1A1A] shadow-inner flex flex-col justify-between relative page-fold">
              {currentPage === 0 ? (
                /* Cover Right Page: Table of Contents & Executive Brief */
                <div className="flex flex-col justify-between h-full">
                  <div>
                    <div className="border-b-2 border-[#1A1A1A] pb-2 mb-4">
                      <span className="font-sans text-xs font-bold uppercase tracking-widest text-[#1A1A1A]">
                        DAILY BYTE TABLE OF CONTENTS
                      </span>
                    </div>

                    <div className="space-y-4">
                      {allArticles.map((art, idx) => (
                        <div 
                          key={art.id}
                          onClick={() => setCurrentPage(idx + 1)}
                          className="group cursor-pointer p-2 hover:bg-[#EEEBE1] border-b border-[#1A1A1A]/30 transition-colors"
                        >
                          <div className="flex justify-between items-center text-xs font-sans font-bold text-[#b91c1c] uppercase tracking-wider">
                            <span>{art.section}</span>
                            <span>PAGE { (idx + 1) * 2 }</span>
                          </div>
                          <h4 className="font-headline text-sm font-bold text-[#1A1A1A] group-hover:text-[#b91c1c] leading-snug">
                            {art.title}
                          </h4>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 bg-[#EEEBE1] border border-[#1A1A1A] text-xs font-serif">
                    <span className="font-bold font-sans uppercase tracking-wider text-[#1A1A1A]">EDITOR'S NOTE:</span>
                    <p className="italic text-[#1A1A1A]/80 mt-1">
                      Welcome to the magazine brochure edition. Use the 'Flip Next' button or page index to navigate through articles seamlessly.
                    </p>
                  </div>
                </div>
              ) : (
                /* Article Right Page: Second half of article & key takeaways */
                (() => {
                  const art = allArticles[currentPage - 1];
                  if (!art) return null;
                  return (
                    <div className="flex flex-col justify-between h-full">
                      <div>
                        <div className="flex justify-between items-center text-[10px] font-sans text-[#1A1A1A]/70 font-bold uppercase mb-2">
                          <span>CONTINUED DISPATCH</span>
                          <span>PAGE {currentPage * 2 + 1}</span>
                        </div>

                        <div className="font-serif text-xs text-[#1A1A1A] leading-relaxed space-y-3">
                          {art.bodyParagraphs.slice(1).map((p, pIdx) => (
                            <p key={pIdx}>{p}</p>
                          ))}
                        </div>

                        {art.pullQuote && (
                          <div className="my-4 p-3 bg-[#EEEBE1] border-l-4 border-[#b91c1c] font-headline italic text-xs text-[#1A1A1A]">
                            "{art.pullQuote}"
                          </div>
                        )}

                        {art.keyTakeaways && art.keyTakeaways.length > 0 && (
                          <div className="my-4 p-3 border border-[#1A1A1A] bg-[#EEEBE1]">
                            <span className="font-sans text-[10px] font-bold text-[#b91c1c] uppercase tracking-wider block mb-1">
                              KEY TAKEAWAYS & ANALYSIS
                            </span>
                            <ul className="list-disc list-inside text-xs font-serif text-[#1A1A1A] space-y-1">
                              {art.keyTakeaways.map((point, kIdx) => (
                                <li key={kIdx}>{point}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      <div className="pt-4 border-t border-[#1A1A1A] flex justify-between items-center">
                        <button
                          onClick={() => onSelectArticle(art)}
                          className="bg-[#1A1A1A] text-[#F9F7F2] hover:bg-[#b91c1c] px-3 py-1.5 text-xs font-sans font-bold uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          Open Article Modal & Comment
                        </button>

                        <button
                          onClick={nextPage}
                          disabled={currentPage === totalPages - 1}
                          className="text-xs font-sans font-bold uppercase text-[#1A1A1A] hover:underline cursor-pointer"
                        >
                          Next Article &rarr;
                        </button>
                      </div>
                    </div>
                  );
                })()
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
