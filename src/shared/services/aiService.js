/**
 * aiService — Modular, provider-agnostic AI integration layer.
 *
 * Supports:
 *   - OpenAI GPT-4o-mini
 *   - Google Gemini 1.5 Flash
 *   - Groq (free, fast, OpenAI-compatible)
 */

import { AI_PROVIDERS } from '../constants/index.js';

// ─── Provider Adapters ────────────────────────────────────────────────────────

const openAIAdapter = {
  async complete({ apiKey, model = 'llama-3.3-70b-versatile', messages, maxTokens = 1024, temperature = 0.7 }) {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ model, messages, max_tokens: maxTokens, temperature }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message ?? `API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content ?? '';
  },
};

const geminiAdapter = {
  async complete({ apiKey, model = 'gemini-1.5-flash', messages, maxTokens = 1024 }) {
    const systemMsg = messages.find((m) => m.role === 'system');
    const userMsgs  = messages.filter((m) => m.role !== 'system');

    const contents = userMsgs.map((m, idx) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{
        text: idx === 0 && systemMsg
          ? `${systemMsg.content}\n\n---\n\n${m.content}`
          : m.content,
      }],
    }));

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          generationConfig: {
            maxOutputTokens: maxTokens,
            temperature: 0.7,
          },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message ?? `Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  },
};

const adapters = {
  [AI_PROVIDERS.OPENAI]: openAIAdapter,
  [AI_PROVIDERS.GEMINI]: geminiAdapter,
};

// ─── System Prompts ───────────────────────────────────────────────────────────

const SYSTEM_PROMPTS = {
  HINT: `You are a senior software engineer acting as a coding interview mentor.
Your role is to give GRADUAL hints — never give the full solution directly.
Guide the user step-by-step, asking them to think through each part.
Be Socratic. Encourage thinking.
Format your response in clear markdown with headers for each hint level.`,

  ANALYSIS: `You are a DSA performance analyst.
Analyze the user's solution and provide:
1. Time complexity (Big-O)
2. Space complexity
3. Correctness assessment
4. Edge cases that might fail
5. Optimization suggestions
6. Better approaches if they exist
Be specific, technical, and educational. Format clearly in markdown.`,

  PATTERN_DETECTION: `You are a DSA pattern expert.
Given a problem description and/or code, identify:
1. The primary algorithmic pattern(s) used
2. Why this pattern applies
3. Similar problems that use the same pattern
4. Pattern mastery tips
Respond in JSON format: { "patterns": [...], "explanation": "...", "similar_problems": [...] }`,

  MISTAKE_ANALYSIS: `You are a debugging and mistake analysis expert.
Analyze the user's code and submission history to identify:
1. Types of mistakes being made
2. Root cause of each mistake
3. How to avoid similar mistakes in the future
4. Practice recommendations
Be empathetic and educational. Format in clear markdown.`,

  INTERVIEW_FEEDBACK: `You are a FAANG senior engineer conducting a mock interview.
Give interview-style feedback on:
1. Problem understanding and clarification
2. Approach and algorithm choice
3. Code quality and readability
4. Time & space complexity awareness
5. Edge case handling
6. Communication (based on the notes provided)
Score each dimension 1-10 and give an overall interview rating.
Be honest but constructive.`,

  SOLUTION_EXPLAINER: `You are a CS professor explaining DSA solutions.
For the given problem and solution, provide:
1. Intuition behind the approach
2. Step-by-step dry run with a concrete example
3. Why this approach works
4. Complexity analysis
5. Variations and follow-up problems
Use clear language with examples. Format beautifully in markdown.`,

  RECOMMENDATION: `You are a personalized learning algorithm.
Based on the user's performance data, recommend:
1. Next problems to solve (with reasoning)
2. Topics to focus on
3. Patterns to practice
4. Estimated difficulty progression
Respond in JSON: { "problems": [...], "topics": [...], "reasoning": "..." }`,
};

// ─── Main Service ─────────────────────────────────────────────────────────────

async function getConfig() {
  const isChromeExtension = typeof chrome !== 'undefined' && chrome.storage?.local;
  if (isChromeExtension) {
    return new Promise((resolve) => {
      chrome.storage.local.get('dsa_copilot_ai_config', (result) => {
        resolve(result.dsa_copilot_ai_config ?? {});
      });
    });
  }
  const val = localStorage.getItem('dsa_copilot_ai_config');
  return val ? JSON.parse(val) : {};
}

function buildMessages(systemPrompt, userMessage) {
  return [
    { role: 'system', content: systemPrompt },
    { role: 'user',   content: userMessage },
  ];
}

