/**
 * storageService — Unified abstraction over chrome.storage.local
 * Falls back to localStorage for development environments (popup in browser tab).
 * All methods are async and return Promises.
 */

const isChromeExtension = typeof chrome !== 'undefined' && chrome.storage?.local;

// ─── Core Primitives ─────────────────────────────────────────────────────────

async function get(key) {
  if (isChromeExtension) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(key, (result) => {
        if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
        else resolve(result[key] ?? null);
      });
    });
  }
  const val = localStorage.getItem(key);
  return val ? JSON.parse(val) : null;
}

async function set(key, value) {
  if (isChromeExtension) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.set({ [key]: value }, () => {
        if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
        else resolve();
      });
    });
  }
  localStorage.setItem(key, JSON.stringify(value));
}

async function remove(key) {
  if (isChromeExtension) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.remove(key, () => {
        if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
        else resolve();
      });
    });
  }
  localStorage.removeItem(key);
}

async function clear() {
  if (isChromeExtension) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.clear(() => {
        if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
        else resolve();
      });
    });
  }
  localStorage.clear();
}

async function getAll() {
  if (isChromeExtension) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(null, (result) => {
        if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
        else resolve(result);
      });
    });
  }
  const result = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    result[key] = JSON.parse(localStorage.getItem(key));
  }
  return result;
}

// ─── High-level Helpers ──────────────────────────────────────────────────────

/** Merge an object into an existing stored object (shallow merge) */
async function merge(key, updates) {
  const existing = (await get(key)) ?? {};
  await set(key, { ...existing, ...updates });
}

/** Get an array, push an item, and save it back */
async function pushToArray(key, item) {
  const arr = (await get(key)) ?? [];
  arr.push(item);
  await set(key, arr);
  return arr;
}

/** Update an item in a stored array by a predicate */
async function updateInArray(key, predicate, updater) {
  const arr = (await get(key)) ?? [];
  const updated = arr.map((item) => (predicate(item) ? { ...item, ...updater(item) } : item));
  await set(key, updated);
  return updated;
}

/** Remove an item from a stored array by a predicate */
async function removeFromArray(key, predicate) {
  const arr = (await get(key)) ?? [];
  const filtered = arr.filter((item) => !predicate(item));
  await set(key, filtered);
  return filtered;
}

/** Export all data as a JSON string */
async function exportData() {
  const data = await getAll();
  return JSON.stringify(data, null, 2);
}

/** Import data from a JSON string */
async function importData(jsonString) {
  const data = JSON.parse(jsonString);
  if (isChromeExtension) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.set(data, () => {
        if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
        else resolve();
      });
    });
  }
  for (const [key, value] of Object.entries(data)) {
    localStorage.setItem(key, JSON.stringify(value));
  }
}

// ─── Usage Stats ─────────────────────────────────────────────────────────────

/** Get rough byte size of stored data */
async function getStorageUsage() {
  const data = await getAll();
  const json = JSON.stringify(data);
  return { bytes: json.length, kb: (json.length / 1024).toFixed(2) };
}

export const storageService = {
  get,
  set,
  remove,
  clear,
  getAll,
  merge,
  pushToArray,
  updateInArray,
  removeFromArray,
  exportData,
  importData,
  getStorageUsage,
};
