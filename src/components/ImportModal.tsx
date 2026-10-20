/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UnitData, UnitImportPreview, UnitRegistry } from '../types/unit';
import {
  buildUnitImportPreview,
  exportAllUnitsAsJson,
  exportUnitAsJson,
  validateBackupPayload,
  validateUnitData,
} from '../data/unitLoader';
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Download,
  FileCode,
  FolderOpen,
  Info,
  Layers,
  RotateCcw,
  Sparkles,
  Trash2,
  Upload,
  X,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  registry: UnitRegistry;
  onSaveUnit: (unit: UnitData) => Promise<void>;
  onDeleteUnit: (unitId: number) => Promise<void>;
  onRestoreBackup: (backupUnits: UnitRegistry) => Promise<void>;
  onSelectUnit: (unitId: number) => void;
}

export const ImportModal: React.FC<Props> = ({
  isOpen,
  onClose,
  registry,
  onSaveUnit,
  onDeleteUnit,
  onRestoreBackup,
  onSelectUnit,
}) => {
  const [activeTab, setActiveTab] = useState<'import' | 'manage'>('import');
  const [jsonText, setJsonText] = useState('');
  const [fileName, setFileName] = useState('');
  const [validationError, setValidationError] = useState<{ en: string; vi: string } | null>(null);
  const [previewUnit, setPreviewUnit] = useState<UnitData | null>(null);
  const [previewInfo, setPreviewInfo] = useState<UnitImportPreview | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValidationError(null);
    setSuccessMessage(null);
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        setJsonText(text);
        processJson(text);
      } catch (err: any) {
        setValidationError({
          en: 'Failed to read file: Invalid JSON syntax or encoding.',
          vi: 'Không thể đọc tệp: Cấu trúc hoặc mã hóa tệp JSON không hợp lệ.',
        });
        setPreviewUnit(null);
        setPreviewInfo(null);
      }
    };
    reader.readAsText(file);
  };

  const processJson = (raw: string) => {
    try {
      const parsed = JSON.parse(raw);

      // Check if this might be a full backup bundle
      if (parsed.units && typeof parsed.units === 'object') {
        const backupCheck = validateBackupPayload(parsed);
        if (backupCheck.valid && backupCheck.units) {
          setValidationError({
            en: 'This appears to be a full backup JSON with multiple units. Use the "Restore Backup" option in the Unit Manager tab to import all units at once.',
            vi: 'Tệp này là bản sao lưu toàn bộ các bài học. Vui lòng chuyển sang tab "Quản lý bài học & Sao lưu" và nhấn "Phục hồi từ sao lưu" để nạp toàn bộ.',
          });
          setPreviewUnit(null);
          setPreviewInfo(null);
          return;
        }
      }

      const res = validateUnitData(parsed);

      if (!res.valid || !res.unit) {
        setValidationError({
          en: res.message || 'JSON schema validation failed.',
          vi: res.messageVi || 'Kiểm tra cấu trúc dữ liệu JSON không thành công.',
        });
        setPreviewUnit(null);
        setPreviewInfo(null);
      } else {
        setValidationError(null);
        setPreviewUnit(res.unit);
        setPreviewInfo(buildUnitImportPreview(res.unit, registry));
      }
    } catch (err: any) {
      setValidationError({
        en: `JSON Syntax Error: ${err.message}`,
        vi: `Lỗi cú pháp JSON: ${err.message}`,
      });
      setPreviewUnit(null);
      setPreviewInfo(null);
    }
  };

  const handleTextChange = (text: string) => {
    setJsonText(text);
    setSuccessMessage(null);
    if (!text.trim()) {
      setValidationError(null);
      setPreviewUnit(null);
      setPreviewInfo(null);
      return;
    }
    processJson(text);
  };

  const handleSaveUnit = async () => {
    if (!previewUnit) return;
    setIsSaving(true);
    try {
      await onSaveUnit(previewUnit);
      setSuccessMessage(
        `Unit ${previewUnit.unit_id} ("${previewUnit.title}") saved successfully! Bài học đã được lưu vào hệ thống.`
      );
      setPreviewUnit(null);
      setPreviewInfo(null);
      setJsonText('');
      setFileName('');
    } catch (err: any) {
      setValidationError({
        en: `Save failed: ${err.message}`,
        vi: `Không thể lưu dữ liệu bài học: ${err.message}`,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleBackupUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        const res = validateBackupPayload(parsed);
        if (!res.valid || !res.units) {
          alert(`Backup validation failed: ${res.message}\n${res.messageVi}`);
          return;
        }
        await onRestoreBackup(res.units);
        alert(
          `Backup restored successfully with ${Object.keys(res.units).length} units! Phục hồi thành công!`
        );
      } catch (err: any) {
        alert(`Failed to restore backup: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  const handleDeleteUnitConfirmed = async (unitId: number) => {
    try {
      await onDeleteUnit(unitId);
      setDeleteConfirmId(null);
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  // Loaded units array sorted by unit_id
  const loadedUnits = Object.values(registry).sort((a, b) => a.unit_id - b.unit_id);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0 shadow-xs">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900">
                Unit Data Center (Quản lý dữ liệu bài học)
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Hỗ trợ 20 Units theo chương trình Global Success 4 của cô Hường.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switchers */}
        <div className="flex border-b border-slate-100 bg-slate-50/70 px-5 pt-2 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('import')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'import'
                ? 'bg-white text-sky-700 border-sky-500 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Import Unit JSON (Tải lên bài học)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('manage')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'manage'
                ? 'bg-white text-sky-700 border-sky-500 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Manage & Backup ({loadedUnits.length} loaded)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
          {activeTab === 'import' ? (
            <>
              {/* File Upload Box */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Select JSON File (Chọn tệp bài học JSON):
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-2xl p-5 text-center hover:border-sky-400 transition-colors bg-slate-50/50">
                  <input
                    type="file"
                    accept=".json,application/json"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="unit-file-input"
                  />
                  <label
                    htmlFor="unit-file-input"
                    className="cursor-pointer flex flex-col items-center justify-center gap-2"
                  >
                    <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center">
                      <Upload className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-extrabold text-slate-800">
                      {fileName ? fileName : 'Choose a Unit JSON file (Units 1–20)'}
                    </span>
                    <span className="text-xs text-slate-400">
                      Supports full schema: vocabulary, sentence patterns, worksheets & verified questions
                    </span>
                  </label>
                </div>
              </div>

              {/* Paste JSON Text Area */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Or Paste JSON content directly (Hoặc dán nội dung JSON):
                </label>
                <textarea
                  rows={4}
                  value={jsonText}
                  onChange={(e) => handleTextChange(e.target.value)}
                  placeholder='{"unit_id": 2, "unit_number": 2, "title": "Unit 2: Time and daily routines", ...}'
                  className="w-full p-3 font-mono text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400 text-slate-800"
                />
              </div>

              {/* Validation Error Message */}
              {validationError && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-sm flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-extrabold">Invalid JSON File / Dữ liệu không hợp lệ:</p>
                    <p className="text-xs text-rose-800 mt-1">{validationError.en}</p>
                    <p className="text-xs text-rose-700 font-medium mt-0.5">{validationError.vi}</p>
                  </div>
                </div>
              )}

              {/* Success Message */}
              {successMessage && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <p className="font-bold text-xs sm:text-sm">{successMessage}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onSelectUnit(previewUnit?.unit_id || 1);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shrink-0 cursor-pointer"
                  >
                    Học ngay
                  </button>
                </div>
              )}

              {/* Import Preview Card */}
              {previewInfo && previewUnit && (
                <div className="p-5 rounded-2xl bg-sky-50/80 border-2 border-sky-300 text-slate-900 space-y-4 shadow-sm animate-in fade-in">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-sky-200/80 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-xl bg-sky-600 text-white font-black text-sm flex items-center justify-center">
                        U{previewInfo.unit_number}
                      </span>
                      <div>
                        <h4 className="text-base font-extrabold text-slate-900">
                          {previewInfo.title}
                        </h4>
                        <p className="text-xs text-slate-500 font-medium">{previewInfo.title_vi}</p>
                      </div>
                    </div>

                    {/* Status badge: Add vs Replace */}
                    {previewInfo.isExisting ? (
                      <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold border border-amber-300 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        <span>Will replace existing Unit {previewInfo.unit_id}</span>
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Will add new Unit {previewInfo.unit_id}</span>
                      </span>
                    )}
                  </div>

                  {/* Summary Stats Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                    <div className="bg-white p-3 rounded-xl border border-sky-100 shadow-2xs">
                      <span className="text-slate-500 block font-medium">Vocabulary:</span>
                      <strong className="text-base text-slate-900 font-extrabold">
                        {previewInfo.vocabularyCount} words
                      </strong>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-sky-100 shadow-2xs">
                      <span className="text-slate-500 block font-medium">Patterns:</span>
                      <strong className="text-base text-slate-900 font-extrabold">
                        {previewInfo.sentencePatternCount} structures
                      </strong>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-sky-100 shadow-2xs">
                      <span className="text-slate-500 block font-medium">Worksheets:</span>
                      <strong className="text-base text-slate-900 font-extrabold">
                        {previewInfo.worksheetCount} sheets
                      </strong>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-sky-100 shadow-2xs">
                      <span className="text-slate-500 block font-medium">Questions:</span>
                      <strong className="text-base text-slate-900 font-extrabold">
                        {previewInfo.questionCount}
                      </strong>
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        ({previewInfo.approvedQuestionCount} verified, {previewInfo.draftQuestionCount} draft)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-sky-800 font-medium">
                      Semester {previewInfo.semester} • Grade {previewInfo.grade}
                    </span>
                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={handleSaveUnit}
                      className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white font-extrabold text-sm shadow-md transition-all cursor-pointer flex items-center gap-2"
                    >
                      <span>
                        {previewInfo.isExisting ? `Update Unit ${previewInfo.unit_id}` : `Save & Enable Unit ${previewInfo.unit_id}`}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Tab 2: Manage & Backup */
            <div className="space-y-6">
              {/* Loaded units list */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                    Currently Loaded Units ({loadedUnits.length} Units in Registry)
                  </h4>
                  <button
                    type="button"
                    onClick={() => exportAllUnitsAsJson(registry)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-xs border border-sky-200 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Backup All Units JSON</span>
                  </button>
                </div>

                <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
                  {loadedUnits.map((u) => {
                    const isUnit1 = u.unit_id === 1;

                    return (
                      <div
                        key={u.unit_id}
                        className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-9 h-9 rounded-xl bg-sky-500 text-white font-black text-sm flex items-center justify-center shrink-0">
                            U{u.unit_id}
                          </span>
                          <div>
                            <h5 className="font-extrabold text-slate-900 text-sm">{u.title}</h5>
                            <p className="text-xs text-slate-500">
                              {u.vocabulary?.length || 0} vocab • {u.sentence_patterns?.length || 0} patterns • {u.worksheets?.length || 0} worksheets • {u.questions?.length || 0} questions
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              onSelectUnit(u.unit_id);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-sky-100 hover:bg-sky-200 text-sky-800 font-bold text-xs cursor-pointer"
                          >
                            Học bài này
                          </button>

                          <button
                            type="button"
                            onClick={() => exportUnitAsJson(u)}
                            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                            title={`Export Unit ${u.unit_id} JSON`}
                          >
                            <Download className="w-4 h-4" />
                          </button>

                          {isUnit1 ? (
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmId(1)}
                              className="px-2.5 py-1.5 rounded-lg text-amber-700 hover:bg-amber-50 font-bold text-xs border border-amber-200 cursor-pointer flex items-center gap-1"
                              title="Reset Unit 1 to default verified data"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Reset default</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmId(u.unit_id)}
                              className="p-2 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                              title={`Delete Unit ${u.unit_id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Full Backup & Restore Tools */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h5 className="font-extrabold text-xs uppercase tracking-wider text-slate-700">
                  Full System Backup & Restore (Sao lưu & Phục hồi)
                </h5>
                <p className="text-xs text-slate-500">
                  Bạn có thể tải về tệp sao lưu toàn bộ các Unit hoặc phục hồi dữ liệu từ bản sao lưu trước đó.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => exportAllUnitsAsJson(registry)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export Full Backup JSON</span>
                  </button>

                  <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-300 cursor-pointer">
                    <FolderOpen className="w-4 h-4 text-sky-600" />
                    <span>Restore from Backup JSON</span>
                    <input
                      type="file"
                      accept=".json,application/json"
                      onChange={handleBackupUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div className="text-xs text-slate-400 font-medium">
            English 4 with Ms Huong • Global Success Grade 4
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs sm:text-sm cursor-pointer"
          >
            Close (Đóng)
          </button>
        </div>
      </div>

      {/* Delete / Reset Confirmation Modal */}
      {deleteConfirmId !== null && (
        <div className="fixed inset-0 z-60 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h4 className="text-lg font-black text-slate-900">
              {deleteConfirmId === 1
                ? 'Reset Unit 1 to Default?'
                : `Delete Unit ${deleteConfirmId}?`}
            </h4>

            <p className="text-xs text-slate-600 leading-relaxed">
              {deleteConfirmId === 1
                ? 'Khôi phục lại dữ liệu gốc của Unit 1: My friends theo chuẩn chương trình Global Success 4 của cô Hường.'
                : `Xóa bài học Unit ${deleteConfirmId} khỏi danh sách bài học khả dụng. Bạn có thể nạp lại bất cứ lúc nào qua tệp JSON.`}
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Hủy (Cancel)
              </button>
              <button
                type="button"
                onClick={() => handleDeleteUnitConfirmed(deleteConfirmId)}
                className={`flex-1 py-2.5 rounded-xl font-bold text-xs text-white cursor-pointer ${
                  deleteConfirmId === 1 ? 'bg-amber-500 hover:bg-amber-600' : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {deleteConfirmId === 1 ? 'Khôi phục gốc' : 'Xác nhận xóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
