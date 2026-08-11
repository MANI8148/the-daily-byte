import React, { useState, useEffect } from 'react';
import { Article } from '../types';
import { Play, Pause, Square, Volume2, Radio, X, Gauge } from 'lucide-react';

interface AudioPlayerBarProps {
  article: Article | null;
  onClose: () => void;
}

export const AudioPlayerBar: React.FC<AudioPlayerBarProps> = ({ article, onClose }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [rate, setRate] = useState<number>(1);
  const [utterance, setUtterance] = useState<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (!article) {
      if (utterance) window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    window.speechSynthesis.cancel();

    const fullText = `${article.title}. ${article.subtitle}. ${article.leadParagraph}. ${article.bodyParagraphs.join(' ')}`;
    const newUtterance = new SpeechSynthesisUtterance(fullText);
    newUtterance.rate = rate;

    newUtterance.onend = () => {
      setIsPlaying(false);
    };

    newUtterance.onerror = () => {
      setIsPlaying(false);
    };

    setUtterance(newUtterance);
    window.speechSynthesis.speak(newUtterance);
    setIsPlaying(true);

    return () => {
      window.speechSynthesis.cancel();
    };
  }, [article]);

  const togglePlay = () => {
    if (!article) return;

    if (isPlaying) {
      window.speechSynthesis.pause();
      setIsPlaying(false);
    } else {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      } else if (utterance) {
        window.speechSynthesis.speak(utterance);
      }
      setIsPlaying(true);
    }
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  };

  const handleRateChange = (newRate: number) => {
    setRate(newRate);
    if (utterance) {
      utterance.rate = newRate;
      if (isPlaying) {
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
      }
    }
  };

  if (!article) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 bg-[#1A1A1A] text-[#F9F7F2] border-t-4 border-[#b91c1c] shadow-2xl p-3 sm:p-4 no-print">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
        
        {/* Left: Broadcast Indicator & Article Title */}
        <div className="flex items-center gap-3 min-w-0 max-w-md">
          <div className="p-2 bg-[#b91c1c]/20 text-[#b91c1c] shrink-0">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div className="min-w-0">
            <span className="font-sans text-[10px] text-[#F9F7F2]/60 uppercase tracking-widest block font-bold">
              DAILY BYTE RADIO NARRATION
            </span>
            <p className="font-headline text-sm font-bold text-[#F9F7F2] truncate">
              {article.title}
            </p>
          </div>
        </div>

        {/* Center: Controls */}
        <div className="flex items-center gap-4">
          <button
            onClick={togglePlay}
            className="p-2.5 bg-[#b91c1c] hover:bg-[#991b1b] text-white transition-colors cursor-pointer shadow-xs"
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white ml-0.5" />}
          </button>

          <button
            onClick={handleStop}
            className="p-2 bg-[#27272a] hover:bg-[#3f3f46] text-[#F9F7F2]/70 transition-colors cursor-pointer"
          >
            <Square className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1 font-mono-tech text-xs bg-[#27272a] px-2 py-1">
            <Gauge className="w-3.5 h-3.5 text-[#b91c1c]" />
            {[0.8, 1, 1.25].map((speed) => (
              <button
                key={speed}
                onClick={() => handleRateChange(speed)}
                className={`px-1.5 py-0.5 cursor-pointer ${
                  rate === speed ? 'bg-[#b91c1c] text-white font-bold' : 'text-[#F9F7F2]/60 hover:text-white'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>

        {/* Right: Close Bar */}
        <button
          onClick={() => {
            handleStop();
            onClose();
          }}
          className="p-1.5 text-[#F9F7F2]/60 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

      </div>
    </div>
  );
};
