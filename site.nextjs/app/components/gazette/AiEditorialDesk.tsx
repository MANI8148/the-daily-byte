"use client";
import React, { useState } from 'react';
import { Article } from '../../types';
import { Sparkles, PenTool, CheckCircle, RefreshCw, Layers, FileText } from 'lucide-react';

interface AiEditorialDeskProps {
  onPublishArticle: (article: Article) => void;
  selectedDateStr: string;
}

export const AiEditorialDesk: React.FC<AiEditorialDeskProps> = ({
  onPublishArticle,
  selectedDateStr,
}) => {
  const [topic, setTopic] = useState<string>('Quantum Synthetic Consciousness and Orbital Compute Nodes');
  const [section, setSection] = useState<Article['section']>('AI & Neural Nets');
  const [tone, setTone] = useState<string>('19th-century Victorian investigative science journalism');
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [draftArticle, setDraftArticle] = useState<Article | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGenerateDraft = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/gemini/generate-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, section, tone }),
      });

      if (!res.ok) {
        throw new Error('Failed to generate article from Gemini AI');
      }

      const data = await res.json();

      const newArticle: Article = {
        id: `art-custom-${Date.now()}`,
        date: selectedDateStr,
        section: data.section || section,
        title: data.title || 'NEW TECHNOLOGICAL DISPATCH',
        subtitle: data.subtitle || 'A groundbreaking investigation into emergent synthetic intellect.',
        author: data.author || 'By Gemini AI, Guest Correspondent',
        leadParagraph: data.leadParagraph || '',
        bodyParagraphs: data.bodyParagraphs || [],
        pullQuote: data.pullQuote,
        keyTakeaways: data.keyTakeaways || [],
        imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
        imageCaption: 'Fig. 1: Illustration generated for this dispatch.',
        readTimeMinutes: Math.max(3, Math.ceil((data.bodyParagraphs?.join(' ').length || 500) / 400)),
        likesCount: 1,
        comments: [],
        tags: ['AI Drafted', section, 'Gazette Exclusive'],
      };

      setDraftArticle(newArticle);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'An error occurred while communicating with Gemini AI.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublish = () => {
    if (draftArticle) {
      onPublishArticle(draftArticle);
      alert("Huzzah! Article published successfully to Today's Gazette Front Page.");
      setDraftArticle(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 newspaper-paper">
      {/* Desk Header */}
      <div className="border-b-4 border-[#1A1A1A] pb-6 mb-8 text-center">
        <span className="font-sans text-xs font-bold text-[#b91c1c] uppercase tracking-widest">
          EDITORIAL DESK & COMPOSING ROOM
        </span>
        <h2 className="font-gothic text-4xl sm:text-6xl text-[#1A1A1A] my-2">
          AI Byte Publishing Office
        </h2>
        <p className="font-serif text-sm text-[#1A1A1A]/80 italic max-w-xl mx-auto">
          Draft and publish custom articles in authentic vintage journalistic style using Gemini AI.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Input Form Column */}
        <div className="lg:col-span-5 bg-[#EEEBE1] p-6 border-2 border-[#1A1A1A] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 font-sans text-xs font-bold text-[#1A1A1A] uppercase tracking-wider border-b border-[#1A1A1A]/30 pb-2 mb-4">
              <PenTool className="w-4 h-4 text-[#b91c1c]" />
              <span>ARTICLE PROMPT & INSTRUCTIONS</span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#1A1A1A] mb-1">
                  Article Topic / Headline Idea:
                </label>
                <textarea
                  rows={3}
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Breakthroughs in neural synthetic voice, or AI in space satellites..."
                  className="w-full bg-[#F9F7F2] border border-[#1A1A1A] p-2.5 text-xs font-serif text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#b91c1c]"
                />
              </div>

              <div>
                <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#1A1A1A] mb-1">
                  Gazette Section:
                </label>
                <select
                  value={section}
                  onChange={(e) => setSection(e.target.value as Article['section'])}
                  className="w-full bg-[#F9F7F2] border border-[#1A1A1A] p-2 text-xs font-serif text-[#1A1A1A]"
                >
                  <option value="AI & Neural Nets">AI & Neural Nets</option>
                  <option value="Cybernetics & Robotics">Cybernetics & Robotics</option>
                  <option value="Silicon & Quantum">Silicon & Quantum</option>
                  <option value="Editorial & Ethics">Editorial & Ethics</option>
                  <option value="Disruptions & Startups">Disruptions & Startups</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#1A1A1A] mb-1">
                  Journalistic Tone / Style:
                </label>
                <input
                  type="text"
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  placeholder="e.g. Victorian science investigation, Modern TechCrunch style..."
                  className="w-full bg-[#F9F7F2] border border-[#1A1A1A] p-2 text-xs font-serif text-[#1A1A1A]"
                />
              </div>
            </div>
          </div>

          <div className="mt-6">
            {errorMessage && (
              <div className="mb-3 p-2 bg-red-100 border border-red-400 text-red-800 text-xs">
                {errorMessage}
              </div>
            )}

            <button
              onClick={handleGenerateDraft}
              disabled={isLoading || !topic.trim()}
              className="w-full bg-[#1A1A1A] text-[#F9F7F2] hover:bg-[#b91c1c] disabled:opacity-50 py-3 text-xs font-sans font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-[#b91c1c]" />
                  <span>Editor AI Composing Dispatch...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#b91c1c]" />
                  <span>Draft Article with Gemini AI</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Live Typeset Preview Column */}
        <div className="lg:col-span-7 bg-[#F9F7F2] p-6 border-2 border-[#1A1A1A] flex flex-col justify-between min-h-[480px]">
          <div>
            <div className="flex justify-between items-center border-b-2 border-[#1A1A1A] pb-2 mb-4">
              <span className="font-sans text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">
                TYPESET PRINT PREVIEW
              </span>
              <span className="font-mono-tech text-[10px] text-[#1A1A1A]/60">
                {draftArticle ? 'DRAFT READY' : 'AWAITING GENERATION'}
              </span>
            </div>

            {draftArticle ? (
              <div className="space-y-4">
                <span className="font-sans text-[10px] bg-[#1A1A1A] text-[#F9F7F2] px-2 py-0.5 uppercase font-bold tracking-wider">
                  {draftArticle.section}
                </span>

                <h3 className="font-headline text-3xl font-bold text-[#1A1A1A] leading-tight">
                  {draftArticle.title}
                </h3>

                <p className="font-serif italic text-sm text-[#1A1A1A]/80 font-semibold border-b border-[#1A1A1A]/30 pb-2">
                  {draftArticle.subtitle}
                </p>

                <p className="font-serif text-xs italic text-[#1A1A1A]/60">
                  {draftArticle.author}
                </p>

                <div className="font-serif text-xs text-[#1A1A1A] leading-relaxed drop-cap space-y-2">
                  <p>{draftArticle.leadParagraph}</p>
                  {draftArticle.bodyParagraphs[0] && <p>{draftArticle.bodyParagraphs[0]}</p>}
                </div>

                {draftArticle.pullQuote && (
                  <div className="p-3 bg-[#EEEBE1] border-l-4 border-[#b91c1c] font-headline italic text-xs text-[#1A1A1A]">
                    "{draftArticle.pullQuote}"
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center text-[#1A1A1A]/60">
                <FileText className="w-12 h-12 stroke-[1.5] mb-2 text-[#1A1A1A]/40" />
                <p className="font-serif text-sm italic">
                  Fill in your topic on the left and click 'Draft Article with Gemini AI' to generate a typeset newspaper draft.
                </p>
              </div>
            )}
          </div>

          {draftArticle && (
            <div className="mt-6 pt-4 border-t-2 border-[#1A1A1A] flex justify-end">
              <button
                onClick={handlePublish}
                className="bg-[#b91c1c] text-white hover:bg-[#991b1b] px-6 py-2.5 text-xs font-sans font-bold uppercase tracking-wider shadow transition-colors flex items-center gap-2 cursor-pointer"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Publish to Byte Front Page</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
