/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MatchingQuestion } from '../../types/unit';
import { CheckCircle2, Link2, RotateCcw, Sparkles, X } from 'lucide-react';

interface Props {
  question: MatchingQuestion;
  value: Record<string, string>; // left_id -> right_id
  onChange: (value: Record<string, string>) => void;
  disabled?: boolean;
}

const PAIR_COLORS = [
  { border: 'border-sky-400', bg: 'bg-sky-50', text: 'text-sky-900', badge: 'bg-sky-500', ring: 'ring-sky-300' },
  { border: 'border-emerald-400', bg: 'bg-emerald-50', text: 'text-emerald-900', badge: 'bg-emerald-500', ring: 'ring-emerald-300' },
  { border: 'border-amber-400', bg: 'bg-amber-50', text: 'text-amber-900', badge: 'bg-amber-500', ring: 'ring-amber-300' },
  { border: 'border-violet-400', bg: 'bg-violet-50', text: 'text-violet-900', badge: 'bg-violet-500', ring: 'ring-violet-300' },
  { border: 'border-rose-400', bg: 'bg-rose-50', text: 'text-rose-900', badge: 'bg-rose-500', ring: 'ring-rose-300' },
  { border: 'border-teal-400', bg: 'bg-teal-50', text: 'text-teal-900', badge: 'bg-teal-500', ring: 'ring-teal-300' },
];

