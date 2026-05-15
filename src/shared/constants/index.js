// ─── Storage Keys ────────────────────────────────────────────────────────────
export const STORAGE_KEYS = {
  PROBLEMS:        'dsa_copilot_problems',
  NOTES:           'dsa_copilot_notes',
  SETTINGS:        'dsa_copilot_settings',
  REVISION_QUEUE:  'dsa_copilot_revision_queue',
  MISTAKE_LOG:     'dsa_copilot_mistake_log',
  PATTERN_SCORES:     'dsa_copilot_pattern_scores',
  PATTERN_SCORES:  'dsa_copilot_pattern_scores',
  INTERVIEW_SESSIONS: 'dsa_copilot_interview_sessions',
  STREAK:          'dsa_copilot_streak',
  AI_CONFIG:       'dsa_copilot_ai_config',
  USER_PROFILE:    'dsa_copilot_user_profile',
  BOOKMARKS:       'dsa_copilot_bookmarks',
};

// ─── Difficulty ───────────────────────────────────────────────────────────────
export const DIFFICULTY = {
  EASY:   'Easy',
  MEDIUM: 'Medium',
  HARD:   'Hard',
};

export const DIFFICULTY_COLORS = {
  Easy:   { text: '#4ade80', bg: 'rgba(34,197,94,0.12)',  border: 'rgba(34,197,94,0.25)' },
  Medium: { text: '#fb923c', bg: 'rgba(251,146,60,0.12)', border: 'rgba(251,146,60,0.25)' },
  Hard:   { text: '#f87171', bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.25)' },
};

// ─── DSA Topics ───────────────────────────────────────────────────────────────
export const DSA_TOPICS = [
  'Array', 'String', 'Linked List', 'Binary Tree', 'Binary Search Tree',
  'Graph', 'Dynamic Programming', 'Greedy', 'Backtracking', 'Stack',
  'Queue', 'Heap', 'Hash Table', 'Trie', 'Segment Tree', 'Binary Search',
  'Two Pointers', 'Sliding Window', 'Recursion', 'Divide and Conquer',
  'Bit Manipulation', 'Math', 'Matrix', 'Union Find', 'Sorting',
  'Prefix Sum', 'Monotonic Stack', 'Topological Sort', 'BFS', 'DFS',
];

// ─── DSA Patterns ─────────────────────────────────────────────────────────────
export const DSA_PATTERNS = [
  {
    id: 'sliding_window',
    label: 'Sliding Window',
    description: 'Maintain a window of elements that satisfies a condition',
    icon: '⊡',
    color: '#09d2f5',
    keywords: ['sliding window', 'substring', 'subarray', 'window'],
  },
  {
    id: 'two_pointers',
    label: 'Two Pointers',
    description: 'Use two indices to traverse from different directions',
    icon: '⇔',
    color: '#a78bfa',
    keywords: ['two pointers', 'left right', 'opposite ends'],
  },
  {
    id: 'binary_search',
    label: 'Binary Search',
    description: 'Eliminate half the search space each iteration',
    icon: '⌖',
    color: '#34d399',
    keywords: ['binary search', 'sorted array', 'search space'],
  },
  {
    id: 'monotonic_stack',
    label: 'Monotonic Stack',
    description: 'Stack that maintains a monotonic (increasing/decreasing) property',
    icon: '⊴',
    color: '#f59e0b',
    keywords: ['monotonic stack', 'next greater', 'histogram', 'span'],
  },
  {
    id: 'dynamic_programming',
    label: 'Dynamic Programming',
    description: 'Break problems into overlapping subproblems',
    icon: '⊞',
    color: '#f87171',
    keywords: ['dp', 'dynamic programming', 'memoization', 'tabulation'],
  },
  {
    id: 'greedy',
    label: 'Greedy',
    description: 'Make locally optimal choices at each step',
    icon: '▶',
    color: '#fb923c',
    keywords: ['greedy', 'optimal', 'interval scheduling'],
  },
  {
    id: 'backtracking',
    label: 'Backtracking',
    description: 'Explore all possibilities via systematic trial-and-error',
    icon: '↺',
    color: '#c084fc',
    keywords: ['backtracking', 'permutations', 'combinations', 'subsets'],
  },
  {
    id: 'graph_traversal',
    label: 'Graph Traversal',
    description: 'BFS/DFS to explore nodes and edges',
    icon: '⬡',
    color: '#38bdf8',
    keywords: ['bfs', 'dfs', 'graph', 'traversal', 'connected components'],
  },
  {
    id: 'union_find',
    label: 'Union Find (DSU)',
    description: 'Track connected components with path compression',
    icon: '◉',
    color: '#a3e635',
    keywords: ['union find', 'dsu', 'disjoint set', 'connected'],
  },
  {
    id: 'prefix_sum',
    label: 'Prefix Sum',
    description: 'Precompute cumulative sums for O(1) range queries',
    icon: 'Σ',
    color: '#fb7185',
    keywords: ['prefix sum', 'running sum', 'range query'],
  },
  {
    id: 'topological_sort',
    label: 'Topological Sort',
    description: 'Order nodes in a DAG by dependency',
    icon: '⋱',
    color: '#fbbf24',
    keywords: ['topological sort', 'course schedule', 'dag', 'dependency'],
  },
  {
    id: 'divide_conquer',
    label: 'Divide & Conquer',
    description: 'Split problem into independent subproblems',
    icon: '⋔',
    color: '#6ee7b7',
    keywords: ['divide and conquer', 'merge sort', 'quick sort'],
  },
];

