/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { SentenceReorderingQuestion } from '../../types/unit';
import { RotateCcw } from 'lucide-react';

interface Props {
  question: SentenceReorderingQuestion;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

interface WordToken {
  id: number;
  text: string;
}

export const SentenceReorderRenderer: React.FC<Props> = ({
  question,
  value = '',
  onChange,
  disabled = false,
}) => {
  const [availableWords, setAvailableWords] = useState<WordToken[]>([]);
  const [selectedWords, setSelectedWords] = useState<WordToken[]>([]);

  // Helper to join word tokens into a readable sentence
  const assembleSentence = (tokens: WordToken[]): string => {
    let result = '';
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i].text;
      if (['.', '?', '!', ',', ';', ':'].includes(token)) {
        result = result.trimEnd() + token;
      } else {
        result += (result ? ' ' : '') + token;
      }
    }
    return result;
  };

  useEffect(() => {
    const rawWords = question.words || [];
    const allTokens: WordToken[] = rawWords.map((word, index) => ({
      id: index,
      text: word,
    }));

    if (!value) {
      setAvailableWords(allTokens);
      setSelectedWords([]);
      return;
    }

    // Try to match value with tokens
    // Split value into tokens
    const valueWords = value.trim().split(/\s+/);
    const selected: WordToken[] = [];
    const pool = [...allTokens];

    for (const vw of valueWords) {
      // Check if vw ends with punctuation
      const puncMatch = vw.match(/[.?!,]$/);
      const cleanWord = puncMatch ? vw.slice(0, -1) : vw;
      const punc = puncMatch ? puncMatch[0] : null;

      const idx = pool.findIndex((t) => t.text.toLowerCase() === cleanWord.toLowerCase());
      if (idx !== -1) {
        selected.push(pool[idx]);
        pool.splice(idx, 1);
      }

      if (punc) {
        const pIdx = pool.findIndex((t) => t.text === punc);
        if (pIdx !== -1) {
          selected.push(pool[pIdx]);
          pool.splice(pIdx, 1);
        }
      }
    }

    setSelectedWords(selected);
    setAvailableWords(pool);
  }, [question, value]);

  const handlePickWord = (token: WordToken) => {
    if (disabled) return;
    const nextSelected = [...selectedWords, token];
    const nextAvailable = availableWords.filter((w) => w.id !== token.id);
    setSelectedWords(nextSelected);
    setAvailableWords(nextAvailable);
    onChange(assembleSentence(nextSelected));
  };

  const handleRemoveWord = (token: WordToken) => {
    if (disabled) return;
    const nextSelected = selectedWords.filter((w) => w.id !== token.id);
    const nextAvailable = [...availableWords, token];
    setSelectedWords(nextSelected);
    setAvailableWords(nextAvailable);
    onChange(assembleSentence(nextSelected));
  };

  const handleReset = () => {
    if (disabled) return;
    const allTokens: WordToken[] = question.words.map((word, index) => ({
      id: index,
      text: word,
    }));
    setAvailableWords(allTokens);
    setSelectedWords([]);
    onChange('');
  };

  return (
    <div className="space-y-4">
      {/* Constructed Sentence Area */}
      <div className="bg-slate-50 p-4 rounded-2xl border-2 border-slate-200 min-h-24 flex flex-col justify-between gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Your Sentence (Câu của bạn):
          </span>
          {selectedWords.length > 0 && !disabled && (
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-red-500 font-medium px-2 py-0.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset / Xếp lại</span>
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 py-2">
          {selectedWords.length === 0 ? (
            <span className="text-slate-400 text-sm italic">
              Tap the words below in order to build your sentence (Bấm các từ bên dưới theo đúng thứ tự)
            </span>
          ) : (
            selectedWords.map((token) => (
              <button
                key={token.id}
                type="button"
                disabled={disabled}
                onClick={() => handleRemoveWord(token)}
                className="px-3.5 py-2 rounded-xl bg-sky-500 text-white font-bold text-sm sm:text-base shadow-sm hover:bg-sky-600 active:translate-y-0.5 cursor-pointer transition-all border-b-2 border-sky-700 touch-manipulation min-h-[42px]"
                title="Bấm để trả lại từ này"
              >
                {token.text}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Available Words Pool */}
      <div className="space-y-2">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
          Available Words (Từ cần xếp):
        </div>

        <div className="flex flex-wrap items-center gap-2.5 p-4 bg-white rounded-2xl border border-slate-200 min-h-16">
          {availableWords.length === 0 ? (
            <span className="text-emerald-600 text-sm font-semibold">
              ✓ All words placed! Check your sentence above. (Đã xếp xong tất cả các từ!)
            </span>
          ) : (
            availableWords.map((token) => (
              <button
                key={token.id}
                type="button"
                disabled={disabled}
                onClick={() => handlePickWord(token)}
                className="px-4 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold text-sm sm:text-base border border-amber-300 shadow-sm active:translate-y-0.5 cursor-pointer transition-all hover:scale-105 touch-manipulation min-h-[42px]"
              >
                {token.text}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
