# ⟨/⟩ DSA Copilot

> **AI-powered DSA interview preparation assistant — track, analyze, and master coding patterns.**

A production-grade Chrome Extension (Manifest V3) built with React, Vite, TailwindCSS, and Zustand that transforms your LeetCode practice into a structured, intelligent study system.

---

## ✨ Features

| Feature | Description |
|---|---|
| **🔍 Auto Problem Tracking** | Detects and saves solved problems automatically |
| **📝 Smart Notes System** | Markdown notes per problem, auto-saved, with custom tags |
| **◈ AI Hint System** | Gradual 5-level hints (never full solutions) via OpenAI / Gemini |
| **↺ Spaced Repetition** | SM-2 algorithm — Day 1→3→7→15→30→60 revision schedule |
| **⊘ Mistake Analytics** | Track & analyze recurring error patterns across problems |
| **◎ Pattern Detection** | AI-powered detection of 12+ DSA patterns |
| **⏱ Interview Mode** | Timed sessions, penalty tracking, mock interview simulation |
| **📊 Analytics Dashboard** | Heatmaps, radar charts, topic breakdowns, progress trends |
| **🎮 Gamification** | XP system, levels, streaks, daily goals |
| **💾 Export / Import** | Full JSON data backup and restore |

---

## 🗂 Architecture

```
dsa-copilot/
├── manifest.json                  # Chrome Extension MV3 manifest
├── vite.config.js                 # Vite + CRXJS build config
├── tailwind.config.js             # Design tokens + custom utilities
│
├── src/
│   ├── global.css                 # Base styles, CSS variables, component layer
│   │
│   ├── background/
│   │   └── index.js               # Service worker — alarms, notifications, message routing
│   │
│   ├── content/                   # Injected into LeetCode problem pages
│   │   ├── index.jsx              # Mount point + submission detection
│   │   ├── content.css            # Scoped content script styles
│   │   └── components/
│   │       ├── SidePanel.jsx      # Main floating side panel
│   │       ├── ProblemSolvedToast.jsx
│   │       └── panels/
│   │           ├── NotesPanel.jsx     # Per-problem markdown notes
│   │           ├── HintsPanel.jsx     # 5-level AI hint system
│   │           ├── AnalysisPanel.jsx  # AI solution analyzer
│   │           └── MistakesPanel.jsx  # Mistake logger
│   │
│   ├── popup/                     # Browser toolbar popup (340px)
│   │   ├── index.html
│   │   ├── main.jsx
│   │   └── PopupApp.jsx           # Compact stats + quick actions
│   │
│   ├── dashboard/                 # Full-page options dashboard
│   │   ├── index.html
│   │   ├── main.jsx
│   │   ├── DashboardApp.jsx       # Router shell
│   │   ├── components/
│   │   │   ├── Sidebar.jsx        # Navigation sidebar
│   │   │   └── Toast.jsx
│   │   └── pages/
│   │       ├── OverviewPage.jsx   # Main dashboard
│   │       ├── ProblemsPage.jsx   # Searchable problem list
│   │       ├── RevisionPage.jsx   # Spaced repetition queue
│   │       ├── AnalyticsPage.jsx  # Charts & stats
│   │       ├── PatternsPage.jsx   # Pattern mastery
│   │       ├── InterviewPage.jsx  # Mock interview mode
│   │       ├── MistakesPage.jsx   # Mistake analytics
│   │       └── SettingsPage.jsx   # Config & data management
│   │
│   └── shared/                    # Shared across all surfaces
│       ├── constants/index.js     # All app constants
│       ├── utils/index.js         # cn(), formatters, helpers
│       ├── store/
│       │   └── useAppStore.js     # Zustand global store
│       ├── services/
│       │   ├── storageService.js  # Chrome storage abstraction
│       │   ├── aiService.js       # OpenAI / Gemini AI layer
│       │   ├── problemService.js  # Problem CRUD + spaced repetition
│       │   ├── notesService.js    # Notes management
│       │   ├── mistakeService.js  # Mistake tracking
│       │   └── leetcodeParser.js  # DOM scraper for LeetCode
│       ├── hooks/
│       │   ├── useTimer.js        # rAF-based precise timer
│       │   ├── useDebounce.js
│       │   ├── useLocalStorage.js
│       │   ├── useChromeMessage.js
│       │   ├── useProblems.js
│       │   └── useAI.js
│       └── components/
│           ├── Button.jsx
│           ├── Card.jsx
│           ├── Badge.jsx
│           ├── Input.jsx
│           ├── Modal.jsx
│           ├── Spinner.jsx
│           ├── EmptyState.jsx
│           └── ProgressRing.jsx
│
├── public/
│   └── icons/                     # Extension icons (16/32/48/128px)
│
└── scripts/
    └── generate-icons.js          # Optional: generate placeholder icons
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 18
- npm ≥ 9
- Chrome browser

### Installation

```bash
# 1. Clone / unzip the project
cd dsa-copilot

