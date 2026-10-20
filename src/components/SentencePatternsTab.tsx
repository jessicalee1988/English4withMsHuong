/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { SentencePattern } from '../types/unit';
import {
  Bookmark,
  CheckCircle2,
  Compass,
  HelpCircle,
  Lightbulb,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

interface Props {
  patterns: SentencePattern[];
  unitTitle?: string;
  unitNumber?: number;
}

export const SentencePatternsTab: React.FC<Props> = ({
  patterns,
  unitTitle,
  unitNumber,
}) => {
  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-sky-500 to-teal-500 rounded-3xl p-5 sm:p-6 text-white shadow-md">
        <div className="flex items-center gap-2 text-sky-100 text-xs sm:text-sm font-semibold uppercase tracking-wider">
          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300 shrink-0" />
          <span>Core Language Patterns • Mẫu câu trọng tâm lớp 4</span>
        </div>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-black mt-1">
          {unitTitle ? `Sentence Patterns – ${unitTitle}` : `Sentence Patterns • Unit ${unitNumber || ''}`}
        </h2>
        <p className="text-sky-50 text-xs sm:text-sm md:text-base mt-1.5 max-w-2xl leading-relaxed">
          Ghi nhớ và luyện nói các mẫu câu trọng tâm cùng cô Hường nhé!
        </p>
      </div>

      <div className="space-y-6">
        {patterns.map((pattern, idx) => {
          const hasGrammarNotes = pattern.highlights && pattern.highlights.length > 0;

          return (
            <div
              key={pattern.id || idx}
              className="bg-white rounded-3xl border-2 border-slate-200/90 shadow-sm overflow-hidden"
            >
              {/* Pattern Header */}
              <div className="bg-slate-50 border-b border-slate-200/90 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-sky-500 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
                    {idx + 1}
                  </span>
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900">
                      {pattern.title}
                    </h3>
                    {pattern.title_vi && (
                      <p className="text-xs font-semibold text-slate-500">{pattern.title_vi}</p>
                    )}
                  </div>
                </div>

                <span className="text-xs font-bold text-sky-700 bg-sky-100/80 px-3 py-1 rounded-full">
                  Pattern {idx + 1}
                </span>
              </div>

              {/* Pattern Body */}
              <div className="p-6 space-y-5">
                {/* 1. Learning Objective */}
                <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-sky-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Compass className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-sky-800">
                      Learning Objective (Mục tiêu bài học):
                    </span>
                    <p className="text-sm sm:text-base font-bold text-sky-950 mt-0.5">
                      {pattern.title_vi ? `${pattern.title} – ${pattern.title_vi}` : pattern.title}
                    </p>
                  </div>
                </div>

                {/* 2 & 3. Question Structure & Answer Structure */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Question Structure */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-700">
                      <HelpCircle className="w-4 h-4 text-sky-600" />
                      <span>Question Structure (Cấu trúc câu hỏi):</span>
                    </div>
                    <p className="text-lg sm:text-xl font-extrabold text-slate-900 font-sans">
                      {pattern.question}
                    </p>
                  </div>

                  {/* Answer Structure */}
                  <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Answer Structure (Cấu trúc câu trả lời):</span>
                    </div>
                    <p className="text-lg sm:text-xl font-extrabold text-emerald-950 font-sans">
                      {pattern.answer}
                    </p>
                  </div>
                </div>

                {/* 4. Complete Example Dialogue */}
                {pattern.examples && pattern.examples.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600">
                      <MessageSquare className="w-4 h-4 text-sky-600" />
                      <span>Complete Example Dialogue (Hội thoại mẫu hoàn chỉnh):</span>
                    </div>

                    <div className="space-y-3">
                      {pattern.examples.map((example, exIdx) => (
                        <div
                          key={exIdx}
                          className="p-4 rounded-2xl bg-slate-50/90 border border-slate-200 flex flex-col gap-2.5"
                        >
                          {/* Question Speaker */}
                          <div className="flex items-start gap-3">
                            <span className="px-2.5 py-0.5 rounded-lg bg-sky-500 text-white font-bold text-xs shrink-0 mt-0.5 shadow-xs">
                              {example.speaker_q || 'Speaker A'}
                            </span>
                            <span className="text-sm sm:text-base font-semibold text-slate-800">
                              "{example.q}"
                            </span>
                          </div>

                          {/* Answer Speaker */}
                          <div className="flex items-start gap-3 pl-4 border-l-2 border-emerald-400 ml-3">
                            <span className="px-2.5 py-0.5 rounded-lg bg-emerald-600 text-white font-bold text-xs shrink-0 mt-0.5 shadow-xs">
                              {example.speaker_a || 'Speaker B'}
                            </span>
                            <span className="text-sm sm:text-base font-semibold text-emerald-950">
                              "{example.a}"
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. Vietnamese Explanation */}
                {pattern.explanation_vi && (
                  <div className="flex items-start gap-3 p-4 bg-amber-50/80 rounded-2xl border border-amber-200/90 text-amber-950 text-sm">
                    <Lightbulb className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-amber-900">
                        Vietnamese Explanation (Giải thích của cô Hường):{' '}
                      </span>
                      <span className="leading-relaxed font-medium">{pattern.explanation_vi}</span>
                    </div>
                  </div>
                )}

                {/* 6. Important Grammar Notes when verified data exists */}
                {hasGrammarNotes && (
                  <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-teal-900">
                      <Bookmark className="w-4 h-4 text-teal-600" />
                      <span>Important Grammar Notes (Lưu ý ngữ pháp quan trọng):</span>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {pattern.highlights?.map((note, nIdx) => (
                        <span
                          key={nIdx}
                          className="px-3 py-1 rounded-xl text-xs font-bold bg-white text-teal-800 border border-teal-300 shadow-xs"
                        >
                          ✓ {note}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
