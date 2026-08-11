"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GazetteIssue, Article } from '../../types';
import { FrontPageGrid } from './FrontPageGrid';
import { Printer, Sparkles, Sliders, Eye, RotateCcw, X, Layers, Droplet, ZoomIn, Check, RefreshCw } from 'lucide-react';

interface PressSheetSimulationProps {
  issue: GazetteIssue;
  onClose: () => void;
  onSelectArticle: (article: Article) => void;
  onPlayAudio: (article: Article) => void;
  onLikeArticle: (articleId: string) => void;
  savedArticleIds: string[];
  onToggleSave: (articleId: string) => void;
}

export const PressSheetSimulation: React.FC<PressSheetSimulationProps> = ({
  issue,
  onClose,
  onSelectArticle,
  onPlayAudio,
  onLikeArticle,
  savedArticleIds,
  onToggleSave,
}) => {
  // Press Sheet parameters
  const [inkDensity, setInkDensity] = useState<number>(100); // 60% to 150%
  const [paperTexture, setPaperTexture] = useState<'newsprint' | 'parchment' | 'kraft' | 'glossy'>('newsprint');
  const [isInkSmearing, setIsInkSmearing] = useState<boolean>(false);
  const [isCrumpling, setIsCrumpling] = useState<boolean>(false);
  const [isLoupeActive, setIsLoupeActive] = useState<boolean>(false);
  const [loupePos, setLoupePos] = useState({ x: 0, y: 0, relX: 0, relY: 0 });
  const [pressRunCount, setPressRunCount] = useState<number>(18420);

  // Sound synthesis using Web Audio API
  const playPressSound = (type: 'roller' | 'crumple' | 'click') => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();

      if (type === 'roller') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(90, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 1.2);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 1.5);
      } else if (type === 'crumple') {
        const bufferSize = ctx.sampleRate * 0.4;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 1200;
        const gain = ctx.createGain();
        gain.gain.value = 0.15;
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start();
      } else if (type === 'click') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      }
    } catch (e) {
      // Audio fallback
    }
  };

  // Trigger paper crumple and unfold animation
  const handleTriggerCrumple = () => {
    setIsCrumpling(true);
    playPressSound('crumple');
    setTimeout(() => {
      setIsCrumpling(false);
      setPressRunCount((prev) => prev + 1);
    }, 1200);
  };

  // Trigger ink smear animation
  const handleRunInkSmear = () => {
    setIsInkSmearing(true);
    playPressSound('roller');
    setTimeout(() => {
      setIsInkSmearing(false);
    }, 2500);
  };

  // Loupe mouse movement
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isLoupeActive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setLoupePos({
      x: e.clientX,
      y: e.clientY,
      relX: (x / rect.width) * 100,
      relY: (y / rect.height) * 100,
    });
  };

  // Handle actual browser printing
  const handlePrint = () => {
    window.print();
  };

  // Background style based on paper texture choice
  const getPaperStyle = () => {
    switch (paperTexture) {
      case 'parchment':
        return 'bg-[#F2E8D5] text-[#1A1815] border-[#2A241C]';
      case 'kraft':
        return 'bg-[#E3D3BA] text-[#241E17] border-[#1C1610]';
      case 'glossy':
        return 'bg-[#FFFFFF] text-[#0A0A0A] border-[#0A0A0A]';
      case 'newsprint':
      default:
        return 'bg-[#F9F7F2] text-[#1A1A1A] border-[#1A1A1A]';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#121214] text-[#F9F7F2] overflow-y-auto font-sans flex flex-col">
      
      {/* Top Industrial Press Control Console */}
      <header className="sticky top-0 z-50 bg-[#1A1A1E] border-b-2 border-[#b91c1c] p-3 px-4 shadow-xl no-print">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          
          {/* Title & Press Machine Status */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#b91c1c]/20 text-[#b91c1c] border border-[#b91c1c]/40 shrink-0">
              <Printer className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono-tech text-[10px] bg-[#b91c1c] text-white px-1.5 py-0.2 uppercase font-bold tracking-widest">
                  PRESS ROOM SIMULATION
                </span>
                <span className="font-mono-tech text-[10px] text-[#A1A1AA] uppercase tracking-widest">
                  RUN #{pressRunCount} &middot; ROTARY OFFSET PRESS 04
                </span>
              </div>
              <h2 className="font-headline text-lg font-bold text-white leading-none mt-1">
                Digital Press Sheet Inspection Bed
              </h2>
            </div>
          </div>

          {/* Interactive Controls Toolbar */}
          <div className="flex flex-wrap items-center gap-3 text-xs font-sans uppercase font-bold tracking-wider">
            
            {/* Paper Texture Switcher */}
            <div className="flex items-center gap-1.5 bg-[#27272A] p-1 border border-[#3F3F46]">
              <Layers className="w-3.5 h-3.5 text-[#b91c1c] ml-1" />
              <span className="text-[10px] text-[#A1A1AA] mr-1 hidden sm:inline">Stock:</span>
              {(['newsprint', 'parchment', 'kraft', 'glossy'] as const).map((tex) => (
                <button
                  key={tex}
                  onClick={() => setPaperTexture(tex)}
                  className={`px-2 py-1 text-[10px] cursor-pointer transition-colors capitalize ${
                    paperTexture === tex ? 'bg-[#b91c1c] text-white' : 'text-[#A1A1AA] hover:text-white'
                  }`}
                >
                  {tex}
                </button>
              ))}
            </div>

            {/* Ink Density Control */}
            <div className="flex items-center gap-2 bg-[#27272A] px-2.5 py-1 border border-[#3F3F46]">
              <Droplet className="w-3.5 h-3.5 text-[#b91c1c]" />
              <span className="text-[10px] text-[#A1A1AA]">Ink: {inkDensity}%</span>
              <input
                type="range"
                min="60"
                max="150"
                value={inkDensity}
                onChange={(e) => setInkDensity(Number(e.target.value))}
                className="w-20 accent-[#b91c1c] cursor-pointer"
              />
            </div>

            {/* Ink Smear Action Button */}
            <button
              onClick={handleRunInkSmear}
              disabled={isInkSmearing}
              className="flex items-center gap-1.5 bg-[#27272A] hover:bg-[#3F3F46] border border-[#3F3F46] px-3 py-1.5 text-xs text-[#F9F7F2] cursor-pointer transition-colors"
              title="Run Press Roller (Ink Smear Animation)"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#b91c1c]" />
              <span>Ink Smear</span>
            </button>

            {/* Paper Crumple Physics Button */}
            <button
              onClick={handleTriggerCrumple}
              disabled={isCrumpling}
              className="flex items-center gap-1.5 bg-[#27272A] hover:bg-[#3F3F46] border border-[#3F3F46] px-3 py-1.5 text-xs text-[#F9F7F2] cursor-pointer transition-colors"
              title="Crumple & Flatten Sheet"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#b91c1c] ${isCrumpling ? 'animate-spin' : ''}`} />
              <span>Crumple Paper</span>
            </button>

            {/* Magnifying Loupe Toggle */}
            <button
              onClick={() => setIsLoupeActive(!isLoupeActive)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs cursor-pointer border transition-colors ${
                isLoupeActive
                  ? 'bg-[#b91c1c] text-white border-[#b91c1c]'
                  : 'bg-[#27272A] text-[#F9F7F2] border-[#3F3F46] hover:bg-[#3F3F46]'
              }`}
            >
              <ZoomIn className="w-3.5 h-3.5" />
              <span>Loupe {isLoupeActive ? 'ON' : 'OFF'}</span>
            </button>

            {/* Actual Print Trigger */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-[#b91c1c] hover:bg-[#991b1b] text-white px-3 py-1.5 text-xs font-bold cursor-pointer transition-colors shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Print Sheet</span>
            </button>

            {/* Exit Simulation */}
            <button
              onClick={onClose}
              className="p-1.5 bg-[#27272A] hover:bg-[#b91c1c] text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

        </div>
      </header>

      {/* Main Press Table Area */}
      <main className="flex-1 p-4 sm:p-8 bg-[#18181B] relative overflow-hidden flex flex-col items-center justify-center">
        
        {/* Stainless Steel / Slate Grid Guide Background */}
        <div 
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#A1A1AA 1px, transparent 1px), linear-gradient(to right, #3F3F46 1px, transparent 1px), linear-gradient(to bottom, #3F3F46 1px, transparent 1px)`,
            backgroundSize: '24px 24px, 96px 96px, 96px 96px'
          }}
        />

        {/* Ink Smear Roller Sweeping Overlay Animation */}
        <AnimatePresence>
          {isInkSmearing && (
            <motion.div
              initial={{ y: '-100%', opacity: 0.9 }}
              animate={{ y: '200%', opacity: 0.2 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2.2, ease: 'easeInOut' }}
              className="absolute inset-x-0 h-48 bg-gradient-to-b from-black/80 via-black/40 to-transparent z-40 pointer-events-none flex items-center justify-center"
            >
              <div className="w-full h-4 bg-[#1A1A1A] border-y-2 border-[#b91c1c] shadow-2xl flex items-center justify-center">
                <span className="font-mono-tech text-xs font-bold text-white uppercase tracking-widest bg-black px-3 py-0.5 border border-[#b91c1c]">
                  FRESH WET INK ROLLER PASSING...
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Paper Unfold / Crumple Animated Press Sheet Wrapper */}
        <motion.div
          initial={{ scale: 0.8, rotateX: 25, rotate: -3, opacity: 0 }}
          animate={
            isCrumpling
              ? {
                  scale: [1, 0.88, 0.85, 0.95, 1],
                  rotate: [0, -4, 5, -2, 0],
                  rotateX: [0, 20, -15, 10, 0],
                  skewX: [0, -3, 3, -1, 0],
                  filter: ['blur(0px)', 'blur(1px)', 'blur(0px)'],
                }
              : { scale: 1, rotateX: 0, rotate: 0, skewX: 0, opacity: 1 }
          }
          transition={{ duration: isCrumpling ? 1.2 : 0.6, ease: 'easeOut' }}
          onMouseMove={handleMouseMove}
          className={`relative max-w-6xl w-full my-6 p-8 sm:p-12 shadow-2xl transition-colors duration-300 border-8 ${getPaperStyle()}`}
          style={{
            filter: `contrast(${100 + (inkDensity - 100) * 0.4}%) brightness(${100 - (inkDensity - 100) * 0.15}%)`,
          }}
        >
          
          {/* Top CMYK Color Density Strip & Trim Marks */}
          <div className="flex justify-between items-center border-b-2 border-[#1A1A1A] pb-3 mb-6 font-mono-tech text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A]">
            {/* CMYK Target Marks */}
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full border border-black bg-cyan-500 inline-block"></span>
                <span>C</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full border border-black bg-pink-500 inline-block"></span>
                <span>M</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full border border-black bg-yellow-400 inline-block"></span>
                <span>Y</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full border border-black bg-black inline-block"></span>
                <span>K</span>
              </span>
              <span className="ml-2 font-mono text-[#b91c1c]">⊕ REGISTRATION TARGET OK</span>
            </div>

            {/* Grayscale Step Wedge */}
            <div className="hidden md:flex items-center border border-black">
              {[10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((step) => (
                <div
                  key={step}
                  className="w-5 h-4 flex items-center justify-center text-[8px] text-white font-mono"
                  style={{ backgroundColor: `rgba(0,0,0, ${step / 100})` }}
                >
                  {step === 100 ? 'K' : ''}
                </div>
              ))}
            </div>

            {/* Press Binders Signature Code */}
            <div>
              <span>BYTE PRESS SHEET #4821-B</span>
            </div>
          </div>

          {/* Corner Registration Crosshair Target Symbols */}
          <div className="absolute top-2 left-2 text-[#1A1A1A] font-mono text-xs select-none pointer-events-none">
            ⊕ 1.0" TRIM
          </div>
          <div className="absolute top-2 right-2 text-[#1A1A1A] font-mono text-xs select-none pointer-events-none">
            ⊕ 1.0" TRIM
          </div>
          <div className="absolute bottom-2 left-2 text-[#1A1A1A] font-mono text-xs select-none pointer-events-none">
            ⊕ BINDERY MARK
          </div>
          <div className="absolute bottom-2 right-2 text-[#1A1A1A] font-mono text-xs select-none pointer-events-none">
            ⊕ BINDERY MARK
          </div>

          {/* Subtle Paper Crease & Fold Texture Lines */}
          <div className="absolute inset-y-0 left-1/2 w-px bg-black/10 pointer-events-none" />
          <div className="absolute inset-x-0 top-1/2 h-px bg-black/10 pointer-events-none" />

          {/* Actual Newspaper Front Page Grid Content inside Press Sheet */}
          <div className="newspaper-paper bg-transparent">
            <FrontPageGrid
              issue={issue}
              onSelectArticle={onSelectArticle}
              onPlayAudio={onPlayAudio}
              onLikeArticle={onLikeArticle}
              savedArticleIds={savedArticleIds}
              onToggleSaveArticle={onToggleSave}
            />
          </div>

          {/* Bottom Press Sheet Footer Approval Stamp */}
          <div className="mt-8 pt-4 border-t-2 border-[#1A1A1A] flex flex-wrap justify-between items-center font-mono-tech text-[10px] text-[#1A1A1A] font-bold uppercase">
            <div className="flex items-center gap-2">
              <span className="p-1 bg-[#1A1A1A] text-white">CHIEF COMPOSITOR:</span>
              <span>GEMINI AI PRESS DESK &middot; VERIFIED DENSITY {inkDensity}%</span>
            </div>
            <div>
              <span>PAGE 1 OF 1 &middot; DAILY DISPATCH</span>
            </div>
          </div>

        </motion.div>

        {/* Loupe Magnifier Glass Overlay when toggled ON */}
        {isLoupeActive && (
          <div
            className="fixed z-50 w-44 h-44 rounded-full border-4 border-[#b91c1c] shadow-2xl pointer-events-none overflow-hidden bg-white"
            style={{
              left: loupePos.x - 88,
              top: loupePos.y - 88,
              boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.4), 0 20px 25px -5px rgba(0, 0, 0, 0.5)'
            }}
          >
            <div className="w-full h-full p-2 bg-[#F9F7F2] flex flex-col justify-between items-center text-center">
              <span className="font-mono-tech text-[9px] font-bold bg-[#b91c1c] text-white px-1.5 py-0.5 uppercase">
                2.5X PRINT LOUPE
              </span>
              <div className="font-serif text-[10px] text-[#1A1A1A] leading-tight">
                <p className="font-black uppercase">HALFTONE DOT MATRIX</p>
                <p className="text-[9px] text-[#1A1A1A]/70 italic mt-0.5">
                  Resolution: 1200 DPI Letterpress Grain
                </p>
              </div>
              <span className="font-mono-tech text-[8px] text-[#b91c1c] font-bold">
                X: {Math.round(loupePos.relX)}% Y: {Math.round(loupePos.relY)}%
              </span>
            </div>
          </div>
        )}

      </main>

    </div>
  );
};
