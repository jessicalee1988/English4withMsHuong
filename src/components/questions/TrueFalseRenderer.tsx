/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { TrueFalseQuestion } from '../../types/unit';
import { BookOpen, Check, CheckCircle2, Circle, X } from 'lucide-react';

interface Props {
  question: TrueFalseQuestion;
  value: string; // "True" | "False" | ""
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const TrueFalseRenderer: React.FC<Props> = ({
  question,
  value,
  onChange,
  disabled = false,
}) => {
  // Use options from question schema if available, otherwise default to ["True", "False"]
  const rawOptions =
    Array.isArray(question.options) && question.options.length >= 2
      ? question.options
      : ['True', 'False'];

  return (
    <div className="space-y-4">
      {/* Instruction hint */}
      <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
        Choose True or False (Chọn Đúng hoặc Sai):
      </div>

      {/* True / False Selectable Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {rawOptions.map((option) => {
          const isSelected = value.toLowerCase() === option.toLowerCase();
          const isTrueOption = option.toLowerCase() === 'true';

          return (
            <button
              key={option}
              type="button"
              disabled={disabled}
              onClick={() => onChange(option)}
              className={`flex items-center gap-4 p-3.5 sm:p-4 rounded-2xl text-left border-2 transition-all cursor-pointer select-none touch-manipulation min-h-[56px] ${
                isSelected
                  ? isTrueOption
                    ? 'border-emerald-500 bg-emerald-50/80 shadow-md shadow-emerald-100 ring-2 ring-emerald-300/60'
                    : 'border-rose-500 bg-rose-50/80 shadow-md shadow-rose-100 ring-2 ring-rose-300/60'
                  : 'border-slate-200 bg-white hover:border-sky-300 hover:bg-slate-50/70'
              } ${disabled ? 'cursor-not-allowed opacity-80' : ''}`}
            >
              {/* Icon badge */}
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-lg transition-colors shrink-0 shadow-xs ${
                  isSelected
                    ? isTrueOption
                      ? 'bg-emerald-500 text-white shadow-emerald-200'
                      : 'bg-rose-500 text-white shadow-rose-200'
                    : isTrueOption
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {isTrueOption ? <Check className="w-6 h-6 stroke-[3]" /> : <X className="w-6 h-6 stroke-[3]" />}
              </div>

              {/* Text label */}
              <div className="flex-1">
                <span
                  className={`text-lg sm:text-xl font-extrabold block leading-tight ${
                    isSelected
                      ? isTrueOption
                        ? 'text-emerald-950'
                        : 'text-rose-950'
                      : 'text-slate-800'
                  }`}
                >
                  {option}
                </span>
                <span className="text-xs font-semibold text-slate-500 block mt-0.5">
                  {isTrueOption ? 'Đúng' : 'Sai'}
                </span>
              </div>

              {/* Radio selection circle */}
              <div className="shrink-0">
                {isSelected ? (
                  <CheckCircle2
                    className={`w-6 h-6 fill-current ${
                      isTrueOption ? 'text-emerald-500' : 'text-rose-500'
                    }`}
                  />
                ) : (
                  <Circle className="w-6 h-6 text-slate-300" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
