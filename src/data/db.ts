/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UnitData, UnitRegistry } from '../types/unit';

const DB_NAME = 'English4MsHuongDB';
const DB_VERSION = 1;
const UNITS_STORE = 'units';
const FALLBACK_STORAGE_KEY = 'ms_huong_unit_registry_v1';

let isIndexedDBAvailable: boolean | null = null;

function checkIndexedDBSupport(): boolean {
  if (isIndexedDBAvailable !== null) return isIndexedDBAvailable;
  try {
    isIndexedDBAvailable = typeof window !== 'undefined' && 'indexedDB' in window && window.indexedDB !== null;
  } catch (e) {
    isIndexedDBAvailable = false;
  }
  return isIndexedDBAvailable;
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!checkIndexedDBSupport()) {
      return reject(new Error('IndexedDB is not supported in this environment.'));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(UNITS_STORE)) {
        db.createObjectStore(UNITS_STORE, { keyPath: 'unit_id' });
      }
    };

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };

    request.onerror = (event) => {
      reject((event.target as IDBOpenDBRequest).error || new Error('Failed to open IndexedDB.'));
    };
  });
}

// Fallback helpers using localStorage
function getFallbackRegistry(): UnitRegistry {
  try {
    const raw = localStorage.getItem(FALLBACK_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.warn('Failed to read from localStorage fallback', e);
    return {};
  }
}

function saveFallbackRegistry(registry: UnitRegistry): void {
  try {
    localStorage.setItem(FALLBACK_STORAGE_KEY, JSON.stringify(registry));
  } catch (e) {
    console.error('Storage quota exceeded or write failure in fallback storage', e);
  }
}

/**
 * Retrieves all Units from IndexedDB (or localStorage fallback).
 */
export async function getAllUnitsFromStorage(): Promise<UnitRegistry> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([UNITS_STORE], 'readonly');
      const store = transaction.objectStore(UNITS_STORE);
      const request = store.getAll();

      request.onsuccess = () => {
        const list: UnitData[] = request.result || [];
        const registry: UnitRegistry = {};
        for (const unit of list) {
          if (unit && unit.unit_id) {
            registry[unit.unit_id] = unit;
          }
        }
        resolve(registry);
      };

      request.onerror = () => {
        reject(request.error || new Error('Failed to fetch units from IndexedDB'));
      };
    });
  } catch (err) {
    console.warn('IndexedDB unavailable or failed, utilizing safe localStorage fallback', err);
    return getFallbackRegistry();
  }
}

/**
 * Saves a single Unit into IndexedDB (or localStorage fallback).
 */
export async function saveUnitToStorage(unit: UnitData): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([UNITS_STORE], 'readwrite');
      const store = transaction.objectStore(UNITS_STORE);
      const request = store.put(unit);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(request.error || new Error(`Failed to save Unit ${unit.unit_id} to IndexedDB`));
      };
    });
  } catch (err) {
    console.warn('IndexedDB write failed, falling back to localStorage', err);
    const registry = getFallbackRegistry();
    registry[unit.unit_id] = unit;
    saveFallbackRegistry(registry);
  }
}

/**
 * Deletes a single Unit from IndexedDB (or localStorage fallback).
 */
export async function deleteUnitFromStorage(unitId: number): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([UNITS_STORE], 'readwrite');
      const store = transaction.objectStore(UNITS_STORE);
      const request = store.delete(unitId);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(request.error || new Error(`Failed to delete Unit ${unitId} from IndexedDB`));
      };
    });
  } catch (err) {
    console.warn('IndexedDB delete failed, falling back to localStorage', err);
    const registry = getFallbackRegistry();
    delete registry[unitId];
    saveFallbackRegistry(registry);
  }
}

/**
 * Atomically replaces the entire Unit registry in IndexedDB (or localStorage fallback).
 */
export async function saveAllUnitsToStorage(registry: UnitRegistry): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([UNITS_STORE], 'readwrite');
      const store = transaction.objectStore(UNITS_STORE);

      // Clear existing records first
      const clearRequest = store.clear();

      clearRequest.onsuccess = () => {
        const units = Object.values(registry);
        if (units.length === 0) {
          return resolve();
        }

        let addedCount = 0;
        let hasError = false;

        for (const unit of units) {
          const putRequest = store.put(unit);
          putRequest.onsuccess = () => {
            addedCount++;
            if (addedCount === units.length && !hasError) {
              resolve();
            }
          };
          putRequest.onerror = () => {
            if (!hasError) {
              hasError = true;
              reject(putRequest.error || new Error('Failed to write backup units into IndexedDB'));
            }
          };
        }
      };

      clearRequest.onerror = () => {
        reject(clearRequest.error || new Error('Failed to clear IndexedDB store for restoration'));
      };
    });
  } catch (err) {
    console.warn('IndexedDB full save failed, falling back to localStorage', err);
    saveFallbackRegistry(registry);
  }
}
