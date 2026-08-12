import React, { useState } from 'react';
import { Article, Comment } from '../types';
import { X, Volume2, ThumbsUp, Bookmark, Printer, MessageSquare, Send, Sparkles, Quote, Award } from 'lucide-react';
import { imgError } from '../lib/img';

interface ArticleDetailModalProps {
  article: Article | null;
  onClose: () => void;
  onPlayAudio: (article: Article) => void;
  onLikeArticle: (articleId: string) => void;
  isSaved: boolean;
  onToggleSave: (articleId: string) => void;
  onAddComment: (articleId: string, comment: Comment) => void;
}

export const ArticleDetailModal: React.FC<ArticleDetailModalProps> = ({
  article,
  onClose,
  onPlayAudio,
  onLikeArticle,
  isSaved,
  onToggleSave,
  onAddComment,
}) => {
  if (!article) return null;

  const [readerName, setReaderName] = useState<string>('');
  const [letterText, setLetterText] = useState<string>('');
  const [isSubmittingLetter, setIsSubmittingLetter] = useState<boolean>(false);

  const handlePrint = () => {
    window.print();
  };

  const handleSubmitLetter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!letterText.trim()) return;

    setIsSubmittingLetter(true);
    const authorName = readerName.trim() || 'Attentive Reader';

    try {
      // Reader correspondence is a plain editorial drop — no AI involved.
      const editorResponseText =
        'The Editor thanks you for your thoughtful submission and will publish it in tomorrow’s edition.';

      const newComment: Comment = {
        id: `c-${Date.now()}`,
        author: authorName,
        date: 'Just now',
        message: letterText,
        editorResponse: editorResponseText,
      };

      onAddComment(article.id, newComment);
      setLetterText('');
    } catch (err) {
      console.error(err);
      const fallbackComment: Comment = {
        id: `c-${Date.now()}`,
        author: authorName,
        date: 'Just now',
        message: letterText,
        editorResponse: 'The Editor-in-Chief acknowledges receipt of your letter.',
      };
      onAddComment(article.id, fallbackComment);
      setLetterText('');
    } finally {
      setIsSubmittingLetter(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#F9F7F2] border-[12px] border-[#EEEBE1] rounded-none shadow-2xl p-6 sm:p-10 max-h-[90vh] overflow-y-auto my-8 text-[#1A1A1A]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-[#1A1A1A] text-[#F9F7F2] hover:bg-[#b91c1c] transition-colors cursor-pointer no-print"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header Toolbar */}
        <div className="flex flex-wrap justify-between items-center border-b-2 border-[#1A1A1A] pb-4 mb-6 no-print">
          <span className="font-sans text-xs bg-[#1A1A1A] text-[#F9F7F2] px-2.5 py-1 font-bold uppercase tracking-wider">
            {article.section}
          </span>

          <div className="flex items-center gap-4 text-xs font-sans font-bold uppercase tracking-wider text-[#1A1A1A]">
            <button
              onClick={() => onPlayAudio(article)}
              className="flex items-center gap-1 hover:text-[#b91c1c] cursor-pointer"
            >
              <Volume2 className="w-4 h-4 text-[#b91c1c]" />
              <span>Listen</span>
            </button>

            <button
              onClick={() => onLikeArticle(article.id)}
              className="flex items-center gap-1 hover:text-[#b91c1c] cursor-pointer"
            >
              <ThumbsUp className="w-4 h-4 text-[#b91c1c]" />
              <span>{article.likesCount} Endorsements</span>
            </button>

            <button
              onClick={() => onToggleSave(article.id)}
              className="flex items-center gap-1 hover:text-[#b91c1c] cursor-pointer"
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-[#b91c1c] text-[#b91c1c]' : ''}`} />
              <span>{isSaved ? 'Saved' : 'Save'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1 bg-[#EEEBE1] border border-[#1A1A1A] px-2 py-1 hover:bg-[#1A1A1A] hover:text-[#F9F7F2] cursor-pointer transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print Dispatch</span>
            </button>
          </div>
        </div>

        {/* Newspaper Article Body */}
        <article className="space-y-6 relative">
          <div className="text-center max-w-2xl mx-auto border-b-2 border-[#1A1A1A] pb-4 relative">
            <div className="absolute top-0 right-0 sm:-right-8 ink-stamp text-xs py-1 px-3 shadow-md z-10">
              {isSaved ? 'ARCHIVED RECORD' : article.stamp || 'CONFIRMED DISPATCH'}
            </div>
            <h1 className="font-headline text-3xl sm:text-5xl font-black text-[#1A1A1A] leading-tight my-2">
              {article.title}
            </h1>
            <p className="font-serif italic text-base sm:text-lg text-[#1A1A1A]/80 font-semibold">
              {article.subtitle}
            </p>
            <p className="font-sans text-xs uppercase text-[#1A1A1A]/60 font-bold mt-2">
              {article.author} &bull; Byte Edition: {article.date}
            </p>
          </div>

          {/* Image beside / above the body text */}
          <div className={`flex flex-col ${article.imageUrl ? 'md:flex-row' : ''} gap-6 my-4`}>
            {article.imageUrl && (
              <figure className="md:w-2/5 shrink-0">
                <img
                  src={article.imageUrl}
                  onError={imgError}
                  alt={article.title}
                  className="w-full max-h-[480px] object-cover border-2 border-[#1A1A1A] vintage-sepia"
                />
                <figcaption className="p-2 bg-[#EEEBE1] text-xs font-sans text-[#1A1A1A] italic border-b-2 border-l-2 border-r-2 border-[#1A1A1A]">
                  {article.imageCaption || 'Official Gazette Photogram.'}
                </figcaption>
              </figure>
            )}

            {/* Body Text */}
            <div className="font-serif text-base text-[#1A1A1A] leading-relaxed drop-cap space-y-4 flex-1">
              <p>{article.leadParagraph}</p>
              {article.bodyParagraphs.map((para, idx) => (
                <p key={idx}>{para}</p>
              ))}
            </div>
          </div>

          {article.pullQuote && (
            <div className="my-6 p-6 bg-[#EEEBE1] border-l-8 border-[#b91c1c] font-headline italic text-lg text-[#1A1A1A] shadow-xs">
              <Quote className="w-6 h-6 text-[#b91c1c] mb-1" />
              "{article.pullQuote}"
            </div>
          )}

          {article.keyTakeaways && article.keyTakeaways.length > 0 && (
            <div className="p-5 border-2 border-[#1A1A1A] bg-[#EEEBE1]">
              <span className="font-sans text-xs font-bold text-[#b91c1c] uppercase tracking-widest block mb-2">
                DAILY BYTE BRIEFING HIGHLIGHTS
              </span>
              <ul className="list-disc list-inside text-xs sm:text-sm font-serif text-[#1A1A1A] space-y-1">
                {article.keyTakeaways.map((point, kIdx) => (
                  <li key={kIdx}>{point}</li>
                ))}
              </ul>
            </div>
          )}

          {article.sourceUrl && (
            <div className="mt-6 pt-4 border-t-2 border-[#1A1A1A]">
              <a
                href={article.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block font-sans text-xs font-bold uppercase tracking-widest text-[#b91c1c] hover:text-[#1A1A1A] border-2 border-[#b91c1c] hover:border-[#1A1A1A] px-4 py-2"
              >
                READ THE ORIGINAL {article.sourceName ? `— ${article.sourceName.toUpperCase()}` : ''} →
              </a>
            </div>
          )}
        </article>

        {/* Letters to the Editor (Comments) Section */}
        <section className="mt-12 pt-8 border-t-4 border-[#1A1A1A] no-print">
          <div className="flex items-center gap-2 mb-6">
            <MessageSquare className="w-5 h-5 text-[#b91c1c]" />
            <h3 className="font-sans text-lg font-bold uppercase tracking-wider text-[#1A1A1A]">
              LETTERS TO THE EDITOR ({article.comments.length})
            </h3>
          </div>

          {/* Form to submit letter */}
          <form onSubmit={handleSubmitLetter} className="mb-8 p-5 bg-[#EEEBE1] border-2 border-[#1A1A1A]">
            <h4 className="font-sans text-xs font-bold text-[#1A1A1A] uppercase tracking-wider mb-3">
              Submit Your Correspondence to the Editor
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
              <input
                type="text"
                placeholder="Your Name & Credentials (e.g. Dr. H. Watson)"
                value={readerName}
                onChange={(e) => setReaderName(e.target.value)}
                className="bg-[#F9F7F2] border border-[#1A1A1A] p-2 text-xs font-serif"
              />
            </div>

            <textarea
              rows={3}
              placeholder="Write your thoughts or critique regarding this dispatch..."
              value={letterText}
              onChange={(e) => setLetterText(e.target.value)}
              className="w-full bg-[#F9F7F2] border border-[#1A1A1A] p-2.5 text-xs font-serif mb-3"
            />

            <button
              type="submit"
              disabled={isSubmittingLetter || !letterText.trim()}
              className="bg-[#1A1A1A] text-[#F9F7F2] hover:bg-[#b91c1c] disabled:opacity-50 px-4 py-2 text-xs font-sans font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-colors"
            >
              {isSubmittingLetter ? (
                <span>Dispatching Letter...</span>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Letter & Await Editorial Reply</span>
                </>
              )}
            </button>
          </form>

          {/* Existing Published Letters */}
          <div className="space-y-4">
            {article.comments.map((comment) => (
              <div key={comment.id} className="p-4 bg-[#F9F7F2] border border-[#1A1A1A] space-y-2">
                <div className="flex justify-between items-center text-xs font-sans font-bold uppercase text-[#1A1A1A]">
                  <span>{comment.author}</span>
                  <span className="text-[#1A1A1A]/60">{comment.date}</span>
                </div>
                <p className="font-serif text-xs text-[#1A1A1A] italic">
                  "{comment.message}"
                </p>

                {comment.editorResponse && (
                  <div className="mt-2 p-3 bg-[#EEEBE1] border-l-4 border-[#b91c1c] text-xs font-serif text-[#1A1A1A]">
                    <span className="font-sans font-bold text-[#b91c1c] uppercase block mb-1">
                      REPLY FROM THE EDITOR:
                    </span>
                    <p>{comment.editorResponse}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
};
