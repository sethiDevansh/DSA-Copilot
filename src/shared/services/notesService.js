/**
 * notesService — Manages per-problem notes with markdown and custom tags.
 */

import { storageService } from './storageService.js';
import { STORAGE_KEYS } from '../constants/index.js';

function generateNoteId() {
  return `note_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

async function getAllNotes() {
  return (await storageService.get(STORAGE_KEYS.NOTES)) ?? {};
}

/**
 * Get note for a specific problem slug
 */
async function getNoteForProblem(titleSlug) {
  const notes = await getAllNotes();
  return notes[titleSlug] ?? null;
}

/**
 * Save or update a note for a problem
 */
async function saveNote(titleSlug, { content, customTags = [], codeSnippets = [] }) {
  const notes = await getAllNotes();
  const existing = notes[titleSlug] ?? {};

  notes[titleSlug] = {
    id:          existing.id ?? generateNoteId(),
    titleSlug,
    content,
    customTags,
    codeSnippets,
    createdAt:   existing.createdAt ?? new Date().toISOString(),
    updatedAt:   new Date().toISOString(),
    wordCount:   content.split(/\s+/).filter(Boolean).length,
  };

  await storageService.set(STORAGE_KEYS.NOTES, notes);
  return notes[titleSlug];
}

/**
 * Delete a note
 */
async function deleteNote(titleSlug) {
  const notes = await getAllNotes();
  delete notes[titleSlug];
  await storageService.set(STORAGE_KEYS.NOTES, notes);
}

/**
 * Search notes by content or tags
 */
async function searchNotes(query) {
  const notes = await getAllNotes();
  const q     = query.toLowerCase();
  return Object.values(notes).filter(
    (n) =>
      n.content?.toLowerCase().includes(q) ||
      n.customTags?.some((t) => t.toLowerCase().includes(q))
  );
}

/**
 * Get all problems with notes (for dashboard)
 */
async function getNoteSummaries() {
  const notes = await getAllNotes();
  return Object.values(notes).map((n) => ({
    titleSlug: n.titleSlug,
    preview:   n.content?.slice(0, 120) + (n.content?.length > 120 ? '…' : ''),
    tags:      n.customTags ?? [],
    updatedAt: n.updatedAt,
    wordCount: n.wordCount,
  }));
}

export const notesService = {
  getAllNotes,
  getNoteForProblem,
  saveNote,
  deleteNote,
  searchNotes,
  getNoteSummaries,
};
