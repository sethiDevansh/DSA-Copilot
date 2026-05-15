import React, { useEffect, useState } from 'react';
import { problemService } from '../shared/services/problemService.js';
import { formatDate, getDifficultyColor, getLevel, getXPToNextLevel } from '../shared/utils/index.js';

export default function PopupApp() {
  const [stats,   setStats]   = useState(null);
  const [streak,  setStreak]  = useState(null);
  const [profile, setProfile] = useState(null);
  const [due,     setDue]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      problemService.getStats(),
      problemService.getStreak(),
      problemService.getUserProfile(),
      problemService.getDueForRevision(),
    ]).then(([s, str, prof, d]) => {
      setStats(s);
      setStreak(str);
      setProfile(prof);
      setDue(d);
      setLoading(false);
    });
  }, []);

  function openDashboard(hash = '') {
    chrome.runtime.sendMessage({ type: 'OPEN_DASHBOARD' });
    window.close();
  }

  function openLeetCode() {
    chrome.tabs.create({ url: 'https://leetcode.com/problemset/' });
    window.close();
  }

  const level    = profile ? getLevel(profile.xp) : null;
  const xpInfo   = profile ? getXPToNextLevel(profile.xp) : null;

  return (
    <div style={{
      width: 340, minHeight: 480,
      background: '#09090b',
      color: '#e8e8f2',
      fontFamily: "'DM Sans', sans-serif",
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 18px 14px',
        background: 'linear-gradient(180deg, rgba(9,210,245,0.08) 0%, transparent 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 9,
              background: 'linear-gradient(135deg, #09d2f5, #0093bb)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 700, color: '#000', fontFamily: 'monospace',
            }}>⟨/⟩</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, fontFamily: 'Space Mono, monospace', color: '#e8e8f2', lineHeight: 1.1 }}>
                DSA Copilot
              </div>
              <div style={{ fontSize: 10, color: '#52526d', letterSpacing: '0.07em', textTransform: 'uppercase' }}>
                Interview Prep Assistant
              </div>
            </div>
          </div>

          {/* Streak badge */}
          {streak?.current > 0 && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '5px 10px', borderRadius: 99,
              background: 'rgba(251,146,60,0.12)',
              border: '1px solid rgba(251,146,60,0.25)',
            }}>
              <span style={{ fontSize: 14 }}>🔥</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#fb923c' }}>{streak.current}</span>
              <span style={{ fontSize: 10, color: '#9b9bba' }}>day{streak.current !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        {/* XP Bar */}
        {level && xpInfo && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
              <span style={{ fontSize: 11, color: '#09d2f5', fontWeight: 600 }}>
                Lv.{level.level} {level.label}
              </span>
              <span style={{ fontSize: 10, color: '#52526d' }}>
                {profile.xp} / {level.minXP + xpInfo.needed} XP
              </span>
            </div>
            <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 99,
                width: `${xpInfo.progress}%`,
                background: 'linear-gradient(90deg, #09d2f5, #0093bb)',
                transition: 'width 0.6s ease',
              }} />
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#52526d', fontSize: 13 }}>
          Loading...
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div style={{ padding: '14px 18px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            {[
              { label: 'Total Solved', value: stats?.total ?? 0, color: '#e8e8f2' },
              { label: 'Easy',   value: stats?.byDifficulty?.Easy   ?? 0, color: '#4ade80' },
              { label: 'Medium', value: stats?.byDifficulty?.Medium ?? 0, color: '#fb923c' },
              { label: 'Hard',   value: stats?.byDifficulty?.Hard   ?? 0, color: '#f87171' },
              { label: 'Due Review', value: due.length, color: due.length > 0 ? '#fbbf24' : '#52526d' },
              { label: 'Bookmarks', value: stats?.bookmarked ?? 0, color: '#a78bfa' },
            ].map((s) => (
              <div key={s.label} style={{
                padding: '10px 10px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 10,
                textAlign: 'center',
              }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: s.color, fontFamily: 'Space Mono, monospace', lineHeight: 1 }}>
                  {s.value}
                </div>
                <div style={{ fontSize: 10, color: '#52526d', marginTop: 3 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Due Revisions Alert */}
          {due.length > 0 && (
            <div style={{ padding: '0 18px 12px' }}>
              <div style={{
                padding: '10px 14px',
                background: 'rgba(251,191,36,0.06)',
                border: '1px solid rgba(251,191,36,0.2)',
                borderRadius: 10,
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <span style={{ fontSize: 16 }}>⏰</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#fbbf24' }}>
                    {due.length} problem{due.length > 1 ? 's' : ''} due for revision
                  </div>
                  <div style={{ fontSize: 10, color: '#9b9bba' }}>
                    {due[0]?.title}{due.length > 1 ? ` + ${due.length - 1} more` : ''}
                  </div>
                </div>
                <button
                  onClick={() => openDashboard('#/revision')}
                  style={{
                    background: 'rgba(251,191,36,0.15)',
                    border: '1px solid rgba(251,191,36,0.3)',
                    borderRadius: 6, color: '#fbbf24',
                    cursor: 'pointer', fontSize: 11, fontWeight: 600,
                    padding: '4px 8px', fontFamily: 'DM Sans, sans-serif',
                  }}
                >
                  Review →
                </button>
              </div>
            </div>
          )}

          {/* Topic Breakdown */}
          {stats?.topicsArr?.length > 0 && (
            <div style={{ padding: '0 18px 12px' }}>
              <div style={{ fontSize: 10, color: '#52526d', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
                Top Topics
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {stats.topicsArr.slice(0, 4).map(({ topic, count }) => (
                  <div key={topic} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ fontSize: 11, color: '#9b9bba', width: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {topic}
                    </div>
                    <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: 99,
                        width: `${Math.min(100, (count / (stats.topicsArr[0]?.count ?? 1)) * 100)}%`,
                        background: 'linear-gradient(90deg, #09d2f5, #0093bb)',
                      }} />
                    </div>
                    <div style={{ fontSize: 11, color: '#52526d', width: 20, textAlign: 'right' }}>{count}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div style={{ padding: '0 18px 18px', display: 'flex', flexDirection: 'column', gap: 7 }}>
            <button
              onClick={() => openDashboard()}
              style={{
                width: '100%', padding: '11px 16px',
                background: 'linear-gradient(135deg, #09d2f5, #0093bb)',
                color: '#000', border: 'none', borderRadius: 10,
                fontWeight: 700, fontSize: 13, cursor: 'pointer',
                fontFamily: 'DM Sans, sans-serif',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
            >
              📊 Open Dashboard
            </button>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
              <button
                onClick={openLeetCode}
                style={{
                  padding: '9px 12px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 9, color: '#9b9bba',
                  cursor: 'pointer', fontSize: 12, fontWeight: 500,
                  fontFamily: 'DM Sans, sans-serif',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                }}
              >
                🔗 LeetCode
              </button>
              <button
                onClick={() => openDashboard('#/revision')}
                style={{
                  padding: '9px 12px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 9, color: '#9b9bba',
                  cursor: 'pointer', fontSize: 12, fontWeight: 500,
                  fontFamily: 'DM Sans, sans-serif',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                }}
              >
                📚 Revision
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
