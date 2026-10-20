/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  BackupPayload,
  FillInTheBlankQuestion,
  MatchingQuestion,
  MultipleChoiceQuestion,
  Question,
  QuestionType,
  ReadingComprehensionQuestion,
  SentenceReorderingQuestion,
  TrueFalseQuestion,
  UnitData,
  UnitImportPreview,
  UnitRegistry,
  WordUnscramblingQuestion,
  Worksheet,
} from '../types/unit';
import defaultUnit1Data from './unit1.json';
import curriculumBundle from './curriculumUnits.json';
import {
  deleteUnitFromStorage,
  getAllUnitsFromStorage,
  saveAllUnitsToStorage,
  saveUnitToStorage,
} from './db';

export interface ValidationResult {
  valid: boolean;
  message?: string;
  messageVi?: string;
  unit?: UnitData;
}

const SUPPORTED_QUESTION_TYPES: QuestionType[] = [
  'multiple_choice',
  'matching',
  'word_unscrambling',
  'fill_in_the_blank',
  'sentence_reordering',
  'reading_comprehension',
  'true_false',
];

/**
 * Validates whether raw data satisfies the strict UnitData schema for Units 1 to 20.
 */
export function validateUnitData(data: any): ValidationResult {
  if (!data || typeof data !== 'object') {
    return {
      valid: false,
      message: 'Invalid data format: JSON must be an object.',
      messageVi: 'Định dạng dữ liệu không hợp lệ: Tệp JSON phải là một đối tượng.',
    };
  }

  // 1. Required top-level fields
  const requiredKeys = [
    'unit_id',
    'title',
    'title_vi',
    'semester',
    'grade',
    'description',
    'vocabulary',
    'sentence_patterns',
    'worksheets',
    'questions',
  ];

  for (const key of requiredKeys) {
    if (!(key in data)) {
      return {
        valid: false,
        message: `Missing required field: "${key}".`,
        messageVi: `Thiếu trường dữ liệu bắt buộc: "${key}".`,
      };
    }
  }

  // 2. Validate unit_id is an integer from 1 to 20
  if (
    typeof data.unit_id !== 'number' ||
    !Number.isInteger(data.unit_id) ||
    data.unit_id < 1 ||
    data.unit_id > 20
  ) {
    return {
      valid: false,
      message: `Invalid unit_id: "${data.unit_id}". Must be an integer between 1 and 20.`,
      messageVi: `unit_id không hợp lệ: "${data.unit_id}". Phải là một số nguyên từ 1 đến 20.`,
    };
  }

  // 3. Validate unit_number matches unit_id
  if (data.unit_number !== undefined && data.unit_number !== data.unit_id) {
    return {
      valid: false,
      message: `unit_number (${data.unit_number}) does not match unit_id (${data.unit_id}).`,
      messageVi: `unit_number (${data.unit_number}) không khớp với unit_id (${data.unit_id}).`,
    };
  }

  // Normalize unit_number if missing
  if (data.unit_number === undefined) {
    data.unit_number = data.unit_id;
  }

  // 4. Validate semester (1 for Units 1-10, 2 for Units 11-20)
  if (data.semester !== 1 && data.semester !== 2) {
    return {
      valid: false,
      message: `Invalid semester: "${data.semester}". Must be 1 or 2.`,
      messageVi: `Học kỳ không hợp lệ: "${data.semester}". Phải là 1 hoặc 2.`,
    };
  }

  // 5. Validate vocabulary array
  if (!Array.isArray(data.vocabulary)) {
    return {
      valid: false,
      message: 'The "vocabulary" field must be an array.',
      messageVi: 'Trường "vocabulary" phải là danh sách các từ vựng.',
    };
  }

  for (let i = 0; i < data.vocabulary.length; i++) {
    const item = data.vocabulary[i];
    if (!item || !item.id || !item.word || !item.meaning) {
      return {
        valid: false,
        message: `Vocabulary item at index ${i} is missing id, word, or meaning.`,
        messageVi: `Từ vựng thứ ${i + 1} bị thiếu id, từ tiếng Anh (word) hoặc nghĩa tiếng Việt (meaning).`,
      };
    }
  }

  // 6. Validate sentence_patterns array
  if (!Array.isArray(data.sentence_patterns)) {
    return {
      valid: false,
      message: 'The "sentence_patterns" field must be an array.',
      messageVi: 'Trường "sentence_patterns" phải là danh sách các mẫu câu.',
    };
  }

  for (let i = 0; i < data.sentence_patterns.length; i++) {
    const p = data.sentence_patterns[i];
    if (!p || !p.id || !p.title || !p.question || !p.answer) {
      return {
        valid: false,
        message: `Sentence pattern at index ${i} is missing id, title, question, or answer.`,
        messageVi: `Mẫu câu thứ ${i + 1} thiếu id, title, câu hỏi (question) hoặc câu trả lời (answer).`,
      };
    }
  }

  // 7. Validate worksheets array
  if (!Array.isArray(data.worksheets) || data.worksheets.length === 0) {
    return {
      valid: false,
      message: 'The "worksheets" field must be a non-empty array.',
      messageVi: 'Trường "worksheets" phải là một danh sách chứa ít nhất một phiếu bài tập.',
    };
  }

  // 8. Validate questions array and check duplicate question IDs
  if (!Array.isArray(data.questions) || data.questions.length === 0) {
    return {
      valid: false,
      message: 'The "questions" field must be a non-empty array.',
      messageVi: 'Trường "questions" phải là một danh sách chứa ít nhất một câu hỏi.',
    };
  }

  const questionIdMap = new Set<string>();

  for (let i = 0; i < data.questions.length; i++) {
    const q = data.questions[i];
    if (!q || !q.id || !q.type || !q.prompt || !q.status || q.correct_answers === undefined) {
      return {
        valid: false,
        message: `Question at index ${i} is missing required fields: id, type, prompt, status, or correct_answers.`,
        messageVi: `Câu hỏi thứ ${i + 1} bị thiếu các trường bắt buộc: id, type, prompt, status hoặc correct_answers.`,
      };
    }

    // Check duplicate question ID
    if (questionIdMap.has(q.id)) {
      return {
        valid: false,
        message: `Duplicate question ID detected: "${q.id}". Every question ID must be unique within the Unit.`,
        messageVi: `Phát hiện mã câu hỏi bị trùng lặp: "${q.id}". Mỗi câu hỏi trong Unit phải có một mã duy nhất.`,
      };
    }
    questionIdMap.add(q.id);

    // Validate status
    if (q.status !== 'approved' && q.status !== 'draft') {
      return {
        valid: false,
        message: `Question "${q.id}" has invalid status "${q.status}". Must be "approved" or "draft".`,
        messageVi: `Câu hỏi "${q.id}" có trạng thái "${q.status}" không hợp lệ. Phải là "approved" hoặc "draft".`,
      };
    }

    // Validate supported question types and required answer fields
    if (!SUPPORTED_QUESTION_TYPES.includes(q.type)) {
      return {
        valid: false,
        message: `Question "${q.id}" uses unsupported type "${q.type}".`,
        messageVi: `Câu hỏi "${q.id}" sử dụng dạng bài tập không được hỗ trợ: "${q.type}".`,
      };
    }

    switch (q.type) {
      case 'multiple_choice': {
        const mc = q as MultipleChoiceQuestion;
        if (!Array.isArray(mc.options) || mc.options.length < 2) {
          return {
            valid: false,
            message: `Multiple choice question "${q.id}" requires an "options" array with at least 2 choices.`,
            messageVi: `Câu hỏi trắc nghiệm "${q.id}" cần mảng "options" có ít nhất 2 đáp án lựa chọn.`,
          };
        }
        if (!Array.isArray(mc.correct_answers) || mc.correct_answers.length === 0) {
          return {
            valid: false,
            message: `Multiple choice question "${q.id}" requires a non-empty "correct_answers" array.`,
            messageVi: `Câu hỏi trắc nghiệm "${q.id}" thiếu danh sách đáp án đúng "correct_answers".`,
          };
        }
        break;
      }

      case 'matching': {
        const mq = q as MatchingQuestion;
        if (!Array.isArray(mq.left_items) || mq.left_items.length === 0) {
          return {
            valid: false,
            message: `Matching question "${q.id}" requires a non-empty "left_items" array.`,
            messageVi: `Câu hỏi nối câu "${q.id}" cần danh sách "left_items" không rỗng.`,
          };
        }
        if (!Array.isArray(mq.right_items) || mq.right_items.length === 0) {
          return {
            valid: false,
            message: `Matching question "${q.id}" requires a non-empty "right_items" array.`,
            messageVi: `Câu hỏi nối câu "${q.id}" cần danh sách "right_items" không rỗng.`,
          };
        }
        if (!mq.correct_answers || typeof mq.correct_answers !== 'object') {
          return {
            valid: false,
            message: `Matching question "${q.id}" requires "correct_answers" as a key-value mapping.`,
            messageVi: `Câu hỏi nối câu "${q.id}" cần "correct_answers" dưới dạng đối tượng ghép cặp.`,
          };
        }
        break;
      }

      case 'word_unscrambling': {
        const wu = q as WordUnscramblingQuestion;
        if (!Array.isArray(wu.scrambled_letters) || wu.scrambled_letters.length === 0) {
          return {
            valid: false,
            message: `Word unscrambling question "${q.id}" requires a non-empty "scrambled_letters" array.`,
            messageVi: `Câu hỏi ghép chữ "${q.id}" cần mảng chữ cái "scrambled_letters" không rỗng.`,
          };
        }
        if (!Array.isArray(wu.correct_answers) || wu.correct_answers.length === 0) {
          return {
            valid: false,
            message: `Word unscrambling question "${q.id}" requires a non-empty "correct_answers" array.`,
            messageVi: `Câu hỏi ghép chữ "${q.id}" thiếu mảng đáp án "correct_answers".`,
          };
        }
        break;
      }

      case 'fill_in_the_blank': {
        const fib = q as FillInTheBlankQuestion;
        if (typeof fib.sentence_template !== 'string' || !fib.sentence_template.trim()) {
          return {
            valid: false,
            message: `Fill-in-the-blank question "${q.id}" requires a "sentence_template" string.`,
            messageVi: `Câu hỏi điền từ "${q.id}" thiếu mẫu câu "sentence_template".`,
          };
        }
        if (!Array.isArray(fib.correct_answers) || fib.correct_answers.length === 0) {
          return {
            valid: false,
            message: `Fill-in-the-blank question "${q.id}" requires a non-empty "correct_answers" array.`,
            messageVi: `Câu hỏi điền từ "${q.id}" thiếu danh sách đáp án đúng "correct_answers".`,
          };
        }
        break;
      }

      case 'sentence_reordering': {
        const sr = q as SentenceReorderingQuestion;
        if (!Array.isArray(sr.words) || sr.words.length < 2) {
          return {
            valid: false,
            message: `Sentence reordering question "${q.id}" requires a "words" array with at least 2 words.`,
            messageVi: `Câu hỏi sắp xếp câu "${q.id}" cần mảng "words" chứa ít nhất 2 từ.`,
          };
        }
        if (!Array.isArray(sr.correct_answers) || sr.correct_answers.length === 0) {
          return {
            valid: false,
            message: `Sentence reordering question "${q.id}" requires a non-empty "correct_answers" array.`,
            messageVi: `Câu hỏi sắp xếp câu "${q.id}" thiếu đáp án đúng "correct_answers".`,
          };
        }
        break;
      }

      case 'reading_comprehension': {
        const rc = q as ReadingComprehensionQuestion;
        if (typeof rc.passage !== 'string' || !rc.passage.trim()) {
          return {
            valid: false,
            message: `Reading comprehension question "${q.id}" requires a "passage" text.`,
            messageVi: `Bài đọc hiểu "${q.id}" thiếu văn bản đọc "passage".`,
          };
        }
        if (!Array.isArray(rc.sub_questions) || rc.sub_questions.length === 0) {
          return {
            valid: false,
            message: `Reading comprehension question "${q.id}" requires a non-empty "sub_questions" array.`,
            messageVi: `Bài đọc hiểu "${q.id}" cần mảng các câu hỏi con "sub_questions".`,
          };
        }
        if (!rc.correct_answers || typeof rc.correct_answers !== 'object') {
          return {
            valid: false,
            message: `Reading comprehension question "${q.id}" requires "correct_answers" mapping.`,
            messageVi: `Bài đọc hiểu "${q.id}" cần đối tượng đáp án "correct_answers".`,
          };
        }
        break;
      }

      case 'true_false': {
        const tf = q as TrueFalseQuestion;
        if (!Array.isArray(tf.correct_answers) || tf.correct_answers.length === 0) {
          return {
            valid: false,
            message: `True/False question "${q.id}" requires a non-empty "correct_answers" array.`,
            messageVi: `Câu hỏi Đúng/Sai "${q.id}" thiếu danh sách đáp án đúng "correct_answers".`,
          };
        }
        const validAnswers = ['true', 'false'];
        const hasValidValue = tf.correct_answers.some(
          (ans) => typeof ans === 'string' && validAnswers.includes(ans.trim().toLowerCase())
        );
        if (!hasValidValue) {
          return {
            valid: false,
            message: `True/False question "${q.id}" has invalid answer key. Must be ["True"] or ["False"].`,
            messageVi: `Câu hỏi Đúng/Sai "${q.id}" có đáp án không hợp lệ. Phải là ["True"] hoặc ["False"].`,
          };
        }
        if (tf.options !== undefined && (!Array.isArray(tf.options) || tf.options.length < 2)) {
          return {
            valid: false,
            message: `True/False question "${q.id}" options must contain at least 2 choices.`,
            messageVi: `Câu hỏi Đúng/Sai "${q.id}" cần mảng options có ít nhất 2 lựa chọn.`,
          };
        }
        break;
      }
    }
  }

  // 9. Verify that all worksheet question_ids reference existing questions
  for (let wIdx = 0; wIdx < data.worksheets.length; wIdx++) {
    const ws = data.worksheets[wIdx];
    if (!ws || !ws.id || !ws.title || !Array.isArray(ws.question_ids)) {
      return {
        valid: false,
        message: `Worksheet at index ${wIdx} is missing id, title, or question_ids array.`,
        messageVi: `Phiếu bài tập thứ ${wIdx + 1} thiếu id, tiêu đề (title) hoặc danh sách question_ids.`,
      };
    }

    for (const qid of ws.question_ids) {
      if (!questionIdMap.has(qid)) {
        return {
          valid: false,
          message: `Worksheet "${ws.title}" references question_id "${qid}" which was not found in the questions list.`,
          messageVi: `Phiếu bài tập "${ws.title}" tham chiếu đến câu hỏi mã "${qid}" nhưng không tìm thấy trong danh sách câu hỏi của Unit.`,
        };
      }
    }
  }

  return {
    valid: true,
    unit: data as UnitData,
  };
}

