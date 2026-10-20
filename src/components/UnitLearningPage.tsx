/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { UnitData, WorksheetResult } from '../types/unit';
import { getSavedResult } from '../utils/storage';
import { VocabularyTab } from './VocabularyTab';
import { SentencePatternsTab } from './SentencePatternsTab';
import { PracticeTab } from './PracticeTab';
import { ResultsTab } from './ResultsTab';
import {
  ArrowLeft,
  Award,
  BookOpen,
  FileText,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

interface Props {
  unit: UnitData;
  onBackToHome: () => void;
  onOpenImportModal?: () => void;
}

export type ActiveTab = 'vocabulary' | 'sentence_patterns' | 'practice' | 'results';

export const UnitLearningPage: React.FC<Props> = ({
  unit,
  onBackToHome,
}) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('vocabulary');
  const [activeWorksheetId, setActiveWorksheetId] = useState<string>(
    unit.worksheets[0]?.id || 'ws_1'
  );
  const [currentResult, setCurrentResult] = useState<WorksheetResult | null>(null);

  // Load existing saved result for current worksheet if available
  useEffect(() => {
    const res = getSavedResult(unit.unit_id, activeWorksheetId);
    setCurrentResult(res);
  }, [unit.unit_id, activeWorksheetId]);

  const handleSubmitted = (result: WorksheetResult) => {
    setCurrentResult(result);
    setActiveTab('results');
  };

  const handleRetry = () => {
    setCurrentResult(null);
    setActiveTab('practice');
  };

  return (
    <div className="space-y-6">
      {/* Top Unit Banner & Navigation */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBackToHome}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500" />
            <span>All Units (Tất cả bài học)</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
              Semester {unit.semester} • Học kỳ {unit.semester}
            </span>
            <span className="px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-bold">
              Grade {unit.grade}
            </span>
          </div>
        </div>

        {/* Title & Description */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-sky-600 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-sky-500" />
              <span>Global Success English 4</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              {unit.title}
            </h1>
            <p className="text-sm font-medium text-slate-500 mt-0.5">
              {unit.title_vi} • {unit.description}
            </p>
          </div>

          <div className="text-xs text-slate-400 font-medium md:text-right shrink-0">
            Source: <span className="text-slate-600 font-semibold">{unit.source}</span>
          </div>
        </div>

        {/* 4 Tabs Header Navigation */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setActiveTab('vocabulary')}
            className={`flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 px-2 sm:px-3 rounded-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer touch-manipulation ${
              activeTab === 'vocabulary'
                ? 'bg-sky-500 text-white shadow-md shadow-sky-200'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-4 h-4 shrink-0" />
            <span className="truncate">1. Từ vựng (Vocab)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('sentence_patterns')}
            className={`flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 px-2 sm:px-3 rounded-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer touch-manipulation ${
              activeTab === 'sentence_patterns'
                ? 'bg-sky-500 text-white shadow-md shadow-sky-200'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <MessageSquare className="w-4 h-4 shrink-0" />
            <span className="truncate">2. Mẫu câu (Patterns)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('practice')}
            className={`flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 px-2 sm:px-3 rounded-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer touch-manipulation ${
              activeTab === 'practice'
                ? 'bg-sky-500 text-white shadow-md shadow-sky-200'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4 shrink-0" />
            <span className="truncate">3. Bài tập (Practice)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('results')}
            className={`flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 px-2 sm:px-3 rounded-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer touch-manipulation ${
              activeTab === 'results'
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Award className="w-4 h-4 shrink-0" />
            <span className="truncate">4. Kết quả (Results)</span>
          </button>
        </div>
      </div>

      {/* Tab Content Rendering */}
      <div>
        {activeTab === 'vocabulary' && <VocabularyTab vocabulary={unit.vocabulary} />}

        {activeTab === 'sentence_patterns' && (
          <SentencePatternsTab
            patterns={unit.sentence_patterns}
            unitTitle={unit.title}
            unitNumber={unit.unit_number}
          />
        )}

        {activeTab === 'practice' && (
          <PracticeTab
            unit={unit}
            activeWorksheetId={activeWorksheetId}
            onWorksheetChange={(id) => {
              setActiveWorksheetId(id);
              const r = getSavedResult(unit.unit_id, id);
              setCurrentResult(r);
            }}
            onSubmitted={handleSubmitted}
            currentResult={currentResult}
          />
        )}

        {activeTab === 'results' && (
          <ResultsTab
            unit={unit}
            result={currentResult}
            onRetry={handleRetry}
            onGoToPractice={() => setActiveTab('practice')}
          />
        )}
      </div>
    </div>
  );
};
