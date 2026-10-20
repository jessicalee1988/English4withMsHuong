/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { FillInTheBlankQuestion } from '../../types/unit';
import { Edit3 } from 'lucide-react';

interface Props {
  question: FillInTheBlankQuestion;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const FillInTheBlankRenderer: React.FC<Props> = ({
  question,
  value = '',
  onChange,
  disabled = false,
}) => {
  // Split template by ______ or _____ or ___
  const parts = question.sentence_template.split(/_{3,}/);

  return (
    <div className="space-y-5">
      {/* Visual Sentence Template with interactive blank */}
      <div className="p-5 rounded-2xl bg-sky-50/60 border border-sky-100 flex flex-wrap items-center gap-2 text-lg sm:text-xl font-medium text-slate-800 leading-relaxed">
        <span>{parts[0]}</span>

        <span className="inline-flex items-center">
          <input
            type="text"
            disabled={disabled}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="......"
            className="w-36 sm:w-44 px-3 py-2 text-center text-base sm:text-lg font-bold text-sky-900 bg-white border-2 border-sky-400 rounded-xl focus:outline-none focus:ring-4 focus:ring-sky-200 transition-all shadow-inner min-h-[44px]"
          />
        </span>

        {parts.length > 1 && <span>{parts.slice(1).join('')}</span>}
      </div>

      {/* Options bank if available */}
      {question.options && question.options.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
            <Edit3 className="w-3.5 h-3.5 text-slate-400" />
            <span>Click a word to fill the blank (Bấm vào từ để điền):</span>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {question.options.map((opt, idx) => {
              const isSelected = value.trim().toLowerCase() === opt.trim().toLowerCase();

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={disabled}
                  onClick={() => onChange(opt)}
                  className={`px-4 py-2.5 rounded-xl text-sm sm:text-base font-semibold border-2 transition-all cursor-pointer touch-manipulation min-h-[44px] ${
                    isSelected
                      ? 'border-sky-500 bg-sky-500 text-white shadow-md'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-sky-300 hover:bg-sky-50/50'
                  } ${disabled ? 'cursor-not-allowed opacity-80' : ''}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
