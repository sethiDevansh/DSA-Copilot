/**
 * interviewService — Saves, loads, and analyzes completed interview sessions.
 */

import { storageService } from './storageService.js';
import { STORAGE_KEYS }   from '../constants/index.js';

function generateId() {
  return `interview_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

// ─── Score formula ────────────────────────────────────────────────────────────
/**
 * Score breakdown (total 100):
 *
 * solvedDuringSession = true  → eligible for up to 100 pts
 * solvedDuringSession = false → max 20 pts (just for showing up)
 *
 * When solved:
 *   - Base:         40 pts  (just for solving it)
 *   - Time bonus:   up to 40 pts  (faster = more)
 *   - Penalty deduct: -8 per penalty (max -40)
 *   - Within time:  +20 bonus
 *
 * When NOT solved:
 *   - 10 pts base
 *   - -2 per penalty
 *   - Min 0
 */
function computeScore({ elapsedSecs, limitSecs, penalties, withinTime, solvedDuringSession }) {
  if (!solvedDuringSession) {
    // Did not solve the problem during the interview
    return Math.max(0, 10 - (penalties ?? 0) * 2);
  }

  const timeBonus     = Math.max(0, 40 * (1 - elapsedSecs / limitSecs));
  const penaltyDeduct = Math.min(40, (penalties ?? 0) * 8);
  const withinBonus   = withinTime ? 20 : 0;
  const raw           = 40 + timeBonus + withinBonus - penaltyDeduct;

  return Math.round(Math.max(0, Math.min(100, raw)));
}

// ─── Save a completed session ─────────────────────────────────────────────────

/**
 * @param {Object}  data
 * @param {Object}  data.problem              — assigned problem
 * @param {number}  data.startTime            — unix ms session started
 * @param {number}  data.endTime              — unix ms session ended
 * @param {number}  data.timeLimitMins        — configured limit
 * @param {number}  data.penalties            — penalty count
 * @param {boolean} data.completed            — did user finish in time?
 * @param {boolean} data.solvedDuringSession  — did user submit AC during session?
 */
async function saveSession(data) {
  const endTime     = data.endTime ?? Date.now();
  const startTime   = data.startTime;
  const elapsedSecs = Math.floor((endTime - startTime) / 1000);
  const limitSecs   = (data.timeLimitMins ?? 45) * 60;
  const overtime    = Math.max(0, elapsedSecs - limitSecs);
  const withinTime  = elapsedSecs <= limitSecs;

  // KEY FIX: only count as solved if problem was actually AC'd during the session window
  const solvedDuringSession = data.solvedDuringSession ?? false;

  const session = {
    id:                  generateId(),
    date:                new Date(endTime).toISOString().split('T')[0],
    startTime,
    endTime,
    elapsedSecs,
    elapsedMins:         Math.round(elapsedSecs / 60),
    timeLimitMins:       data.timeLimitMins ?? 45,
    limitSecs,
    overtime,
    withinTime,
    penalties:           data.penalties ?? 0,
    completed:           data.completed ?? withinTime,
    solvedDuringSession,
    problem:             data.problem
      ? {
          id:         data.problem.id,
          title:      data.problem.title,
          titleSlug:  data.problem.titleSlug,
          difficulty: data.problem.difficulty,
          tags:       data.problem.tags ?? [],
          url:        `https://leetcode.com/problems/${data.problem.titleSlug}/`,
        }
      : null,
    score: computeScore({
      elapsedSecs,
      limitSecs,
      penalties:           data.penalties ?? 0,
      withinTime,
      solvedDuringSession,
    }),
    rating: null,
    notes:  '',
  };

  await storageService.pushToArray(STORAGE_KEYS.INTERVIEW_SESSIONS, session);
  return session;
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────

async function getAllSessions() {
  const sessions = (await storageService.get(STORAGE_KEYS.INTERVIEW_SESSIONS)) ?? [];
  return [...sessions].sort((a, b) => b.startTime - a.startTime);
}

async function getSessionById(id) {
  const sessions = await getAllSessions();
  return sessions.find((s) => s.id === id) ?? null;
}

async function updateSessionNotes(id, notes, rating) {
  await storageService.updateInArray(
    STORAGE_KEYS.INTERVIEW_SESSIONS,
    (s) => s.id === id,
    () => ({ notes, rating }),
  );
}

async function deleteSession(id) {
  await storageService.removeFromArray(
    STORAGE_KEYS.INTERVIEW_SESSIONS,
    (s) => s.id === id,
  );
}

// ─── Aggregated stats ─────────────────────────────────────────────────────────

async function getStats() {
  const sessions = await getAllSessions();
  if (!sessions.length) return null;

  const completed   = sessions.filter((s) => s.withinTime);
  const solved      = sessions.filter((s) => s.solvedDuringSession);
  const avgScore    = Math.round(sessions.reduce((a, s) => a + (s.score ?? 0), 0) / sessions.length);
  const avgTime     = Math.round(sessions.reduce((a, s) => a + s.elapsedMins, 0) / sessions.length);
  const avgPenalty  = +(sessions.reduce((a, s) => a + s.penalties, 0) / sessions.length).toFixed(1);

  const byDifficulty = { Easy: 0, Medium: 0, Hard: 0 };
  for (const s of sessions) {
    if (s.problem?.difficulty) {
      byDifficulty[s.problem.difficulty] = (byDifficulty[s.problem.difficulty] ?? 0) + 1;
    }
  }

  return {
    total:          sessions.length,
    completedCount: completed.length,
    solvedCount:    solved.length,
    solveRate:      Math.round((solved.length / sessions.length) * 100),
    completionRate: Math.round((completed.length / sessions.length) * 100),
    avgScore,
    avgTimeMins:    avgTime,
    avgPenalties:   avgPenalty,
    byDifficulty,
    bestScore:      Math.max(...sessions.map((s) => s.score ?? 0)),
  };
}

export const interviewService = {
  saveSession,
  getAllSessions,
  getSessionById,
  updateSessionNotes,
  deleteSession,
  getStats,
};