/**
 * problemService — Core domain logic for problem tracking.
 * FIX 1: upsertProblem always stores a clean URL (no submissions page).
 * FIX 2: awardXP called correctly on new solve and re-solve.
 */

import { storageService } from './storageService.js';
import { updatePatternScores } from './patternService.js';
import {
  STORAGE_KEYS,
  SPACED_REPETITION_INTERVALS,
  MASTERY_LEVELS,
  XP_REWARDS,
  XP_LEVELS,
} from '../constants/index.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateId() {
  return `prob_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function today() {
  return new Date().toISOString().split('T')[0];
}

function nextRevisionDate(masteryLevel, lastReviewedAt) {
  const interval = SPACED_REPETITION_INTERVALS[masteryLevel] ?? 30;
  const base = new Date(lastReviewedAt ?? Date.now());
  base.setDate(base.getDate() + interval);
  return base.toISOString().split('T')[0];
}

// ─── XP / Level helpers ───────────────────────────────────────────────────────

function getLevelFromXP(xp) {
  let currentLevel = XP_LEVELS[0];
  for (const lvl of XP_LEVELS) {
    if (xp >= lvl.minXP) currentLevel = lvl;
    else break;
  }
  return currentLevel.level;
}

// ─── Problem CRUD ─────────────────────────────────────────────────────────────

async function getAllProblems() {
  return (await storageService.get(STORAGE_KEYS.PROBLEMS)) ?? [];
}

async function getProblemById(id) {
  const problems = await getAllProblems();
  return problems.find((p) => p.id === id) ?? null;
}

async function getProblemByTitleSlug(titleSlug) {
  const problems = await getAllProblems();
  return problems.find((p) => p.titleSlug === titleSlug) ?? null;
}

async function upsertProblem(data) {
  const problems = await getAllProblems();
  const existingIdx = problems.findIndex(
    (p) => p.titleSlug === data.titleSlug || p.leetcodeId === data.leetcodeId
  );

  // FIX 1: Always build a clean problem URL — never the submissions page.
  // LeetCode submission pages have URLs like /problems/two-sum/submissions/123/
  // We always force the clean description URL.
  const cleanUrl = `https://leetcode.com/problems/${data.titleSlug}/`;

  if (existingIdx !== -1) {
    // Re-solve — update but don't award full XP again
    const existing = problems[existingIdx];
    const updated = {
      ...existing,
      ...data,
      url:      cleanUrl,         // FIX: always override with clean URL
      attempts: (existing.attempts ?? 0) + 1,
      solvedAt: data.solvedAt ?? today(),
      submissionHistory: [
        ...(existing.submissionHistory ?? []),
        {
          date:      today(),
          language:  data.language,
          timeTaken: data.timeTaken,
          status:    data.status ?? 'Accepted',
        },
      ],
    };
    problems[existingIdx] = updated;
    await storageService.set(STORAGE_KEYS.PROBLEMS, problems);

    // Small XP for re-solving
    await awardXP(XP_REWARDS.REVISION_DONE, `Re-solved: ${data.title}`);

    return { problem: updated, isNew: false };
  }

// ── New problem ───────────────────────────────────────────────────────────
  const newProblem = {
    id:           generateId(),
    leetcodeId:   data.leetcodeId,
    titleSlug:    data.titleSlug,
    title:        data.title,
    difficulty:   data.difficulty,
    tags:         data.tags ?? [],
    language:     data.language,
    timeTaken:    data.timeTaken ?? null,
    attempts:     1,
    solvedAt:     data.solvedAt ?? today(),
    addedAt:      new Date().toISOString(),
    submissionHistory: [
      {
        date:      today(),
        language:  data.language,
        timeTaken: data.timeTaken,
        status:    data.status ?? 'Accepted',
      },
    ],
    masteryLevel:   MASTERY_LEVELS.NEW.value,
    nextRevisionAt: nextRevisionDate(0, today()),
    lastReviewedAt: null,
    reviewCount:    0,
    notes:          '',
    bookmarked:     false,
    customTags:     [],
    url:            cleanUrl,
  };

  problems.push(newProblem);
  await storageService.set(STORAGE_KEYS.PROBLEMS, problems);

  // ── Award XP based on difficulty ──────────────────────────────────────────
  const xpAmount =
    data.difficulty === 'Hard'   ? XP_REWARDS.SOLVE_HARD   :
    data.difficulty === 'Medium' ? XP_REWARDS.SOLVE_MEDIUM :
                                   XP_REWARDS.SOLVE_EASY;

  await awardXP(xpAmount, `Solved ${data.difficulty}: ${data.title}`);

  // ── Update pattern mastery scores ─────────────────────────────────────────
  await updatePatternScores(data.tags ?? [], data.difficulty);   // ← ADD THIS

  // ── Streak bonus ───────────────────────────────────────────────────────────
  const streak = await updateStreak();
  if (streak.current > 1) {
    await awardXP(XP_REWARDS.STREAK_BONUS, `${streak.current}-day streak bonus`);
  }

  return { problem: newProblem, isNew: true };
}

async function deleteProblem(id) {
  return storageService.removeFromArray(STORAGE_KEYS.PROBLEMS, (p) => p.id === id);
}

async function toggleBookmark(id) {
  const problems = await getAllProblems();
  const idx = problems.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  problems[idx].bookmarked = !problems[idx].bookmarked;
  await storageService.set(STORAGE_KEYS.PROBLEMS, problems);
  return problems[idx];
}

// ─── Spaced Repetition ────────────────────────────────────────────────────────

async function getDueForRevision() {
  const problems = await getAllProblems();
  const todayStr = today();
  return problems.filter((p) => p.nextRevisionAt && p.nextRevisionAt <= todayStr);
}

