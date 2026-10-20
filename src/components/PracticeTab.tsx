/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Question, StudentAnswers, UnitData, WorksheetResult } from '../types/unit';
import { getQuestionsForWorksheet } from '../data/unitLoader';
import {
  evaluateWorksheet,
  getQuestionCompletionDetail,
  hasAnsweredQuestion,
  isQuestionAnswerComplete,
} from '../utils/grader';
import { clearAnswers, clearResult, getSavedAnswers, saveAnswers, saveResult } from '../utils/storage';
import { QuestionCard } from './questions/QuestionCard';
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Award,
  CheckCircle2,
  Clock,
  FileText,
  RotateCcw,
  Send,
} from 'lucide-react';

interface Props {
  unit: UnitData;
  activeWorksheetId: string;
  onWorksheetChange: (id: string) => void;
  onSubmitted: (result: WorksheetResult) => void;
  currentResult: WorksheetResult | null;
}

export const PracticeTab: React.FC<Props> = ({
  unit,
  activeWorksheetId,
  onWorksheetChange,
  onSubmitted,
  currentResult,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<StudentAnswers>({});
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  // Active worksheet
  const currentWorksheet =
    unit.worksheets.find((w) => w.id === activeWorksheetId) || unit.worksheets[0];

  // Questions for this worksheet
  const questions: Question[] = getQuestionsForWorksheet(unit, currentWorksheet.id);

  // Load saved answers on mount or worksheet switch
  useEffect(() => {
    const saved = getSavedAnswers(unit.unit_id, currentWorksheet.id);
    setAnswers(saved);
    setCurrentQuestionIndex(0);
  }, [unit.unit_id, currentWorksheet.id]);

  // Update answer for a specific question & persist in localStorage
  const handleAnswerChange = (questionId: string, value: any) => {
    const updated = {
      ...answers,
      [questionId]: value,
    };
    setAnswers(updated);
    saveAnswers(unit.unit_id, currentWorksheet.id, updated);
  };

  const currentQ = questions[currentQuestionIndex];

  const answeredCount = questions.filter((q) =>
    hasAnsweredQuestion(q, answers[q.id])
  ).length;

  const fullyCompletedCount = questions.filter((q) =>
    isQuestionAnswerComplete(q, answers[q.id])
  ).length;

  // Identify any incomplete questions
  const incompleteQuestions = questions
    .map((q, idx) => ({
      question: q,
      index: idx,
      isComplete: isQuestionAnswerComplete(q, answers[q.id]),
      detail: getQuestionCompletionDetail(q, answers[q.id]),
    }))
    .filter((item) => !item.isComplete);

  const handleSubmit = () => {
    setShowSubmitConfirm(false);
    const evaluation = evaluateWorksheet(
      unit.unit_id,
      currentWorksheet.id,
      questions,
      answers
    );
    saveResult(unit.unit_id, currentWorksheet.id, evaluation);
    onSubmitted(evaluation);
  };

  const handleRetry = () => {
    if (confirm('Do you want to retry this worksheet from the beginning? / Bạn có chắc muốn làm lại phiếu bài này không?')) {
      clearAnswers(unit.unit_id, currentWorksheet.id);
      clearResult(unit.unit_id, currentWorksheet.id);
      setAnswers({});
      setCurrentQuestionIndex(0);
    }
  };

  const approvedQuestionsCount = questions.filter((q) => q.status === 'approved').length;
  const draftQuestionsCount = questions.filter((q) => q.status === 'draft').length;

  // Calculate progress metrics
  const progressPercent = questions.length > 0 ? Math.round(((currentQuestionIndex + 1) / questions.length) * 100) : 0;
  const answeredPercent = questions.length > 0 ? Math.round((fullyCompletedCount / questions.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Worksheet Selector Tabs */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-xs flex flex-wrap gap-2 items-center">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2 flex items-center gap-1.5 shrink-0">
          <FileText className="w-3.5 h-3.5" />
          <span>Phiếu bài tập (Worksheets):</span>
        </span>
        <div className="flex flex-wrap gap-2 items-center">
          {unit.worksheets.map((ws) => {
            const isSelected = ws.id === currentWorksheet.id;
            return (
              <button
                key={ws.id}
                type="button"
                onClick={() => onWorksheetChange(ws.id)}
                className={`px-3.5 sm:px-4 py-2 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer touch-manipulation ${
                  isSelected
                    ? 'bg-sky-500 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {ws.title_vi || ws.title}
              </button>
            );
          })}
        </div>
      </div>

      {/* Worksheet Header & Controls */}
      <div className="bg-gradient-to-r from-sky-50 to-emerald-50 rounded-3xl p-5 sm:p-6 border border-sky-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            {currentWorksheet.title}
          </h2>
          <p className="text-slate-600 text-sm mt-1">
            {currentWorksheet.description || 'Hoàn thành các bài tập để ghi điểm cùng cô Hường nhé!'}
          </p>

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 mt-3 text-xs">
            <span className="px-2.5 py-1 rounded-full bg-white text-slate-700 font-bold border border-slate-200">
              Total: {questions.length} questions
            </span>
            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold">
              ✓ {approvedQuestionsCount} Official Questions
            </span>
            {draftQuestionsCount > 0 && (
              <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{draftQuestionsCount} Teacher Draft</span>
              </span>
            )}
          </div>
        </div>

        {/* Progress summary & Retry */}
        <div className="flex items-center gap-3 self-start md:self-auto">
          <div className="text-left md:text-right">
            <div className="text-xs text-slate-500 font-medium">Completed:</div>
            <div className="text-lg font-black text-sky-700">
              {fullyCompletedCount} / {questions.length} ({answeredPercent}%)
            </div>
          </div>

          {answeredCount > 0 && (
            <button
              type="button"
              onClick={handleRetry}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-red-50 text-slate-600 hover:text-red-600 text-xs font-semibold border border-slate-200 hover:border-red-200 transition-colors cursor-pointer touch-manipulation"
              title="Reset this worksheet / Làm lại từ đầu"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry / Làm lại</span>
            </button>
          )}
        </div>
      </div>

      {/* Question Progress Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between text-xs font-bold text-slate-600">
          <span>
            Question <span className="text-sky-600 text-sm">{currentQuestionIndex + 1}</span> of{' '}
            <span className="text-slate-900 text-sm">{questions.length}</span>
          </span>
          <span className="text-slate-400 font-medium">
            Progress: {progressPercent}%
          </span>
        </div>

        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-sky-400 to-teal-400 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Question Selector Dots with clear visual status & touch sizing */}
        <div className="flex flex-wrap gap-2 pt-2">
          {questions.map((q, idx) => {
            const isCurrent = idx === currentQuestionIndex;
            const isComplete = isQuestionAnswerComplete(q, answers[q.id]);
            const isPartial = hasAnsweredQuestion(q, answers[q.id]) && !isComplete;
            const isDraft = q.status === 'draft';

            return (
              <button
                key={q.id}
                type="button"
                onClick={() => setCurrentQuestionIndex(idx)}
                className={`w-10 h-10 sm:w-9 sm:h-9 rounded-xl font-bold text-xs sm:text-xs transition-all cursor-pointer flex flex-col items-center justify-center relative touch-manipulation ${
                  isCurrent
                    ? 'bg-sky-500 text-white shadow-md ring-2 ring-sky-300 scale-105'
                    : isComplete
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : isPartial
                    ? 'bg-amber-100 text-amber-900 border-2 border-amber-400'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
                title={`Question ${idx + 1} (${q.type}) - ${isComplete ? 'Complete' : isPartial ? 'Partially answered' : 'Not answered'}`}
              >
                <span>{idx + 1}</span>
                {isDraft && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 absolute top-1 right-1" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Single Question Card (Displays ONE question at a time) */}
      {currentQ ? (
        <QuestionCard
          question={currentQ}
          index={currentQuestionIndex}
          total={questions.length}
          value={answers[currentQ.id]}
          onChange={(val) => handleAnswerChange(currentQ.id, val)}
        />
      ) : (
        <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 text-slate-500">
          No questions available in this worksheet.
        </div>
      )}

      {/* Previous, Next & Submit Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            disabled={currentQuestionIndex === 0}
            onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 sm:px-5 py-3 sm:py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer touch-manipulation min-h-[44px]"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            <span>Câu trước (Prev)</span>
          </button>

          <button
            type="button"
            disabled={currentQuestionIndex === questions.length - 1}
            onClick={() =>
              setCurrentQuestionIndex((prev) => Math.min(questions.length - 1, prev + 1))
            }
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 sm:px-5 py-3 sm:py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer touch-manipulation min-h-[44px]"
          >
            <span>Câu sau (Next)</span>
            <ArrowRight className="w-4 h-4 shrink-0" />
          </button>
        </div>

        {/* Submit Button (Triggers Student Confirmation) */}
        <button
          type="button"
          onClick={() => setShowSubmitConfirm(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 sm:py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-black text-sm sm:text-base shadow-md transition-all cursor-pointer touch-manipulation min-h-[44px]"
        >
          <Send className="w-4 h-4 shrink-0" />
          <span>Nộp bài (Submit)</span>
        </button>
      </div>

      {/* Submission Student Confirmation Modal with Incomplete Answers Validation */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="w-14 h-14 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center mx-auto">
              <Award className="w-7 h-7" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-xl font-black text-slate-900">
                Confirm Submission / Xác nhận nộp bài
              </h3>
              <p className="text-sm text-slate-600">
                You have completed <strong>{fullyCompletedCount}</strong> of{' '}
                <strong>{questions.length}</strong> questions.
              </p>
            </div>

            {/* Validation: Incomplete Questions Warning */}
            {incompleteQuestions.length > 0 && (
              <div className="space-y-3 bg-amber-50 p-4 rounded-2xl border border-amber-200">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Incomplete Questions Warning (Chưa làm xong đủ các câu):</span>
                </div>
                <p className="text-xs text-amber-800">
                  Bạn có <strong>{incompleteQuestions.length} câu</strong> chưa hoàn thành đủ các phần. Vui lòng bấm vào câu dưới đây để làm tiếp:
                </p>

                <div className="space-y-2 pt-1">
                  {incompleteQuestions.map((item) => (
                    <div
                      key={item.question.id}
                      className="bg-white p-3 rounded-xl border border-amber-200 flex items-center justify-between gap-3 text-xs shadow-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-800">
                          Câu {item.index + 1} ({item.question.type}):
                        </span>{' '}
                        <span className="text-amber-700 font-medium">
                          {item.detail.messageVi}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setShowSubmitConfirm(false);
                          setCurrentQuestionIndex(item.index);
                        }}
                        className="px-3 py-1 rounded-lg bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shrink-0 cursor-pointer transition-colors"
                      >
                        Làm tiếp ➔
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowSubmitConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors text-sm cursor-pointer"
              >
                Keep Practicing (Làm tiếp)
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition-colors shadow-sm text-sm cursor-pointer"
              >
                Confirm Submit (Nộp bài ngay)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
