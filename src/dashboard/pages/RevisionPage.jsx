import React, { useState } from 'react';
import useAppStore from '../../shared/store/useAppStore.js';
import { formatDate, getLeetCodeProblemURL } from '../../shared/utils/index.js';
import { MASTERY_LEVELS, SPACED_REPETITION_INTERVALS } from '../../shared/constants/index.js';

const QUALITY_OPTIONS = [
  { value: 0, label: 'Forgot',     color: '#f87171', desc: 'Complete blackout' },
  { value: 2, label: 'Hard',       color: '#fb923c', desc: 'Significant effort' },
  { value: 4, label: 'Good',       color: '#4ade80', desc: 'Correct with effort' },
  { value: 5, label: 'Perfect',    color: '#09d2f5', desc: 'Instant recall' },
];

const MASTERY_COLORS = ['#52526d', '#f59e0b', '#38bdf8', '#4ade80', '#a78bfa', '#09d2f5'];

function MasteryBadge({ level }) {
  const m = Object.values(MASTERY_LEVELS).find(m => m.value === level) ?? MASTERY_LEVELS.NEW;
  return (
    <span style={{
      fontSize: 10, padding: '2px 8px', borderRadius: 99, fontWeight: 600,
      background: `${MASTERY_COLORS[level] ?? '#52526d'}15`,
      color: MASTERY_COLORS[level] ?? '#52526d',
      border: `1px solid ${MASTERY_COLORS[level] ?? '#52526d'}30`,
    }}>{m.label}</span>
  );
}

