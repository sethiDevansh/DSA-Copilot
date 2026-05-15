import React, { useEffect } from 'react';
import useAppStore from '../../shared/store/useAppStore.js';
import { MISTAKE_TYPES } from '../../shared/constants/index.js';
import { formatDate } from '../../shared/utils/index.js';

export function MistakesPage() {
  const { mistakes, mistakeStats, loadMistakes } = useAppStore();

  useEffect(() => { loadMistakes(); }, []);

  return (
    <div style={{ padding: '32px 36px', maxWidth: 1000 }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, color: '#52526d', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>Mistake Tracker</div>
        <h1 style={{ fontSize: 28, fontWeight: 700, fontFamily: 'Space Mono, monospace', color: '#e8e8f2', margin: 0 }}>Mistake Analytics</h1>
        <p style={{ color: '#52526d', fontSize: 13, marginTop: 6 }}>Identify recurring patterns in your mistakes to improve faster</p>
      </div>

      {/* Mistake type breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14, marginBottom: 28 }}>
        {MISTAKE_TYPES.map((type) => {
          const count = mistakeStats?.byType?.[type.id] ?? 0;
          const maxCount = Math.max(...Object.values(mistakeStats?.byType ?? {}), 1);
          return (
            <div key={type.id} style={{
              padding: '16px 18px',
              background: 'rgba(20,20,24,0.8)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 14, display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                background: `${type.color}12`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, color: type.color, fontWeight: 700,
                fontFamily: 'monospace',
                border: `1px solid ${type.color}25`,
              }}>{type.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#c4c4d8' }}>{type.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: count > 0 ? type.color : '#3d3d52', fontFamily: 'monospace' }}>
                    {count}
                  </span>
                </div>
                <div style={{ height: 3, background: 'rgba(255,255,255,0.05)', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 99,
                    width: `${Math.round((count / maxCount) * 100)}%`,
                    background: type.color,
                    transition: 'width 0.8s ease',
                  }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Top insight */}
      {mistakeStats?.topMistakes?.[0] && (
        <div style={{
          padding: '18px 20px', marginBottom: 24,
          background: 'rgba(239,68,68,0.05)',
          border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: 14, display: 'flex', gap: 14, alignItems: 'flex-start',
        }}>
          <span style={{ fontSize: 24, flexShrink: 0 }}>⚠</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#f87171', marginBottom: 4 }}>
              Most Common Mistake: {MISTAKE_TYPES.find(t => t.id === mistakeStats.topMistakes[0].type)?.label ?? mistakeStats.topMistakes[0].type}
            </div>
            <div style={{ fontSize: 12, color: '#737394', lineHeight: 1.6 }}>
              You've logged this mistake {mistakeStats.topMistakes[0].count} time{mistakeStats.topMistakes[0].count !== 1 ? 's' : ''}.
              Focus on practicing problems that specifically test this area.
            </div>
          </div>
        </div>
      )}

      {/* Recent mistakes log */}
      <div>
        <div style={{ fontSize: 11, color: '#52526d', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 14 }}>
          Recent Mistakes ({mistakes.length} total)
        </div>

        {mistakes.length === 0 ? (
          <div style={{
            padding: '40px 24px', textAlign: 'center',
            background: 'rgba(20,20,24,0.6)',
            border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16,
          }}>
            <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.3 }}>⊘</div>
            <div style={{ fontSize: 14, color: '#52526d' }}>
              No mistakes logged yet. Use the Mistakes panel on LeetCode to track what went wrong.
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[...mistakes].reverse().slice(0, 20).map((m) => (
              <div key={m.id} style={{
                padding: '14px 18px',
                background: 'rgba(20,20,24,0.7)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 12,
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 6 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#c4c4d8' }}>{m.title}</div>
                  <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                    <span style={{
                      fontSize: 10, padding: '2px 7px', borderRadius: 99, fontWeight: 600,
                      background: m.difficulty === 'Easy' ? 'rgba(74,222,128,0.1)' : m.difficulty === 'Medium' ? 'rgba(251,146,60,0.1)' : 'rgba(239,68,68,0.1)',
                      color: m.difficulty === 'Easy' ? '#4ade80' : m.difficulty === 'Medium' ? '#fb923c' : '#f87171',
                    }}>{m.difficulty}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: m.notes ? 6 : 0 }}>
                  {m.mistakeTypes?.map((t) => {
                    const type = MISTAKE_TYPES.find(mt => mt.id === t);
                    return (
                      <span key={t} style={{
                        fontSize: 10, padding: '2px 8px', borderRadius: 99,
                        background: `${type?.color ?? '#9b9bba'}12`,
                        border: `1px solid ${type?.color ?? '#9b9bba'}28`,
                        color: type?.color ?? '#9b9bba',
                      }}>{type?.label ?? t}</span>
                    );
                  })}
                </div>
                {m.notes && <div style={{ fontSize: 11, color: '#737394', marginTop: 4 }}>{m.notes}</div>}
                <div style={{ fontSize: 10, color: '#3d3d52', marginTop: 5 }}>{formatDate(m.date)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
