import React, { useEffect, useState } from 'react';
import useAppStore from '../../shared/store/useAppStore.js';
import { interviewService } from '../../shared/services/interviewService.js';
import { formatDate } from '../../shared/utils/index.js';

const RATINGS = [1, 2, 3, 4, 5];

function ScoreRing({ score }) {
  const color =
    score >= 80 ? '#4ade80' :
    score >= 60 ? '#09d2f5' :
    score >= 40 ? '#fbbf24' : '#f87171';

  const r    = 22;
  const circ = 2 * Math.PI * r;
  const dash = circ - (score / 100) * circ;

  return (
    <div style={{ position: 'relative', width: 56, height: 56, flexShrink: 0 }}>
      <svg width={56} height={56} style={{ transform: 'rotate(-90deg)', position: 'absolute' }}>
        <circle cx={28} cy={28} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={5} />
        <circle
          cx={28} cy={28} r={r}
          fill="none"
          stroke={color}
          strokeWidth={5}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={dash}
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 12, fontWeight: 700, color, fontFamily: 'monospace',
      }}>
        {score}
      </div>
    </div>
  );
}

function SessionCard({ session, onDelete, onUpdateNotes }) {
  const [expanded, setExpanded] = useState(false);
  const [notes,    setNotes]    = useState(session.notes ?? '');
  const [rating,   setRating]   = useState(session.rating ?? null);
  const [saving,   setSaving]   = useState(false);

  const diffColor =
    session.problem?.difficulty === 'Easy'   ? '#4ade80' :
    session.problem?.difficulty === 'Medium' ? '#fb923c' : '#f87171';

  async function saveNotes() {
    setSaving(true);
    await interviewService.updateSessionNotes(session.id, notes, rating);
    onUpdateNotes?.();
    setSaving(false);
  }

  // Solved badge color
  const solvedColor  = session.solvedDuringSession ? '#4ade80' : '#f87171';
  const solvedLabel  = session.solvedDuringSession ? '✓ Solved' : '✗ Not Solved';
  const solvedBg     = session.solvedDuringSession ? 'rgba(74,222,128,0.1)' : 'rgba(239,68,68,0.1)';
  const solvedBorder = session.solvedDuringSession ? 'rgba(74,222,128,0.25)' : 'rgba(239,68,68,0.25)';

  return (
    <div style={{
      background:   'rgba(20,20,24,0.8)',
      border:       '1px solid rgba(255,255,255,0.07)',
      borderRadius: 16,
      overflow:     'hidden',
      transition:   'border-color 0.2s ease',
    }}>
      {/* ── Card Header ── always visible ──────────────────────────────── */}
      <div
        onClick={() => setExpanded((v) => !v)}
        style={{
          padding:    '18px 20px',
          cursor:     'pointer',
          display:    'flex',
          alignItems: 'center',
          gap:        16,
        }}
      >
        {/* Score ring */}
        <ScoreRing score={session.score ?? 0} />

        {/* Main info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#e8e8f2' }}>
              {session.problem?.title ?? 'No problem assigned'}
            </span>

            {/* Difficulty */}
            {session.problem?.difficulty && (
              <span style={{
                fontSize: 10, padding: '2px 7px', borderRadius: 99,
                fontWeight: 600,
                background: `${diffColor}15`,
                color:      diffColor,
                border:     `1px solid ${diffColor}30`,
              }}>
                {session.problem.difficulty}
              </span>
            )}

            {/* Solved during session — KEY NEW BADGE */}
            <span style={{
              fontSize:   10, padding: '2px 7px', borderRadius: 99, fontWeight: 600,
              background: solvedBg,
              color:      solvedColor,
              border:     `1px solid ${solvedBorder}`,
            }}>
              {solvedLabel}
            </span>

            {/* Within time */}
            <span style={{
              fontSize: 10, padding: '2px 7px', borderRadius: 99, fontWeight: 600,
              background: session.withinTime ? 'rgba(74,222,128,0.1)' : 'rgba(239,68,68,0.1)',
              color:      session.withinTime ? '#4ade80' : '#f87171',
              border:     `1px solid ${session.withinTime ? 'rgba(74,222,128,0.25)' : 'rgba(239,68,68,0.25)'}`,
            }}>
              {session.withinTime ? '⏱ In Time' : '⏱ Overtime'}
            </span>
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {[
              {
                icon:  '📅',
                label: formatDate(session.date),
              },
              {
                icon:  '⏱',
                label: `${session.elapsedMins}m / ${session.timeLimitMins}m`,
              },
              {
                icon:  '⊘',
                label: `${session.penalties} penalt${session.penalties === 1 ? 'y' : 'ies'}`,
                color: session.penalties > 0 ? '#f87171' : '#52526d',
              },
              {
                icon:  '⭐',
                label: session.rating ? `${session.rating}/5` : 'No rating',
                color: session.rating ? '#fbbf24' : '#52526d',
              },
            ].map((s) => (
              <span
                key={s.label}
                style={{
                  fontSize: 11,
                  color:    s.color ?? '#52526d',
                  display:  'flex',
                  alignItems: 'center',
                  gap:      4,
                }}
              >
                {s.icon} {s.label}
              </span>
            ))}
          </div>
        </div>

        {/* Expand arrow */}
        <span style={{
          fontSize:   12,
          color:      '#52526d',
          flexShrink: 0,
          transition: 'transform 0.2s',
          transform:  expanded ? 'rotate(180deg)' : 'rotate(0deg)',
        }}>
          ▼
        </span>
      </div>

      {/* ── Expanded Detail ─────────────────────────────────────────────── */}
      {expanded && (
        <div style={{ padding: '0 20px 20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>

          {/* Detailed stats grid — 4 columns × 2 rows */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, margin: '16px 0' }}>
            {[
              {
                label: 'Score',
                value: `${session.score ?? 0}/100`,
                color: (session.score ?? 0) >= 70 ? '#4ade80' : (session.score ?? 0) >= 40 ? '#fbbf24' : '#f87171',
              },
              {
                // FIX: Show whether problem was solved during the session
                label: 'Problem Solved',
                value: session.solvedDuringSession ? 'Yes ✓' : 'No ✗',
                color: session.solvedDuringSession ? '#4ade80' : '#f87171',
              },
              {
                label: 'Time Used',
                value: `${session.elapsedMins}m`,
                color: '#09d2f5',
              },
              {
                label: 'Time Limit',
                value: `${session.timeLimitMins}m`,
                color: '#9b9bba',
              },
              {
                label: 'Overtime',
                value: session.overtime > 0
                  ? `+${Math.round(session.overtime / 60)}m`
                  : 'None',
                color: session.overtime > 0 ? '#f87171' : '#4ade80',
              },
              {
                label: 'Penalties',
                value: session.penalties,
                color: session.penalties > 0 ? '#f87171' : '#4ade80',
              },
              {
                label: 'Date',
                value: formatDate(session.date),
                color: '#9b9bba',
              },
              {
                label: 'Started At',
                value: new Date(session.startTime).toLocaleTimeString([], {
                  hour:   '2-digit',
                  minute: '2-digit',
                }),
                color: '#9b9bba',
              },
            ].map((s) => (
              <div
                key={s.label}
                style={{
                  padding:    '10px 12px',
                  background: 'rgba(255,255,255,0.03)',
                  border:     '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 10,
                }}
              >
                <div style={{
                  fontSize:       10,
                  color:          '#52526d',
                  textTransform:  'uppercase',
                  letterSpacing:  '0.08em',
                  marginBottom:   4,
                }}>
                  {s.label}
                </div>
                <div style={{
                  fontSize:   15,
                  fontWeight: 700,
                  color:      s.color,
                  fontFamily: 'monospace',
                }}>
                  {s.value}
                </div>
              </div>
            ))}
          </div>

          {/* Score explanation */}
          <div style={{
            padding:      '10px 14px',
            marginBottom: 16,
            background:   session.solvedDuringSession
              ? 'rgba(74,222,128,0.05)'
              : 'rgba(239,68,68,0.05)',
            border: `1px solid ${session.solvedDuringSession
              ? 'rgba(74,222,128,0.15)'
              : 'rgba(239,68,68,0.15)'}`,
            borderRadius: 10,
            fontSize:     12,
            color:        '#737394',
            lineHeight:   1.6,
          }}>
            {session.solvedDuringSession
              ? `✓ Problem was solved during the session. Score calculated from time used, penalties, and whether you finished within the limit.`
              : `✗ Problem was not solved during the session. Maximum possible score is 10. Solve the problem within the time limit to earn full score.`
            }
          </div>

          {/* Problem tags */}
          {session.problem?.tags?.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{
                fontSize:      10,
                color:         '#52526d',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom:  8,
              }}>
                Topics
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {session.problem.tags.map((t) => (
                  <span
                    key={t}
                    style={{
                      fontSize:   11,
                      padding:    '3px 9px',
                      borderRadius: 99,
                      background: 'rgba(9,210,245,0.06)',
                      border:     '1px solid rgba(9,210,245,0.15)',
                      color:      '#09d2f5',
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Self rating */}
          <div style={{ marginBottom: 16 }}>
            <div style={{
              fontSize:      10,
              color:         '#52526d',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom:  8,
            }}>
              Self Rating
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              {RATINGS.map((r) => (
                <button
                  key={r}
                  onClick={() => setRating(r)}
                  style={{
                    width:        36,
                    height:       36,
                    borderRadius: 8,
                    background:   rating === r ? 'rgba(251,191,36,0.15)' : 'rgba(255,255,255,0.04)',
                    border:       rating === r ? '1px solid rgba(251,191,36,0.4)' : '1px solid rgba(255,255,255,0.08)',
                    color:        rating === r ? '#fbbf24' : '#52526d',
                    cursor:       'pointer',
                    fontSize:     14,
                    display:      'flex',
                    alignItems:   'center',
                    justifyContent: 'center',
                  }}
                >
                  ★
                </button>
              ))}
              {rating && (
                <span style={{ fontSize: 11, color: '#fbbf24', marginLeft: 4 }}>
                  {rating}/5
                </span>
              )}
            </div>
          </div>

          {/* Post-interview notes */}
          <div style={{ marginBottom: 14 }}>
            <div style={{
              fontSize:      10,
              color:         '#52526d',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom:  8,
            }}>
              Post-interview Notes
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What went well? What would you do differently? Any patterns you noticed?"
              rows={3}
              style={{
                width:        '100%',
                background:   'rgba(255,255,255,0.03)',
                border:       '1px solid rgba(255,255,255,0.08)',
                borderRadius: 10,
                color:        '#c4c4d8',
                fontSize:     12,
                lineHeight:   1.7,
                padding:      '10px 12px',
                resize:       'vertical',
                outline:      'none',
                fontFamily:   'DM Sans, sans-serif',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#09d2f5')}
              onBlur={(e)  => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
            />
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {/* Save notes */}
            <button
              onClick={saveNotes}
              disabled={saving}
              style={{
                padding:    '8px 18px',
                background: 'linear-gradient(135deg, #09d2f5, #0093bb)',
                color:      '#000',
                border:     'none',
                borderRadius: 8,
                fontWeight: 700,
                fontSize:   12,
                cursor:     saving ? 'default' : 'pointer',
                fontFamily: 'DM Sans, sans-serif',
                opacity:    saving ? 0.7 : 1,
              }}
            >
              {saving ? 'Saving...' : '💾 Save Notes'}
            </button>

            {/* FIX: Corrected stray <a> tag — was missing closing properly */}
            {session.problem?.url && (
              
                <a href={session.problem.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding:        '8px 18px',
                  background:     'rgba(9,210,245,0.08)',
                  border:         '1px solid rgba(9,210,245,0.2)',
                  borderRadius:   8,
                  color:          '#09d2f5',
                  fontSize:       12,
                  fontWeight:     600,
                  textDecoration: 'none',
                  display:        'flex',
                  alignItems:     'center',
                  gap:            5,
                }}
              >
                🔗 Open Problem
              </a>
            )}

            {/* Delete */}
            <button
              onClick={() => onDelete(session.id)}
              style={{
                padding:      '8px 14px',
                background:   'rgba(239,68,68,0.08)',
                border:       '1px solid rgba(239,68,68,0.2)',
                borderRadius: 8,
                color:        '#f87171',
                cursor:       'pointer',
                fontSize:     12,
                fontFamily:   'DM Sans, sans-serif',
                marginLeft:   'auto',
              }}
            >
              🗑 Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function InterviewHistoryPage() {
  const { interviewHistory, loadInterviewHistory } = useAppStore();
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      await loadInterviewHistory();
      const s = await interviewService.getStats();
      setStats(s);
      setLoading(false);
    }
    load();
  }, []);

  async function handleDelete(id) {
    if (!confirm('Delete this interview session?')) return;
    await interviewService.deleteSession(id);
    await loadInterviewHistory();
    const s = await interviewService.getStats();
    setStats(s);
  }

  async function handleUpdateNotes() {
    await loadInterviewHistory();
  }

  if (loading) {
    return (
      <div style={{ padding: '32px 36px', color: '#52526d', fontSize: 13 }}>
        Loading interview history...
      </div>
    );
  }

  return (
    <div style={{ padding: '32px 36px', maxWidth: 1000 }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{
          fontSize:      11,
          color:         '#52526d',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          marginBottom:  6,
        }}>
          Interview Mode
        </div>
        <h1 style={{
          fontSize:   28,
          fontWeight: 700,
          fontFamily: 'Space Mono, monospace',
          color:      '#e8e8f2',
          margin:     0,
        }}>
          Interview History
        </h1>
        <p style={{ color: '#52526d', fontSize: 13, marginTop: 6 }}>
          All past mock interview sessions with detailed performance analysis
        </p>
      </div>

      {/* Stats overview — 6 cards including Solve Rate */}
      {stats && (
        <div style={{
          display:             'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap:                 12,
          marginBottom:        28,
        }}>
          {[
            {
              label: 'Total Sessions',
              value: stats.total,
              color: '#09d2f5',
            },
            {
              label: 'Avg Score',
              value: `${stats.avgScore}/100`,
              color: stats.avgScore >= 70 ? '#4ade80' : stats.avgScore >= 40 ? '#fbbf24' : '#f87171',
            },
            {
              // FIX: Show solve rate (how often problem was solved during session)
              label: 'Solve Rate',
              value: `${stats.solveRate ?? 0}%`,
              color: (stats.solveRate ?? 0) >= 60 ? '#4ade80' : (stats.solveRate ?? 0) >= 30 ? '#fbbf24' : '#f87171',
            },
            {
              label: 'Completion Rate',
              value: `${stats.completionRate}%`,
              color: '#a78bfa',
            },
            {
              label: 'Avg Time',
              value: `${stats.avgTimeMins}m`,
              color: '#38bdf8',
            },
            {
              label: 'Avg Penalties',
              value: stats.avgPenalties,
              color: stats.avgPenalties > 1 ? '#f87171' : '#4ade80',
            },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                padding:    '18px 20px',
                background: 'rgba(20,20,24,0.8)',
                border:     '1px solid rgba(255,255,255,0.07)',
                borderRadius: 14,
                textAlign:  'center',
              }}
            >
              <div style={{
                fontSize:   24,
                fontWeight: 700,
                color:      s.color,
                fontFamily: 'Space Mono, monospace',
                marginBottom: 4,
              }}>
                {s.value}
              </div>
              <div style={{
                fontSize:      10,
                color:         '#52526d',
                textTransform: 'uppercase',
                letterSpacing: '0.07em',
              }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Difficulty breakdown */}
      {stats?.byDifficulty && (
        <div style={{
          display:             'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap:                 10,
          marginBottom:        24,
        }}>
          {[
            { label: 'Easy',   value: stats.byDifficulty.Easy   ?? 0, color: '#4ade80' },
            { label: 'Medium', value: stats.byDifficulty.Medium ?? 0, color: '#fb923c' },
            { label: 'Hard',   value: stats.byDifficulty.Hard   ?? 0, color: '#f87171' },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                padding:      '14px 18px',
                background:   'rgba(20,20,24,0.6)',
                border:       '1px solid rgba(255,255,255,0.06)',
                borderRadius: 12,
                display:      'flex',
                alignItems:   'center',
                gap:          12,
              }}
            >
              <span style={{ fontSize: 22, fontWeight: 700, color: s.color, fontFamily: 'monospace' }}>
                {s.value}
              </span>
              <span style={{ fontSize: 12, color: '#52526d' }}>
                {s.label} problems attempted
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Session list */}
      {interviewHistory.length === 0 ? (
        <div style={{
          padding:      '60px 24px',
          textAlign:    'center',
          background:   'rgba(20,20,24,0.5)',
          border:       '1px solid rgba(255,255,255,0.06)',
          borderRadius: 16,
        }}>
          <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.2 }}>⏱</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#52526d', marginBottom: 8 }}>
            No interview sessions yet
          </div>
          <div style={{ fontSize: 12, color: '#3d3d52' }}>
            Complete a mock interview to see your performance history here.
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {interviewHistory.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              onDelete={handleDelete}
              onUpdateNotes={handleUpdateNotes}
            />
          ))}
        </div>
      )}
    </div>
  );
}