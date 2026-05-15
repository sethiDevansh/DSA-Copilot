/**
 * leetcodeParser — Extracts structured problem data from LeetCode's DOM.
 * Updated selectors to match LeetCode's current React DOM (2025).
 */

// ─── URL Helpers ─────────────────────────────────────────────────────────────

export function getCurrentProblemSlug() {
  const match = window.location.pathname.match(/\/problems\/([^/]+)/);
  return match?.[1] ?? null;
}

export function isLeetCodeProblemPage() {
  return window.location.hostname === 'leetcode.com' &&
    /\/problems\//.test(window.location.pathname);
}

// ─── Metadata Extraction ─────────────────────────────────────────────────────

export function extractProblemTitle() {
  const selectors = [
    '[data-cy="question-title"]',
    '.mr-2.text-label-1',
    'div[class*="title"] a',
    'a[href*="/problems/"]',
  ];

  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (el?.textContent?.trim()) {
      return el.textContent.trim();
    }
  }

  const slug = getCurrentProblemSlug();
  if (slug) {
    return slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }

  return 'Unknown Problem';
}

export function extractDifficulty() {
  const selectors = [
    '[diff]',
    'span.text-olive',
    'span.text-yellow',
    'span.text-pink',
    'div[class*="difficulty"]',
  ];

  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (el?.textContent) {
      const text = el.textContent.trim();
      if (/easy/i.test(text))   return 'Easy';
      if (/medium/i.test(text)) return 'Medium';
      if (/hard/i.test(text))   return 'Hard';
    }
  }

  const allSpans = document.querySelectorAll('span');
  for (const span of allSpans) {
    const text = span.textContent.trim();
    if (text === 'Easy')   return 'Easy';
    if (text === 'Medium') return 'Medium';
    if (text === 'Hard')   return 'Hard';
  }

  return 'Medium';
}

export function extractTags() {
  const tags = new Set();

  const tagSelectors = [
    'a[href*="/tag/"]',
    '[class*="topics"] span',
    '[class*="tag"]',
  ];

  for (const sel of tagSelectors) {
    const els = document.querySelectorAll(sel);
    for (const el of els) {
      const text = el.textContent?.trim();
      if (text && text.length < 40 && text.length > 2) {
        tags.add(text);
      }
    }
  }

  return Array.from(tags);
}

export function extractProblemId() {
  const title = extractProblemTitle();
  const match = title.match(/^(\d+)\./);
  if (match) return parseInt(match[1], 10);

  const slug = getCurrentProblemSlug();
  const slugMatch = slug?.match(/^(\d+)/);
  if (slugMatch) return parseInt(slugMatch[1], 10);

  return null;
}

export function extractProblemDescription() {
  const selectors = [
    '[data-track-load="description_content"]',
    'div[class*="description"]',
    '.question-content',
  ];

  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (el?.textContent?.length > 50) {
      return el.textContent.slice(0, 1000).trim();
    }
  }

  return '';
}

// ─── Editor / Language Extraction ─────────────────────────────────────────────
// FIX: LeetCode 2025 uses a button with the language name in the editor toolbar.
// We use multiple strategies with a known-language whitelist to avoid false positives.

const KNOWN_LANGUAGES = [
  'C++', 'Java', 'Python', 'Python3', 'C', 'C#', 'JavaScript', 'TypeScript',
  'PHP', 'Swift', 'Kotlin', 'Dart', 'Go', 'Ruby', 'Scala', 'Rust',
  'Racket', 'Erlang', 'Elixir', 'MySQL', 'MSSQL', 'Oracle', 'Pandas',
];