# 2. Install dependencies
npm install

# 3. Generate placeholder icons (optional)
npm install canvas --save-dev
node scripts/generate-icons.js

# 4. Build the extension
npm run build

# 5. Load in Chrome
# Open chrome://extensions/
# Enable "Developer mode" (top right)
# Click "Load unpacked"
# Select the dist/ folder
```

### Development (Hot Reload)

```bash
npm run dev
# Then load the dist/ folder in Chrome as above
# Changes rebuild automatically
```

---

## ⚙ Configuration

1. Click the DSA Copilot icon in Chrome toolbar
2. Click **Open Dashboard**
3. Go to **Settings**
4. Select your AI provider (OpenAI or Gemini)
5. Paste your API key
6. Click **Test Connection**

### Getting API Keys

| Provider | URL |
|---|---|
| OpenAI | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) |
| Google Gemini | [aistudio.google.com](https://aistudio.google.com) |

> **Privacy:** Your API key is stored locally in Chrome extension storage. It never leaves your device or goes to any external server.

---

## 🎯 How to Use

### On LeetCode
1. Navigate to any problem page
2. The **DSA Copilot panel** slides in from the right (or press `Ctrl+Shift+D`)
3. Use tabs:
   - **Notes** — Write markdown notes, add tags
   - **AI Hints** — Get gradual hints (5 levels, never full solutions)
   - **Analyze** — Get AI complexity analysis or solution explanation
   - **Mistakes** — Log what went wrong for tracking

4. When you get **Accepted**, DSA Copilot automatically saves the problem and schedules it for spaced repetition review

### Dashboard
- **Overview** — Stats, heatmap, difficulty breakdown
- **Problems** — Search, filter, sort your solved history
- **Revision** — Problems due for spaced repetition review
- **Analytics** — Charts, radar, language breakdown
- **Patterns** — Track mastery of 12 DSA patterns
- **Mistakes** — Recurring error analysis
- **Interview** — Mock interview timer with problem selection

---

## 🧠 Spaced Repetition System

Problems are scheduled for review using the SM-2 algorithm:

| Review # | Interval |
|---|---|
| 1st review | 1 day |
| 2nd review | 3 days |
| 3rd review | 7 days |
| 4th review | 15 days |
| 5th review | 30 days |
| 6th review | 60 days |

After each review, rate your recall:
- **Forgot** → Reset interval
- **Hard** → Reduce interval
- **Good** → Keep scheduled interval
- **Perfect** → Extend interval

---

## 🔧 Tech Stack

| Layer | Technology |
|---|---|
| UI | React 18 + JSX |
| Styling | TailwindCSS + custom CSS variables |
| State | Zustand with persistence |
| Build | Vite + CRXJS plugin |
| Extension | Chrome MV3 — content scripts, service worker, storage API |
| Charts | Recharts |
| Routing | React Router v6 (hash-based for extension) |
| AI | OpenAI GPT-4o-mini / Google Gemini 1.5 Flash |
| Date | date-fns |
| Animation | CSS animations + Framer Motion |

---

## 🔮 Roadmap
kkkkkkkkkkkkkkkkkkkkk
- [ ] Codeforces / CodeChef / AtCoder support
- [ ] Cloud sync with Supabase / Firebase
- [ ] User accounts & cross-device sync
- [ ] AI-powered problem recommendations feed
- [ ] Code diff comparison across attempts
- [ ] Team / study group features
- [ ] Mobile companion app

---

## 📄 License

MIT — built for portfolio and open-source learning.

---

**Made with ◈ for serious DSA preparation.**
