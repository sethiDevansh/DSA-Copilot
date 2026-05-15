/**
 * Content Script — Injected into LeetCode problem pages.
 * FIX: Added session-level deduplication so the toast only fires ONCE per problem per session.
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import { SidePanel } from './components/SidePanel.jsx';
import {
  extractFullProblemData,
  isSubmissionAccepted,
  extractCodeFromEditor,
  extractSubmissionStats,
  isLeetCodeProblemPage,
  getCurrentProblemSlug,
} from '../shared/services/leetcodeParser.js';
import { problemService } from '../shared/services/problemService.js';
import { debounce } from '../shared/utils/index.js';

// ─── Mount Point ──────────────────────────────────────────────────────────────

const CONTAINER_ID = 'dsa-copilot-root';
let root               = null;
let containerEl        = null;
let submissionObserver = null;

// ─── Session deduplication ────────────────────────────────────────────────────
// Tracks slugs already saved THIS browser session so we never fire twice.
const savedThisSession = new Set();

// Tracks the last time we fired for this slug (unix ms).
// Even if the user re-submits for real, we enforce a 10-second cooldown.
const lastSavedAt = {};
const COOLDOWN_MS = 10_000;

function mountPanel() {
  if (document.getElementById(CONTAINER_ID)) return;
  if (!isLeetCodeProblemPage()) return;

  containerEl = document.createElement('div');
  containerEl.id = CONTAINER_ID;
  containerEl.style.cssText = `
    position: fixed;
    top: 0;
    right: 0;
    height: 100vh;
    z-index: 9999;
    pointer-events: none;
    font-family: 'DM Sans', sans-serif;
  `;

  document.body.appendChild(containerEl);

  const problemData = extractFullProblemData();

  root = createRoot(containerEl);
  root.render(<SidePanel initialProblem={problemData} />);

  observeSubmissions();
}

function unmountPanel() {
  if (root) { root.unmount(); root = null; }
  if (containerEl) { containerEl.remove(); containerEl = null; }
  if (submissionObserver) { submissionObserver.disconnect(); submissionObserver = null; }
}

// ─── Submission Observer ──────────────────────────────────────────────────────

function observeSubmissions() {
  const checkSubmission = debounce(async () => {
    if (!isSubmissionAccepted()) return;

    const slug = getCurrentProblemSlug();
    if (!slug) return;

    // ── Deduplication guard ───────────────────────────────────────────────
    const now = Date.now();
    const last = lastSavedAt[slug] ?? 0;
    if (now - last < COOLDOWN_MS) return;   // within cooldown window → skip

    if (savedThisSession.has(slug)) {
      // Already saved once this session — only allow again if user navigated
      // away and came back (slug changes) or 60 seconds have passed.
      if (now - last < 60_000) return;
    }

    // Mark immediately to prevent race conditions from rapid observer calls
    savedThisSession.add(slug);
    lastSavedAt[slug] = now;

    await handleSuccessfulSubmission(slug);
  }, 800);  // Debounce 800ms — prevents rapid-fire on DOM thrashing

  submissionObserver = new MutationObserver(checkSubmission);
  submissionObserver.observe(document.body, {
    childList:  true,
    subtree:    true,
    attributes: false,
    characterData: false,
  });
}

async function handleSuccessfulSubmission(slug) {
  const problemData = extractFullProblemData();
  const code        = extractCodeFromEditor();
  const stats       = extractSubmissionStats();
  const startTime   = sessionStorage.getItem(`dsa_copilot_start_${slug}`);
  const timeTaken   = startTime
    ? Math.round((Date.now() - parseInt(startTime)) / 60000)
    : null;

  try {
    const { problem, isNew } = await problemService.upsertProblem({
      ...problemData,
      timeTaken,
      status:  'Accepted',
      code,
      runtime: stats.runtime,
      memory:  stats.memory,
    });

    // ── KEY FIX: Mark solvedDuringSession in BOTH session key AND a
    //    dedicated solved key so it survives the LAST_KEY handoff ──────────
    const isChromeExtension = typeof chrome !== 'undefined' && chrome.storage?.local;
    if (isChromeExtension) {
      chrome.storage.local.get('dsa_copilot_interview_session', (result) => {
        const activeSession = result?.dsa_copilot_interview_session;
        if (activeSession && activeSession.problem?.titleSlug === slug) {
          // Update the active session with solvedDuringSession: true
          const updatedSession = { ...activeSession, solvedDuringSession: true };
          // Write to BOTH keys so it's never lost during handoff
          chrome.storage.local.set({
            'dsa_copilot_interview_session': updatedSession,
            'dsa_copilot_interview_solved':  true,   // ← dedicated simple flag
          }, () => {
            console.log('[DSA Copilot] ✓ Interview problem solved — flag saved!');
          });
        }
      });
    }

    chrome.runtime.sendMessage({
      type:    'PROBLEM_SOLVED',
      payload: { problem, isNew, code, stats },
    });

    window.dispatchEvent(
      new CustomEvent('dsa_copilot:problem_solved', {
        detail: { problem, isNew, code, stats },
      })
    );

    console.log(`[DSA Copilot] ${isNew ? '✓ New' : '↺ Re-solved'}: ${problem.title}`);
  } catch (err) {
    savedThisSession.delete(slug);
    delete lastSavedAt[slug];
    console.error('[DSA Copilot] Failed to save problem:', err);
  }
}

// ─── Message Listener ─────────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'PAGE_CHANGED') {
    unmountPanel();
    setTimeout(mountPanel, 1000);
  }
});

// ─── Start Time Tracking ──────────────────────────────────────────────────────

function initStartTime() {
  const slug = getCurrentProblemSlug();
  if (!slug) return;
  const key = `dsa_copilot_start_${slug}`;
  // Only set if not already set (don't reset on re-visit)
  if (!sessionStorage.getItem(key)) {
    sessionStorage.setItem(key, String(Date.now()));
  }
}

// ─── Navigation detection (SPA) ───────────────────────────────────────────────
// LeetCode is a SPA — URL changes without full page reload.
// We watch for URL changes to reset the observer for the new problem.

let lastUrl = location.href;

const urlObserver = new MutationObserver(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    if (isLeetCodeProblemPage()) {
      unmountPanel();
      setTimeout(() => {
        mountPanel();
        initStartTime();
      }, 1000);
    }
  }
});

urlObserver.observe(document.body, { childList: true, subtree: true });

// ─── Init ─────────────────────────────────────────────────────────────────────

function init() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => { mountPanel(); initStartTime(); }, 800);
    });
  } else {
    setTimeout(() => { mountPanel(); initStartTime(); }, 800);
    initStartTime();
  }
}

init();