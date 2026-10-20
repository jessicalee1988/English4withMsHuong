/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { MultipleChoiceQuestion } from '../../types/unit';
import { CheckCircle2, Circle } from 'lucide-react';

interface Props {
  question: MultipleChoiceQuestion;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const MultipleChoiceRenderer: React.FC<Props> = ({
  question,
  value,
  onChange,
  disabled = false,
}) => {
  const letters = ['A', 'B', 'C', 'D', 'E'];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {question.options.map((option, idx) => {
          const letter = letters[idx] || String(idx + 1);
          const isSelected = value === option;

          return (
            <button
              key={idx}
              type="button"
              disabled={disabled}
              onClick={() => onChange(option)}
              className={`flex items-center gap-3.5 p-3.5 sm:p-4 rounded-2xl text-left border-2 transition-all cursor-pointer select-none touch-manipulation min-h-[52px] ${
                isSelected
                  ? 'border-sky-500 bg-sky-50/80 shadow-md shadow-sky-100 ring-2 ring-sky-300/50'
                  : 'border-slate-200 bg-white hover:border-sky-300 hover:bg-slate-50/60'
              } ${disabled ? 'cursor-not-allowed opacity-80' : ''}`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-base transition-colors shrink-0 ${
                  isSelected
                    ? 'bg-sky-500 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {letter}
              </div>

              <span
                className={`text-base sm:text-lg font-medium flex-1 ${
                  isSelected ? 'text-sky-950 font-semibold' : 'text-slate-800'
                }`}
              >
                {option}
              </span>

              <div className="shrink-0 text-sky-600">
                {isSelected ? (
                  <CheckCircle2 className="w-5 h-5 fill-sky-500 text-white" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-300" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
