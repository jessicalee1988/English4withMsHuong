/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  FillInTheBlankQuestion,
  MatchingQuestion,
  MultipleChoiceQuestion,
  Question,
  ReadingComprehensionQuestion,
  SentenceReorderingQuestion,
  SingleQuestionResult,
  StudentAnswers,
  TrueFalseQuestion,
  WordUnscramblingQuestion,
  WorksheetResult,
} from '../types/unit';

/**
 * Normalizes text for comparison (lowercased, trimmed, extra spaces collapsed)
 */
export function normalizeText(str: any): string {
  if (typeof str !== 'string') return '';
  return str.trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Normalizes punctuation for sentence reordering comparison
 */
export function normalizeSentence(str: any): string {
  if (typeof str !== 'string') return '';
  return str
    .trim()
    .toLowerCase()
    .replace(/[.,?!]/g, '')
    .replace(/\s+/g, ' ');
}

/**
 * Validates whether the scrambled letters contain exactly the same letters as at least one verified correct answer,
 * including identical frequencies of repeated letters.
 */
export function validateScrambledLetters(
  scrambled_letters: string[],
  correct_answers: string[]
): boolean {
  if (!Array.isArray(scrambled_letters) || scrambled_letters.length === 0) {
    return false;
  }
  if (!Array.isArray(correct_answers) || correct_answers.length === 0) {
    return false;
  }

  const countLetters = (letters: string[]) => {
    const counts: Record<string, number> = {};
    for (const char of letters) {
      const clean = char.toUpperCase().trim();
      if (!clean) continue;
      counts[clean] = (counts[clean] || 0) + 1;
    }
    return counts;
  };

  const scrambledCounts = countLetters(scrambled_letters);
  const scrambledKeys = Object.keys(scrambledCounts).sort();

  return correct_answers.some((ans) => {
    const cleanWordChars = ans.toUpperCase().replace(/[^A-Z0-9]/g, '').split('');
    const answerCounts = countLetters(cleanWordChars);
    const answerKeys = Object.keys(answerCounts).sort();

    if (scrambledKeys.length !== answerKeys.length) return false;

    for (const key of scrambledKeys) {
      if (scrambledCounts[key] !== answerCounts[key]) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Deterministically grades a single question record.
 * Crucially: Questions marked as 'draft' MUST NOT be counted in official scores,
 * and their answer keys MUST NEVER be exposed.
 */
export function gradeSingleQuestion(question: Question, rawAnswer: any): SingleQuestionResult {
  const isDraft = question.status === 'draft';

  // If question is a draft, NEVER grade or expose answer keys!
  if (isDraft) {
    return {
      questionId: question.id,
      type: question.type,
      prompt: question.prompt,
      status: 'draft',
      isDraft: true,
      studentAnswer: rawAnswer ?? null,
      isCorrect: undefined,
      scoreEarned: 0,
      maxScore: 0, // Excluded from official score denominator
      correctAnswerSummary: undefined, // Never expose unapproved answer key!
      explanation: 'Câu hỏi này đang chờ giáo viên thẩm định, chưa tính vào điểm chính thức.',
    };
  }

  // Approved questions
  let isCorrect = false;
  let isPartialCredit = false;
  let scoreEarned = 0;
  let maxScore = 1;
  let correctAnswerSummary: any = null;
  let matchingStats: SingleQuestionResult['matchingStats'] = undefined;

  switch (question.type) {
    case 'multiple_choice': {
      const mc = question as MultipleChoiceQuestion;
      const ansStr = typeof rawAnswer === 'string' ? rawAnswer.trim() : '';
      isCorrect = mc.correct_answers.some((ca) => normalizeText(ca) === normalizeText(ansStr));
      scoreEarned = isCorrect ? 1 : 0;
      correctAnswerSummary = mc.correct_answers[0];
      break;
    }

    case 'matching': {
      const mq = question as MatchingQuestion;
      const ansObj = rawAnswer && typeof rawAnswer === 'object' ? rawAnswer : {};
      const expectedKeys = Object.keys(mq.correct_answers);
      const totalPairsCount = expectedKeys.length;

      let correctPairsCount = 0;
      for (const leftId of expectedKeys) {
        if (ansObj[leftId] === mq.correct_answers[leftId]) {
          correctPairsCount++;
        }
      }

      // Partial credit calculation: e.g. 2 of 4 pairs = 0.5 (50%)
      const creditFraction = totalPairsCount > 0 ? correctPairsCount / totalPairsCount : 0;
      scoreEarned = Math.round(creditFraction * 100) / 100;
      isCorrect = totalPairsCount > 0 && correctPairsCount === totalPairsCount;
      isPartialCredit = correctPairsCount > 0 && correctPairsCount < totalPairsCount;

      matchingStats = {
        correctPairsCount,
        totalPairsCount,
        partialPercentage: Math.round(creditFraction * 100),
      };

      // Readable summary of correct pairs
      const readablePairs = expectedKeys.map((lId) => {
        const leftItem = mq.left_items.find((i) => i.id === lId);
        const rightId = mq.correct_answers[lId];
        const rightItem = mq.right_items.find((i) => i.id === rightId);
        return `${leftItem?.text || lId} ➔ ${rightItem?.text || rightId}`;
      });
      correctAnswerSummary = readablePairs;
      break;
    }

    case 'word_unscrambling': {
      const wu = question as WordUnscramblingQuestion;

      // Validate that scrambled letters contain exactly the same letters as verified correct answer
      const isValidSource = validateScrambledLetters(wu.scrambled_letters, wu.correct_answers);
      if (!isValidSource) {
        // Flag for teacher review instead of scoring it!
        return {
          questionId: question.id,
          type: question.type,
          prompt: question.prompt,
          status: 'draft',
          isDraft: true,
          isFlaggedForReview: true,
          flagReason: 'Chữ cái xáo trộn không khớp với đáp án chuẩn. Đã chuyển cho cô Hường thẩm định.',
          studentAnswer: rawAnswer ?? null,
          isCorrect: undefined,
          scoreEarned: 0,
          maxScore: 0,
          correctAnswerSummary: undefined,
          explanation: 'Câu hỏi này có các chữ cái xáo trộn chưa khớp với đáp án, đã được chuyển cho cô Hường kiểm tra và không tính điểm.',
        };
      }

      const ansStr = typeof rawAnswer === 'string' ? rawAnswer.trim().toUpperCase() : '';
      isCorrect = wu.correct_answers.some(
        (ca) => normalizeText(ca) === normalizeText(ansStr)
      );
      scoreEarned = isCorrect ? 1 : 0;
      correctAnswerSummary = wu.correct_answers[0];
      break;
    }

    case 'fill_in_the_blank': {
      const fib = question as FillInTheBlankQuestion;
      const ansStr = typeof rawAnswer === 'string' ? rawAnswer.trim() : '';
      isCorrect = fib.correct_answers.some(
        (ca) => normalizeText(ca) === normalizeText(ansStr)
      );
      correctAnswerSummary = fib.correct_answers.join(' / ');
      break;
    }

    case 'sentence_reordering': {
      const sr = question as SentenceReorderingQuestion;
      const ansStr = typeof rawAnswer === 'string' ? rawAnswer.trim() : '';
      isCorrect = sr.correct_answers.some(
        (ca) => normalizeSentence(ca) === normalizeSentence(ansStr)
      );
      correctAnswerSummary = sr.correct_answers[0];
      break;
    }

    case 'reading_comprehension': {
      const rc = question as ReadingComprehensionQuestion;
      const ansObj = rawAnswer && typeof rawAnswer === 'object' ? rawAnswer : {};
      const subKeys = Object.keys(rc.correct_answers);

      if (subKeys.length === 0) {
        isCorrect = false;
      } else {
        isCorrect = subKeys.every(
          (sqId) => normalizeText(ansObj[sqId]) === normalizeText(rc.correct_answers[sqId])
        );
      }
      if (isCorrect) {
        scoreEarned = 1;
      }
      correctAnswerSummary = rc.correct_answers;
      break;
    }

    case 'true_false': {
      const tf = question as TrueFalseQuestion;
      const ansStr = typeof rawAnswer === 'string' ? rawAnswer.trim() : '';
      isCorrect = tf.correct_answers.some(
        (ca) => normalizeText(ca) === normalizeText(ansStr)
      );
      scoreEarned = isCorrect ? 1 : 0;
      correctAnswerSummary = tf.correct_answers[0] || 'True';
      break;
    }

    default:
      isCorrect = false;
      scoreEarned = 0;
  }

  // For non-matching questions where scoreEarned wasn't set explicitly
  if (question.type !== 'matching' && scoreEarned === 0 && isCorrect) {
    scoreEarned = 1;
  }

  return {
    questionId: question.id,
    type: question.type,
    prompt: question.prompt,
    status: 'approved',
    isDraft: false,
    studentAnswer: rawAnswer ?? null,
    isCorrect,
    isPartialCredit,
    scoreEarned,
    maxScore,
    correctAnswerSummary,
    explanation: question.explanation,
    matchingStats,
  };
}

/**
 * Checks if student has provided an answer to a question
 */
export function hasAnsweredQuestion(question: Question, rawAnswer: any): boolean {
  if (rawAnswer === undefined || rawAnswer === null || rawAnswer === '') {
    return false;
  }

  if (question.type === 'matching' || question.type === 'reading_comprehension') {
    if (typeof rawAnswer !== 'object') return false;
    const answeredKeys = Object.values(rawAnswer).filter(
      (v) => v !== undefined && v !== null && v !== ''
    );
    return answeredKeys.length > 0;
  }

  if (typeof rawAnswer === 'string') {
    return rawAnswer.trim().length > 0;
  }

  return true;
}

/**
 * Checks whether an answer to a question is fully completed.
 * Particularly checks that matching questions have ALL pairs connected,
 * and reading comprehension questions have ALL sub-questions answered.
 */
export function isQuestionAnswerComplete(question: Question, rawAnswer: any): boolean {
  if (rawAnswer === undefined || rawAnswer === null || rawAnswer === '') {
    return false;
  }

  if (question.type === 'matching') {
    if (!rawAnswer || typeof rawAnswer !== 'object') return false;
    const mq = question as MatchingQuestion;
    const requiredLeft = mq.left_items.map((i) => i.id);
    return requiredLeft.length > 0 && requiredLeft.every((id) => !!rawAnswer[id]);
  }

  if (question.type === 'reading_comprehension') {
    if (!rawAnswer || typeof rawAnswer !== 'object') return false;
    const rc = question as ReadingComprehensionQuestion;
    return rc.sub_questions.length > 0 && rc.sub_questions.every((sq) => !!rawAnswer[sq.id]);
  }

  if (question.type === 'word_unscrambling') {
    if (typeof rawAnswer !== 'string') return false;
    return rawAnswer.trim().length > 0;
  }

  if (question.type === 'sentence_reordering') {
    if (typeof rawAnswer !== 'string') return false;
    return rawAnswer.trim().length > 0;
  }

  if (question.type === 'fill_in_the_blank') {
    if (typeof rawAnswer !== 'string') return false;
    return rawAnswer.trim().length > 0;
  }

  if (question.type === 'multiple_choice') {
    if (typeof rawAnswer !== 'string') return false;
    return rawAnswer.trim().length > 0;
  }

  if (question.type === 'true_false') {
    if (typeof rawAnswer !== 'string') return false;
    return rawAnswer.trim().length > 0;
  }

  return true;
}

/**
 * Provides a human-readable completion summary for a question
 */
export function getQuestionCompletionDetail(question: Question, rawAnswer: any): { isComplete: boolean; message: string; messageVi: string } {
  if (question.type === 'matching') {
    const mq = question as MatchingQuestion;
    const totalRequired = mq.left_items.length;
    const matchedCount = rawAnswer && typeof rawAnswer === 'object'
      ? Object.values(rawAnswer).filter(Boolean).length
      : 0;

    if (matchedCount === 0) {
      return {
        isComplete: false,
        message: 'No pairs matched yet (0/' + totalRequired + ')',
        messageVi: 'Chưa nối câu nào (0/' + totalRequired + ' cặp)',
      };
    }
    if (matchedCount < totalRequired) {
      return {
        isComplete: false,
        message: 'Incomplete: ' + matchedCount + '/' + totalRequired + ' pairs matched',
        messageVi: 'Chưa đủ: mới nối ' + matchedCount + '/' + totalRequired + ' cặp',
      };
    }
    return {
      isComplete: true,
      message: 'All ' + totalRequired + ' pairs matched',
      messageVi: 'Đã nối đủ ' + totalRequired + ' cặp',
    };
  }

  if (question.type === 'reading_comprehension') {
    const rc = question as ReadingComprehensionQuestion;
    const total = rc.sub_questions.length;
    const answered = rawAnswer && typeof rawAnswer === 'object'
      ? Object.values(rawAnswer).filter(Boolean).length
      : 0;

    if (answered < total) {
      return {
        isComplete: false,
        message: answered + '/' + total + ' sub-questions answered',
        messageVi: 'Đã trả lời ' + answered + '/' + total + ' câu hỏi đọc hiểu',
      };
    }
    return {
      isComplete: true,
      message: 'All questions answered',
      messageVi: 'Đã trả lời đủ các câu',
    };
  }

  const isDone = hasAnsweredQuestion(question, rawAnswer);
  return {
    isComplete: isDone,
    message: isDone ? 'Answered' : 'Not answered yet',
    messageVi: isDone ? 'Đã làm' : 'Chưa làm',
  };
}

/**
 * Evaluates all questions in a worksheet
 */
export function evaluateWorksheet(
  unitId: number,
  worksheetId: string,
  questions: Question[],
  answers: StudentAnswers
): WorksheetResult {
  const questionResults: SingleQuestionResult[] = questions.map((q) => {
    return gradeSingleQuestion(q, answers[q.id]);
  });

  const totalQuestions = questions.length;
  const approvedQuestions = questionResults.filter((r) => !r.isDraft);
  const draftQuestions = questionResults.filter((r) => r.isDraft);

  const answeredCount = questions.filter((q) => hasAnsweredQuestion(q, answers[q.id])).length;
  const correctApprovedCount = approvedQuestions.filter((r) => r.isCorrect).length;

  const approvedCount = approvedQuestions.length;
  const incorrectApprovedCount = approvedQuestions.filter((r) => !r.isCorrect).length;

  const totalEarnedScore = Math.round(approvedQuestions.reduce((sum, q) => sum + q.scoreEarned, 0) * 100) / 100;
  const totalPossibleScore = approvedQuestions.reduce((sum, q) => sum + q.maxScore, 0);

  const percentageScore = totalPossibleScore > 0
    ? Math.round((totalEarnedScore / totalPossibleScore) * 100)
    : 0;

  return {
    unitId,
    worksheetId,
    submittedAt: new Date().toISOString(),
    totalQuestions,
    approvedQuestionsCount: approvedCount,
    draftQuestionsCount: draftQuestions.length,
    answeredCount,
    totalEarnedScore,
    totalPossibleScore,
    correctApprovedCount,
    incorrectApprovedCount,
    percentageScore,
    questionResults,
  };
}