export function extractSelectedLanguage() {
  // Strategy 1: LeetCode's current language selector button (most reliable)
  // It renders as a button in the editor toolbar with just the language name
  const allButtons = document.querySelectorAll('button');
  for (const btn of allButtons) {
    const text = btn.textContent?.trim();
    if (text && KNOWN_LANGUAGES.includes(text)) {
      return text;
    }
  }

  // Strategy 2: look for select/dropdown elements
  const selects = document.querySelectorAll('select');
  for (const sel of selects) {
    const val = sel.options[sel.selectedIndex]?.text?.trim();
    if (val && KNOWN_LANGUAGES.includes(val)) return val;
  }

  // Strategy 3: look for any element with a known language as its exact text
  const allEls = document.querySelectorAll('div, span, p');
  for (const el of allEls) {
    const text = el.childNodes.length === 1 ? el.textContent?.trim() : null;
    if (text && KNOWN_LANGUAGES.includes(text)) return text;
  }

  // Strategy 4: Monaco editor language mode
  if (window.monaco?.editor) {
    const models = window.monaco.editor.getModels();
    if (models.length > 0) {
      const langId = models[0].getLanguageId?.();
      if (langId) {
        // Map Monaco language IDs to display names
        const monacoMap = {
          cpp:        'C++',
          java:       'Java',
          python:     'Python3',
          javascript: 'JavaScript',
          typescript: 'TypeScript',
          csharp:     'C#',
          go:         'Go',
          rust:       'Rust',
          swift:      'Swift',
          kotlin:     'Kotlin',
          ruby:       'Ruby',
          scala:      'Scala',
          c:          'C',
          php:        'PHP',
        };
        if (monacoMap[langId]) return monacoMap[langId];
      }
    }
  }

  // Strategy 5: URL query param (?lang=cpp)
  const urlLang = new URLSearchParams(window.location.search).get('lang');
  if (urlLang) {
    const urlMap = {
      cpp: 'C++', java: 'Java', python: 'Python', python3: 'Python3',
      javascript: 'JavaScript', typescript: 'TypeScript', csharp: 'C#',
      go: 'Go', rust: 'Rust', swift: 'Swift', kotlin: 'Kotlin',
      ruby: 'Ruby', scala: 'Scala', c: 'C', php: 'PHP',
    };
    if (urlMap[urlLang]) return urlMap[urlLang];
  }

  return 'Unknown';
}

export function extractCodeFromEditor() {
  // Monaco editor (LeetCode uses Monaco)
  if (window.monaco?.editor) {
    const models = window.monaco.editor.getModels();
    if (models.length > 0) return models[0].getValue();
  }

  // CodeMirror fallback
  const cmLines = document.querySelectorAll('.CodeMirror-line');
  if (cmLines.length > 0) {
    return Array.from(cmLines).map((l) => l.textContent).join('\n');
  }

  // Textarea fallback
  const textarea = document.querySelector('textarea.inputarea');
  if (textarea) return textarea.value;

  return '';
}

// ─── Submission Detection ─────────────────────────────────────────────────────

export function isSubmissionAccepted() {
  const resultSelectors = [
    '[data-e2e-locator="submission-result"]',
    'span[class*="accepted"]',
    'div[class*="result"]',
  ];

  for (const sel of resultSelectors) {
    const el = document.querySelector(sel);
    if (el?.textContent?.toLowerCase().includes('accepted')) return true;
  }

  if (document.title.toLowerCase().includes('accepted')) return true;

  return false;
}

export function extractSubmissionStats() {
  const statsEl = document.querySelector('[class*="runtime-detail"], [class*="memory-detail"]');
  if (!statsEl) return { runtime: null, memory: null };

  const text = statsEl.textContent ?? '';
  const runtimeMatch = text.match(/(\d+)\s*ms/);
  const memoryMatch  = text.match(/([\d.]+)\s*MB/);

  return {
    runtime: runtimeMatch ? parseInt(runtimeMatch[1]) : null,
    memory:  memoryMatch  ? parseFloat(memoryMatch[1]) : null,
  };
}

// ─── Full Page Data ───────────────────────────────────────────────────────────

export function extractFullProblemData() {
  return {
    titleSlug:   getCurrentProblemSlug(),
    title:       extractProblemTitle(),
    difficulty:  extractDifficulty(),
    tags:        extractTags(),
    leetcodeId:  extractProblemId(),
    description: extractProblemDescription(),
    language:    extractSelectedLanguage(),
    url:         window.location.href,
  };
}