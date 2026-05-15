/**
 * InterviewTimer — Floating timer on LeetCode tab.
 * Fully synced with dashboard via chrome.storage.onChanged listener.
 */

import React, { useState, useEffect, useRef } from 'react';
import { formatSeconds } from '../../shared/utils/index.js';

const SESSION_KEY = 'dsa_copilot_interview_session';

export function InterviewTimer({ session: initialSession, onEnd, onPenalty }) {
  const [session,  setSession]  = useState(initialSession);
  const [elapsed,  setElapsed]  = useState(0);
  const [expanded, setExpanded] = useState(true);
  const [dragging, setDragging] = useState(false);
  const [pos,      setPos]      = useState({ x: 16, y: 80 });
  const dragStart  = useRef(null);
  const rafRef     = useRef(null);

  // ── Sync FROM chrome.storage (dashboard → leetcode tab) ──────────────────
  useEffect(() => {
    const isChromeExtension = typeof chrome !== 'undefined' && chrome.storage?.local;
    if (!isChromeExtension) return;

    const handleStorageChange = (changes, area) => {
      if (area !== 'local') return;
      if (!changes[SESSION_KEY]) return;

      const newVal = changes[SESSION_KEY].newValue;

      if (!newVal) {
        // Session was removed from dashboard → end timer here too
        setSession(null);
        onEnd?.();
        return;
      }

      // Session updated (penalty change, etc.) → sync
      setSession(newVal);
    };

    chrome.storage.onChanged.addListener(handleStorageChange);
    return () => chrome.storage.onChanged.removeListener(handleStorageChange);
  }, [onEnd]);

  // ── Precise rAF timer ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!session) return;
    const tick = () => {
      setElapsed(Math.floor((Date.now() - session.startTime) / 1000));
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [session?.startTime]);

  // ── Drag logic ────────────────────────────────────────────────────────────
  const onMouseDown = (e) => {
    if (e.target.closest('button')) return;
    setDragging(true);
    dragStart.current = { mx: e.clientX, my: e.clientY, ox: pos.x, oy: pos.y };
  };

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e) => {
      setPos({
        x: Math.max(0, Math.min(window.innerWidth  - 240, dragStart.current.ox + e.clientX - dragStart.current.mx)),
        y: Math.max(0, Math.min(window.innerHeight - 300, dragStart.current.oy + e.clientY - dragStart.current.my)),
      });
    };
    const onUp = () => setDragging(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup',   onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup',   onUp);
    };
  }, [dragging]);

  // ── Actions — write to chrome.storage so dashboard syncs too ─────────────
