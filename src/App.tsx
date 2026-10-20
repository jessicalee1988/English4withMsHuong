/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { UnitData, UnitRegistry } from './types/unit';
import {
  deleteUnitFromRegistry,
  initializeUnitRegistry,
  restoreBackupToRegistry,
  saveUnitToRegistry,
} from './data/unitLoader';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './components/HomePage';
import { UnitLearningPage } from './components/UnitLearningPage';
import { TeacherProfilePage } from './components/TeacherProfilePage';
import { ImportModal } from './components/ImportModal';
import { AlertTriangle, FileCode, Loader2, RefreshCw } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'unit' | 'teacher'>('home');
  const [currentUnitId, setCurrentUnitId] = useState<number>(1);
  const [registry, setRegistry] = useState<UnitRegistry>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<{ en: string; vi: string } | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Initialize Unit Registry on startup from storage
  useEffect(() => {
    async function loadInitialData() {
      try {
        setIsLoading(true);
        const initialRegistry = await initializeUnitRegistry();
        setRegistry(initialRegistry);
        setLoadError(null);
      } catch (err: any) {
        setLoadError({
          en: `Failed to initialize database: ${err.message}`,
          vi: `Không thể khởi động cơ sở dữ liệu: ${err.message}`,
        });
      } finally {
        setIsLoading(false);
      }
    }

    loadInitialData();
  }, []);

  const handleSelectUnit = (unitId: number) => {
    if (registry[unitId]) {
      setCurrentUnitId(unitId);
      setCurrentView('unit');
      setLoadError(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setLoadError({
        en: `Unit ${unitId} is not available in the curriculum registry. Please import its JSON data first.`,
        vi: `Bài học Unit ${unitId} chưa được nạp vào hệ thống. Vui lòng tải tệp JSON của bài học này lên.`,
      });
    }
  };

  const handleGoHome = () => {
    setCurrentView('home');
    setLoadError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoTeacher = () => {
    setCurrentView('teacher');
    setLoadError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveUnit = async (newUnit: UnitData) => {
    const updated = await saveUnitToRegistry(newUnit, registry);
    setRegistry(updated);
    // If saving the currently opened unit, keep it active
    if (currentUnitId === newUnit.unit_id) {
      setCurrentUnitId(newUnit.unit_id);
    }
    setLoadError(null);
  };

  const handleDeleteUnit = async (unitId: number) => {
    const updated = await deleteUnitFromRegistry(unitId, registry);
    setRegistry(updated);
    if (currentUnitId === unitId && currentView === 'unit') {
      if (unitId === 1 && updated[1]) {
        // Reset Unit 1 stays on Unit 1
        setCurrentUnitId(1);
      } else {
        // Deleted unit redirects home
        setCurrentView('home');
      }
    }
  };

  const handleRestoreBackup = async (backupUnits: UnitRegistry) => {
    const updated = await restoreBackupToRegistry(backupUnits);
    setRegistry(updated);
    setLoadError(null);
  };

  const currentUnitData = registry[currentUnitId] || null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/70 text-slate-900 font-sans antialiased selection:bg-sky-200 selection:text-sky-900">
      {/* Header */}
      <Header
        currentView={currentView}
        currentUnitId={currentUnitId}
        onGoHome={handleGoHome}
        onGoTeacher={handleGoTeacher}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {isLoading ? (
          <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-10 h-10 text-sky-500 animate-spin" />
            <p className="text-slate-600 font-bold text-sm">
              Đang tải dữ liệu bài học của cô Hường...
            </p>
          </div>
        ) : loadError ? (
          <div className="bg-white rounded-3xl border-2 border-rose-200 p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-lg space-y-5 animate-in fade-in">
            <div className="w-16 h-16 rounded-3xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900">
                Unit Data Error / Lỗi tệp dữ liệu bài học
              </h2>
              <p className="text-sm text-rose-700 font-semibold bg-rose-50 p-3 rounded-2xl border border-rose-100">
                {loadError.en}
              </p>
              <p className="text-xs text-slate-600 font-medium">
                {loadError.vi}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
              <button
                type="button"
                onClick={() => handleSelectUnit(1)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Learn Unit 1: My friends</span>
              </button>

              <button
                type="button"
                onClick={handleGoHome}
                className="px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm transition-all cursor-pointer"
              >
                Go to Home (Về trang chủ)
              </button>
            </div>
          </div>
        ) : (
          <>
            {currentView === 'home' && (
              <HomePage
                registry={registry}
                onSelectUnit={handleSelectUnit}
                onGoTeacher={handleGoTeacher}
              />
            )}

            {currentView === 'unit' && currentUnitData && (
              <UnitLearningPage
                unit={currentUnitData}
                onBackToHome={handleGoHome}
              />
            )}

            {currentView === 'teacher' && (
              <TeacherProfilePage
                onBackToHome={handleGoHome}
                onStartLearning={() => handleSelectUnit(1)}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <Footer onGoTeacher={handleGoTeacher} />

      {/* Import & Multi-Unit Data Management Modal */}
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        registry={registry}
        onSaveUnit={handleSaveUnit}
        onDeleteUnit={handleDeleteUnit}
        onRestoreBackup={handleRestoreBackup}
        onSelectUnit={handleSelectUnit}
      />
    </div>
  );
}
