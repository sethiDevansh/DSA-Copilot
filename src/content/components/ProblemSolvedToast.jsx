import React, { useEffect, useState } from 'react';

export function ProblemSolvedToast({ problem, isNew, onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 50);
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  const diffColor =
    problem?.difficulty === 'Easy'   ? '#4ade80' :
    problem?.difficulty === 'Medium' ? '#fb923c' : '#f87171';

  return (
    <div style={{
      position: 'fixed', bottom: 24, left: 24, zIndex: 10001,
      pointerEvents: 'all',
      transform: visible ? 'translateY(0)' : 'translateY(20px)',
      opacity: visible ? 1 : 0,
      transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
    }}>
      <div style={{
        background: 'rgba(9,9,11,0.97)',
        border: '1px solid rgba(74,222,128,0.3)',
        borderRadius: 14, padding: '14px 18px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.8), 0 0 0 1px rgba(74,222,128,0.1)',
        minWidth: 280, maxWidth: 340,
        backdropFilter: 'blur(20px)',
        display: 'flex', alignItems: 'flex-start', gap: 12,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10, flexShrink: 0,
          background: 'rgba(74,222,128,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, border: '1px solid rgba(74,222,128,0.25)',
        }}>
          {isNew ? '🎉' : '✓'}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#4ade80', marginBottom: 3 }}>
            {isNew ? 'Problem Solved!' : 'Solved Again!'}
          </div>
          <div style={{ fontSize: 12, color: '#9b9bba', marginBottom: 4 }}>
            {problem?.title}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{
              fontSize: 10, padding: '1px 7px', borderRadius: 99, fontWeight: 600,
              background: `${diffColor}15`, color: diffColor, border: `1px solid ${diffColor}30`,
            }}>
              {problem?.difficulty}
            </span>
            <span style={{ fontSize: 10, color: '#52526d' }}>Tracked by DSA Copilot</span>
          </div>
        </div>
        <button
          onClick={() => { setVisible(false); setTimeout(onClose, 300); }}
          style={{
            background: 'transparent', border: 'none', color: '#52526d',
            cursor: 'pointer', fontSize: 14, padding: 0, lineHeight: 1,
          }}
        >✕</button>
      </div>
    </div>
  );
}