function handleEnd() {
  cancelAnimationFrame(rafRef.current);

  // Read the current session (which has solvedDuringSession set by content script)
  // ALSO read the dedicated solved flag as a fallback
  chrome.storage.local.get(
    ['dsa_copilot_interview_session', 'dsa_copilot_interview_solved'],
    (result) => {
      const current       = result?.dsa_copilot_interview_session ?? {};
      const solvedFlag    = result?.dsa_copilot_interview_solved ?? false;

      // Merge both sources — if either says solved, it's solved
      const solvedDuringSession = current.solvedDuringSession === true || solvedFlag === true;

      const lastState = { ...current, solvedDuringSession };

      // Save to LAST_KEY for dashboard to read, then remove active session
      chrome.storage.local.set(
        { 'dsa_copilot_interview_last': lastState },
        () => {
          // Remove session + dedicated flag together
          chrome.storage.local.remove(
            ['dsa_copilot_interview_session', 'dsa_copilot_interview_solved'],
            () => {
              console.log('[DSA Copilot] Interview ended. Solved:', solvedDuringSession);
            }
          );
        }
      );
    }
  );

  setSession(null);
  onEnd?.();
}

  function handlePenalty() {
    if (!session) return;
    const updated = { ...session, penalties: (session.penalties ?? 0) + 1 };
    // Write to storage → triggers onChanged → dashboard updates penalty count
    chrome.storage.local.set({ [SESSION_KEY]: updated });
    setSession(updated);
    onPenalty?.();
  }

  if (!session) return null;

  const timeLimit  = session.timeLimitMins * 60;
  const remaining  = Math.max(0, timeLimit - elapsed);
  const pct        = Math.min(100, (elapsed / timeLimit) * 100);
  const isWarning  = remaining < 300;
  const isCritical = remaining < 60;
  const isExpired  = remaining === 0;

  const timerColor =
    isCritical || isExpired ? '#f87171' :
    isWarning               ? '#fbbf24' :
                              '#09d2f5';

  return (
    <div
      onMouseDown={onMouseDown}
      style={{
        position:   'fixed',
        left:       pos.x,
        top:        pos.y,
        zIndex:     99999,
        cursor:     dragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        pointerEvents: 'all',
      }}
    >
      {expanded ? (
        <div style={{
          width:      230,
          background: 'rgba(9,9,11,0.97)',
          border:     `1px solid ${timerColor}40`,
          borderRadius: 16,
          boxShadow:  `0 8px 40px rgba(0,0,0,0.8), 0 0 0 1px ${timerColor}20`,
          backdropFilter: 'blur(20px)',
          overflow:   'hidden',
          fontFamily: "'DM Sans', sans-serif",
        }}>
          {/* Header */}
          <div style={{
            padding:    '10px 12px 8px',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            display:    'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 7, height: 7, borderRadius: '50%',
                background: isExpired ? '#f87171' : '#4ade80',
                boxShadow:  `0 0 6px ${isExpired ? '#f87171' : '#4ade80'}`,
                animation:  'dsa-pulse 1.5s ease-in-out infinite',
              }} />
              <span style={{ fontSize: 10, color: '#52526d', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                DSA Copilot · Interview
              </span>
            </div>
            <button
              onClick={() => setExpanded(false)}
              title="Minimize"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border:     '1px solid rgba(255,255,255,0.08)',
                borderRadius: 5, color: '#52526d',
                cursor: 'pointer', fontSize: 12,
                width: 22, height: 22,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                lineHeight: 1,
              }}
            >−</button>
          </div>

          {/* Timer */}
          <div style={{ padding: '16px 16px 10px', textAlign: 'center' }}>
            <div style={{
              fontSize:   48,
              fontWeight: 700,
              fontFamily: 'Space Mono, monospace',
              color:      timerColor,
              lineHeight: 1,
              letterSpacing: '0.04em',
              textShadow: `0 0 20px ${timerColor}60`,
              animation:  isCritical && !isExpired ? 'dsa-pulse 0.6s ease-in-out infinite' : 'none',
            }}>
              {formatSeconds(remaining)}
            </div>
            <div style={{ fontSize: 10, color: '#52526d', marginTop: 4 }}>
              {isExpired ? '⚠ Time is up!' : 'remaining'}
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ padding: '0 14px 10px' }}>
            <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{
                height:       '100%',
                borderRadius: 99,
                width:        `${pct}%`,
                background:   isCritical ? '#f87171' : isWarning ? '#fbbf24' : 'linear-gradient(90deg, #09d2f5, #0093bb)',
                transition:   'width 1s linear, background 0.3s ease',
              }} />
            </div>
          </div>

          {/* Stats */}
          <div style={{
            padding:    '8px 14px',
            display:    'flex',
            justifyContent: 'space-between',
            borderTop:  '1px solid rgba(255,255,255,0.05)',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
          }}>
            {[
              { label: 'Elapsed',   value: formatSeconds(elapsed) },
              { label: 'Limit',     value: `${session.timeLimitMins}m` },
              { label: 'Penalties', value: session.penalties ?? 0,
                color: (session.penalties ?? 0) > 0 ? '#f87171' : '#52526d' },
            ].map((s) => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: s.color ?? '#9b9bba', fontFamily: 'monospace' }}>
                  {s.value}
                </div>
                <div style={{ fontSize: 9, color: '#3d3d52', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          {/* Buttons */}
          <div style={{ padding: '10px 12px', display: 'flex', gap: 6 }}>
            <button
              onClick={handlePenalty}
              style={{
                flex:         1,
                padding:      '7px 8px',
                background:   'rgba(239,68,68,0.1)',
                border:       '1px solid rgba(239,68,68,0.25)',
                borderRadius: 8, color: '#f87171',
                cursor: 'pointer', fontSize: 11, fontWeight: 600,
                fontFamily: 'DM Sans, sans-serif',
              }}
            >
              + Penalty ({session.penalties ?? 0})
            </button>
            <button
              onClick={handleEnd}
              style={{
                flex:         1,
                padding:      '7px 8px',
                background:   'rgba(255,255,255,0.05)',
                border:       '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8, color: '#9b9bba',
                cursor: 'pointer', fontSize: 11, fontWeight: 600,
                fontFamily: 'DM Sans, sans-serif',
              }}
            >
              End
            </button>
          </div>
        </div>
      ) : (
        /* Minimized pill */
        <div
          onClick={() => setExpanded(true)}
          title="Click to expand"
          style={{
            display:    'flex',
            alignItems: 'center',
            gap:        8,
            padding:    '8px 14px',
            background: 'rgba(9,9,11,0.97)',
            border:     `1px solid ${timerColor}50`,
            borderRadius: 99,
            boxShadow:  `0 4px 20px rgba(0,0,0,0.6), 0 0 0 1px ${timerColor}20`,
            cursor:     'pointer',
          }}
        >
          <div style={{
            width: 7, height: 7, borderRadius: '50%',
            background: timerColor,
            boxShadow:  `0 0 8px ${timerColor}`,
            animation:  'dsa-pulse 1.5s ease-in-out infinite',
          }} />
          <span style={{
            fontSize:   15,
            fontWeight: 700,
            color:      timerColor,
            fontFamily: 'Space Mono, monospace',
            letterSpacing: '0.04em',
          }}>
            {formatSeconds(remaining)}
          </span>
          <span style={{ fontSize: 9, color: '#52526d' }}>▲</span>
        </div>
      )}

      <style>{`
        @keyframes dsa-pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}