/**
 * Builds an import preview for the user/teacher before committing changes.
 */
export function buildUnitImportPreview(unit: UnitData, registry: UnitRegistry): UnitImportPreview {
  const approvedQuestionCount = unit.questions.filter((q) => q.status === 'approved').length;
  const draftQuestionCount = unit.questions.filter((q) => q.status === 'draft').length;

  return {
    unit_id: unit.unit_id,
    unit_number: unit.unit_number || unit.unit_id,
    title: unit.title,
    title_vi: unit.title_vi || '',
    semester: unit.semester,
    grade: unit.grade || 4,
    vocabularyCount: unit.vocabulary?.length || 0,
    sentencePatternCount: unit.sentence_patterns?.length || 0,
    worksheetCount: unit.worksheets?.length || 0,
    questionCount: unit.questions?.length || 0,
    approvedQuestionCount,
    draftQuestionCount,
    isExisting: !!registry[unit.unit_id],
  };
}

/**
 * Initializes the Multi-Unit registry from storage.
 * Automatically seeds bundled curriculum Units if missing from storage,
 * while strictly preserving existing imported Units and teacher modifications.
 */
export async function initializeUnitRegistry(): Promise<UnitRegistry> {
  const loaded = await getAllUnitsFromStorage();

  // Load bundled units from packaged curriculum
  const bundledUnits = (curriculumBundle as unknown as BackupPayload)?.units || {};
  
  for (const [key, rawUnit] of Object.entries(bundledUnits)) {
    const unitId = Number(key);
    // Only seed if unit is not already present in browser storage (preserves existing data)
    if (!loaded[unitId]) {
      const val = validateUnitData(rawUnit);
      if (val.valid && val.unit) {
        await saveUnitToStorage(val.unit);
        loaded[unitId] = val.unit;
      }
    }
  }

  // Fallback for Unit 1 if curriculum bundle did not populate it
  if (!loaded[1]) {
    const val = validateUnitData(defaultUnit1Data);
    if (val.valid && val.unit) {
      await saveUnitToStorage(val.unit);
      loaded[1] = val.unit;
    }
  }

  return loaded;
}

