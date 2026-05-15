/**
 * patternService — Auto-updates pattern mastery scores when problems are solved.
 * Accurately maps LeetCode topic tags → DSA patterns.
 */

import { STORAGE_KEYS } from '../constants/index.js';
import { storageService } from './storageService.js';

// ─── Tag → Pattern mapping ────────────────────────────────────────────────────
// Keys must match LeetCode tag names exactly (we lowercase both sides when comparing).
// Be conservative — only map tags that STRONGLY indicate the pattern.

const TAG_TO_PATTERN = {
  // Sliding Window — only tags that are exclusively sliding window
  'sliding window': 'sliding_window',

  // Two Pointers
  'two pointers':   'two_pointers',
  'two pointer':    'two_pointers',

  // Binary Search — only if the tag IS binary search
  'binary search':  'binary_search',

  // Monotonic Stack — very specific tags only
  'monotonic stack':      'monotonic_stack',
  'monotonic queue':      'monotonic_stack',

  // Dynamic Programming — only DP-specific tags
  'dynamic programming':  'dynamic_programming',
  'memoization':          'dynamic_programming',

  // Greedy — only if explicitly greedy
  'greedy':               'greedy',

  // Backtracking — explicit tag only, NOT recursion (recursion is too broad)
  'backtracking':         'backtracking',

  // Graph Traversal — ONLY explicit graph/BFS/DFS tags, NOT matrix
  'graph':                'graph_traversal',
  'bfs':                  'graph_traversal',
  'dfs':                  'graph_traversal',
  'breadth-first search': 'graph_traversal',
  'depth-first search':   'graph_traversal',
  // NOTE: 'matrix' REMOVED — matrix problems are not always graph traversal

  // Union Find — very specific
  'union find':           'union_find',
  'disjoint set union':   'union_find',
  'disjoint set':         'union_find',

  // Prefix Sum — specific
  'prefix sum':           'prefix_sum',

  // Topological Sort — specific
  'topological sort':     'topological_sort',

  // Divide & Conquer — specific
  'divide and conquer':   'divide_conquer',
};

// Score increment per solve based on difficulty
const PATTERN_XP = {
  Easy:   5,
  Medium: 12,
  Hard:   20,
};

/**
 * Given a solved problem's tags and difficulty,
 * find matching patterns and increment their scores in storage.
 */
export async function updatePatternScores(tags, difficulty) {
  if (!tags?.length) return [];

  // Match tags → pattern IDs (case-insensitive)
  const matchedPatterns = new Set();
  for (const tag of tags) {
    const normalized = tag.toLowerCase().trim();
    const patternId  = TAG_TO_PATTERN[normalized];
    if (patternId) {
      matchedPatterns.add(patternId);
    }
  }

  if (!matchedPatterns.size) return [];

  // Load existing scores
  const existing  = (await storageService.get(STORAGE_KEYS.PATTERN_SCORES)) ?? {};
  const increment = PATTERN_XP[difficulty] ?? PATTERN_XP.Medium;

  // Update scores — cap at 100
  const updated = { ...existing };
  for (const patternId of matchedPatterns) {
    updated[patternId] = Math.min(100, (updated[patternId] ?? 0) + increment);
  }

  await storageService.set(STORAGE_KEYS.PATTERN_SCORES, updated);

  console.log(
    '[DSA Copilot] Pattern scores updated:',
    [...matchedPatterns].map((id) => `${id}: ${updated[id]}%`).join(', ')
  );

  return [...matchedPatterns];
}

/**
 * One-time migration — recalculate all pattern scores from existing problem history.
 * Call this from Settings if user wants to backfill scores.
 */
export async function recalculateAllPatternScores(problems) {
  // Reset all scores to 0
  const scores = {};

  for (const problem of problems) {
    const tags       = problem.tags ?? [];
    const difficulty = problem.difficulty ?? 'Medium';
    const increment  = PATTERN_XP[difficulty] ?? PATTERN_XP.Medium;

    for (const tag of tags) {
      const normalized = tag.toLowerCase().trim();
      const patternId  = TAG_TO_PATTERN[normalized];
      if (patternId) {
        scores[patternId] = Math.min(100, (scores[patternId] ?? 0) + increment);
      }
    }
  }

  await storageService.set(STORAGE_KEYS.PATTERN_SCORES, scores);
  console.log('[DSA Copilot] Pattern scores recalculated from history:', scores);
  return scores;
}