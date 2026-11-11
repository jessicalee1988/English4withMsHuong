/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UnitMeta, UnitRegistry } from '../types/unit';
import { UNITS_METADATA } from '../data/unitsMeta';
import {
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  GraduationCap,
  Lock,
  PlusCircle,
  Sparkles,
  Star,
  Upload,
} from 'lucide-react';

interface Props {
  registry: UnitRegistry;
  onSelectUnit: (unitId: number) => void;
  onOpenImportModal?: () => void;
}

export const HomePage: React.FC<Props> = ({
  registry,
  onSelectUnit,
}) => {
  const [selectedSemester, setSelectedSemester] = useState<1 | 2>(1);
  const [noticeModalUnit, setNoticeModalUnit] = useState<UnitMeta | null>(null);

  const semester1Units = UNITS_METADATA.filter((u) => u.semester === 1);
  const semester2Units = UNITS_METADATA.filter((u) => u.semester === 2);

  const currentUnits = selectedSemester === 1 ? semester1Units : semester2Units;

  const handleUnitClick = (unit: UnitMeta, isAvailable: boolean) => {
    if (isAvailable) {
      onSelectUnit(unit.id);
    } else {
      setNoticeModalUnit(unit);
    }
  };

  // Count active units
  const loadedUnitIds = Object.keys(registry).map(Number);
  const activeCount = loadedUnitIds.length;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-sky-400 via-violet-400 to-pink-400 rounded-3xl p-6 sm:p-10 text-white shadow-lg">
        {/* Decorative background shapes */}
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute right-1/4 -top-10 w-40 h-40 bg-amber-400/20 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-3.5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-amber-200 text-xs sm:text-sm font-bold border border-white/20">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Hello, little stars! 🌟</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            English 4 · Fun Learning
          </h1>
          <p className="text-sky-100 text-sm sm:text-base md:text-lg font-medium leading-relaxed">
            <strong>Global Success 4</strong> · Learn, play & shine! 🌟
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onSelectUnit(1)}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-slate-900 font-extrabold text-sm sm:text-base shadow-md transition-all hover:scale-105 cursor-pointer touch-manipulation"
            >
              <span>🚀 Let's play!</span>
              <ArrowRight className="w-5 h-5" />
            </button>


            <div className="inline-flex items-center gap-2 text-xs sm:text-sm text-sky-100 bg-white/10 px-3.5 py-2.5 rounded-xl border border-white/10">
              <Star className="w-4 h-4 text-amber-300 fill-amber-300" />
              <span>✨ Free · No login</span>
            </div>
          </div>
        </div>
      </div>

      {/* Semester Switcher Tabs */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-2xl font-black text-slate-900">🎈 Choose a Unit!</h2>
            <p className="text-sm text-slate-500">
              20 fun units · {activeCount} ready to play!
            </p>
          </div>

          {/* Semester Selector Buttons */}
          <div className="w-full sm:w-auto flex items-center p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => setSelectedSemester(1)}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer touch-manipulation ${
                selectedSemester === 1
                  ? 'bg-white text-sky-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-4 h-4 shrink-0" />
              <span>🌸 Term 1</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedSemester(2)}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer touch-manipulation ${
                selectedSemester === 2
                  ? 'bg-white text-sky-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-4 h-4 shrink-0" />
              <span>🌻 Term 2</span>
            </button>
          </div>
        </div>

        {/* Units Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {currentUnits.map((metaUnit) => {
            const loadedUnit = registry[metaUnit.id];
            const isAvailable = Boolean(loadedUnit);

            const displayTitle = loadedUnit ? loadedUnit.title : metaUnit.title;
            const displayTitleVi = loadedUnit ? loadedUnit.title_vi : metaUnit.title_vi;
            const vocabCount = loadedUnit ? loadedUnit.vocabulary?.length || 0 : 0;
            const patternCount = loadedUnit ? loadedUnit.sentence_patterns?.length || 0 : 0;
            const worksheetCount = loadedUnit ? loadedUnit.worksheets?.length || 0 : 0;

            return (
              <div
                key={metaUnit.id}
                onClick={() => handleUnitClick(metaUnit, isAvailable)}
                className={`group relative rounded-[2rem] border-2 p-4 sm:p-6 transition-all select-none ${
                  isAvailable
                    ? 'border-sky-200 bg-white hover:border-rose-300 hover:shadow-xl hover:-translate-y-2 cursor-pointer'
                    : 'border-slate-200/80 bg-slate-50/70 hover:bg-slate-100/60 opacity-90 cursor-pointer'
                }`}
              >
                {/* Header tag */}
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`w-12 h-12 rounded-2xl font-black text-base flex items-center justify-center shrink-0 ${
                      isAvailable
                        ? 'bg-gradient-to-br from-sky-400 to-violet-400 text-white shadow-md'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    U{metaUnit.number}
                  </span>

                  {isAvailable ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>⭐ Play</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-200/80 text-slate-600 text-xs font-bold border border-slate-300">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>🔒 Soon</span>
                    </span>
                  )}
                </div>

                {/* Title & Topic */}
                <div className="space-y-1.5 min-h-20">
                  <h3
                    className={`text-lg sm:text-xl font-extrabold ${
                      isAvailable
                        ? 'text-slate-900 group-hover:text-sky-600 transition-colors'
                        : 'text-slate-700'
                    }`}
                  >
                    {displayTitle}
                  </h3>
                  <p className="text-sm font-semibold text-slate-500">{displayTitleVi}</p>
                  <div className="text-5xl sm:text-6xl text-center py-3 group-hover:scale-110 transition-transform" aria-hidden="true">{['🐻','🦊','🐰','🐼','🦁','🐸','🐱','🦄','🐨','🐯'][((metaUnit.id - 1) % 10)]}</div>
                </div>

                {/* Footer Action */}
                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                  {isAvailable ? (
                    <>
                      <span className="text-xs font-bold text-sky-600">
                        📚 🎯 ✏️
                      </span>
                      <span className="flex items-center gap-1 text-xs font-extrabold text-sky-600 group-hover:translate-x-1 transition-transform">
                        <span>Go!</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5" />
                        <span>Chưa mở bài học</span>
                      </span>
                      <span className="text-xs font-bold text-slate-400">
                        Coming soon
                      </span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Coming Soon Notice Modal */}
      {noticeModalUnit && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
              <Clock className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold">
                Unit {noticeModalUnit.number} (Coming soon)
              </span>
              <h3 className="text-xl font-extrabold text-slate-900">
                {noticeModalUnit.title}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                This unit is getting ready! Come back soon.
              </p>
              <p className="text-xs text-sky-700 font-semibold bg-sky-50 p-3 rounded-xl border border-sky-100">
                🌟 Try another unit while you wait!
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setNoticeModalUnit(null)}
                className="w-full sm:flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-colors text-sm cursor-pointer"
              >
                Đóng (Close)
              </button>
              <button
                type="button"
                onClick={() => {
                  setNoticeModalUnit(null);
                  onSelectUnit(1);
                }}
                className="w-full sm:flex-1 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold transition-colors shadow-sm text-sm cursor-pointer"
              >
                🚀 Play Unit 1
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