/**
 * Safely saves/replaces a Unit in the registry and persists to IndexedDB.
 */
export async function saveUnitToRegistry(
  unit: UnitData,
  currentRegistry: UnitRegistry
): Promise<UnitRegistry> {
  const validation = validateUnitData(unit);
  if (!validation.valid || !validation.unit) {
    throw new Error(validation.message || 'Unit validation failed.');
  }

  await saveUnitToStorage(validation.unit);

  return {
    ...currentRegistry,
    [validation.unit.unit_id]: validation.unit,
  };
}

/**
 * Deletes or resets a Unit in the registry.
 * Unit 1 is reset to source data; Units 2-20 are removed.
 */
export async function deleteUnitFromRegistry(
  unitId: number,
  currentRegistry: UnitRegistry
): Promise<UnitRegistry> {
  if (unitId === 1) {
    // Reset Unit 1 back to default source verified data
    const val = validateUnitData(defaultUnit1Data);
    if (val.valid && val.unit) {
      await saveUnitToStorage(val.unit);
      return {
        ...currentRegistry,
        1: val.unit,
      };
    }
    return currentRegistry;
  }

  await deleteUnitFromStorage(unitId);
  const updated = { ...currentRegistry };
  delete updated[unitId];
  return updated;
}

/**
 * Validates a full backup payload containing multiple Units.
 */
