import React, { useState } from 'react';
import { GazetteIssue, Article, Comment } from './types';
import { buildInitialIssues, buildInitialDate } from './data/buildIssues';
import { Masthead } from './components/Masthead';
import { FrontPageGrid } from './components/FrontPageGrid';
import { ArchiveBrowser } from './components/ArchiveBrowser';
import { ArticleDetailModal } from './components/ArticleDetailModal';
import { AudioPlayerBar } from './components/AudioPlayerBar';
import { SuggestionBox } from './components/SuggestionBox';
import { SearchOverlay } from './components/SearchOverlay';

const CHEATSHEETS = [
  { label: 'Python', href: 'https://pythoncheatsheet.org' },
  { label: 'Git', href: 'https://education.github.com/git-cheat-sheet-education.pdf' },
  { label: 'Regex', href: 'https://quickref.me/regex' },
  { label: 'Docker', href: 'https://quickref.me/docker' },
  { label: 'SQL', href: 'https://quickref.me/postgres' },
  { label: 'scikit-learn', href: 'https://quickref.me/scikit-learn' },
];

const GITHUB_REPOS = [
  { label: 'awesome-oss', href: 'https://github.com/awesome-selfhosted/awesome-selfhosted' },
  { label: 'free-programming-books', href: 'https://github.com/EbookFoundation/free-programming-books' },
  { label: 'public-apis', href: 'https://github.com/public-apis/public-apis' },
  { label: 'OSS University', href: 'https://github.com/ossu/computer-science' },
  { label: 'build-your-own-x', href: 'https://github.com/codecrafters-io/build-your-own-x' },
  { label: 'roadmap.sh', href: 'https://github.com/kamranahmedse/developer-roadmap' },
];

const ROADMAPS = [
  { label: 'AI & Data Scientist', href: 'https://roadmap.sh/ai-data-scientist' },
  { label: 'Backend', href: 'https://roadmap.sh/backend' },
  { label: 'Frontend', href: 'https://roadmap.sh/frontend' },
  { label: 'Python', href: 'https://roadmap.sh/python' },
  { label: 'DevOps', href: 'https://roadmap.sh/devops' },
  { label: 'Cybersecurity', href: 'https://roadmap.sh/cyber-security' },
];

const CONNECT = [
  { label: 'GitHub (this repo)', href: 'https://github.com/MANI8148/bloggy' },
  { label: 'Bluesky', href: '#' },
  { label: 'Dev.to', href: '#' },
  { label: 'Buttondown', href: '#' },
  { label: 'Weekly Byte', href: '#' },
];

