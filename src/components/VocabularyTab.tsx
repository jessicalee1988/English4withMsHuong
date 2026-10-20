/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { VocabularyItem } from '../types/unit';
import { HelpCircle, Rotate3D, RotateCcw, Search, Volume2 } from 'lucide-react';

interface Props {
  vocabulary: VocabularyItem[];
}

export const VocabularyTab: React.FC<Props> = ({ vocabulary }) => {
  const [flippedMap, setFlippedMap] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [speechSupported, setSpeechSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSpeechSupported(true);
    }
  }, []);

  const filteredItems = vocabulary.filter((item) => {
    const matchesSearch =
      item.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.meaning.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const toggleFlip = (id: string) => {
    setFlippedMap((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleFlipAll = () => {
    const allFlipped = filteredItems.every((item) => flippedMap[item.id]);
    const newState: Record<string, boolean> = {};
    for (const item of vocabulary) {
      newState[item.id] = !allFlipped;
    }
    setFlippedMap(newState);
  };

  const handleSpeak = (word: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      utterance.rate = 0.85; // Clear and accessible speed for grade 4 learners
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Flip Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search word or meaning / Tìm từ vựng..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400 focus:bg-white text-slate-800"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleFlipAll}
            className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 text-sm font-semibold border border-sky-200 transition-colors cursor-pointer"
          >
            <Rotate3D className="w-4 h-4 text-sky-600" />
            <span>Flip all cards (Lật tất cả thẻ)</span>
          </button>
        </div>
      </div>

      {/* Grid of Vocabulary Cards: Desktop: 3, Tablet: 2, Mobile: 1 */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-3xl border border-slate-200">
          <p className="text-slate-500 font-medium">No words found matching "{searchQuery}"</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((item) => {
            const isFlipped = !!flippedMap[item.id];

            return (
              <div
                key={item.id}
                onClick={() => toggleFlip(item.id)}
                className="perspective-1000 min-h-[17.5rem] sm:min-h-[16.5rem] cursor-pointer select-none group touch-manipulation"
                title="Click to flip card (Bấm để lật thẻ)"
              >
                <div
                  className={`relative w-full h-full min-h-[17.5rem] sm:min-h-[16.5rem] transition-transform duration-500 transform-style-3d ${
                    isFlipped ? 'rotate-y-180' : ''
                  }`}
                >
                  {/* FRONT SIDE */}
                  <div className="absolute inset-0 w-full h-full backface-hidden bg-white rounded-3xl border-2 border-slate-200/90 shadow-sm hover:border-sky-300 hover:shadow-md transition-all p-5 flex flex-col justify-between">
                    <div>
                      {/* Top Header Row */}
                      <div className="flex items-center justify-between text-xs text-slate-400 gap-2">
                        {/* Word Category */}
                        <span className="font-semibold uppercase tracking-wider text-sky-600 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-100/80">
                          {item.part_of_speech || 'noun'}
                        </span>

                        {/* Actions: Speaker button + Flip prompt */}
                        <div className="flex items-center gap-1.5">
                          {speechSupported && (
                            <button
                              type="button"
                              onClick={(e) => handleSpeak(item.word, e)}
                              className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 hover:text-amber-800 border border-amber-200 transition-colors cursor-pointer touch-manipulation"
                              title="Listen to pronunciation / Nghe phát âm"
                              aria-label={`Listen to pronunciation of ${item.word}`}
                            >
                              <Volume2 className="w-4 h-4 text-amber-600" />
                            </button>
                          )}

                          <span className="flex items-center gap-1 text-xs text-slate-400 group-hover:text-sky-600 transition-colors ml-1 font-medium">
                            <Rotate3D className="w-3.5 h-3.5" />
                            <span>Lật</span>
                          </span>
                        </div>
                      </div>

                      {/* Illustration only if valid image asset exists */}
                      {item.image_url && (
                        <div className="mt-2 w-full h-16 rounded-xl overflow-hidden bg-slate-50 flex items-center justify-center">
                          <img
                            src={item.image_url}
                            alt={item.word}
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                      )}

                      {/* Main English Vocabulary Word & IPA */}
                      <div className="mt-3 text-center space-y-1">
                        <h3 className="text-2xl sm:text-3xl font-black text-slate-900 group-hover:text-sky-600 transition-colors tracking-tight">
                          {item.word}
                        </h3>

                        {/* Display IPA pronunciation when available */}
                        {item.ipa && (
                          <div className="text-xs sm:text-sm font-mono text-sky-700 bg-sky-50 inline-block px-3 py-0.5 rounded-full border border-sky-100 font-medium">
                            {item.ipa}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* English Example Sentence */}
                    {item.example && (
                      <div className="pt-2 border-t border-slate-100">
                        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                          Example:
                        </p>
                        <p className="text-xs sm:text-sm font-semibold text-slate-700 italic mt-0.5 line-clamp-2">
                          "{item.example}"
                        </p>
                      </div>
                    )}
                  </div>

                  {/* BACK SIDE */}
                  <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-gradient-to-br from-teal-50/90 via-emerald-50/70 to-mint-50/90 rounded-3xl border-2 border-emerald-300 shadow-md p-5 flex flex-col justify-between">
                    <div>
                      {/* Top Header Row with Required Label & Flip-back button */}
                      <div className="flex items-center justify-between text-xs text-emerald-800 gap-2">
                        {/* Changed label per prompt instruction */}
                        <span className="font-bold uppercase tracking-wider bg-emerald-100/90 text-emerald-900 px-2.5 py-1 rounded-full border border-emerald-200 text-[11px]">
                          NGHĨA TIẾNG VIỆT
                        </span>

                        {/* Flip-back button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFlip(item.id);
                          }}
                          className="flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-900 bg-white/80 hover:bg-white px-2.5 py-1 rounded-lg border border-emerald-200 transition-colors cursor-pointer touch-manipulation"
                          title="Flip back to English / Quay lại tiếng Anh"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Lật lại</span>
                        </button>
                      </div>

                      {/* Vietnamese Meaning Section */}
                      <div className="mt-3 text-center space-y-1">
                        <p className="text-xs uppercase tracking-widest text-emerald-700 font-bold">
                          {item.word}
                        </p>
                        <h4 className="text-2xl sm:text-3xl font-black text-emerald-950">
                          {item.meaning}
                        </h4>
                      </div>
                    </div>

                    {/* Original English Example & Vietnamese Translation */}
                    {(item.example || item.example_vi) && (
                      <div className="pt-2 border-t border-emerald-200/80 space-y-1 text-xs">
                        {item.example && (
                          <p className="text-slate-600 italic line-clamp-1">
                            <strong className="text-emerald-800 not-italic font-bold">En: </strong>"{item.example}"
                          </p>
                        )}
                        {item.example_vi && (
                          <p className="text-emerald-900 font-semibold line-clamp-1">
                            <strong className="text-emerald-800 not-italic font-bold">Vi: </strong>"{item.example_vi}"
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Helpful reminder note */}
      <div className="p-4 bg-sky-50/80 rounded-2xl border border-sky-200/70 flex items-center gap-3 text-xs sm:text-sm text-sky-900">
        <HelpCircle className="w-5 h-5 text-sky-600 shrink-0" />
        <p>
          <strong>Học từ vựng cùng cô Hường:</strong> Bấm vào biểu tượng loa để nghe phát âm tiếng Anh chuẩn, và bấm vào thẻ để lật xem nghĩa tiếng Việt nhé!
        </p>
      </div>
    </div>
  );
};