export function validateBackupPayload(raw: any): {
  valid: boolean;
  message?: string;
  messageVi?: string;
  units?: UnitRegistry;
} {
  if (!raw || typeof raw !== 'object') {
    return {
      valid: false,
      message: 'Invalid backup file: Must be a JSON object.',
      messageVi: 'Tệp sao lưu không hợp lệ: Phải là một đối tượng JSON.',
    };
  }

  const unitsObj = raw.units || raw;
  if (!unitsObj || typeof unitsObj !== 'object') {
    return {
      valid: false,
      message: 'Backup missing "units" registry object.',
      messageVi: 'Tệp sao lưu thiếu danh sách các Unit hợp lệ.',
    };
  }

  const registry: UnitRegistry = {};
  const entries = Object.entries(unitsObj);

  if (entries.length === 0) {
    return {
      valid: false,
      message: 'Backup contains no units.',
      messageVi: 'Tệp sao lưu không chứa bài học nào.',
    };
  }

  for (const [key, val] of entries) {
    const valResult = validateUnitData(val);
    if (!valResult.valid || !valResult.unit) {
      return {
        valid: false,
        message: `Validation failed for Unit ${key}: ${valResult.message}`,
        messageVi: `Kiểm tra dữ liệu không thành công cho Unit ${key}: ${valResult.messageVi}`,
      };
    }
    registry[valResult.unit.unit_id] = valResult.unit;
  }

  return {
    valid: true,
    units: registry,
  };
}

