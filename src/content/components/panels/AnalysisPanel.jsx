import React, { useState } from 'react';
import { aiService } from '../../../shared/services/aiService.js';
import { extractCodeFromEditor, extractSelectedLanguage } from '../../../shared/services/leetcodeParser.js';

export function AnalysisPanel({ problem }) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [mode, setMode]         = useState('analysis'); // 'analysis' | 'explain' | 'patterns'

  async function analyze() {
    setLoading(true);
    setError(null);
    setAnalysis(null);
    try {
      const code     = extractCodeFromEditor();
      const language = extractSelectedLanguage();
      if (!code?.trim()) throw new Error('No code found in editor. Write your solution first.');

      let result;
      if (mode === 'analysis') {
        result = await aiService.analyzeSolution({ problem, code, language });
      } else if (mode === 'explain') {
        result = await aiService.explainSolution({ problem, code, language });
      } else {
        const r = await aiService.detectPatterns({ problem, code });
        result = r.explanation + '\n\nPatterns: ' + (r.patterns?.join(', ') ?? 'None detected');
      }

      setAnalysis(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const MODES = [
    { id: 'analysis', label: 'Analyze',  icon: '⚡' },
    { id: 'explain',  label: 'Explain',  icon: '📖' },
    { id: 'patterns', label: 'Patterns', icon: '◈' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Mode Selector */}
      <div style={{
        padding: '10px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', gap: 4,
        flexShrink: 0,
      }}>
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => { setMode(m.id); setAnalysis(null); }}
            style={{
              flex: 1, padding: '7px 8px',
              background: mode === m.id ? 'rgba(9,210,245,0.1)' : 'transparent',
              border: mode === m.id ? '1px solid rgba(9,210,245,0.3)' : '1px solid rgba(255,255,255,0.06)',
              borderRadius: 7,
              color: mode === m.id ? '#09d2f5' : '#52526d',
              cursor: 'pointer',
              fontSize: 11, fontWeight: 600,
              fontFamily: 'DM Sans, sans-serif',
              transition: 'all 0.15s ease',
            }}
          >
            {m.icon} {m.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '14px 16px' }}>
        {!analysis && !loading && !error && (
          <div style={{ textAlign: 'center', paddingTop: 30 }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>⚡</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#9b9bba', marginBottom: 6 }}>
              {mode === 'analysis'  ? 'AI Solution Analyzer'  :
               mode === 'explain'   ? 'Solution Explainer'    :
                                      'Pattern Detector'}
            </div>
            <div style={{ fontSize: 11, color: '#52526d', lineHeight: 1.6 }}>
              {mode === 'analysis'
                ? 'Get complexity analysis, edge cases, and optimization suggestions.'
                : mode === 'explain'
                ? 'Get a step-by-step explanation with a dry run example.'
                : 'Identify the algorithmic patterns in your solution.'}
            </div>
          </div>
        )}

        {loading && (
          <div style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            paddingTop: 40, gap: 12,
          }}>
            <div style={{
              width: 36, height: 36,
              border: '2px solid rgba(9,210,245,0.2)',
              borderTop: '2px solid #09d2f5',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }} />
            <div style={{ fontSize: 12, color: '#52526d' }}>Analyzing your solution...</div>
          </div>
        )}

        {error && (
          <div style={{
            padding: 14, background: 'rgba(239,68,68,0.06)',
            border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: 10, fontSize: 12, color: '#f87171',
          }}>
            ⚠ {error}
            {error.includes('API key') && (
              <div style={{ marginTop: 8 }}>
                <button
                  onClick={() => chrome.runtime.sendMessage({ type: 'OPEN_DASHBOARD' })}
                  style={{ background: 'none', border: 'none', color: '#09d2f5', cursor: 'pointer', fontSize: 12, padding: 0 }}
                >
                  Configure API key in settings →
                </button>
              </div>
            )}
          </div>
        )}

        {analysis && (
          <div style={{
            fontSize: 12, color: '#c4c4d8', lineHeight: 1.8,
            whiteSpace: 'pre-wrap',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 10,
            padding: 14,
          }}>
            {analysis}
          </div>
        )}
      </div>

      {/* Action Button */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.05)', flexShrink: 0 }}>
        <button
          onClick={analyze}
          disabled={loading}
          style={{
            width: '100%',
            padding: '11px 16px',
            background: loading ? 'rgba(9,210,245,0.08)' : 'linear-gradient(135deg, #09d2f5, #0093bb)',
            color: loading ? '#09d2f5' : '#000',
            border: 'none', borderRadius: 8,
            fontWeight: 700, fontSize: 13,
            cursor: loading ? 'default' : 'pointer',
            fontFamily: 'DM Sans, sans-serif',
          }}
        >
          {loading ? 'Analyzing...' :
           analysis ? '↺ Re-analyze' :
           mode === 'analysis'  ? '⚡ Analyze My Solution' :
           mode === 'explain'   ? '📖 Explain Solution'    :
                                  '◈ Detect Patterns'}
        </button>
      </div>
    </div>
  );
}