export function RevisionPage() {
  const { dueRevisions, problems, markRevisionDone, loadProblems } = useAppStore();
  const [reviewingId, setReviewingId] = useState(null);
  const [done, setDone]               = useState(new Set());

  const upcoming = problems
    .filter(p => {
      const today  = new Date().toISOString().split('T')[0];
      const future = new Date();
      future.setDate(future.getDate() + 7);
      return p.nextRevisionAt > today && p.nextRevisionAt <= future.toISOString().split('T')[0] && !dueRevisions.find(d => d.id === p.id);
    })
    .slice(0, 10);

  async function handleQuality(id, quality) {
    await markRevisionDone(id, quality);
    setDone(prev => new Set([...prev, id]));
    setReviewingId(null);
  }

  const pendingDue = dueRevisions.filter(p => !done.has(p.id));

  return (
    <div style={{ padding: '32px 36px', maxWidth: 900 }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, color: '#52526d', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>Spaced Repetition</div>
        <h1 style={{ fontSize: 28, fontWeight: 700, fontFamily: 'Space Mono, monospace', color: '#e8e8f2', margin: 0 }}>Revision Queue</h1>
        <p style={{ color: '#52526d', fontSize: 13, marginTop: 6 }}>
          Based on the SM-2 spaced repetition algorithm — Day 1 → 3 → 7 → 15 → 30 → 60
        </p>
      </div>

      {/* System explanation */}
      <div style={{
        padding: '16px 20px', marginBottom: 24,
        background: 'rgba(9,210,245,0.04)',
        border: '1px solid rgba(9,210,245,0.15)',
        borderRadius: 12, display: 'flex', gap: 16, alignItems: 'center',
      }}>
        <div style={{ fontSize: 28, flexShrink: 0 }}>◈</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#09d2f5', marginBottom: 3 }}>
            How Spaced Repetition Works
          </div>
          <div style={{ fontSize: 12, color: '#737394', lineHeight: 1.6 }}>
            Problems are scheduled for review at increasing intervals. Rate your recall after each review
            to adapt the schedule. Easy recalls push the next review further; hard recalls bring it closer.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          {SPACED_REPETITION_INTERVALS.map((d, i) => (
            <div key={d} style={{
              padding: '4px 8px', borderRadius: 6, textAlign: 'center',
              background: `rgba(9,210,245,${0.05 + i * 0.04})`,
              border: '1px solid rgba(9,210,245,0.15)',
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#09d2f5', fontFamily: 'monospace' }}>D{d}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Due Now */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <div style={{ fontSize: 11, color: '#52526d', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Due Today
          </div>
          {pendingDue.length > 0 && (
            <span style={{
              fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99,
              background: 'rgba(251,191,36,0.12)', color: '#fbbf24',
              border: '1px solid rgba(251,191,36,0.25)',
            }}>{pendingDue.length} remaining</span>
          )}
          {done.size > 0 && (
            <span style={{
              fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99,
              background: 'rgba(74,222,128,0.1)', color: '#4ade80',
              border: '1px solid rgba(74,222,128,0.2)',
            }}>{done.size} done ✓</span>
          )}
        </div>

        {pendingDue.length === 0 && dueRevisions.length === 0 && (
          <div style={{
            padding: '36px 24px', textAlign: 'center',
            background: 'rgba(74,222,128,0.04)',
            border: '1px solid rgba(74,222,128,0.15)',
            borderRadius: 16, marginBottom: 14,
          }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>🎉</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#4ade80', marginBottom: 4 }}>
              All caught up!
            </div>
            <div style={{ fontSize: 12, color: '#52526d' }}>No revisions due today. Keep solving new problems!</div>
          </div>
        )}

        {pendingDue.length === 0 && done.size > 0 && (
          <div style={{
            padding: '28px 24px', textAlign: 'center',
            background: 'rgba(74,222,128,0.04)',
            border: '1px solid rgba(74,222,128,0.15)',
            borderRadius: 16, marginBottom: 14,
          }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>✓</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#4ade80' }}>
              Session complete — {done.size} problem{done.size > 1 ? 's' : ''} reviewed!
            </div>
          </div>
        )}

        {pendingDue.map((p) => (
          <div key={p.id} style={{
            marginBottom: 8,
            background: 'rgba(20,20,24,0.8)',
            border: reviewingId === p.id ? '1px solid rgba(9,210,245,0.25)' : '1px solid rgba(255,255,255,0.07)',
            borderRadius: 14, overflow: 'hidden',
            transition: 'border-color 0.2s ease',
          }}>
            {/* Problem header */}
            <div style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <a
                    href={p.url || getLeetCodeProblemURL(p.titleSlug)}
                    target="_blank" rel="noopener noreferrer"
                    style={{ fontSize: 14, fontWeight: 600, color: '#c4c4d8', textDecoration: 'none' }}
                  >
                    {p.title}
                  </a>
                  <span style={{
                    fontSize: 10, padding: '2px 7px', borderRadius: 99, fontWeight: 600,
                    background: p.difficulty === 'Easy' ? 'rgba(74,222,128,0.1)' : p.difficulty === 'Medium' ? 'rgba(251,146,60,0.1)' : 'rgba(239,68,68,0.1)',
                    color: p.difficulty === 'Easy' ? '#4ade80' : p.difficulty === 'Medium' ? '#fb923c' : '#f87171',
                  }}>{p.difficulty}</span>
                  <MasteryBadge level={p.masteryLevel ?? 0} />
                </div>
                <div style={{ fontSize: 11, color: '#52526d' }}>
                  Review #{(p.reviewCount ?? 0) + 1} · Last solved {formatDate(p.solvedAt)}
                </div>
              </div>
              <button
                onClick={() => setReviewingId(reviewingId === p.id ? null : p.id)}
                style={{
                  padding: '8px 16px', borderRadius: 8,
                  background: reviewingId === p.id ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg, #09d2f5, #0093bb)',
                  color: reviewingId === p.id ? '#9b9bba' : '#000',
                  border: 'none', fontWeight: 700, fontSize: 12,
                  cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                }}
              >
                {reviewingId === p.id ? 'Cancel' : '↺ Review'}
              </button>
            </div>

            {/* Quality rating */}
            {reviewingId === p.id && (
              <div style={{
                padding: '14px 18px',
                borderTop: '1px solid rgba(255,255,255,0.06)',
                background: 'rgba(9,210,245,0.03)',
              }}>
                <div style={{ fontSize: 11, color: '#52526d', marginBottom: 10 }}>
                  How well did you recall this problem?
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {QUALITY_OPTIONS.map((q) => (
                    <button
                      key={q.value}
                      onClick={() => handleQuality(p.id, q.value)}
                      style={{
                        flex: 1, padding: '10px 8px',
                        background: `${q.color}10`,
                        border: `1px solid ${q.color}30`,
                        borderRadius: 9, cursor: 'pointer',
                        fontFamily: 'DM Sans, sans-serif',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = `${q.color}20`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = `${q.color}10`; e.currentTarget.style.transform = 'translateY(0)'; }}
                    >
                      <div style={{ fontSize: 13, fontWeight: 700, color: q.color, marginBottom: 2 }}>{q.label}</div>
                      <div style={{ fontSize: 10, color: '#52526d' }}>{q.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <div>
          <div style={{ fontSize: 11, color: '#52526d', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 14 }}>
            Upcoming (Next 7 Days)
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {upcoming.map((p) => (
              <div key={p.id} style={{
                padding: '13px 18px', display: 'flex', alignItems: 'center', gap: 12,
                background: 'rgba(20,20,24,0.5)',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: 12,
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#9b9bba' }}>{p.title}</div>
                  <div style={{ fontSize: 11, color: '#52526d', marginTop: 2 }}>Due: {formatDate(p.nextRevisionAt)}</div>
                </div>
                <MasteryBadge level={p.masteryLevel ?? 0} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
