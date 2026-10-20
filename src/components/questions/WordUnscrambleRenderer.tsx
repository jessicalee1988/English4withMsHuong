/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { WordUnscramblingQuestion } from '../../types/unit';
import { validateScrambledLetters } from '../../utils/grader';
import { AlertTriangle, Lightbulb, RotateCcw } from 'lucide-react';

interface Props {
  question: WordUnscramblingQuestion;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

interface LetterTile {
  id: number;
  char: string;
}

export const WordUnscrambleRenderer: React.FC<Props> = ({
  question,
  value = '',
  onChange,
  disabled = false,
}) => {
  // Maintain pool of letter tiles with unique indices
  const [availableTiles, setAvailableTiles] = useState<LetterTile[]>([]);
  const [selectedTiles, setSelectedTiles] = useState<LetterTile[]>([]);

  // Validate letter pool against verified answer
  const isLetterPoolValid = validateScrambledLetters(
    question.scrambled_letters,
    question.correct_answers
  );

  // Initialize or re-sync when question or value changes
  useEffect(() => {
    const rawLetters = question.scrambled_letters || [];
    const allTiles: LetterTile[] = rawLetters.map((char, index) => ({
      id: index,
      char: char.toUpperCase(),
    }));

    if (!value) {
      setAvailableTiles(allTiles);
      setSelectedTiles([]);
      return;
    }

    // If there is an existing value, reconstruct selected and available tiles
    const charsWanted = value.toUpperCase().split('');
    const selected: LetterTile[] = [];
    const pool = [...allTiles];

    for (const ch of charsWanted) {
      const foundIdx = pool.findIndex((t) => t.char === ch);
      if (foundIdx !== -1) {
        selected.push(pool[foundIdx]);
        pool.splice(foundIdx, 1);
      }
    }

    setSelectedTiles(selected);
    setAvailableTiles(pool);
  }, [question, value]);

  const handlePickTile = (tile: LetterTile) => {
    if (disabled) return;
    const newSelected = [...selectedTiles, tile];
    const newAvailable = availableTiles.filter((t) => t.id !== tile.id);
    setSelectedTiles(newSelected);
    setAvailableTiles(newAvailable);
    onChange(newSelected.map((t) => t.char).join(''));
  };

  const handleRemoveTile = (tile: LetterTile) => {
    if (disabled) return;
    const newSelected = selectedTiles.filter((t) => t.id !== tile.id);
    const newAvailable = [...availableTiles, tile];
    setSelectedTiles(newSelected);
    setAvailableTiles(newAvailable);
    onChange(newSelected.map((t) => t.char).join(''));
  };

  const handleReset = () => {
    if (disabled) return;
    const allTiles: LetterTile[] = question.scrambled_letters.map((char, index) => ({
      id: index,
      char: char.toUpperCase(),
    }));
    setAvailableTiles(allTiles);
    setSelectedTiles([]);
    onChange('');
  };

  return (
    <div className="space-y-5">
      {/* Teacher Flag Warning if scrambled letters do not match answer keys */}
      {!isLetterPoolValid && (
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 text-xs sm:text-sm flex items-start gap-2.5">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Lưu ý giáo viên / Teacher Notice: </span>
            Các chữ cái xáo trộn trong đề không khớp chính xác với đáp án chuẩn. Câu hỏi này đã được gắn cờ chuyển cho cô Hường thẩm định và không tính vào điểm số chính thức.
          </div>
        </div>
      )}

      {question.hint && (
        <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-xl border border-amber-200/80 text-amber-900 text-sm">
          <Lightbulb className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong className="font-semibold">Hint (Gợi ý):</strong> {question.hint}
          </span>
        </div>
      )}

      {/* Answer Slots */}
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center space-y-2">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Your word (Từ bạn ghép được):
        </div>
        <div className="min-h-16 flex flex-wrap items-center justify-center gap-2 py-1">
          {selectedTiles.length === 0 ? (
            <span className="text-slate-400 text-sm italic">
              Tap the letter tiles below to form the word (Bấm vào các chữ cái bên dưới)
            </span>
          ) : (
            selectedTiles.map((tile) => (
              <button
                key={tile.id}
                type="button"
                disabled={disabled}
                onClick={() => handleRemoveTile(tile)}
                className="w-11 h-12 sm:w-12 sm:h-13 rounded-xl bg-sky-500 text-white font-extrabold text-lg sm:text-xl shadow-md border-b-4 border-sky-700 hover:bg-sky-600 active:translate-y-0.5 cursor-pointer flex items-center justify-center transition-all touch-manipulation"
                title="Click to remove (Bấm để gỡ chữ này)"
              >
                {tile.char}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Letter Pool */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Available Letters (Các chữ cái có sẵn):
          </span>
          {selectedTiles.length > 0 && !disabled && (
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-red-500 font-medium px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors touch-manipulation"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset letters / Xếp lại</span>
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 p-3.5 sm:p-4 bg-white rounded-2xl border-2 border-dashed border-slate-200">
          {availableTiles.length === 0 ? (
            <span className="text-emerald-600 text-sm font-semibold py-1">
              All letters used! (Đã dùng hết tất cả chữ cái!)
            </span>
          ) : (
            availableTiles.map((tile) => (
              <button
                key={tile.id}
                type="button"
                disabled={disabled}
                onClick={() => handlePickTile(tile)}
                className="w-11 h-12 sm:w-12 sm:h-13 rounded-xl bg-amber-400 text-slate-900 font-extrabold text-lg sm:text-xl shadow-sm border-b-4 border-amber-600 hover:bg-amber-300 active:translate-y-0.5 cursor-pointer flex items-center justify-center transition-transform hover:scale-105 touch-manipulation"
              >
                {tile.char}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Optional typed input for accessibility */}
      <div className="flex items-center gap-3 pt-1">
        <span className="text-xs text-slate-400">Or type manually:</span>
        <input
          type="text"
          disabled={disabled}
          value={value}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          placeholder="TYPE WORD HERE"
          className="px-3 py-1.5 text-sm font-semibold tracking-wider uppercase border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-400 text-slate-800"
        />
      </div>
    </div>
  );
};
