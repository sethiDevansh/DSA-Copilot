import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { problemService } from '../services/problemService.js';
import { mistakeService }  from '../services/mistakeService.js';
import { interviewService } from '../services/interviewService.js';
import { notesService }    from '../services/notesService.js';
import { storageService } from '../services/storageService.js';
import { STORAGE_KEYS, AI_PROVIDERS } from '../constants/index.js';

const useAppStore = create(
  persist(
    (set, get) => ({
      // ── Problems ──────────────────────────────────────────────────────────
      problems:          [],
      problemStats:      null,
      dueRevisions:      [],
      weakTopics:        [],
      isLoadingProblems: false,

      loadProblems: async () => {
        set({ isLoadingProblems: true });
        try {
          const [problems, stats, due, weak, patternScores] = await Promise.all([
            problemService.getAllProblems(),
            problemService.getStats(),
            problemService.getDueForRevision(),
            problemService.getWeakTopics(),
            storageService.get(STORAGE_KEYS.PATTERN_SCORES),  // ← ADD THIS
          ]);
          set({
            problems,
            problemStats:  stats,
            dueRevisions:  due,
            weakTopics:    weak,
            patternScores: patternScores ?? {},               // ← ADD THIS
          });
        } finally {
          set({ isLoadingProblems: false });
        }
      },

      addProblem: async (data) => {
        const { problem, isNew } = await problemService.upsertProblem(data);
        await get().loadProblems();
        await get().loadStreak();
        return { problem, isNew };
      },

      toggleBookmark: async (id) => {
        await problemService.toggleBookmark(id);
        await get().loadProblems();
      },

      markRevisionDone: async (id, quality) => {
        await problemService.markRevisionDone(id, quality);
        await get().loadProblems();
        await get().loadStreak();
      },

      // ── Mistakes ──────────────────────────────────────────────────────────
      mistakes:     [],
      mistakeStats: null,

      loadMistakes: async () => {
        const [mistakes, stats] = await Promise.all([
          mistakeService.getAllMistakes(),
          mistakeService.getMistakeStats(),
        ]);
        set({ mistakes, mistakeStats: stats });
      },

      logMistake: async (data) => {
        const entry = await mistakeService.logMistake(data);
        await get().loadMistakes();
        return entry;
      },

      // ── Streak & Gamification ─────────────────────────────────────────────
      streak:      { current: 0, best: 0, lastDate: null },
      userProfile: { xp: 0, level: 1, badges: [], dailyGoal: 3 },

      loadStreak: async () => {
  // First check if streak should be reset (missed a day)
        await problemService.checkAndResetStreak();

        const [streak, profile] = await Promise.all([
          problemService.getStreak(),
          problemService.getUserProfile(),
        ]);
        set({ streak, userProfile: profile });
      },

      // ── Theme ─────────────────────────────────────────────────────────────
      theme: 'dark',

      toggleTheme: () => {
        const newTheme = get().theme === 'dark' ? 'light' : 'dark';
        set({ theme: newTheme });
        // Apply to document
        document.documentElement.classList.toggle('light', newTheme === 'light');
        document.documentElement.classList.toggle('dark',  newTheme === 'dark');
      },

      initTheme: () => {
        const theme = get().theme ?? 'dark';
        document.documentElement.classList.toggle('light', theme === 'light');
        document.documentElement.classList.toggle('dark',  theme === 'dark');
      },

      // ── Settings ──────────────────────────────────────────────────────────
      settings: {
        aiProvider:       AI_PROVIDERS.OPENAI,
        apiKey:           '',
        theme:            'dark',
        autoDetect:       true,
        notifications:    true,
        dailyGoal:        3,
        panelPosition:    'right',
        interviewMode:    false,
        hideEditorial:    true,
        hideHints:        true,
        hideDiscussions:  false,
        defaultTimerMins: 45,
      },

      updateSettings: (updates) => {
        set((state) => ({ settings: { ...state.settings, ...updates } }));
        const newSettings = { ...get().settings, ...updates };
        const isChromeExtension = typeof chrome !== 'undefined' && chrome.storage?.local;
        if (isChromeExtension) {
          chrome.storage.local.set({
            [STORAGE_KEYS.AI_CONFIG]: {
              provider: newSettings.aiProvider,
              apiKey:   newSettings.apiKey,
            },
          });
        }
      },

      // ── UI State ──────────────────────────────────────────────────────────
      ui: {
        sidePanelOpen:      false,
        activePanelTab:     'notes',
        dashboardPage:      'overview',
        notificationsOpen:  false,
        commandPaletteOpen: false,
        isLoading:          false,
        toast:              null,
      },

      setUI: (updates) => set((state) => ({ ui: { ...state.ui, ...updates } })),

      openSidePanel: (tab) => set((state) => ({
        ui: { ...state.ui, sidePanelOpen: true, activePanelTab: tab ?? state.ui.activePanelTab },
      })),

      closeSidePanel: () => set((state) => ({
        ui: { ...state.ui, sidePanelOpen: false },
      })),

      showToast: (message, type = 'info', duration = 3000) => {
        set((state) => ({ ui: { ...state.ui, toast: { message, type, id: Date.now() } } }));
        setTimeout(() => {
          set((state) => ({ ui: { ...state.ui, toast: null } }));
        }, duration);
      },

// ── Interview Mode ────────────────────────────────────────────────────────
interviewSession: null,
interviewHistory: [],

loadInterviewHistory: async () => {
  // const { interviewService } = await import('../services/interviewService.js');
  const sessions = await interviewService.getAllSessions();
  set({ interviewHistory: sessions });
},

startInterviewSession: (config) => {
  set({
    interviewSession: {
      startTime:    Date.now(),
      timeLimit:    config.timeLimitMins * 60 * 1000,
      timeLimitMins: config.timeLimitMins,
      problem:      config.problem,
      penalties:    0,
      hintsUsed:    0,
      paused:       false,
    },
  });
},

endInterviewSession: async (opts = {}) => {
  const session = get().interviewSession;
  if (!session) return;

  try {
    // const { interviewService } = await import('../services/interviewService.js');
    await interviewService.saveSession({
      problem:              session.problem,
      startTime:            session.startTime,
      endTime:              Date.now(),
      timeLimitMins:        session.timeLimitMins ?? 45,
      penalties:            session.penalties ?? 0,
      completed:            opts.completed ?? true,
      solvedDuringSession:  opts.solvedDuringSession ?? false,  // ← KEY
    });
  } catch (err) {
    console.error('[DSA Copilot] Failed to save interview session:', err);
  }

  set({ interviewSession: null });

  // ✅ Replace with this
const sessions = await interviewService.getAllSessions();
set({ interviewHistory: sessions });
},

addInterviewPenalty: () => {
  set((state) => ({
    interviewSession: state.interviewSession
      ? {
          ...state.interviewSession,
          penalties: (state.interviewSession.penalties ?? 0) + 1,
        }
      : null,
  }));
},

markInterviewSolved: () => {
  set((state) => ({
    interviewSession: state.interviewSession
      ? { ...state.interviewSession, solvedDuringSession: true }
      : null,
  }));
},

      // ── Pattern Scores ────────────────────────────────────────────────────
      patternScores: {},

      updatePatternScore: (patternId, delta) => {
        set((state) => ({
          patternScores: {
            ...state.patternScores,
            [patternId]: Math.min(100, Math.max(0, (state.patternScores[patternId] ?? 0) + delta)),
          },
        }));
      },
    }),

    {
      name:    'dsa-copilot-store',
      storage: createJSONStorage(() => {
        if (typeof chrome !== 'undefined' && chrome.storage?.local) {
          return {
            getItem: (key) =>
              new Promise((resolve) => {
                chrome.storage.local.get(key, (r) => resolve(r[key] ?? null));
              }),
            setItem: (key, value) =>
              new Promise((resolve) => {
                chrome.storage.local.set({ [key]: value }, resolve);
              }),
            removeItem: (key) =>
              new Promise((resolve) => {
                chrome.storage.local.remove(key, resolve);
              }),
          };
        }
        return localStorage;
      }),
      partialize: (state) => ({
        settings:     state.settings,
        patternScores: state.patternScores,
        theme:        state.theme,
        ui: { dashboardPage: state.ui.dashboardPage },
      }),
    }
  )
);

export default useAppStore;