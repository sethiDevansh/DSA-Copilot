import React, { useState, useEffect } from 'react';
import { mistakeService } from '../../../shared/services/mistakeService.js';
import { MISTAKE_TYPES } from '../../../shared/constants/index.js';

export function MistakesPanel({ problem }) {
  const [selected, setSelected]   = useState([]);
  const [notes, setNotes]         = useState('');
  const [saved, setSaved]         = useState(false);
  const [history, setHistory]     = useState([]);

  useEffect(() => {
    if (!problem?.titleSlug) return;
    mistakeService.getMistakesForProblem(problem.titleSlug).then(setHistory);
  }, [problem?.titleSlug]);

  const toggle = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
    setSaved(false);
  };

  async function save() {
    if (!selected.length || !problem) return;
    await mistakeService.logMistake({
      titleSlug:    problem.titleSlug,
      title:        problem.title,
      difficulty:   problem.difficulty,
      mistakeTypes: selected,
      notes,
    });
    setSaved(true);
    setSelected([]);
    setNotes('');
    const updated = await mistakeService.getMistakesForProblem(problem.titleSlug);
    setHistory(updated);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ flex: 1, overflow: 'auto', padding: '14px 16px' }}>
        <div style={{ fontSize: 10, color: '#52526d', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
          What went wrong?
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
          {MISTAKE_TYPES.map((m) => (
            <button
              key={m.id}
              onClick={() => toggle(m.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px', borderRadius: 8,
                background: selected.includes(m.id) ? `${m.color}10` : 'rgba(255,255,255,0.02)',
                border: selected.includes(m.id) ? `1px solid ${m.color}40` : '1px solid rgba(255,255,255,0.05)',
                cursor: 'pointer', transition: 'all 0.15s ease',
                textAlign: 'left', width: '100%',
              }}
            >
              <span style={{
                width: 26, height: 26, borderRadius: 6, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: `${m.color}15`, color: m.color, fontSize: 12, fontWeight: 700,
                fontFamily: 'monospace',
              }}>{m.icon}</span>
              <span style={{ fontSize: 12, color: selected.includes(m.id) ? m.color : '#9b9bba', fontWeight: selected.includes(m.id) ? 600 : 400 }}>
                {m.label}
              </span>
              {selected.includes(m.id) && (
                <span style={{ marginLeft: 'auto', color: m.color, fontSize: 12 }}>✓</span>
              )}
            </button>
          ))}
        </div>

        {selected.length > 0 && (
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional: describe the mistake..."
            style={{
              width: '100%', background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8,
              color: '#c4c4d8', fontSize: 12, padding: '10px 12px',
              resize: 'none', outline: 'none', height: 70,
              fontFamily: 'DM Sans, sans-serif', lineHeight: 1.6,
            }}
          />
        )}

        {saved && (
          <div style={{
            padding: '8px 12px', background: 'rgba(74,222,128,0.08)',
            border: '1px solid rgba(74,222,128,0.2)', borderRadius: 8,
            fontSize: 12, color: '#4ade80', marginTop: 8,
          }}>
            ✓ Mistake logged. This will help identify patterns.
          </div>
        )}

        {history.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 10, color: '#52526d', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
              Previous Mistakes ({history.length})
            </div>
            {history.slice(-3).map((h) => (
              <div key={h.id} style={{
                padding: '8px 12px', background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.05)', borderRadius: 7, marginBottom: 6,
              }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: h.notes ? 4 : 0 }}>
                  {h.mistakeTypes.map((t) => {
                    const type = MISTAKE_TYPES.find((m) => m.id === t);
                    return (
                      <span key={t} style={{
                        fontSize: 10, padding: '1px 6px', borderRadius: 99,
                        background: `${type?.color ?? '#9b9bba'}15`,
                        color: type?.color ?? '#9b9bba',
                        border: `1px solid ${type?.color ?? '#9b9bba'}30`,
                      }}>{type?.label ?? t}</span>
                    );
                  })}
                </div>
                {h.notes && <div style={{ fontSize: 11, color: '#52526d' }}>{h.notes}</div>}
                <div style={{ fontSize: 10, color: '#26262f', marginTop: 3 }}>{h.date}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.05)', flexShrink: 0 }}>
        <button
          onClick={save}
          disabled={!selected.length}
          style={{
            width: '100%', padding: '10px 16px',
            background: selected.length ? 'linear-gradient(135deg, #ef21e8, #a90da5)' : 'rgba(255,255,255,0.04)',
            color: selected.length ? '#fff' : '#52526d',
            border: 'none', borderRadius: 8,
            fontWeight: 700, fontSize: 13,
            cursor: selected.length ? 'pointer' : 'default',
            fontFamily: 'DM Sans, sans-serif',
          }}
        >
          ⊘ Log {selected.length > 0 ? `${selected.length} ` : ''}Mistake{selected.length !== 1 ? 's' : ''}
        </button>
      </div>
    </div>
  );
}
