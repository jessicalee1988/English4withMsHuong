/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Heart, Sparkles } from 'lucide-react';

interface Props {
  onGoTeacher?: () => void;
}

export const Footer: React.FC<Props> = ({ onGoTeacher }) => {
  return (
    <footer className="mt-16 bg-white border-t border-slate-200/90 py-8 px-4 text-center">
      <div className="max-w-4xl mx-auto space-y-2">
        <div className="flex items-center justify-center gap-2 text-sm font-bold text-slate-800">
          <span>English 4 with Ms Huong</span>
          <span className="text-slate-300">•</span>
          <span className="text-sky-600">Global Success – Grade 4</span>
        </div>
        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
          Ứng dụng học tiếng Anh dành cho học sinh lớp 4 Việt Nam. Thiết kế bài giảng trực quan, không cần đăng nhập, hoàn toàn miễn phí.
        </p>

        {onGoTeacher && (
          <div className="pt-1">
            <button
              type="button"
              onClick={onGoTeacher}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 transition-colors cursor-pointer touch-manipulation"
            >
              <span>👩‍🏫 Meet Ms Huong – Giới thiệu cô Hường</span>
            </button>
          </div>
        )}

        <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-center gap-1">
          <span>Made with</span>
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          <span>for Vietnamese students</span>
        </div>
      </div>
    </footer>
  );
};