export const MatchingRenderer: React.FC<Props> = ({
  question,
  value = {},
  onChange,
  disabled = false,
}) => {
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);

  // Invert value map to check which right item is paired: right_id -> left_id
  const rightToLeftMap: Record<string, string> = {};
  for (const [leftId, rightId] of Object.entries(value || {})) {
    if (rightId) {
      rightToLeftMap[rightId] = leftId;
    }
  }

  // Consistent color mapping based on left_items order
  const leftItemOrder = question.left_items.map((item) => item.id);
  const getColorForLeftId = (leftId: string) => {
    const idx = leftItemOrder.indexOf(leftId);
    return PAIR_COLORS[idx >= 0 ? idx % PAIR_COLORS.length : 0];
  };

  // Connect left and right items
  const connectPair = (leftId: string, rightId: string) => {
    const updated = { ...(value || {}) };

    // If another left item was paired with this right item, remove old pairing
    for (const [lKey, rVal] of Object.entries(updated)) {
      if (lKey !== leftId && rVal === rightId) {
        delete updated[lKey];
      }
    }

    updated[leftId] = rightId;
    onChange(updated);
    setSelectedLeft(null);
    setSelectedRight(null);
  };

  const handleSelectLeft = (leftId: string) => {
    if (disabled) return;

    // If a right item was already selected, connect immediately!
    if (selectedRight) {
      connectPair(leftId, selectedRight);
      return;
    }

    // Toggle selection
    if (selectedLeft === leftId) {
      setSelectedLeft(null);
    } else {
      setSelectedLeft(leftId);
    }
  };

  const handleSelectRight = (rightId: string) => {
    if (disabled) return;

    // If a left item was already selected, connect immediately!
    if (selectedLeft) {
      connectPair(selectedLeft, rightId);
      return;
    }

    // Toggle selection
    if (selectedRight === rightId) {
      setSelectedRight(null);
    } else {
      setSelectedRight(rightId);
    }
  };

  const handleRemovePair = (leftId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (disabled) return;
    const updated = { ...(value || {}) };
    delete updated[leftId];
    onChange(updated);
  };

  const handleReset = () => {
    if (disabled) return;
    onChange({});
    setSelectedLeft(null);
    setSelectedRight(null);
  };

  const validEntries = Object.entries(value || {}).filter(([_, r]) => !!r);
  const pairedCount = validEntries.length;
  const totalLeft = question.left_items.length;
  const isFullyMatched = pairedCount === totalLeft;

  return (
    <div className="space-y-4">
      {/* Interactive Guidance Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-sky-50/80 p-3.5 rounded-2xl border border-sky-200">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-sky-900">
          <Link2 className="w-4 h-4 text-sky-600 shrink-0" />
          <span>
            {selectedLeft ? (
              <span className="font-bold text-sky-800 animate-pulse">
                👉 Now click the matching answer in Column B! (Bấm chọn câu tương ứng ở Cột B)
              </span>
            ) : selectedRight ? (
              <span className="font-bold text-emerald-800 animate-pulse">
                👈 Now click the matching question in Column A! (Bấm chọn câu hỏi tương ứng ở Cột A)
              </span>
            ) : (
              <span>
                Click an item in <strong>Column A</strong>, then click its match in <strong>Column B</strong> (Hoặc chọn Cột B trước rồi nối Cột A).
              </span>
            )}
          </span>
        </div>

        {pairedCount > 0 && !disabled && (
          <button
            type="button"
            onClick={handleReset}
            className="self-end sm:self-auto flex items-center gap-1 text-xs text-slate-500 hover:text-red-600 font-bold px-2.5 py-1 rounded-xl bg-white hover:bg-red-50 border border-slate-200 hover:border-red-200 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset pairs / Nối lại</span>
          </button>
        )}
      </div>

      {/* Two Matching Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Column (Column A) */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">
              Column A (Cột A - Câu hỏi / Lời nói)
            </h4>
            <span className="text-[11px] font-bold text-slate-400">Step 1</span>
          </div>

          {question.left_items.map((leftItem) => {
            const pairedRightId = value?.[leftItem.id];
            const isSelected = selectedLeft === leftItem.id;
            const pairColor = getColorForLeftId(leftItem.id);
            const pairedRightItem = pairedRightId
              ? question.right_items.find((r) => r.id === pairedRightId)
              : null;

            return (
              <div
                key={leftItem.id}
                onClick={() => handleSelectLeft(leftItem.id)}
                className={`relative p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-2 touch-manipulation min-h-[52px] ${
                  isSelected
                    ? 'border-sky-500 bg-sky-100/90 shadow-md ring-4 ring-sky-300/50 scale-[1.01]'
                    : pairedRightId
                    ? `${pairColor.border} ${pairColor.bg} shadow-xs`
                    : selectedRight
                    ? 'border-dashed border-sky-400 bg-sky-50/50 hover:bg-sky-100 hover:border-sky-600'
                    : 'border-slate-200 bg-white hover:border-sky-300 hover:bg-slate-50/70'
                } ${disabled ? 'cursor-default opacity-85' : ''}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-7 h-7 rounded-xl text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs ${
                        pairedRightId ? pairColor.badge : isSelected ? 'bg-sky-600' : 'bg-slate-400'
                      }`}
                    >
                      {leftItem.id.replace('l', 'A')}
                    </span>
                    <span className="font-bold text-slate-900 text-sm sm:text-base">
                      {leftItem.text}
                    </span>
                  </div>

                  {pairedRightId && !disabled && (
                    <button
                      type="button"
                      onClick={(e) => handleRemovePair(leftItem.id, e)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-white transition-colors"
                      title="Hủy nối cặp này"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Subtext showing current link */}
                {pairedRightItem && (
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-800 pt-1 border-t border-sky-200/60 pl-10">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Nối với:</span>
                    <span className="font-bold text-slate-800">{pairedRightItem.text}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right Column (Column B) */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">
              Column B (Cột B - Câu trả lời / Đáp từ)
            </h4>
            <span className="text-[11px] font-bold text-slate-400">Step 2</span>
          </div>

          {question.right_items.map((rightItem) => {
            const pairedLeftId = rightToLeftMap[rightItem.id];
            const isSelected = selectedRight === rightItem.id;
            const pairColor = pairedLeftId ? getColorForLeftId(pairedLeftId) : null;
            const pairedLeftItem = pairedLeftId
              ? question.left_items.find((l) => l.id === pairedLeftId)
              : null;

            return (
              <div
                key={rightItem.id}
                onClick={() => handleSelectRight(rightItem.id)}
                className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-2 touch-manipulation min-h-[52px] ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-100/90 shadow-md ring-4 ring-emerald-300/50 scale-[1.01]'
                    : pairColor
                    ? `${pairColor.border} ${pairColor.bg} shadow-xs`
                    : selectedLeft
                    ? 'border-dashed border-sky-400 bg-sky-50/50 hover:bg-sky-100 hover:border-sky-600'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                } ${disabled ? 'cursor-default opacity-85' : ''}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-7 h-7 rounded-xl text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs ${
                        pairColor ? pairColor.badge : isSelected ? 'bg-emerald-600' : 'bg-slate-400'
                      }`}
                    >
                      {rightItem.id.replace('r', 'B')}
                    </span>
                    <span className="font-bold text-slate-900 text-sm sm:text-base">
                      {rightItem.text}
                    </span>
                  </div>

                  {pairColor && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-white/90 text-emerald-800 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Matched</span>
                    </span>
                  )}
                </div>

                {/* Subtext showing current link */}
                {pairedLeftItem && (
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-800 pt-1 border-t border-emerald-200/60 pl-10">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Nối từ:</span>
                    <span className="font-bold text-slate-800">{pairedLeftItem.text}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Matching Status Summary Bar */}
      <div className="p-3.5 rounded-2xl bg-white border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          {isFullyMatched ? (
            <span className="inline-flex items-center gap-1.5 font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>All {totalLeft} pairs matched! (Đã hoàn thành nối tất cả các cặp!)</span>
            </span>
          ) : (
            <span className="font-medium text-amber-800 bg-amber-50 px-3 py-1 rounded-xl border border-amber-200">
              ⚠️ Matched: <strong>{pairedCount}</strong> / {totalLeft} pairs (Vui lòng nối đủ tất cả các cặp câu trước khi nộp bài)
            </span>
          )}
        </div>

        <div className="text-slate-400 font-semibold">
          {pairedCount}/{totalLeft} completed
        </div>
      </div>
    </div>
  );
};
