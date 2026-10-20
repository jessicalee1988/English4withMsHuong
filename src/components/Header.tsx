/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BookOpen, FileCode, Home, Sparkles } from 'lucide-react';

interface Props {
  currentView: 'home' | 'unit' | 'teacher';
  currentUnitId?: number;
  onGoHome: () => void;
  onGoTeacher?: () => void;
  onOpenImportModal?: () => void;
}

export const Header: React.FC<Props> = ({
  currentView,
  onGoHome,
  onGoTeacher,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-18 flex items-center justify-between gap-3">
        {/* Brand & Title */}
        <div
          onClick={onGoHome}
          className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group select-none min-w-0"
        >
          {/* Friendly Mascot Avatar Badge */}
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-sky-400 to-teal-400 p-0.5 shadow-sm group-hover:scale-105 transition-transform flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center font-black text-sky-600 text-lg">
              👩‍🏫
            </div>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-base sm:text-xl font-black text-slate-900 group-hover:text-sky-600 transition-colors tracking-tight truncate">
                English 4 with Ms Huong
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            </div>
            <p className="text-[11px] sm:text-xs font-semibold text-slate-500 flex items-center gap-1.5 truncate">
              <span>Global Success 4</span>
              <span className="text-slate-300">•</span>
              <span className="text-sky-600">cô Hường</span>
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {currentView !== 'teacher' && onGoTeacher && (
            <button
              type="button"
              onClick={onGoTeacher}
              className="flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 text-xs sm:text-sm font-bold border border-sky-200 transition-colors cursor-pointer touch-manipulation"
              title="Meet Ms Huong – Giới thiệu cô Hường"
            >
              <span>👩‍🏫</span>
              <span className="hidden sm:inline">Meet Ms Huong</span>
              <span className="sm:hidden">Cô Hường</span>
            </button>
          )}

          {currentView !== 'home' && (
            <button
              type="button"
              onClick={onGoHome}
              className="flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-bold transition-colors cursor-pointer touch-manipulation"
            >
              <Home className="w-4 h-4 text-slate-500" />
              <span>Trang chủ</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

