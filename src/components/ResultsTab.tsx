/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { MatchingQuestion, UnitData, WorksheetResult } from '../types/unit';
import {
  AlertCircle,
  Award,
  CheckCircle2,
  Clock,
  FileQuestion,
  HelpCircle,
  RotateCcw,
  Sparkles,
  XCircle,
} from 'lucide-react';

interface Props {
  unit: UnitData;
  result: WorksheetResult | null;
  onRetry: () => void;
  onGoToPractice: () => void;
}

export const ResultsTab: React.FC<Props> = ({
  unit,
  result,
  onRetry,
  onGoToPractice,
}) => {
  if (!result) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-12 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center mx-auto">
          <FileQuestion className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-extrabold text-slate-800">
          No Results Yet / Chưa có kết quả nộp bài
        </h3>
        <p className="text-slate-500 max-w-md mx-auto text-sm">
          Please complete and submit a worksheet in the <strong>Practice Worksheets</strong> tab to view your score and review responses.
        </p>
        <button
          type="button"
          onClick={onGoToPractice}
          className="px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-sm shadow-sm transition-colors cursor-pointer"
        >
          Go to Practice Worksheets (Đến phần Luyện tập)
        </button>
      </div>
    );
  }

  const {
    percentageScore,
    correctApprovedCount,
    approvedQuestionsCount,
    draftQuestionsCount,
    totalQuestions,
    questionResults,
  } = result;

  const totalEarnedScore = result.totalEarnedScore !== undefined
    ? result.totalEarnedScore
    : correctApprovedCount;

  const totalPossibleScore = result.totalPossibleScore !== undefined
    ? result.totalPossibleScore
    : approvedQuestionsCount;

  // Explicit calculation for incorrect/incomplete questions
  const incorrectCount = result.incorrectApprovedCount !== undefined
    ? result.incorrectApprovedCount
    : Math.max(0, approvedQuestionsCount - correctApprovedCount);

  // Encouraging feedback designed especially for Grade 4 Vietnamese students
  const getPraiseMessage = (pct: number) => {
    if (pct === 100) {
      return {
        title: 'Outstanding! Điểm 10 xuất sắc! 🌟🌟🌟',
        subtitle: 'Bạn đã làm đúng tất cả các câu hỏi chính thức! Cô Hường rất tự hào và gửi tặng bạn 3 ngôi sao điểm 10!',
        badgeColor: 'bg-emerald-500',
        textColor: 'text-emerald-700',
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-200',
      };
    }
    if (pct >= 80) {
      return {
        title: 'Great Job! Làm rất tốt! ⭐⭐',
        subtitle: 'Kết quả tuyệt vời! Bạn đã nắm bài rất chắc chắn! Xem lại một chút phần chưa đúng là sẽ đạt điểm 10 ngay!',
        badgeColor: 'bg-sky-500',
        textColor: 'text-sky-700',
        bgColor: 'bg-sky-50',
        borderColor: 'border-sky-200',
      };
    }
    if (pct >= 50) {
      return {
        title: 'Good Effort! Cố gắng lắm! 👍',
        subtitle: 'Bạn đã làm đúng được nhiều câu rồi đấy! Hãy đọc kĩ giải thích của cô Hường bên dưới rồi bấm "Làm lại phiếu bài" để nâng cao điểm số nhé!',
        badgeColor: 'bg-amber-500',
        textColor: 'text-amber-800',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
      };
    }
    return {
      title: 'Keep Trying! Đừng nản lòng nhé! 🌱',
      subtitle: 'Học tiếng Anh cần kiên trì luyện tập! Hãy ôn lại phần Từ vựng và Mẫu câu cùng cô Hường, rồi cùng làm lại phiếu bài để đạt điểm cao hơn nhé!',
      badgeColor: 'bg-rose-500',
      textColor: 'text-rose-700',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-200',
    };
  };

  const praise = getPraiseMessage(percentageScore);

  /**
   * Renders the student's actual matching choices with per-pair verification and pair counter
   */
  const renderMatchingStudentChoices = (mq: MatchingQuestion, studentAns: any, matchingStats?: any) => {
    const ansMap: Record<string, string> = studentAns && typeof studentAns === 'object' ? studentAns : {};
    const hasAnyMatch = Object.keys(ansMap).some((k) => !!ansMap[k]);

    if (!hasAnyMatch) {
      return (
        <span className="text-rose-600 font-semibold italic text-sm">
          Chưa nối cặp câu nào (No pairs matched)
        </span>
      );
    }

    return (
      <div className="space-y-2 pt-1">
        {matchingStats && (
          <div className="text-xs font-bold text-sky-800 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200 inline-block mb-1">
            Số cặp nối đúng: <strong>{matchingStats.correctPairsCount}</strong> / {matchingStats.totalPairsCount} cặp ({matchingStats.partialPercentage}% điểm)
          </div>
        )}

        {mq.left_items.map((leftItem) => {
          const matchedRightId = ansMap[leftItem.id];
          const matchedRight = matchedRightId ? mq.right_items.find((r) => r.id === matchedRightId) : null;
          const correctRightId = mq.correct_answers[leftItem.id];
          const isPairCorrect = matchedRightId === correctRightId;

          return (
            <div
              key={leftItem.id}
              className={`p-2.5 rounded-xl border text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 ${
                isPairCorrect
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                  : 'bg-rose-50/70 border-rose-200 text-rose-950'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="font-bold">{leftItem.text}</span>
                <span className="text-slate-400">➔</span>
                <span className="font-semibold">
                  {matchedRight ? matchedRight.text : <span className="text-rose-500 italic">(Chưa nối)</span>}
                </span>
              </div>

              <div className="shrink-0">
                {isPairCorrect ? (
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md text-xs">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Đúng</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md text-xs">
                    <XCircle className="w-3 h-3 text-rose-600" />
                    <span>Chưa đúng</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  /**
   * Renders the verified matching answer key
   */
  const renderMatchingCorrectPairs = (mq: MatchingQuestion) => {
    return (
      <div className="space-y-1.5 pt-1">
        {mq.left_items.map((leftItem) => {
          const rightId = mq.correct_answers[leftItem.id];
          const rightItem = mq.right_items.find((r) => r.id === rightId);

          return (
            <div
              key={leftItem.id}
              className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-xs sm:text-sm text-emerald-950 flex items-center gap-2 font-medium"
            >
              <span className="font-bold text-emerald-900">{leftItem.text}</span>
              <span className="text-emerald-500">➔</span>
              <span className="font-bold text-emerald-800">{rightItem?.text || rightId}</span>
            </div>
          );
        })}
      </div>
    );
  };

  const formatStudentAnswer = (ans: any) => {
    if (ans === undefined || ans === null || ans === '') {
      return <span className="text-slate-400 italic">No answer provided (Chưa trả lời)</span>;
    }
    if (typeof ans === 'object') {
      const keys = Object.keys(ans);
      if (keys.length === 0) {
        return <span className="text-slate-400 italic">No answer provided (Chưa trả lời)</span>;
      }
      return (
        <span className="font-mono text-xs sm:text-sm bg-slate-100 px-2 py-1 rounded">
          {JSON.stringify(ans)}
        </span>
      );
    }
    return <span className="font-semibold text-slate-900">{String(ans)}</span>;
  };

  return (
    <div className="space-y-6">
      {/* Praise Hero Banner with Score Points & Percentage */}
      <div
        className={`${praise.bgColor} ${praise.borderColor} border-2 rounded-3xl p-5 sm:p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-5 sm:gap-6`}
      >
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5 text-center sm:text-left w-full md:w-auto">
          <div className="w-24 h-24 rounded-2xl bg-white shadow-md flex flex-col items-center justify-center shrink-0 border border-slate-100">
            <span className="text-3xl font-black text-sky-600">{percentageScore}%</span>
            <span className="text-xs font-extrabold text-slate-700">
              {totalEarnedScore} / {totalPossibleScore} pts
            </span>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Total Score
            </span>
          </div>

          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <Sparkles className="w-5 h-5 text-amber-500 shrink-0" />
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">{praise.title}</h2>
            </div>
            <p className="text-slate-600 text-xs sm:text-sm mt-1 max-w-lg leading-relaxed">{praise.subtitle}</p>
          </div>
        </div>

        {/* Retry Worksheet Button */}
        <button
          type="button"
          onClick={onRetry}
          className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-800 font-black text-sm border-2 border-slate-200 shadow-sm transition-all hover:border-sky-400 cursor-pointer shrink-0 touch-manipulation min-h-[44px]"
        >
          <RotateCcw className="w-4 h-4 text-sky-600 shrink-0" />
          <span>Làm lại phiếu bài (Retry)</span>
        </button>
      </div>

      {/* 5 Stats Cards: Total questions, Total score, Correct answers, Incorrect answers, Percentage */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {/* 1. Total questions */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 text-center space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Questions
          </span>
          <div className="text-xl font-black text-slate-800">
            {totalQuestions}
          </div>
          <span className="text-[10px] text-slate-500">
            ({approvedQuestionsCount} official)
          </span>
        </div>

        {/* 2. Total Points Score */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 text-center space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Total Score
          </span>
          <div className="text-xl font-black text-sky-600">
            {totalEarnedScore} / {totalPossibleScore}
          </div>
          <span className="text-[10px] text-sky-600 font-semibold">points earned</span>
        </div>

        {/* 3. Correct answers */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 text-center space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Correct Answers
          </span>
          <div className="text-xl font-black text-emerald-600">
            {correctApprovedCount}
          </div>
          <span className="text-[10px] text-emerald-600 font-medium">
            ✓ Out of {approvedQuestionsCount}
          </span>
        </div>

        {/* 4. Incorrect answers */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 text-center space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Incorrect / Partial
          </span>
          <div className="text-xl font-black text-rose-600">
            {incorrectCount}
          </div>
          <span className="text-[10px] text-rose-500 font-medium">
            ✕ Out of {approvedQuestionsCount}
          </span>
        </div>

        {/* 5. Percentage score */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 text-center space-y-1 col-span-2 sm:col-span-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Percentage
          </span>
          <div className="text-xl font-black text-amber-500">
            {percentageScore}%
          </div>
          <span className="text-[10px] text-slate-500">official score</span>
        </div>
      </div>

      {/* Teacher Draft Notice if draft questions exist */}
      {draftQuestionsCount > 0 && (
        <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-200 text-amber-950 text-xs sm:text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Quy định thẩm định của cô Hường: </span>
            Có <strong>{draftQuestionsCount} câu hỏi Bản thảo (Draft)</strong> đang chờ thẩm định. Chỉ có <strong>{approvedQuestionsCount} câu hỏi chính thức</strong> được tính vào điểm số và tỉ lệ phần trăm kết quả của bạn.
          </div>
        </div>
      )}

      {/* Review of each question */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-base font-bold text-slate-900">
            Review of Each Question / Chi tiết từng câu hỏi:
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            {questionResults.length} questions reviewed
          </span>
        </div>

        <div className="space-y-4">
          {questionResults.map((qRes, idx) => {
            const isApproved = !qRes.isDraft;
            const isCorrect = qRes.isCorrect;
            const isPartial = qRes.isPartialCredit;
            const originalQuestion = unit.questions.find((q) => q.id === qRes.questionId);

            return (
              <div
                key={qRes.questionId}
                className={`bg-white rounded-2xl border-2 p-5 space-y-3 transition-all ${
                  qRes.isDraft
                    ? 'border-amber-200 bg-amber-50/20'
                    : isCorrect
                    ? 'border-emerald-200 bg-emerald-50/10'
                    : isPartial
                    ? 'border-amber-300 bg-amber-50/20'
                    : 'border-rose-200 bg-rose-50/10'
                }`}
              >
                {/* Header row */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-extrabold text-xs">
                      Question {idx + 1}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 uppercase">
                      {qRes.type}
                    </span>
                  </div>

                  {/* Result Badge */}
                  {qRes.isDraft ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold border border-amber-200">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{qRes.flagReason || 'Draft – Teacher Review Required (Chờ duyệt)'}</span>
                    </span>
                  ) : isCorrect ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Correct (+{qRes.scoreEarned} pt) / Chính xác</span>
                    </span>
                  ) : isPartial ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold border border-amber-300">
                      <Award className="w-3.5 h-3.5 text-amber-600" />
                      <span>Partial Credit (+{qRes.scoreEarned} pt) / Điểm một phần ({qRes.matchingStats?.correctPairsCount}/{qRes.matchingStats?.totalPairsCount} cặp đúng)</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold border border-rose-200">
                      <XCircle className="w-3.5 h-3.5 text-rose-600" />
                      <span>Incorrect (0 pt) / Chưa đúng</span>
                    </span>
                  )}
                </div>

                {/* Prompt */}
                <h4 className="font-bold text-slate-900 text-base">
                  {qRes.prompt}
                </h4>

                {/* Student Answer & Correct Answer Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1 text-sm">
                  {/* Your Answer */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <span className="text-xs font-bold uppercase text-slate-400">
                      Your response (Lựa chọn của bạn):
                    </span>

                    {/* Dedicated matching display for student choices */}
                    {originalQuestion && originalQuestion.type === 'matching' ? (
                      renderMatchingStudentChoices(originalQuestion as MatchingQuestion, qRes.studentAnswer, qRes.matchingStats)
                    ) : (
                      <div className="pt-1">{formatStudentAnswer(qRes.studentAnswer)}</div>
                    )}
                  </div>

                  {/* Correct Answer (ONLY if approved!) */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <span className="text-xs font-bold uppercase text-slate-400">
                      Correct key (Đáp án chuẩn):
                    </span>

                    {qRes.isDraft ? (
                      <div className="pt-1">
                        <span className="text-amber-700 italic text-xs font-medium">
                          🔒 Hidden until verified by teacher (Bảo mật cho tới khi duyệt)
                        </span>
                      </div>
                    ) : originalQuestion && originalQuestion.type === 'matching' ? (
                      renderMatchingCorrectPairs(originalQuestion as MatchingQuestion)
                    ) : (
                      <div className="pt-1 font-semibold text-emerald-700">
                        {typeof qRes.correctAnswerSummary === 'object'
                          ? Array.isArray(qRes.correctAnswerSummary)
                            ? qRes.correctAnswerSummary.join(', ')
                            : JSON.stringify(qRes.correctAnswerSummary)
                          : String(qRes.correctAnswerSummary)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Simple Vietnamese Explanation by cô Hường for learning */}
                {isApproved && (
                  <div
                    className={`pt-2 text-xs sm:text-sm p-3.5 rounded-xl border flex items-start gap-2.5 ${
                      isCorrect
                        ? 'bg-sky-50/70 border-sky-100 text-slate-700'
                        : 'bg-amber-50/80 border-amber-200 text-amber-950'
                    }`}
                  >
                    <HelpCircle className={`w-4 h-4 shrink-0 mt-0.5 ${isCorrect ? 'text-sky-600' : 'text-amber-600'}`} />
                    <div>
                      <span className="font-bold text-slate-900">
                        Giải thích của cô Hường:
                      </span>{' '}
                      <span className="leading-relaxed">
                        {qRes.explanation ||
                          (isCorrect
                            ? 'Làm rất tốt! Bạn đã chọn đúng theo cấu trúc bài học.'
                            : 'Hãy chú ý xem kĩ câu hỏi và ôn lại mẫu câu tương ứng để chọn đáp án chuẩn xác nhé!')}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