/**
 * Restores a full backup into storage atomically.
 */
export async function restoreBackupToRegistry(
  backupUnits: UnitRegistry
): Promise<UnitRegistry> {
  // Ensure Unit 1 is present in the restored registry
  if (!backupUnits[1]) {
    const val = validateUnitData(defaultUnit1Data);
    if (val.valid && val.unit) {
      backupUnits[1] = val.unit;
    }
  }

  await saveAllUnitsToStorage(backupUnits);
  return backupUnits;
}

/**
 * Maps a worksheet's question_ids to full Question records preserving order.
 */
export function getQuestionsForWorksheet(unit: UnitData, worksheetId: string): Question[] {
  const ws = unit.worksheets.find((w) => w.id === worksheetId);
  if (!ws) return [];

  const questionMap = new Map<string, Question>();
  for (const q of unit.questions) {
    questionMap.set(q.id, q);
  }

  const result: Question[] = [];
  for (const qid of ws.question_ids) {
    const found = questionMap.get(qid);
    if (found) {
      result.push(found);
    }
  }

  return result;
}

/**
 * Convenience helper to download a single Unit as JSON.
 */
export function exportUnitAsJson(unit: UnitData): void {
  const dataStr =
    'data:text/json;charset=utf-8,' +
    encodeURIComponent(JSON.stringify(unit, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  const cleanTitle = (unit.title || `Unit_${unit.unit_id}`).replace(
    /[^a-zA-Z0-9_-]/g,
    '_'
  );
  downloadAnchor.setAttribute('download', `${cleanTitle}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

/**
 * Convenience helper to download all Units as backup JSON.
 */
export function exportAllUnitsAsJson(registry: UnitRegistry): void {
  const backup: BackupPayload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    app: 'English 4 with Ms Huong',
    units: registry,
  };
  const dataStr =
    'data:text/json;charset=utf-8,' +
    encodeURIComponent(JSON.stringify(backup, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `English_4_Ms_Huong_Backup_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

/**
 * Compatibility helper for loading a unit directly.
 */
export function loadUnitData(
  unitId: number,
  registry?: UnitRegistry
): { success: boolean; data?: UnitData; error?: string; errorVi?: string } {
  if (registry && registry[unitId]) {
    return { success: true, data: registry[unitId] };
  }
  if (unitId === 1) {
    const val = validateUnitData(defaultUnit1Data);
    if (val.valid && val.unit) {
      return { success: true, data: val.unit };
    }
  }
  return {
    success: false,
    error: `Unit ${unitId} is not available in registry.`,
    errorVi: `Bài học Unit ${unitId} chưa có dữ liệu trong hệ thống.`,
  };
}

/**
 * Compatibility helper to reset a unit.
 */
export function resetUnitToDefault(unitId: number): UnitData | null {
  if (unitId === 1) {
    const val = validateUnitData(defaultUnit1Data);
    if (val.valid && val.unit) {
      saveUnitToStorage(val.unit);
      return val.unit;
    }
  }
  return null;
}

/**
 * Compatibility helper to save custom unit data.
 */
export async function saveCustomUnitData(unit: UnitData): Promise<void> {
  await saveUnitToStorage(unit);
}

