import React, { useState, useEffect, useCallback } from 'react';
import { NotesPanel }      from './panels/NotesPanel.jsx';
import { HintsPanel }      from './panels/HintsPanel.jsx';
import { AnalysisPanel }   from './panels/AnalysisPanel.jsx';
import { MistakesPanel }   from './panels/MistakesPanel.jsx';
import { ProblemSolvedToast } from './ProblemSolvedToast.jsx';
import { InterviewTimer }  from './InterviewTimer.jsx';
import { notesService }    from '../../shared/services/notesService.js';

const TABS = [
  { id: 'notes',    label: 'Notes',    icon: '✎' },
  { id: 'hints',    label: 'AI Hints', icon: '◈' },
  { id: 'analysis', label: 'Analyze',  icon: '⚡' },
  { id: 'mistakes', label: 'Mistakes', icon: '⊘' },
];

export function SidePanel({ initialProblem }) {
  const [isOpen,           setIsOpen]           = useState(false);
  const [activeTab,        setActiveTab]         = useState('notes');
  const [problem,          setProblem]           = useState(initialProblem);
  const [toast,            setToast]             = useState(null);
  const [notesDot,         setNotesDot]          = useState(false);
  const [interviewSession, setInterviewSession]  = useState(null);

  // ── Check for existing notes ─────────────────────────────────────────────
  useEffect(() => {
    if (!problem?.titleSlug) return;
    notesService.getNoteForProblem(problem.titleSlug).then((note) => {
      setNotesDot(!!note?.content?.trim());
    });
  }, [problem?.titleSlug]);

  // ── Listen for problem solved ────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      const { problem: solved, isNew } = e.detail;
      setProblem(solved);
      setToast({ problem: solved, isNew });
      if (isNew) {
        setTimeout(() => setIsOpen(true),    500);
        setTimeout(() => setActiveTab('analysis'), 600);
      }
    };
    window.addEventListener('dsa_copilot:problem_solved', handler);
    return () => window.removeEventListener('dsa_copilot:problem_solved', handler);
  }, []);

  // ── Listen for interview session messages from dashboard ─────────────────
  useEffect(() => {
    const isChromeExtension = typeof chrome !== 'undefined' && chrome.runtime?.onMessage;
    if (!isChromeExtension) return;

    const handler = (message) => {
      if (message.type === 'INTERVIEW_STARTED') {
        setInterviewSession(message.payload);
      }
      if (message.type === 'INTERVIEW_ENDED') {
        setInterviewSession(null);
      }
    };

    chrome.runtime.onMessage.addListener(handler);
    return () => chrome.runtime.onMessage.removeListener(handler);
  }, []);

  // ── Also check chrome storage on mount for active session ────────────────
  useEffect(() => {
    const isChromeExtension = typeof chrome !== 'undefined' && chrome.storage?.local;
    if (!isChromeExtension) return;
    chrome.storage.local.get('dsa_copilot_interview_session', (result) => {
      if (result.dsa_copilot_interview_session) {
        setInterviewSession(result.dsa_copilot_interview_session);
      }
    });
  }, []);

  // ── Keyboard shortcut: Ctrl+Shift+D ──────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        setIsOpen((v) => !v);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  // ── Interview handlers ────────────────────────────────────────────────────
  function handleEndInterview() {
    setInterviewSession(null);
    const isChromeExtension = typeof chrome !== 'undefined' && chrome.storage?.local;
    if (isChromeExtension) {
      chrome.storage.local.remove('dsa_copilot_interview_session');
    }
  }

  function handlePenalty() {
    if (!interviewSession) return;
    const updated = {
      ...interviewSession,
      penalties: (interviewSession.penalties ?? 0) + 1,
    };
    setInterviewSession(updated);
    const isChromeExtension = typeof chrome !== 'undefined' && chrome.storage?.local;
    if (isChromeExtension) {
      chrome.storage.local.set({ dsa_copilot_interview_session: updated });
    }
  }

  const panelWidth = 380;

  return (
    <div style={{ pointerEvents: 'none' }}>
      {/* ── Floating Interview Timer ─────────────────────────────────────── */}
      {interviewSession && (
        <InterviewTimer
          session={interviewSession}
          onEnd={handleEndInterview}
          onPenalty={handlePenalty}
        />
      )}

      {/* ── Problem Solved Toast ─────────────────────────────────────────── */}
      {toast && (
        <ProblemSolvedToast
          problem={toast.problem}
          isNew={toast.isNew}
          onClose={() => setToast(null)}
        />
      )}

      {/* ── Toggle Button ────────────────────────────────────────────────── */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        style={{
          pointerEvents: 'all',
          position:      'fixed',
          right:         isOpen ? panelWidth + 8 : 0,
          top:           '50%',
          transform:     'translateY(-50%)',
          zIndex:        10000,
          width:         28,
          height:        80,
          background:    isOpen ? 'rgba(9,210,245,0.9)' : 'rgba(20,20,28,0.95)',
          border:        '1px solid rgba(9,210,245,0.4)',
          borderRadius:  '8px 0 0 8px',
          cursor:        'pointer',
          display:       'flex',
          alignItems:    'center',
          justifyContent:'center',
          transition:    'all 0.25s cubic-bezier(0.16,1,0.3,1)',
          boxShadow:     '0 4px 20px rgba(0,0,0,0.5)',
          backdropFilter:'blur(8px)',
          color:         isOpen ? '#000' : '#09d2f5',
          fontSize:      14,
          fontWeight:    700,
          writingMode:   'vertical-lr',
          letterSpacing: '0.05em',
          flexDirection: 'column',
          gap:           4,
        }}
        title="DSA Copilot (Ctrl+Shift+D)"
      >
        <span style={{ fontSize: 10 }}>{isOpen ? '▶' : '◀'}</span>
        <span style={{ fontSize: 9, fontFamily: 'monospace', letterSpacing: '0.08em' }}>DSA</span>
      </button>

      {/* ── Side Panel ───────────────────────────────────────────────────── */}
      <div
        style={{
          pointerEvents: isOpen ? 'all' : 'none',
          position:      'fixed',
          right:         0,
          top:           0,
          width:         panelWidth,
          height:        '100vh',
          background:    'rgba(9,9,11,0.98)',
          backdropFilter:'blur(20px)',
          borderLeft:    '1px solid rgba(255,255,255,0.08)',
          zIndex:        9999,
          display:       'flex',
          flexDirection: 'column',
          transform:     isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition:    'transform 0.3s cubic-bezier(0.16,1,0.3,1)',
          boxShadow:     '-20px 0 60px rgba(0,0,0,0.8)',
          fontFamily:    "'DM Sans', sans-serif",
          color:         '#e8e8f2',
          overflow:      'hidden',
        }}
      >
        {/* Panel Header */}
        <div style={{
          padding:      '14px 16px 0',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          flexShrink:   0,
        }}>
          {/* Logo row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 28, height: 28,
                background: 'linear-gradient(135deg, #09d2f5, #0093bb)',
                borderRadius: 7,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 700, color: '#000', fontFamily: 'monospace',
              }}>⟨/⟩</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#e8e8f2', lineHeight: 1.2, fontFamily: 'Space Mono, monospace' }}>
                  DSA Copilot
                </div>
                <div style={{ fontSize: 10, color: '#52526d', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  AI Study Assistant
                </div>
              </div>
            </div>

            {/* Interview active indicator */}
            {interviewSession && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '3px 9px', borderRadius: 99,
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.25)',
              }}>
                <div style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: '#f87171',
                  boxShadow: '0 0 6px #f87171',
                  animation: 'pulse 1s ease-in-out infinite',
                }} />
                <span style={{ fontSize: 10, color: '#f87171', fontWeight: 600 }}>LIVE</span>
              </div>
            )}

            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 6, color: '#52526d',
                cursor: 'pointer', fontSize: 14,
                padding: '4px 8px',
              }}
            >✕</button>
          </div>

          {/* Problem badge */}
          {problem?.title && (
            <div style={{
              fontSize: 12, color: '#9b9bba',
              padding: '8px 12px',
              background: 'rgba(255,255,255,0.03)',
              borderRadius: 8, marginBottom: 12,
              border: '1px solid rgba(255,255,255,0.06)',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span style={{
                fontSize: 10, padding: '2px 7px', borderRadius: 99, fontWeight: 600,
                background:
                  problem.difficulty === 'Easy'   ? 'rgba(34,197,94,0.15)'  :
                  problem.difficulty === 'Medium' ? 'rgba(251,146,60,0.15)' :
                                                    'rgba(239,68,68,0.15)',
                color:
                  problem.difficulty === 'Easy'   ? '#4ade80' :
                  problem.difficulty === 'Medium' ? '#fb923c' : '#f87171',
              }}>
                {problem.difficulty}
              </span>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                {problem.title}
              </span>
              {notesDot && (
                <span title="Has notes" style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: '#09d2f5', flexShrink: 0,
                }} />
              )}
            </div>
          )}

          {/* Tab Navigation */}
          <div style={{ display: 'flex', gap: 2, marginBottom: -1 }}>
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex:       1,
                  padding:    '8px 4px',
                  background: 'transparent',
                  border:     'none',
                  borderBottom: activeTab === tab.id
                    ? '2px solid #09d2f5'
                    : '2px solid transparent',
                  color:    activeTab === tab.id ? '#09d2f5' : '#52526d',
                  cursor:   'pointer',
                  fontSize: 11, fontWeight: 600,
                  letterSpacing: '0.03em',
                  transition: 'all 0.15s ease',
                  display:  'flex', flexDirection: 'column',
                  alignItems: 'center', gap: 3,
                  fontFamily: 'DM Sans, sans-serif',
                }}
              >
                <span style={{ fontSize: 13 }}>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Panel Content */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {activeTab === 'notes'    && <NotesPanel    problem={problem} />}
          {activeTab === 'hints'    && <HintsPanel    problem={problem} />}
          {activeTab === 'analysis' && <AnalysisPanel problem={problem} />}
          {activeTab === 'mistakes' && <MistakesPanel problem={problem} />}
        </div>

        {/* Footer */}
        <div style={{
          padding:    '10px 16px',
          borderTop:  '1px solid rgba(255,255,255,0.05)',
          display:    'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <span style={{ fontSize: 10, color: '#52526d', letterSpacing: '0.06em' }}>
            CTRL+SHIFT+D to toggle
          </span>
          <button
            onClick={() => chrome.runtime.sendMessage({ type: 'OPEN_DASHBOARD' })}
            style={{
              background: 'rgba(9,210,245,0.08)',
              border: '1px solid rgba(9,210,245,0.2)',
              borderRadius: 6, color: '#09d2f5',
              cursor: 'pointer', fontSize: 11, fontWeight: 600,
              padding: '4px 10px', fontFamily: 'DM Sans, sans-serif',
            }}
          >
            Dashboard →
          </button>
        </div>

        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50%       { opacity: 0.4; }
          }
        `}</style>
      </div>
    </div>
  );
}