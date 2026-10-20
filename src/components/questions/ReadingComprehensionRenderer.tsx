/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ReadingComprehensionQuestion } from '../../types/unit';
import { BookOpen, CheckCircle2, Circle } from 'lucide-react';

interface Props {
  question: ReadingComprehensionQuestion;
  value: Record<string, string>; // sub_q_id -> selected_option
  onChange: (value: Record<string, string>) => void;
  disabled?: boolean;
}

export const ReadingComprehensionRenderer: React.FC<Props> = ({
  question,
  value = {},
  onChange,
  disabled = false,
}) => {
  const letters = ['A', 'B', 'C', 'D'];

  const handleSelectOption = (subId: string, option: string) => {
    if (disabled) return;
    onChange({
      ...value,
      [subId]: option,
    });
  };

  return (
    <div className="space-y-6">
      {/* Reading Passage Card */}
      <div className="bg-amber-50/70 border-2 border-amber-200/80 rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-amber-900 font-bold text-base border-b border-amber-200/80 pb-2">
          <BookOpen className="w-5 h-5 text-amber-700" />
          <span>{question.passage_title || 'Reading Passage (Bài đọc)'}</span>
        </div>
        <p className="text-slate-800 text-base sm:text-lg leading-relaxed whitespace-pre-line font-normal">
          {question.passage}
        </p>
      </div>

      {/* Sub questions */}
      <div className="space-y-5">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Questions (Câu hỏi đọc hiểu):
        </div>

        {question.sub_questions.map((subQ, qIndex) => {
          const selectedOption = value[subQ.id];

          return (
            <div
              key={subQ.id}
              className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-xs"
            >
              <div className="flex items-start gap-2.5">
                <span className="w-6 h-6 rounded-full bg-sky-500 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {qIndex + 1}
                </span>
                <div>
                  <h4 className="font-semibold text-slate-900 text-base">
                    {subQ.question}
                  </h4>
                  {subQ.question_vi && (
                    <p className="text-xs text-slate-500 mt-0.5">{subQ.question_vi}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 pl-8">
                {subQ.options.map((opt, optIdx) => {
                  const letter = letters[optIdx] || String(optIdx + 1);
                  const isSelected = selectedOption === opt;

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      disabled={disabled}
                      onClick={() => handleSelectOption(subQ.id, opt)}
                      className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer touch-manipulation min-h-[44px] ${
                        isSelected
                          ? 'border-sky-500 bg-sky-50 font-semibold text-sky-950 shadow-xs'
                          : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/70 text-slate-800'
                      } ${disabled ? 'cursor-not-allowed opacity-80' : ''}`}
                    >
                      <span
                        className={`w-6 h-6 rounded-md text-xs font-bold flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-sky-500 text-white' : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {letter}
                      </span>
                      <span className="text-sm sm:text-base flex-1">{opt}</span>
                      <div className="shrink-0 text-sky-600">
                        {isSelected ? (
                          <CheckCircle2 className="w-4 h-4 fill-sky-500 text-white" />
                        ) : (
                          <Circle className="w-4 h-4 text-slate-300" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
