/**
 * Background Service Worker — Chrome Extension MV3 background script.
 *
 * Responsibilities:
 *  - Route messages between content scripts ↔ popup/dashboard
 *  - Schedule spaced repetition reminder alarms
 *  - Fire revision notifications
 *  - Handle first-install setup
 */

import { STORAGE_KEYS } from '../shared/constants/index.js';

// ─── Install Handler ──────────────────────────────────────────────────────────

chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    console.log('[DSA Copilot] First install — setting up defaults');
    await initializeDefaults();
    await scheduleRevisionAlarm();
    // Open onboarding
    chrome.tabs.create({ url: chrome.runtime.getURL('src/dashboard/index.html#/onboarding') });
  }

  if (details.reason === 'update') {
    console.log('[DSA Copilot] Updated to', chrome.runtime.getManifest().version);
    await scheduleRevisionAlarm();
  }
});

// ─── Default Data Setup ───────────────────────────────────────────────────────

async function initializeDefaults() {
  const existing = await getStorage(STORAGE_KEYS.SETTINGS);
  if (!existing) {
    await setStorage(STORAGE_KEYS.SETTINGS, {
      aiProvider:    'openai',
      apiKey:        '',
      theme:         'dark',
      autoDetect:    true,
      notifications: true,
      dailyGoal:     3,
    });
  }

  const streak = await getStorage(STORAGE_KEYS.STREAK);
  if (!streak) {
    await setStorage(STORAGE_KEYS.STREAK, { current: 0, best: 0, lastDate: null });
  }
}

// ─── Storage Helpers ─────────────────────────────────────────────────────────

function getStorage(key) {
  return new Promise((resolve) => {
    chrome.storage.local.get(key, (r) => resolve(r[key] ?? null));
  });
}

function setStorage(key, value) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [key]: value }, resolve);
  });
}

// ─── Alarms ───────────────────────────────────────────────────────────────────

async function scheduleRevisionAlarm() {
  // Check every 6 hours for due revisions
  await chrome.alarms.clear('dsa-revision-check');
  chrome.alarms.create('dsa-revision-check', {
    delayInMinutes:  60,
    periodInMinutes: 360, // every 6 hours
  });

  // Daily streak check at 9am equivalent (3am UTC)
  await chrome.alarms.clear('dsa-daily-check');
  chrome.alarms.create('dsa-daily-check', {
    delayInMinutes:  1,
    periodInMinutes: 1440, // every 24 hours
  });
}

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'dsa-revision-check') {
    await handleRevisionCheck();
  }
  if (alarm.name === 'dsa-daily-check') {
    await handleDailyCheck();
  }
});

async function handleRevisionCheck() {
  const settings  = await getStorage(STORAGE_KEYS.SETTINGS);
  if (!settings?.notifications) return;

  const problems  = (await getStorage(STORAGE_KEYS.PROBLEMS)) ?? [];
  const today     = new Date().toISOString().split('T')[0];
  const dueCount  = problems.filter((p) => p.nextRevisionAt && p.nextRevisionAt <= today).length;

  if (dueCount > 0) {
    chrome.notifications.create('revision-due', {
      type:    'basic',
      iconUrl: chrome.runtime.getURL('icons/icon48.png'),
      title:   'DSA Copilot — Revision Time!',
      message: `You have ${dueCount} problem${dueCount > 1 ? 's' : ''} due for revision today.`,
      buttons: [{ title: 'Open Dashboard' }],
      priority: 1,
    });
  }
}

async function handleDailyCheck() {
  const settings = await getStorage(STORAGE_KEYS.SETTINGS);
  if (!settings?.notifications) return;

  const streak = await getStorage(STORAGE_KEYS.STREAK);
  if (!streak) return;

  const today     = new Date().toISOString().split('T')[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  // Alert user if they haven't solved anything today and had a streak yesterday
  if (streak.current > 0 && streak.lastDate === yesterdayStr) {
    chrome.notifications.create('streak-warning', {
      type:    'basic',
      iconUrl: chrome.runtime.getURL('icons/icon48.png'),
      title:   `🔥 Keep your ${streak.current}-day streak!`,
      message: `Solve a problem today to maintain your streak. Don't break the chain!`,
      priority: 2,
    });
  }
}

// ─── Notification Click Handler ───────────────────────────────────────────────

chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
  if (notificationId === 'revision-due' && buttonIndex === 0) {
    chrome.tabs.create({ url: chrome.runtime.getURL('src/dashboard/index.html#/revision') });
    chrome.notifications.clear(notificationId);
  }
});

chrome.notifications.onClicked.addListener((notificationId) => {
  chrome.tabs.create({ url: chrome.runtime.getURL('src/dashboard/index.html') });
  chrome.notifications.clear(notificationId);
});

// ─── Message Router ───────────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message, sender)
    .then(sendResponse)
    .catch((err) => sendResponse({ error: err.message }));
  return true; // Keep channel open for async response
});

async function handleMessage(message, sender) {
  const { type, payload } = message;

  switch (type) {
    case 'PROBLEM_SOLVED': {
      // Relay to any open dashboard tabs
      const tabs = await chrome.tabs.query({ url: chrome.runtime.getURL('*') });
      for (const tab of tabs) {
        chrome.tabs.sendMessage(tab.id, { type: 'PROBLEM_SOLVED', payload }).catch(() => {});
      }
      return { success: true };
    }

    case 'OPEN_DASHBOARD': {
      const url = chrome.runtime.getURL('src/dashboard/index.html');
      const existing = await chrome.tabs.query({ url: `${url}*` });
      if (existing.length > 0) {
        chrome.tabs.update(existing[0].id, { active: true });
        chrome.windows.update(existing[0].windowId, { focused: true });
      } else {
        chrome.tabs.create({ url });
      }
      return { success: true };
    }

    case 'GET_SETTINGS': {
      const settings = await getStorage(STORAGE_KEYS.SETTINGS);
      return settings ?? {};
    }

    case 'SAVE_SETTINGS': {
      await setStorage(STORAGE_KEYS.SETTINGS, payload);
      await setStorage(STORAGE_KEYS.AI_CONFIG, {
        provider: payload.aiProvider,
        apiKey:   payload.apiKey,
      });
      return { success: true };
    }

    case 'GET_STATS': {
      const problems = (await getStorage(STORAGE_KEYS.PROBLEMS)) ?? [];
      return {
        total:  problems.length,
        streak: await getStorage(STORAGE_KEYS.STREAK),
      };
    }

    default:
      return { error: `Unknown message type: ${type}` };
  }
}

// ─── Tab Update Listener ──────────────────────────────────────────────────────
// Inject content script logic state when navigating between problems

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (
    changeInfo.status === 'complete' &&
    tab.url?.includes('leetcode.com/problems/')
  ) {
    chrome.tabs.sendMessage(tabId, { type: 'PAGE_CHANGED', url: tab.url }).catch(() => {});
  }
});

console.log('[DSA Copilot] Background service worker initialized');