async function getUpcomingRevisions(days = 7) {
  const problems = await getAllProblems();
  const future   = new Date();
  future.setDate(future.getDate() + days);
  const futureStr = future.toISOString().split('T')[0];
  const todayStr  = today();

  return problems
    .filter((p) => p.nextRevisionAt > todayStr && p.nextRevisionAt <= futureStr)
    .sort((a, b) => a.nextRevisionAt.localeCompare(b.nextRevisionAt));
}

async function markRevisionDone(id, quality) {
  const problems = await getAllProblems();
  const idx      = problems.findIndex((p) => p.id === id);
  if (idx === -1) return;

  const p = problems[idx];
  let newMastery = p.masteryLevel ?? 0;

  if (quality >= 4) newMastery = Math.min(newMastery + 1, 5);
  else if (quality <= 1) newMastery = Math.max(newMastery - 1, 0);

  problems[idx] = {
    ...p,
    masteryLevel:   newMastery,
    lastReviewedAt: today(),
    nextRevisionAt: nextRevisionDate(newMastery, today()),
    reviewCount:    (p.reviewCount ?? 0) + 1,
  };

  await storageService.set(STORAGE_KEYS.PROBLEMS, problems);

  // Award XP for completing a revision
  await awardXP(XP_REWARDS.REVISION_DONE, `Revised: ${p.title}`);
  if (quality === 5) {
    await awardXP(XP_REWARDS.PERFECT_REVIEW, `Perfect recall: ${p.title}`);
  }

  return problems[idx];
}

// ─── Statistics ───────────────────────────────────────────────────────────────

async function getStats() {
  const problems = await getAllProblems();

  const byDifficulty = { Easy: 0, Medium: 0, Hard: 0 };
  const byTopic      = {};
  const byDate       = {};
  const byLanguage   = {};

  for (const p of problems) {
    byDifficulty[p.difficulty] = (byDifficulty[p.difficulty] ?? 0) + 1;

    for (const tag of (p.tags ?? [])) {
      byTopic[tag] = (byTopic[tag] ?? 0) + 1;
    }

    const date = p.solvedAt ?? p.addedAt?.split('T')[0];
    if (date) byDate[date] = (byDate[date] ?? 0) + 1;

    if (p.language && p.language !== 'Unknown') {
      byLanguage[p.language] = (byLanguage[p.language] ?? 0) + 1;
    }
  }

  const avgTime = problems
    .filter((p) => p.timeTaken > 0)
    .reduce((acc, p, _, arr) => acc + p.timeTaken / arr.length, 0);

  const topicsArr = Object.entries(byTopic)
    .map(([topic, count]) => ({ topic, count }))
    .sort((a, b) => b.count - a.count);

  return {
    total:        problems.length,
    byDifficulty,
    byTopic,
    byDate,
    byLanguage,
    topicsArr,
    avgTimeMins:  Math.round(avgTime),
    bookmarked:   problems.filter((p) => p.bookmarked).length,
    dueRevision:  (await getDueForRevision()).length,
  };
}

async function getWeakTopics() {
  const stats = await getStats();
  const all   = Object.entries(stats.byTopic)
    .map(([topic, count]) => ({ topic, count }))
    .sort((a, b) => a.count - b.count);
  return all.slice(0, 5);
}

// ─── Streak ───────────────────────────────────────────────────────────────────

async function getStreak() {
  return (await storageService.get(STORAGE_KEYS.STREAK)) ?? {
    current: 0, best: 0, lastDate: null,
  };
}

async function updateStreak() {
  const streak   = await getStreak();
  const todayStr = today();

  if (streak.lastDate === todayStr) return streak;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const newCurrent = streak.lastDate === yesterdayStr ? streak.current + 1 : 1;
  const newStreak  = {
    current:  newCurrent,
    best:     Math.max(streak.best, newCurrent),
    lastDate: todayStr,
  };

  await storageService.set(STORAGE_KEYS.STREAK, newStreak);
  return newStreak;
}

// ─── XP / Gamification ────────────────────────────────────────────────────────

async function getUserProfile() {
  return (await storageService.get(STORAGE_KEYS.USER_PROFILE)) ?? {
    xp:           0,
    level:        1,
    badges:       [],
    dailyGoal:    3,
    dailySolved:  0,
    lastGoalDate: null,
    xpLog:        [],
  };
}

async function awardXP(amount, reason) {
  const profile  = await getUserProfile();
  const newXP    = (profile.xp ?? 0) + amount;
  const newLevel = getLevelFromXP(newXP);

  await storageService.set(STORAGE_KEYS.USER_PROFILE, {
    ...profile,
    xp:    newXP,
    level: newLevel,
    xpLog: [...(profile.xpLog ?? []).slice(-50), { amount, reason, date: today() }],
  });

  return newXP;
}

// ─── Search & Filter ──────────────────────────────────────────────────────────

async function searchProblems({ query, difficulty, tags, bookmarked, language }) {
  const problems = await getAllProblems();
  return problems.filter((p) => {
    if (query      && !p.title?.toLowerCase().includes(query.toLowerCase())) return false;
    if (difficulty && p.difficulty !== difficulty) return false;
    if (bookmarked && !p.bookmarked) return false;
    if (language   && p.language !== language) return false;
    if (tags?.length && !tags.some((t) => p.tags?.includes(t))) return false;
    return true;
  });
}

export const problemService = {
  getAllProblems,
  getProblemById,
  getProblemByTitleSlug,
  upsertProblem,
  deleteProblem,
  toggleBookmark,
  getDueForRevision,
  getUpcomingRevisions,
  markRevisionDone,
  getStats,
  getWeakTopics,
  getStreak,
  updateStreak,
  getUserProfile,
  awardXP,
  searchProblems,
};