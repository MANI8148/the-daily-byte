"use client";
import React, { useState, useEffect } from 'react';
import { GazetteIssue } from '../../types';
import { Sparkles, CheckCircle2, AlertCircle, RefreshCw, HelpCircle, Grid, Cpu, Trophy, RotateCcw } from 'lucide-react';

interface TechPuzzleSectionProps {
  issue: GazetteIssue;
}

interface GridCell {
  letter?: string;
  num?: number;
  isBlack?: boolean;
}

// 5x5 Crossword Grid layout definition
const INITIAL_CROSSWORD_GRID: GridCell[][] = [
  [{ letter: 'C', num: 1 }, { letter: 'Y' }, { letter: 'B', num: 2 }, { letter: 'E' }, { letter: 'R', num: 3 }],
  [{ letter: 'O' }, { isBlack: true }, { letter: 'Y' }, { isBlack: true }, { letter: 'O' }],
  [{ letter: 'D', num: 4 }, { letter: 'A' }, { letter: 'T' }, { letter: 'A' }, { letter: 'B' }],
  [{ letter: 'E' }, { isBlack: true }, { letter: 'E' }, { isBlack: true }, { letter: 'O' }],
  [{ letter: 'S', num: 5 }, { letter: 'Y' }, { letter: 'S' }, { letter: 'O' }, { letter: 'T' }],
];

// Clues definition with fallback cryptic clues
const DEFAULT_CLUES = {
  across: [
    { num: 1, word: 'CYBER', row: 0, col: 0, clue: 'Virtual frontier realm entangled in digital wires (5)', hint: 'Prefix for security or punk' },
    { num: 4, word: 'DATAB', row: 2, col: 0, clue: 'Short for structured repository storage bank (5)', hint: 'Where neural weights reside' },
    { num: 5, word: 'SYSOT', row: 4, col: 0, clue: 'System operator on early bulletin boards (5)', hint: 'Classic sysop admin alias' },
  ],
  down: [
    { num: 1, word: 'CODES', row: 0, col: 0, clue: 'Cryptographic instructions executed by machine (5)', hint: 'Programmers write this' },
    { num: 2, word: 'BYTES', row: 0, col: 2, clue: 'Eight binary bits wrapped in a single cluster (5)', hint: 'Storage measurement unit' },
    { num: 3, word: 'ROBOT', row: 0, col: 4, clue: 'Automated mechanical worker obeying instructions (5)', hint: 'Kapek coined this word' },
  ]
};

// 4x4 Sudoku Puzzle
const SUDOKU_SOLUTION = [
  [1, 2, 3, 4],
  [4, 3, 2, 1],
  [3, 4, 1, 2],
  [2, 1, 4, 3]
];

const INITIAL_SUDOKU = [
  [1, 0, 0, 4],
  [0, 3, 2, 0],
  [0, 4, 1, 0],
  [2, 0, 0, 3]
];

const DEFAULT_SUDOKU_TRIVIA = [
  { number: 1, question: "Binary value representing HIGH / TRUE state.", clue: "Single bit pulse" },
  { number: 2, question: "Dual-core processor thread count.", clue: "Base-2 fundamental" },
  { number: 3, question: "Number of primary colors in RGB additive model.", clue: "Red, Green, Blue" },
  { number: 4, question: "Number of bits in a standard computing nibble.", clue: "Half an 8-bit byte" },
];

