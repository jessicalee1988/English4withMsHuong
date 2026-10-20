/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { StudentAnswers, WorksheetResult } from '../types/unit';

const OLD_ANSWERS_KEY_PREFIX = 'ms_huong_answers_';
const OLD_RESULTS_KEY_PREFIX = 'ms_huong_results_';

function getAnswersKey(unitId: number, worksheetId: string): string {
  return `ms_huong_answers_unit_${unitId}_ws_${worksheetId}`;
}

function getResultsKey(unitId: number, worksheetId: string): string {
  return `ms_huong_results_unit_${unitId}_ws_${worksheetId}`;
}

export function getSavedAnswers(unitId: number, worksheetId: string): StudentAnswers {
  try {
    const canonicalKey = getAnswersKey(unitId, worksheetId);
    const legacyKey = `${OLD_ANSWERS_KEY_PREFIX}${unitId}_${worksheetId}`;
    const raw = localStorage.getItem(canonicalKey) || localStorage.getItem(legacyKey);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

export function saveAnswers(
  unitId: number,
  worksheetId: string,
  answers: StudentAnswers
): void {
  try {
    const key = getAnswersKey(unitId, worksheetId);
    localStorage.setItem(key, JSON.stringify(answers));
  } catch (e) {
    console.error('Failed to save answers to localStorage', e);
  }
}

export function clearAnswers(unitId: number, worksheetId: string): void {
  try {
    localStorage.removeItem(getAnswersKey(unitId, worksheetId));
    localStorage.removeItem(`${OLD_ANSWERS_KEY_PREFIX}${unitId}_${worksheetId}`);
  } catch (e) {
    console.error('Failed to clear answers from localStorage', e);
  }
}

export function getSavedResult(
  unitId: number,
  worksheetId: string
): WorksheetResult | null {
  try {
    const canonicalKey = getResultsKey(unitId, worksheetId);
    const legacyKey = `${OLD_RESULTS_KEY_PREFIX}${unitId}_${worksheetId}`;
    const raw = localStorage.getItem(canonicalKey) || localStorage.getItem(legacyKey);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function saveResult(
  unitId: number,
  worksheetId: string,
  result: WorksheetResult
): void {
  try {
    const key = getResultsKey(unitId, worksheetId);
    localStorage.setItem(key, JSON.stringify(result));
  } catch (e) {
    console.error('Failed to save result to localStorage', e);
  }
}

export function clearResult(unitId: number, worksheetId: string): void {
  try {
    localStorage.removeItem(getResultsKey(unitId, worksheetId));
    localStorage.removeItem(`${OLD_RESULTS_KEY_PREFIX}${unitId}_${worksheetId}`);
  } catch (e) {
    console.error('Failed to clear result from localStorage', e);
  }
}