export default function App() {
  const [issues, setIssues] = useState<Record<string, GazetteIssue>>(() => buildInitialIssues());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(() => buildInitialDate());
  const [readingMode, setReadingMode] = useState<'newspaper' | 'magazine' | 'archive'>('newspaper');

  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [audioArticle, setAudioArticle] = useState<Article | null>(null);
  const [savedArticleIds, setSavedArticleIds] = useState<string[]>([]);

  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);

  // Get active issue or fallback to default
  const currentIssue: GazetteIssue = issues[selectedDateStr] || issues['2026-08-10'];

  // Handle article like / endorsement
  const handleLikeArticle = (articleId: string) => {
    setIssues((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((dateKey) => {
        const iss = updated[dateKey];
        if (iss.leadHeroArticle?.id === articleId) {
          iss.leadHeroArticle.likesCount += 1;
        }
        iss.featuredArticles.forEach((art) => {
          if (art.id === articleId) art.likesCount += 1;
        });
        iss.opinionPieces.forEach((art) => {
          if (art.id === articleId) art.likesCount += 1;
        });
      });
      return { ...updated };
    });
  };

  // Toggle bookmark save
  const handleToggleSaveArticle = (articleId: string) => {
    setSavedArticleIds((prev) =>
      prev.includes(articleId)
        ? prev.filter((id) => id !== articleId)
        : [...prev, articleId]
    );
  };

  // Add comment / letter to editor
  const handleAddComment = (articleId: string, comment: Comment) => {
    setIssues((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((dateKey) => {
        const iss = updated[dateKey];
        if (iss.leadHeroArticle?.id === articleId) {
          iss.leadHeroArticle.comments.unshift(comment);
        }
        iss.featuredArticles.forEach((art) => {
          if (art.id === articleId) art.comments.unshift(comment);
        });
        iss.opinionPieces.forEach((art) => {
          if (art.id === articleId) art.comments.unshift(comment);
        });
      });
      return { ...updated };
    });
  };

  return (
    <div className="min-h-screen bg-[#F9F7F2] text-[#1A1A1A] flex flex-col font-serif-body newspaper-paper">
      {/* Top Gazette Masthead */}
      <Masthead
        issue={currentIssue}
        selectedDate={selectedDateStr}
        onDateChange={(dateStr) => {
          setSelectedDateStr(dateStr);
          if (!issues[dateStr]) {
            alert('No edition for that date yet — the pipeline has not covered it. Drop it in the Suggestion Box below and the editor will queue it.');
          }
        }}
        activeCategory={activeCategory}
        onSelectCategory={(key) => {
          setActiveCategory(key);
          setReadingMode('newspaper');
        }}
        onOpenArchives={() => {
          setActiveCategory(null);
          setReadingMode('archive');
        }}
        onOpenSearch={() => setSearchOpen(true)}
      />

      {/* Main View Area */}
      <main className="flex-1">
        {readingMode === 'newspaper' && (
          <FrontPageGrid
            issue={currentIssue}
            sectionFilter={activeCategory}
            onSelectArticle={(art) => setSelectedArticle(art)}
            onPlayAudio={(art) => setAudioArticle(art)}
            onLikeArticle={handleLikeArticle}
            savedArticleIds={savedArticleIds}
            onToggleSaveArticle={handleToggleSaveArticle}
          />
        )}

        {readingMode === 'archive' && (
          <ArchiveBrowser
            issues={issues}
            currentDateStr={selectedDateStr}
            onSelectDate={(dateStr) => {
              setSelectedDateStr(dateStr);
              setReadingMode('newspaper');
            }}
          />
        )}
      </main>

      {/* Article Detail Reader Modal */}
      {selectedArticle && (
        <ArticleDetailModal
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
          onPlayAudio={(art) => setAudioArticle(art)}
          onLikeArticle={handleLikeArticle}
          isSaved={savedArticleIds.includes(selectedArticle.id)}
          onToggleSave={handleToggleSaveArticle}
          onAddComment={handleAddComment}
        />
      )}

      {/* Search overlay — AI-Studio style, every edition */}
      {searchOpen && (
        <SearchOverlay
          issues={issues}
          onClose={() => setSearchOpen(false)}
          onSelectArticle={(art) => {
            setSelectedArticle(art);
            setSearchOpen(false);
          }}
        />
      )}

      {/* Radio Audio Player Bar */}
      {audioArticle && (
        <AudioPlayerBar
          article={audioArticle}
          onClose={() => setAudioArticle(null)}
        />
      )}

      {/* ===== Below the paper: suggestion box + resources ===== */}
      <section className="border-t-4 border-[#1A1A1A] bg-[#eee9dd] mt-14 no-print">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="max-w-2xl mx-auto">
            {/* Suggestion box — the reader channel (no AI posting) */}
            <SuggestionBox />
          </div>

          {/* Resource columns — like the old Daily Byte footer */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8 mt-10 pt-8 border-t-2 border-[#1A1A1A]">
            <div>
              <h4 className="font-cinzel text-xs font-bold text-[#1A1A1A] uppercase tracking-widest mb-3">
                Cheatsheets
              </h4>
              <ul className="space-y-1.5">
                {CHEATSHEETS.map((l) => (
                  <li key={l.label}>
                    <a className="font-serif text-xs text-[#44403c] hover:text-[#b91c1c] hover:underline" href={l.href} target="_blank" rel="noreferrer">{l.label} →</a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-cinzel text-xs font-bold text-[#1A1A1A] uppercase tracking-widest mb-3">
                GitHub Repos
              </h4>
              <ul className="space-y-1.5">
                {GITHUB_REPOS.map((l) => (
                  <li key={l.label}>
                    <a className="font-serif text-xs text-[#44403c] hover:text-[#b91c1c] hover:underline" href={l.href} target="_blank" rel="noreferrer">{l.label} →</a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-cinzel text-xs font-bold text-[#1A1A1A] uppercase tracking-widest mb-3">
                Roadmaps
              </h4>
              <ul className="space-y-1.5">
                {ROADMAPS.map((l) => (
                  <li key={l.label}>
                    <a className="font-serif text-xs text-[#44403c] hover:text-[#b91c1c] hover:underline" href={l.href} target="_blank" rel="noreferrer">{l.label} →</a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-cinzel text-xs font-bold text-[#1A1A1A] uppercase tracking-widest mb-3">
                Connect
              </h4>
              <ul className="space-y-1.5">
                {CONNECT.map((l) => (
                  <li key={l.label}>
                    <a className="font-serif text-xs text-[#44403c] hover:text-[#b91c1c] hover:underline" href={l.href} target="_blank" rel="noreferrer">{l.label} →</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Legal bar */}
        <div className="border-t border-[#1A1A1A]/30">
          <div className="max-w-7xl mx-auto px-4 py-4 text-center">
            <p className="font-gothic text-2xl text-[#1A1A1A]">The Daily Byte</p>
            <p className="font-cinzel text-[10px] tracking-widest text-[#78716c] uppercase">
              Published Daily by the Bloggy Pipeline • All Rights Reserved • Printed on the free stack, $0 forever
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}