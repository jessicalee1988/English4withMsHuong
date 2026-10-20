/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  FillInTheBlankQuestion,
  MatchingQuestion,
  MultipleChoiceQuestion,
  Question,
  ReadingComprehensionQuestion,
  SentenceReorderingQuestion,
  TrueFalseQuestion,
  WordUnscramblingQuestion,
} from '../../types/unit';
import { AlertCircle, Bookmark, BookOpen, CheckCircle, Clock } from 'lucide-react';
import { MultipleChoiceRenderer } from './MultipleChoiceRenderer';
import { MatchingRenderer } from './MatchingRenderer';
import { WordUnscrambleRenderer } from './WordUnscrambleRenderer';
import { FillInTheBlankRenderer } from './FillInTheBlankRenderer';
import { SentenceReorderRenderer } from './SentenceReorderRenderer';
import { ReadingComprehensionRenderer } from './ReadingComprehensionRenderer';
import { TrueFalseRenderer } from './TrueFalseRenderer';

interface Props {
  question: Question;
  index: number;
  total: number;
  value: any;
  onChange: (value: any) => void;
  disabled?: boolean;
}

export const QuestionCard: React.FC<Props> = ({
  question,
  index,
  total,
  value,
  onChange,
  disabled = false,
}) => {
  const isDraft = question.status === 'draft';

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'multiple_choice':
        return 'Multiple Choice (Trắc nghiệm)';
      case 'matching':
        return 'Matching (Nối câu)';
      case 'word_unscrambling':
        return 'Word Unscrambling (Ghép chữ)';
      case 'fill_in_the_blank':
        return 'Fill in the Blank (Điền từ)';
      case 'sentence_reordering':
        return 'Sentence Reordering (Sắp xếp câu)';
      case 'reading_comprehension':
        return 'Reading Comprehension (Đọc hiểu)';
      case 'true_false':
        return 'True / False (Đúng / Sai)';
      default:
        return type;
    }
  };

  const renderQuestionBody = () => {
    switch (question.type) {
      case 'multiple_choice':
        return (
          <MultipleChoiceRenderer
            question={question as MultipleChoiceQuestion}
            value={value || ''}
            onChange={onChange}
            disabled={disabled}
          />
        );
      case 'matching':
        return (
          <MatchingRenderer
            question={question as MatchingQuestion}
            value={value || {}}
            onChange={onChange}
            disabled={disabled}
          />
        );
      case 'word_unscrambling':
        return (
          <WordUnscrambleRenderer
            question={question as WordUnscramblingQuestion}
            value={value || ''}
            onChange={onChange}
            disabled={disabled}
          />
        );
      case 'fill_in_the_blank':
        return (
          <FillInTheBlankRenderer
            question={question as FillInTheBlankQuestion}
            value={value || ''}
            onChange={onChange}
            disabled={disabled}
          />
        );
      case 'sentence_reordering':
        return (
          <SentenceReorderRenderer
            question={question as SentenceReorderingQuestion}
            value={value || ''}
            onChange={onChange}
            disabled={disabled}
          />
        );
      case 'reading_comprehension':
        return (
          <ReadingComprehensionRenderer
            question={question as ReadingComprehensionQuestion}
            value={value || {}}
            onChange={onChange}
            disabled={disabled}
          />
        );
      case 'true_false':
        return (
          <TrueFalseRenderer
            question={question as TrueFalseQuestion}
            value={value || ''}
            onChange={onChange}
            disabled={disabled}
          />
        );
      default:
        return (
          <div className="p-4 bg-red-50 text-red-700 rounded-xl">
            Unsupported question schema.
          </div>
        );
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 sm:p-7 space-y-6">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2.5">
          <span className="px-3 py-1 rounded-full bg-sky-100 text-sky-800 font-extrabold text-sm">
            Question {index + 1} of {total}
          </span>
          <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
            {getTypeLabel(question.type)}
          </span>
        </div>

        {/* Status tag */}
        {isDraft ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold border border-amber-300">
            <Clock className="w-3.5 h-3.5 text-amber-700" />
            <span>Draft – Teacher Approval Required</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>Approved (Đã thẩm định)</span>
          </span>
        )}
      </div>

      {/* Draft banner notice if draft */}
      {isDraft && (
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs sm:text-sm flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">
              Bản thảo câu hỏi cần cô Hường duyệt (Draft Question)
            </p>
            <p className="text-amber-800 mt-0.5">
              Câu hỏi này dùng để bạn luyện tập thêm, chưa được tính vào điểm số chính thức.
            </p>
          </div>
        </div>
      )}

      {/* Optional Reading Passage above question when provided */}
      {question.type === 'true_false' && (question as TrueFalseQuestion).passage && (
        <div className="bg-amber-50/70 border-2 border-amber-200/80 rounded-2xl p-5 shadow-2xs space-y-2">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-sm sm:text-base border-b border-amber-200/70 pb-2">
            <BookOpen className="w-5 h-5 text-amber-700 shrink-0" />
            <span>{(question as TrueFalseQuestion).passage_title || 'Reading Passage (Bài đọc)'}</span>
          </div>
          <p className="text-slate-800 text-sm sm:text-base leading-relaxed whitespace-pre-line font-normal">
            {(question as TrueFalseQuestion).passage}
          </p>
        </div>
      )}

      {/* Prompts */}
      <div className="space-y-1.5">
        <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
          {question.prompt}
        </h3>
        {question.prompt_vi && (
          <p className="text-sm font-medium text-slate-500">
            {question.prompt_vi}
          </p>
        )}
      </div>

      {/* Specific Question Renderer */}
      <div className="pt-2">{renderQuestionBody()}</div>

      {/* Source metadata footer */}
      {question.source && (
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Bookmark className="w-3 h-3 text-slate-400" />
            <span>Source: {question.source}</span>
          </span>
          <span className="font-mono text-slate-300">ID: {question.id}</span>
        </div>
      )}
    </div>
  );
};
