/**
 * mistakeService — Tracks, stores, and analyzes recurring coding mistakes.
 */

import { storageService } from './storageService.js';
import { STORAGE_KEYS } from '../constants/index.js';

function generateId() {
  return `mistake_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

async function getAllMistakes() {
  return (await storageService.get(STORAGE_KEYS.MISTAKE_LOG)) ?? [];
}

/**
 * Log a mistake for a problem
 * @param {{ titleSlug, title, difficulty, mistakeTypes, notes }} data
 */
async function logMistake(data) {
  const entry = {
    id:           generateId(),
    titleSlug:    data.titleSlug,
    title:        data.title,
    difficulty:   data.difficulty,
    mistakeTypes: data.mistakeTypes ?? [],
    notes:        data.notes ?? '',
    loggedAt:     new Date().toISOString(),
    date:         new Date().toISOString().split('T')[0],
  };

  await storageService.pushToArray(STORAGE_KEYS.MISTAKE_LOG, entry);
  return entry;
}

async function deleteMistake(id) {
  return storageService.removeFromArray(STORAGE_KEYS.MISTAKE_LOG, (m) => m.id === id);
}

/**
 * Get aggregated mistake frequency by type
 */
async function getMistakeStats() {
  const mistakes = await getAllMistakes();
  const byType   = {};
  const byTopic  = {};

  for (const m of mistakes) {
    for (const type of (m.mistakeTypes ?? [])) {
      byType[type] = (byType[type] ?? 0) + 1;
    }
    if (m.difficulty) {
      byTopic[m.difficulty] = (byTopic[m.difficulty] ?? 0) + 1;
    }
  }

  const topMistakes = Object.entries(byType)
    .sort((a, b) => b[1] - a[1])
    .map(([type, count]) => ({ type, count }));

  return {
    total:       mistakes.length,
    byType,
    byTopic,
    topMistakes,
    recentMistakes: mistakes.slice(-10),
  };
}

/**
 * Get mistakes for a specific problem
 */
async function getMistakesForProblem(titleSlug) {
  const mistakes = await getAllMistakes();
  return mistakes.filter((m) => m.titleSlug === titleSlug);
}

export const mistakeService = {
  getAllMistakes,
  logMistake,
  deleteMistake,
  getMistakeStats,
  getMistakesForProblem,
};
