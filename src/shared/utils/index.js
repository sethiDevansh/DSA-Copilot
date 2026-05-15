import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatDistanceToNow, format, parseISO, isValid } from 'date-fns';

// ─── Class Name Utility ───────────────────────────────────────────────────────
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// ─── Date Formatting ──────────────────────────────────────────────────────────
export function timeAgo(dateString) {
  if (!dateString) return 'Never';
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
    if (!isValid(date)) return 'Unknown';
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return 'Unknown';
  }
}

export function formatDate(dateString, pattern = 'MMM d, yyyy') {
  if (!dateString) return '—';
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
    if (!isValid(date)) return '—';
    return format(date, pattern);
  } catch {
    return '—';
  }
}

export function formatDuration(minutes) {
  if (!minutes || minutes <= 0) return '—';
  if (minutes < 60) return `${Math.round(minutes)}m`;
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function formatSeconds(totalSeconds) {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// ─── Debounce ─────────────────────────────────────────────────────────────────
export function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// ─── Throttle ─────────────────────────────────────────────────────────────────
export function throttle(fn, limit) {
  let lastCall = 0;
  return (...args) => {
    const now = Date.now();
    if (now - lastCall >= limit) {
      lastCall = now;
      return fn(...args);
    }
  };
}

// ─── Number Formatting ───────────────────────────────────────────────────────
export function formatNumber(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export function toPercent(value, total) {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}

// ─── Array Utils ──────────────────────────────────────────────────────────────
export function groupBy(arr, key) {
  return arr.reduce((acc, item) => {
    const k = typeof key === 'function' ? key(item) : item[key];
    (acc[k] = acc[k] ?? []).push(item);
    return acc;
  }, {});
}

export function sortBy(arr, key, direction = 'asc') {
  return [...arr].sort((a, b) => {
    const va = typeof key === 'function' ? key(a) : a[key];
    const vb = typeof key === 'function' ? key(b) : b[key];
    if (va < vb) return direction === 'asc' ? -1 : 1;
    if (va > vb) return direction === 'asc' ?  1 : -1;
    return 0;
  });
}

export function uniqueBy(arr, key) {
  const seen = new Set();
  return arr.filter((item) => {
    const k = typeof key === 'function' ? key(item) : item[key];
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

// ─── String Utils ─────────────────────────────────────────────────────────────
export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function truncate(str, maxLen = 60) {
  if (!str || str.length <= maxLen) return str ?? '';
  return str.slice(0, maxLen) + '…';
}

export function slugify(str) {
  return str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

// ─── Color Utils ─────────────────────────────────────────────────────────────
export function getDifficultyColor(difficulty) {
  const map = {
    Easy:   '#4ade80',
    Medium: '#fb923c',
    Hard:   '#f87171',
  };
  return map[difficulty] ?? '#9b9bba';
}

export function getMasteryColor(level) {
  const colors = ['#9b9bba', '#f59e0b', '#38bdf8', '#4ade80', '#a78bfa', '#09d2f5'];
  return colors[level] ?? colors[0];
}

export function getHeatColor(count) {
  if (!count || count === 0) return 'rgba(255,255,255,0.04)';
  if (count === 1)           return 'rgba(9,210,245,0.2)';
  if (count === 2)           return 'rgba(9,210,245,0.4)';
  if (count === 3)           return 'rgba(9,210,245,0.6)';
  return 'rgba(9,210,245,0.85)';
}

// ─── XP / Level ───────────────────────────────────────────────────────────────
import { XP_LEVELS } from '../constants/index.js';

export function getLevel(xp) {
  let current = XP_LEVELS[0];
  for (const lvl of XP_LEVELS) {
    if (xp >= lvl.minXP) current = lvl;
    else break;
  }
  return current;
}

export function getXPToNextLevel(xp) {
  const current  = getLevel(xp);
  const nextIdx  = XP_LEVELS.findIndex((l) => l.level === current.level + 1);
  if (nextIdx === -1) return { needed: 0, progress: 100 };
  const next     = XP_LEVELS[nextIdx];
  const needed   = next.minXP - current.minXP;
  const earned   = xp - current.minXP;
  return { needed, earned, progress: Math.round((earned / needed) * 100), nextLabel: next.label };
}

// ─── DOM Helpers ─────────────────────────────────────────────────────────────
export function waitForElement(selector, timeout = 10_000) {
  return new Promise((resolve, reject) => {
    const el = document.querySelector(selector);
    if (el) return resolve(el);

    const observer = new MutationObserver(() => {
      const found = document.querySelector(selector);
      if (found) {
        observer.disconnect();
        resolve(found);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Timeout waiting for ${selector}`));
    }, timeout);
  });
}

// ─── Clipboard ───────────────────────────────────────────────────────────────
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    return true;
  }
}

// ─── URL Helpers ─────────────────────────────────────────────────────────────
export function getLeetCodeProblemURL(titleSlug) {
  return `https://leetcode.com/problems/${titleSlug}/`;
}

// ─── Random ───────────────────────────────────────────────────────────────────
export function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
