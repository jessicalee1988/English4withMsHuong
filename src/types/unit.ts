/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type QuestionStatus = 'approved' | 'draft';

export type QuestionType =
  | 'multiple_choice'
  | 'matching'
  | 'word_unscrambling'
  | 'fill_in_the_blank'
  | 'sentence_reordering'
  | 'reading_comprehension'
  | 'true_false';

export interface VocabularyItem {
  id: string;
  word: string;
  meaning: string;
  ipa?: string;
  image_url?: string;
  part_of_speech?: string;
  example?: string;
  example_vi?: string;
}

export interface PatternExample {
  speaker_q?: string;
  q: string;
  speaker_a?: string;
  a: string;
}

export interface SentencePattern {
  id: string;
  title: string;
  title_vi?: string;
  question: string;
  answer: string;
  explanation_vi: string;
  highlights?: string[];
  examples: PatternExample[];
}

export interface MatchingItem {
  id: string;
  text: string;
  subtext?: string;
}

export interface ReadingSubQuestion {
  id: string;
  question: string;
  question_vi?: string;
  options: string[];
  correct_answer: string;
}

export interface BaseQuestion {
  id: string;
  type: QuestionType;
  prompt: string;
  prompt_vi?: string;
  status: QuestionStatus;
  source?: string;
  explanation?: string;
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  type: 'multiple_choice';
  options: string[];
  correct_answers: string[];
}

export interface MatchingQuestion extends BaseQuestion {
  type: 'matching';
  left_items: MatchingItem[];
  right_items: MatchingItem[];
  correct_answers: Record<string, string>; // left_id -> right_id
}

export interface WordUnscramblingQuestion extends BaseQuestion {
  type: 'word_unscrambling';
  scrambled_letters: string[];
  hint?: string;
  correct_answers: string[];
}

export interface FillInTheBlankQuestion extends BaseQuestion {
  type: 'fill_in_the_blank';
  sentence_template: string; // e.g. "Mary is from America. ______ is American."
  options?: string[]; // Optional word bank
  correct_answers: string[];
}

export interface SentenceReorderingQuestion extends BaseQuestion {
  type: 'sentence_reordering';
  words: string[];
  correct_answers: string[]; // e.g. ["Where is she from?"]
}

export interface ReadingComprehensionQuestion extends BaseQuestion {
  type: 'reading_comprehension';
  passage: string;
  passage_title?: string;
  sub_questions: ReadingSubQuestion[];
  correct_answers: Record<string, string>; // sub_q_id -> correct option
}

export interface TrueFalseQuestion extends BaseQuestion {
  type: 'true_false';
  passage?: string;
  passage_title?: string;
  options?: string[]; // typically ["True", "False"]
  correct_answers: string[]; // ["True"] or ["False"]
}

export type Question =
  | MultipleChoiceQuestion
  | MatchingQuestion
  | WordUnscramblingQuestion
  | FillInTheBlankQuestion
  | SentenceReorderingQuestion
  | ReadingComprehensionQuestion
  | TrueFalseQuestion;

export interface Worksheet {
  id: string;
  title: string;
  title_vi?: string;
  description?: string;
  question_ids: string[];
}

export interface UnitData {
  unit_id: number;
  unit_number: number;
  title: string;
  title_vi: string;
  semester: 1 | 2;
  grade: number;
  description: string;
  source: string;
  vocabulary: VocabularyItem[];
  sentence_patterns: SentencePattern[];
  worksheets: Worksheet[];
  questions: Question[];
}

export interface StudentAnswers {
  // Key is question id, value depends on type:
  // multiple_choice: string (selected option)
  // matching: Record<string, string> (left_id -> right_id)
  // word_unscrambling: string (joined letters)
  // fill_in_the_blank: string
  // sentence_reordering: string (joined words)
  // reading_comprehension: Record<string, string> (sub_id -> answer)
  [questionId: string]: any;
}

export interface SingleQuestionResult {
  questionId: string;
  type: QuestionType;
  prompt: string;
  status: QuestionStatus;
  isDraft: boolean;
  isFlaggedForReview?: boolean;
  flagReason?: string;
  studentAnswer: any;
  isCorrect?: boolean;
  isPartialCredit?: boolean;
  scoreEarned: number; // 0, 0.25, 0.5, 0.75, 1
  maxScore: number; // 1 if approved, 0 if draft/flagged
  correctAnswerSummary?: any; // Only exposed if approved!
  explanation?: string;
  matchingStats?: {
    correctPairsCount: number;
    totalPairsCount: number;
    partialPercentage: number;
  };
}

export interface WorksheetResult {
  unitId: number;
  worksheetId: string;
  submittedAt: string;
  totalQuestions: number;
  approvedQuestionsCount: number;
  draftQuestionsCount: number;
  answeredCount: number;
  totalEarnedScore: number; // sum of earned scores (e.g. 3.5)
  totalPossibleScore: number; // sum of max scores (e.g. 4.0)
  correctApprovedCount: number;
  incorrectApprovedCount: number;
  percentageScore: number;
  questionResults: SingleQuestionResult[];
}

export interface UnitMeta {
  id: number;
  number: number;
  title: string;
  title_vi: string;
  semester: 1 | 2;
  status: 'available' | 'coming_soon';
  topic: string;
}

export type UnitRegistry = Record<number, UnitData>;

export interface UnitImportPreview {
  unit_id: number;
  unit_number: number;
  title: string;
  title_vi: string;
  semester: 1 | 2;
  grade: number;
  vocabularyCount: number;
  sentencePatternCount: number;
  worksheetCount: number;
  questionCount: number;
  approvedQuestionCount: number;
  draftQuestionCount: number;
  isExisting: boolean;
}

export interface BackupPayload {
  version: number;
  exportedAt: string;
  app: string;
  units: Record<number, UnitData>;
}