export const TechPuzzleSection: React.FC<TechPuzzleSectionProps> = ({ issue }) => {
  const [activeTab, setActiveTab] = useState<'crossword' | 'sudoku'>('crossword');

  // Crossword state
  const [userGrid, setUserGrid] = useState<string[][]>(() => 
    Array(5).fill(null).map(() => Array(5).fill(''))
  );
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>({ row: 0, col: 0 });
  const [direction, setDirection] = useState<'across' | 'down'>('across');
  const [clues, setClues] = useState(DEFAULT_CLUES);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [crosswordStatus, setCrosswordStatus] = useState<string | null>(null);
  const [revealedCells, setRevealedCells] = useState<boolean[][]>(() =>
    Array(5).fill(null).map(() => Array(5).fill(false))
  );

  // Sudoku state
  const [sudokuGrid, setSudokuGrid] = useState<number[][]>(INITIAL_SUDOKU);
  const [selectedSudokuCell, setSelectedSudokuCell] = useState<{ row: number; col: number } | null>(null);
  const [sudokuStatus, setSudokuStatus] = useState<string | null>(null);
  const [sudokuTrivia, setSudokuTrivia] = useState(DEFAULT_SUDOKU_TRIVIA);

  // Fetch AI Clues for current issue
  const handleGenerateAiClues = async () => {
    setIsGeneratingAi(true);
    setCrosswordStatus('Gemini AI drafting cryptic clues from today\'s dispatches...');
    try {
      const res = await fetch('/api/gemini/generate-crossword', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          issueTitle: issue.leadHeroArticle.title,
          words: ['CYBER', 'DATAB', 'SYSOT', 'CODES', 'BYTES', 'ROBOT'],
        }),
      });

      if (!res.ok) throw new Error('Failed to generate AI clues');

      const data = await res.json();
      if (data.crosswordClues && data.crosswordClues.length > 0) {
        // Map generated clues to crossword structure
        const updatedAcross = clues.across.map((c) => {
          const match = data.crosswordClues.find((item: any) => item.word.toUpperCase() === c.word);
          return match ? { ...c, clue: match.clue, hint: match.hint } : c;
        });

        const updatedDown = clues.down.map((c) => {
          const match = data.crosswordClues.find((item: any) => item.word.toUpperCase() === c.word);
          return match ? { ...c, clue: match.clue, hint: match.hint } : c;
        });

        setClues({ across: updatedAcross, down: updatedDown });
      }

      if (data.sudokuClues && data.sudokuClues.length > 0) {
        setSudokuTrivia(data.sudokuClues);
      }

      setCrosswordStatus('Gemini AI clues successfully published to today\'s byte!');
    } catch (err) {
      console.error(err);
      setCrosswordStatus('Using offline editorial clues.');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Handle cell click
  const handleCellClick = (row: number, col: number) => {
    if (INITIAL_CROSSWORD_GRID[row][col].isBlack) return;
    if (selectedCell?.row === row && selectedCell?.col === col) {
      // Toggle direction if clicking same cell
      setDirection((prev) => (prev === 'across' ? 'down' : 'across'));
    } else {
      setSelectedCell({ row, col });
    }
  };

  // Handle key press for crossword
  const handleKeyDown = (e: React.KeyboardEvent, row: number, col: number) => {
    if (!selectedCell) return;

    if (e.key === 'Backspace') {
      const newGrid = [...userGrid.map((r) => [...r])];
      newGrid[row][col] = '';
      setUserGrid(newGrid);
      // Move backward
      moveToPrevCell(row, col);
    } else if (e.key === 'ArrowRight') {
      moveSelected(0, 1);
    } else if (e.key === 'ArrowLeft') {
      moveSelected(0, -1);
    } else if (e.key === 'ArrowDown') {
      moveSelected(1, 0);
    } else if (e.key === 'ArrowUp') {
      moveSelected(-1, 0);
    } else if (/^[a-zA-Z]$/.test(e.key)) {
      const char = e.key.toUpperCase();
      const newGrid = [...userGrid.map((r) => [...r])];
      newGrid[row][col] = char;
      setUserGrid(newGrid);
      // Move forward
      moveToNextCell(row, col);
    }
  };

  const moveSelected = (dRow: number, dCol: number) => {
    if (!selectedCell) return;
    let nr = selectedCell.row + dRow;
    let nc = selectedCell.col + dCol;
    if (nr >= 0 && nr < 5 && nc >= 0 && nc < 5 && !INITIAL_CROSSWORD_GRID[nr][nc].isBlack) {
      setSelectedCell({ row: nr, col: nc });
    }
  };

  const moveToNextCell = (r: number, c: number) => {
    if (direction === 'across') {
      let nc = c + 1;
      while (nc < 5 && INITIAL_CROSSWORD_GRID[r][nc].isBlack) nc++;
      if (nc < 5) setSelectedCell({ row: r, col: nc });
    } else {
      let nr = r + 1;
      while (nr < 5 && INITIAL_CROSSWORD_GRID[nr][c].isBlack) nr++;
      if (nr < 5) setSelectedCell({ row: nr, col: c });
    }
  };

  const moveToPrevCell = (r: number, c: number) => {
    if (direction === 'across') {
      let nc = c - 1;
      while (nc >= 0 && INITIAL_CROSSWORD_GRID[r][nc].isBlack) nc--;
      if (nc >= 0) setSelectedCell({ row: r, col: nc });
    } else {
      let nr = r - 1;
      while (nr >= 0 && INITIAL_CROSSWORD_GRID[nr][c].isBlack) nr--;
      if (nr >= 0) setSelectedCell({ row: nr, col: c });
    }
  };

  // Check crossword answers
  const handleCheckCrossword = () => {
    let totalCells = 0;
    let correctCells = 0;

    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        if (!INITIAL_CROSSWORD_GRID[r][c].isBlack) {
          totalCells++;
          if (userGrid[r][c] === INITIAL_CROSSWORD_GRID[r][c].letter) {
            correctCells++;
          }
        }
      }
    }

    if (correctCells === totalCells) {
      setCrosswordStatus('🎉 BYTE COPY DESK: PERFECT SOLUTION! All dispatches deciphered!');
    } else {
      setCrosswordStatus(`✏️ BYTE COPY DESK: ${correctCells} of ${totalCells} letters verified correct.`);
    }
  };

  // Reveal current word
  const handleRevealCell = () => {
    if (!selectedCell) return;
    const { row, col } = selectedCell;
    const correctLetter = INITIAL_CROSSWORD_GRID[row][col].letter;
    if (correctLetter) {
      const newGrid = [...userGrid.map((r) => [...r])];
      newGrid[row][col] = correctLetter;
      setUserGrid(newGrid);

      const newRevealed = [...revealedCells.map((r) => [...r])];
      newRevealed[row][col] = true;
      setRevealedCells(newRevealed);
    }
  };

  // Reset Crossword
  const handleResetCrossword = () => {
    setUserGrid(Array(5).fill(null).map(() => Array(5).fill('')));
    setRevealedCells(Array(5).fill(null).map(() => Array(5).fill(false)));
    setCrosswordStatus(null);
  };

  // Sudoku handlers
  const handleSudokuInput = (num: number) => {
    if (!selectedSudokuCell) return;
    const { row, col } = selectedSudokuCell;
    if (INITIAL_SUDOKU[row][col] !== 0) return; // pre-filled cell cannot be edited

    const newSudoku = [...sudokuGrid.map((r) => [...r])];
    newSudoku[row][col] = num;
    setSudokuGrid(newSudoku);
  };

  const handleCheckSudoku = () => {
    let correct = true;
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (sudokuGrid[r][c] !== SUDOKU_SOLUTION[r][c]) {
          correct = false;
          break;
        }
      }
    }

    if (correct) {
      setSudokuStatus('🌟 PERFECT LOGIC! Tech Sudoku grid solved successfully!');
    } else {
      setSudokuStatus('❌ Incomplete or invalid matrix values. Re-check rows & columns!');
    }
  };

  const handleResetSudoku = () => {
    setSudokuGrid(INITIAL_SUDOKU);
    setSudokuStatus(null);
  };

  return (
    <div className="bg-[#EEEBE1] border-2 border-[#1A1A1A] p-5 my-6 text-[#1A1A1A]">
      
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center border-b-2 border-[#1A1A1A] pb-3 mb-4">
        <div>
          <span className="font-sans text-[10px] font-bold uppercase tracking-widest text-[#b91c1c]">
            DAILY BYTE PASTIMES & PUZZLES
          </span>
          <h3 className="font-headline text-2xl font-bold text-[#1A1A1A] leading-tight">
            Cryptic Tech Crossword & Sudoku
          </h3>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-[#F9F7F2] border border-[#1A1A1A] p-1">
          <button
            onClick={() => setActiveTab('crossword')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-sans font-bold uppercase tracking-wider cursor-pointer transition-colors ${
              activeTab === 'crossword' ? 'bg-[#1A1A1A] text-[#F9F7F2]' : 'text-[#1A1A1A] hover:bg-[#EEEBE1]'
            }`}
          >
            <Grid className="w-3.5 h-3.5 text-[#b91c1c]" />
            <span>Cryptic Crossword</span>
          </button>

          <button
            onClick={() => setActiveTab('sudoku')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-sans font-bold uppercase tracking-wider cursor-pointer transition-colors ${
              activeTab === 'sudoku' ? 'bg-[#1A1A1A] text-[#F9F7F2]' : 'text-[#1A1A1A] hover:bg-[#EEEBE1]'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-[#b91c1c]" />
            <span>Tech Sudoku</span>
          </button>
        </div>
      </div>

      {/* CROSSWORD TAB */}
      {activeTab === 'crossword' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            
            {/* 5x5 Crossword Grid (Cols 1 to 5) */}
            <div className="md:col-span-5 flex flex-col items-center bg-[#F9F7F2] p-4 border border-[#1A1A1A]">
              <div className="grid grid-cols-5 gap-1 bg-[#1A1A1A] p-1.5 shadow-md border-2 border-[#1A1A1A] w-64 h-64">
                {INITIAL_CROSSWORD_GRID.map((row, rIdx) =>
                  row.map((cell, cIdx) => {
                    if (cell.isBlack) {
                      return (
                        <div
                          key={`${rIdx}-${cIdx}`}
                          className="bg-[#1A1A1A] w-full h-full border border-black/40"
                        />
                      );
                    }

                    const isSelected = selectedCell?.row === rIdx && selectedCell?.col === cIdx;
                    const userVal = userGrid[rIdx][cIdx];
                    const isRevealed = revealedCells[rIdx][cIdx];

                    return (
                      <div
                        key={`${rIdx}-${cIdx}`}
                        onClick={() => handleCellClick(rIdx, cIdx)}
                        tabIndex={0}
                        onKeyDown={(e) => handleKeyDown(e, rIdx, cIdx)}
                        className={`relative w-full h-full flex items-center justify-center font-mono-tech text-xl font-bold uppercase cursor-pointer select-none transition-colors border ${
                          isSelected
                            ? 'bg-[#b91c1c] text-[#F9F7F2] ring-2 ring-[#1A1A1A]'
                            : 'bg-[#F9F7F2] text-[#1A1A1A] hover:bg-[#EEEBE1]'
                        }`}
                      >
                        {/* Clue Number Badge */}
                        {cell.num && (
                          <span
                            className={`absolute top-0.5 left-0.5 text-[9px] font-sans font-bold leading-none ${
                              isSelected ? 'text-[#F9F7F2]' : 'text-[#b91c1c]'
                            }`}
                          >
                            {cell.num}
                          </span>
                        )}

                        {/* Entered Letter */}
                        <span className={isRevealed ? 'text-[#b91c1c] font-black' : ''}>
                          {userVal}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Grid Control Buttons */}
              <div className="flex flex-wrap gap-2 mt-4 justify-center">
                <button
                  onClick={handleCheckCrossword}
                  className="bg-[#1A1A1A] text-[#F9F7F2] hover:bg-[#b91c1c] px-3 py-1.5 text-xs font-sans font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Check Answers
                </button>

                <button
                  onClick={handleRevealCell}
                  className="bg-[#EEEBE1] border border-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-[#F9F7F2] px-3 py-1.5 text-xs font-sans font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Reveal Letter
                </button>

                <button
                  onClick={handleResetCrossword}
                  className="p-1.5 text-[#1A1A1A]/70 hover:text-[#b91c1c] transition-colors cursor-pointer"
                  title="Reset Crossword"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              {/* AI Regenerate Clues Action */}
              <button
                onClick={handleGenerateAiClues}
                disabled={isGeneratingAi}
                className="mt-3 w-full bg-[#b91c1c] text-white hover:bg-[#991b1b] disabled:opacity-50 py-2 text-xs font-sans font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                {isGeneratingAi ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Generating Gemini Clues...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate AI Clues from Issue</span>
                  </>
                )}
              </button>
            </div>

            {/* Cryptic Clues Column (Cols 6 to 12) */}
            <div className="md:col-span-7 space-y-4">
              
              {/* Across Clues */}
              <div className="bg-[#F9F7F2] p-3 border border-[#1A1A1A]">
                <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-[#b91c1c] border-b border-[#1A1A1A] pb-1 mb-2">
                  ACROSS CLUES
                </h4>
                <div className="space-y-2 text-xs font-serif">
                  {clues.across.map((c) => (
                    <div
                      key={c.num}
                      onClick={() => handleCellClick(c.row, c.col)}
                      className="cursor-pointer hover:bg-[#EEEBE1] p-1.5 transition-colors border-b border-dashed border-[#1A1A1A]/20"
                    >
                      <span className="font-sans font-bold text-[#b91c1c] mr-1.5">{c.num}.</span>
                      <span className="font-bold text-[#1A1A1A] mr-1">{c.clue}</span>
                      <span className="italic text-[#1A1A1A]/60 block text-[11px] mt-0.5">
                        Hint: {c.hint}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Down Clues */}
              <div className="bg-[#F9F7F2] p-3 border border-[#1A1A1A]">
                <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-[#b91c1c] border-b border-[#1A1A1A] pb-1 mb-2">
                  DOWN CLUES
                </h4>
                <div className="space-y-2 text-xs font-serif">
                  {clues.down.map((c) => (
                    <div
                      key={c.num}
                      onClick={() => handleCellClick(c.row, c.col)}
                      className="cursor-pointer hover:bg-[#EEEBE1] p-1.5 transition-colors border-b border-dashed border-[#1A1A1A]/20"
                    >
                      <span className="font-sans font-bold text-[#b91c1c] mr-1.5">{c.num}.</span>
                      <span className="font-bold text-[#1A1A1A] mr-1">{c.clue}</span>
                      <span className="italic text-[#1A1A1A]/60 block text-[11px] mt-0.5">
                        Hint: {c.hint}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Status Message */}
          {crosswordStatus && (
            <div className="p-3 bg-[#F9F7F2] border-l-4 border-[#b91c1c] text-xs font-sans font-bold text-[#1A1A1A] animate-fadeIn">
              {crosswordStatus}
            </div>
          )}
        </div>
      )}

      {/* SUDOKU TAB */}
      {activeTab === 'sudoku' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            
            {/* 4x4 Sudoku Matrix (Cols 1 to 5) */}
            <div className="md:col-span-5 flex flex-col items-center bg-[#F9F7F2] p-4 border border-[#1A1A1A]">
              <span className="font-sans text-[10px] font-bold text-[#1A1A1A]/70 uppercase tracking-widest mb-2">
                4x4 MINI TECH SUDOKU MATRIX
              </span>

              <div className="grid grid-cols-4 gap-0.5 bg-[#1A1A1A] p-1 border-2 border-[#1A1A1A] w-56 h-56">
                {sudokuGrid.map((row, rIdx) =>
                  row.map((val, cIdx) => {
                    const isFixed = INITIAL_SUDOKU[rIdx][cIdx] !== 0;
                    const isSelected = selectedSudokuCell?.row === rIdx && selectedSudokuCell?.col === cIdx;

                    return (
                      <div
                        key={`${rIdx}-${cIdx}`}
                        onClick={() => setSelectedSudokuCell({ row: rIdx, col: cIdx })}
                        className={`w-full h-full flex items-center justify-center font-mono-tech text-2xl font-black cursor-pointer select-none transition-colors border ${
                          isSelected
                            ? 'bg-[#b91c1c] text-[#F9F7F2]'
                            : isFixed
                            ? 'bg-[#EEEBE1] text-[#1A1A1A] font-bold'
                            : 'bg-[#F9F7F2] text-[#b91c1c] hover:bg-[#EEEBE1]'
                        }`}
                      >
                        {val !== 0 ? val : ''}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Number Input Selector Buttons */}
              <div className="flex gap-2 mt-4 items-center">
                <span className="font-sans text-[10px] font-bold text-[#1A1A1A] uppercase mr-1">Insert Digit:</span>
                {[1, 2, 3, 4].map((num) => (
                  <button
                    key={num}
                    onClick={() => handleSudokuInput(num)}
                    className="w-8 h-8 bg-[#1A1A1A] text-[#F9F7F2] hover:bg-[#b91c1c] font-mono-tech font-bold text-sm transition-colors cursor-pointer"
                  >
                    {num}
                  </button>
                ))}
              </div>

              {/* Controls */}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleCheckSudoku}
                  className="bg-[#1A1A1A] text-[#F9F7F2] hover:bg-[#b91c1c] px-3 py-1.5 text-xs font-sans font-bold uppercase tracking-wider cursor-pointer transition-colors"
                >
                  Verify Matrix
                </button>
                <button
                  onClick={handleResetSudoku}
                  className="bg-[#EEEBE1] border border-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-[#F9F7F2] px-3 py-1.5 text-xs font-sans font-bold uppercase tracking-wider cursor-pointer transition-colors"
                >
                  Reset Grid
                </button>
              </div>
            </div>

            {/* Sudoku Tech Clues Column (Cols 6 to 12) */}
            <div className="md:col-span-7 bg-[#F9F7F2] p-4 border border-[#1A1A1A] space-y-3">
              <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-[#b91c1c] border-b border-[#1A1A1A] pb-1">
                NUMERICAL TECH TRIVIA GUIDE
              </h4>
              <p className="font-serif text-xs italic text-[#1A1A1A]/80 mb-2">
                Use these technological clues to identify missing digits 1 through 4 in the matrix rows:
              </p>

              <div className="space-y-3 text-xs font-serif">
                {sudokuTrivia.map((item) => (
                  <div key={item.number} className="p-2 bg-[#EEEBE1] border border-[#1A1A1A]/30">
                    <div className="flex justify-between items-center font-sans font-bold text-[11px] text-[#b91c1c] uppercase mb-1">
                      <span>DIGIT #{item.number} TRIVIA</span>
                      <span>Answer: {item.number}</span>
                    </div>
                    <p className="font-bold text-[#1A1A1A]">{item.question}</p>
                    <p className="italic text-[#1A1A1A]/70 text-[11px] mt-0.5">Clue: {item.clue}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Sudoku Status */}
          {sudokuStatus && (
            <div className="p-3 bg-[#F9F7F2] border-l-4 border-[#b91c1c] text-xs font-sans font-bold text-[#1A1A1A] animate-fadeIn">
              {sudokuStatus}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