async function complete(systemPrompt, userMessage, options = {}) {
  const config   = await getConfig();
  const provider = config.provider ?? AI_PROVIDERS.OPENAI;
  const apiKey   = config.apiKey   ?? '';

  if (!apiKey) {
    throw new Error('No API key configured. Please add your API key in DSA Copilot settings.');
  }

  const adapter = adapters[provider];
  if (!adapter) throw new Error(`Unknown AI provider: ${provider}`);

  const messages = buildMessages(systemPrompt, userMessage);
  return adapter.complete({ apiKey, messages, ...options });
}

// ─── Domain Methods ───────────────────────────────────────────────────────────

async function getHint({ problem, level, code }) {
  const prompt = `
Problem: ${problem.title}
Difficulty: ${problem.difficulty}
Tags: ${(problem.tags ?? []).join(', ')}
Description: ${problem.description ?? 'Not provided'}

Hint Level Requested: ${level}/5
${code ? `User's Current Code:\n\`\`\`\n${code}\n\`\`\`` : ''}

Provide hint level ${level}. Level 1 = very subtle nudge (think about data structure).
Level 3 = approach/algorithm name. Level 5 = near-complete guidance without full code.
  `.trim();

  return complete(SYSTEM_PROMPTS.HINT, prompt);
}

async function analyzeSolution({ problem, code, language }) {
  const prompt = `
Problem: ${problem.title} (${problem.difficulty})
Tags: ${(problem.tags ?? []).join(', ')}
Language: ${language}

User's Solution:
\`\`\`${language?.toLowerCase() ?? ''}
${code}
\`\`\`

Analyze this solution comprehensively.
  `.trim();

  return complete(SYSTEM_PROMPTS.ANALYSIS, prompt);
}

async function detectPatterns({ problem, code }) {
  const prompt = `
Problem: ${problem.title}
Description: ${problem.description ?? ''}
Tags: ${(problem.tags ?? []).join(', ')}
${code ? `Code:\n\`\`\`\n${code}\n\`\`\`` : ''}
  `.trim();

  const raw = await complete(SYSTEM_PROMPTS.PATTERN_DETECTION, prompt, { maxTokens: 512 });
  try {
    const cleaned = raw.replace(/```json|```/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return { patterns: [], explanation: raw, similar_problems: [] };
  }
}

async function getInterviewFeedback({ problem, code, language, timeSpent, notes }) {
  const prompt = `
Problem: ${problem.title} (${problem.difficulty})
Time Spent: ${timeSpent} minutes
Language: ${language}
User Notes: ${notes ?? 'None provided'}

Solution:
\`\`\`${language?.toLowerCase() ?? ''}
${code}
\`\`\`

Give detailed interview feedback.
  `.trim();

  return complete(SYSTEM_PROMPTS.INTERVIEW_FEEDBACK, prompt, { maxTokens: 1500 });
}

async function explainSolution({ problem, code, language }) {
  const prompt = `
Problem: ${problem.title} (${problem.difficulty})
Language: ${language}

Solution to explain:
\`\`\`${language?.toLowerCase() ?? ''}
${code}
\`\`\`

Explain this solution as if teaching a student.
  `.trim();

  return complete(SYSTEM_PROMPTS.SOLUTION_EXPLAINER, prompt, { maxTokens: 2000 });
}

async function analyzeMistakes({ mistakes, problemHistory }) {
  const prompt = `
User's Mistake History (last 30 submissions):
${JSON.stringify(mistakes?.slice(-30), null, 2)}

Problem History Summary:
- Total problems: ${problemHistory?.length ?? 0}
- Easy: ${problemHistory?.filter(p => p.difficulty === 'Easy').length}
- Medium: ${problemHistory?.filter(p => p.difficulty === 'Medium').length}
- Hard: ${problemHistory?.filter(p => p.difficulty === 'Hard').length}

Analyze patterns in mistakes and provide actionable insights.
  `.trim();

  return complete(SYSTEM_PROMPTS.MISTAKE_ANALYSIS, prompt, { maxTokens: 1200 });
}

async function getRecommendations({ patternScores, weakTopics, recentProblems }) {
  const prompt = `
Pattern Mastery Scores: ${JSON.stringify(patternScores)}
Weak Topics: ${JSON.stringify(weakTopics)}
Recently Solved: ${(recentProblems ?? []).slice(-10).map(p => p.title).join(', ')}

Recommend next 5 problems to solve with reasoning.
  `.trim();

  const raw = await complete(SYSTEM_PROMPTS.RECOMMENDATION, prompt, { maxTokens: 800 });
  try {
    const cleaned = raw.replace(/```json|```/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return { problems: [], topics: [], reasoning: raw };
  }
}

export const aiService = {
  getHint,
  analyzeSolution,
  detectPatterns,
  getInterviewFeedback,
  explainSolution,
  analyzeMistakes,
  getRecommendations,
};