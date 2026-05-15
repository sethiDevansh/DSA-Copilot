import React, { useState } from 'react';
import { aiService } from '../../../shared/services/aiService.js';
import { extractCodeFromEditor } from '../../../shared/services/leetcodeParser.js';

const HINT_LEVELS = [
  { level: 1, label: 'Gentle Nudge',   desc: 'A subtle direction to think in', color: '#4ade80' },
  { level: 2, label: 'Think About...', desc: 'Data structure or approach hint', color: '#a3e635' },
  { level: 3, label: 'Algorithm Hint', desc: 'The pattern or algorithm name',   color: '#fbbf24' },
  { level: 4, label: 'Key Steps',      desc: 'Main implementation steps',       color: '#fb923c' },
  { level: 5, label: 'Near Solution',  desc: 'Detailed guidance (last resort)', color: '#f87171' },
];

export function HintsPanel({ problem }) {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [hints, setHints]               = useState({});
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState(null);

  async function fetchHint(level) {
    if (hints[level]) return; // Already fetched
    setLoading(true);
    setError(null);
    try {
      const code = extractCodeFromEditor();
      const hint = await aiService.getHint({ problem, level, code });
      setHints((prev) => ({ ...prev, [level]: hint }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function revealNextHint() {
    const nextLevel = currentLevel + 1;
    if (nextLevel > 5) return;
    setCurrentLevel(nextLevel);
    await fetchHint(nextLevel);
  }

  function resetHints() {
    setCurrentLevel(0);
    setHints({});
    setError(null);
  }

  const current = HINT_LEVELS[currentLevel - 1];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Hint Level Indicator */}
      <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid rgba(255,255,255,0.05)', flexShrink: 0 }}>
        <div style={{ fontSize: 10, color: '#52526d', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>
          Hint Progression
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {HINT_LEVELS.map((h, i) => (
            <div key={h.level} style={{
              flex: 1, height: 5, borderRadius: 99,
              background: i < currentLevel ? h.color : 'rgba(255,255,255,0.06)',
              transition: 'background 0.3s ease',
            }} />
          ))}
        </div>
        {current && (
          <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{
              fontSize: 10, padding: '2px 7px', borderRadius: 99, fontWeight: 600,
              background: `${current.color}20`, color: current.color,
              border: `1px solid ${current.color}40`,
            }}>
              Level {currentLevel}/5
            </span>
            <span style={{ fontSize: 11, color: '#9b9bba' }}>{current.label}</span>
          </div>
        )}
      </div>

      {/* Hint Content Area */}
      <div style={{ flex: 1, overflow: 'auto', padding: '14px 16px' }}>
        {currentLevel === 0 && (
          <div style={{ textAlign: 'center', paddingTop: 40 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>◈</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#9b9bba', marginBottom: 6 }}>
              Stuck on this problem?
            </div>
            <div style={{ fontSize: 12, color: '#52526d', lineHeight: 1.6, marginBottom: 20 }}>
              Get gradual hints without spoiling the solution.
              Each hint reveals a bit more.
            </div>
            <div style={{ textAlign: 'left', marginBottom: 16 }}>
              {HINT_LEVELS.map((h) => (
                <div key={h.level} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.04)',
                }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                    background: `${h.color}15`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 700, color: h.color,
                  }}>
                    {h.level}
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#9b9bba' }}>{h.label}</div>
                    <div style={{ fontSize: 10, color: '#52526d' }}>{h.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Revealed hints */}
        {Array.from({ length: currentLevel }, (_, i) => i + 1).map((level) => (
          <div key={level} style={{
            marginBottom: 16,
            padding: 14,
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 10,
            borderLeft: `3px solid ${HINT_LEVELS[level-1]?.color}`,
          }}>
            <div style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
              color: HINT_LEVELS[level-1]?.color,
              marginBottom: 8, textTransform: 'uppercase',
            }}>
              {HINT_LEVELS[level-1]?.label}
            </div>
            {hints[level] ? (
              <div style={{
                fontSize: 13, color: '#c4c4d8', lineHeight: 1.7,
                whiteSpace: 'pre-wrap',
              }}>
                {hints[level]}
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', color: '#52526d', fontSize: 12 }}>
                <span className="animate-pulse">●</span> Generating...
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div style={{
            padding: 14, background: 'rgba(9,210,245,0.04)',
            border: '1px solid rgba(9,210,245,0.12)',
            borderRadius: 10, marginBottom: 16,
          }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: '#09d2f5', fontSize: 12 }}>
              <span>◈</span>
              <span>AI is thinking<span style={{ animation: 'ellipsis 1.5s infinite' }}>...</span></span>
            </div>
          </div>
        )}

        {error && (
          <div style={{
            padding: 12, background: 'rgba(239,68,68,0.06)',
            border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: 8, fontSize: 12, color: '#f87171', marginBottom: 12,
          }}>
            {error.includes('API key') ? (
              <span>
                No API key configured.{' '}
                <button
                  onClick={() => chrome.runtime.sendMessage({ type: 'OPEN_DASHBOARD' })}
                  style={{ background: 'none', border: 'none', color: '#09d2f5', cursor: 'pointer', fontSize: 12 }}
                >
                  Open settings →
                </button>
              </span>
            ) : error}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.05)', flexShrink: 0, display: 'flex', gap: 8 }}>
        {currentLevel < 5 && (
          <button
            onClick={revealNextHint}
            disabled={loading || !problem}
            style={{
              flex: 1,
              padding: '10px 16px',
              background: loading ? 'rgba(9,210,245,0.08)' : 'linear-gradient(135deg, #09d2f5, #0093bb)',
              color: loading ? '#09d2f5' : '#000',
              border: 'none',
              borderRadius: 8,
              fontWeight: 700,
              fontSize: 13,
              cursor: loading ? 'default' : 'pointer',
              transition: 'all 0.2s ease',
              fontFamily: 'DM Sans, sans-serif',
            }}
          >
            {currentLevel === 0 ? '◈ Get First Hint' : `▼ Next Hint (Level ${currentLevel + 1})`}
          </button>
        )}
        {currentLevel > 0 && (
          <button
            onClick={resetHints}
            style={{
              padding: '10px 14px',
              background: 'transparent',
              color: '#52526d',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 12,
              fontFamily: 'DM Sans, sans-serif',
            }}
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