// ─── Spaced Repetition Schedule ───────────────────────────────────────────────
export const SPACED_REPETITION_INTERVALS = [1, 3, 7, 15, 30, 60]; // days

export const MASTERY_LEVELS = {
  NEW:        { label: 'New',        value: 0, color: '#9b9bba' },
  LEARNING:   { label: 'Learning',   value: 1, color: '#f59e0b' },
  REVIEWING:  { label: 'Reviewing',  value: 2, color: '#38bdf8' },
  MASTERED:   { label: 'Mastered',   value: 3, color: '#4ade80' },
};

// ─── Common Mistake Types ─────────────────────────────────────────────────────
export const MISTAKE_TYPES = [
  { id: 'off_by_one',    label: 'Off-by-one Error',   icon: '±1', color: '#f87171' },
  { id: 'overflow',      label: 'Integer Overflow',    icon: '⬆', color: '#fb923c' },
  { id: 'wrong_ds',      label: 'Wrong Data Structure',icon: '⚡', color: '#fbbf24' },
  { id: 'edge_case',     label: 'Missed Edge Case',    icon: '◈', color: '#a78bfa' },
  { id: 'recursion',     label: 'Recursion Error',     icon: '↻', color: '#c084fc' },
  { id: 'dp_state',      label: 'Wrong DP State',      icon: '⊡', color: '#38bdf8' },
  { id: 'tle',           label: 'TLE / Inefficiency',  icon: '⏱', color: '#f59e0b' },
  { id: 'syntax',        label: 'Syntax Error',        icon: '</>', color: '#9b9bba' },
  { id: 'logic',         label: 'Logic Error',         icon: '⚠', color: '#ef4444' },
  { id: 'initialization',label: 'Init Error',          icon: '∅', color: '#06b6d4' },
];

// ─── Programming Languages ────────────────────────────────────────────────────
export const LANGUAGES = [
  'Python', 'Java', 'C++', 'C', 'JavaScript', 'TypeScript',
  'Go', 'Rust', 'Kotlin', 'Swift', 'Ruby', 'Scala',
];

// ─── Interview Mode Config ────────────────────────────────────────────────────
export const INTERVIEW_MODE_CONFIG = {
  HIDE_EDITORIAL:       true,
  HIDE_ACCEPTANCE_RATE: true,
  HIDE_HINTS:           true,
  HIDE_DISCUSSIONS:     true,
  DEFAULT_TIME_LIMIT:   45, // minutes
};

// ─── AI Providers ─────────────────────────────────────────────────────────────
export const AI_PROVIDERS = {
  OPENAI: 'openai',
  GEMINI: 'gemini',
};

// ─── Platforms ────────────────────────────────────────────────────────────────
export const PLATFORMS = {
  LEETCODE:   'leetcode',
  CODEFORCES: 'codeforces',
  CODECHEF:   'codechef',
  ATCODER:    'atcoder',
};

// ─── XP System ────────────────────────────────────────────────────────────────
export const XP_REWARDS = {
  SOLVE_EASY:     10,
  SOLVE_MEDIUM:   25,
  SOLVE_HARD:     50,
  FIRST_TRY:      15,
  STREAK_BONUS:   5,
  REVISION_DONE:  8,
  NOTE_ADDED:     3,
  PERFECT_REVIEW: 20,
};

export const XP_LEVELS = [
  { level: 1,  minXP: 0,    label: 'Initiate' },
  { level: 2,  minXP: 100,  label: 'Learner' },
  { level: 3,  minXP: 300,  label: 'Practitioner' },
  { level: 4,  minXP: 600,  label: 'Analyst' },
  { level: 5,  minXP: 1000, label: 'Solver' },
  { level: 6,  minXP: 1500, label: 'Coder' },
  { level: 7,  minXP: 2200, label: 'Tactician' },
  { level: 8,  minXP: 3000, label: 'Expert' },
  { level: 9,  minXP: 4000, label: 'Architect' },
  { level: 10, minXP: 5500, label: 'Master' },
];

// ─── Events ───────────────────────────────────────────────────────────────────
export const EVENTS = {
  PROBLEM_SOLVED:      'dsa_copilot:problem_solved',
  NOTE_SAVED:          'dsa_copilot:note_saved',
  REVISION_SCHEDULED:  'dsa_copilot:revision_scheduled',
  INTERVIEW_STARTED:   'dsa_copilot:interview_started',
  INTERVIEW_ENDED:     'dsa_copilot:interview_ended',
  SETTINGS_UPDATED:    'dsa_copilot:settings_updated',
};
