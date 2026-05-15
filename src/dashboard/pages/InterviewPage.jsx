import React, { useState, useEffect, useRef } from 'react';
import useAppStore from '../../shared/store/useAppStore.js';
import { formatSeconds } from '../../shared/utils/index.js';

const DIFFICULTIES = ['Easy', 'Medium', 'Hard', 'Random'];
const TIME_LIMITS  = [20, 30, 45, 60, 90];
const SESSION_KEY  = 'dsa_copilot_interview_session';
const LAST_KEY     = 'dsa_copilot_interview_last';

export function InterviewPage() {
  const {
    interviewSession,
    startInterviewSession,
    endInterviewSession,
    addInterviewPenalty,
    loadInterviewHistory,
    showToast,
    problems,
  } = useAppStore();

  const [difficulty,    setDifficulty] = useState('Random');
  const [timeLimitMins, setTimeLimit]  = useState(45);
  const [elapsed,       setElapsed]    = useState(0);
  const timerRef = useRef(null);

  // ── Timer ticker ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (interviewSession) {
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - interviewSession.startTime) / 1000));
      }, 1000);
    } else {
      clearInterval(timerRef.current);
      setElapsed(0);
    }
    return () => clearInterval(timerRef.current);
  }, [interviewSession]);

  // ── Sync FROM chrome.storage (LeetCode tab → dashboard) ───────────────────
  // When the user ends the session from the floating timer on LeetCode,
  // the timer writes to LAST_KEY then removes SESSION_KEY.
  // We listen here and save the session with correct solvedDuringSession flag.
  useEffect(() => {
  const isChromeExtension = typeof chrome !== 'undefined' && chrome.storage?.local;
  if (!isChromeExtension) return;

  const handleStorageChange = async (changes, area) => {
    if (area !== 'local') return;

    // SESSION_KEY was removed → LeetCode tab ended the session
    if (changes[SESSION_KEY] && !changes[SESSION_KEY].newValue) {
      clearInterval(timerRef.current);

      // Read BOTH last key AND dedicated solved flag
      chrome.storage.local.get(
        [LAST_KEY, 'dsa_copilot_interview_solved'],
        async (result) => {
          const last       = result?.[LAST_KEY] ?? {};
          const solvedFlag = result?.dsa_copilot_interview_solved ?? false;

          // TRUE if EITHER source says solved — prevents race condition loss
          const solvedDuringSession =
            last.solvedDuringSession === true || solvedFlag === true;

          await endInterviewSession({ completed: true, solvedDuringSession });
          await loadInterviewHistory();

          // Clean up all keys
          chrome.storage.local.remove([
            LAST_KEY,
            'dsa_copilot_interview_solved',
          ]);

          showToast(
            solvedDuringSession
              ? '✓ Problem solved! Session saved to history.'
              : 'Session ended. Problem not solved — low score recorded.',
            solvedDuringSession ? 'success' : 'info',
          );
        }
      );
      return;
    }

    // SESSION_KEY was updated → sync penalty changes from LeetCode tab
    if (changes[SESSION_KEY]?.newValue) {
      const newVal = changes[SESSION_KEY].newValue;
      if (interviewSession && newVal.penalties !== (interviewSession.penalties ?? 0)) {
        addInterviewPenalty();
      }
    }
  };

  chrome.storage.onChanged.addListener(handleStorageChange);
  return () => chrome.storage.onChanged.removeListener(handleStorageChange);
}, [interviewSession, endInterviewSession, addInterviewPenalty, showToast, loadInterviewHistory]);

  // ── Start session ──────────────────────────────────────────────────────────
  async function startSession() {
    const pool = difficulty === 'Random'
      ? problems
      : problems.filter((p) => p.difficulty === difficulty);

    const problem = pool.length > 0
      ? pool[Math.floor(Math.random() * pool.length)]
      : null;

    const session = {
      startTime:          Date.now(),
      timeLimitMins,
      penalties:          0,
      solvedDuringSession: false,  // starts false, content script sets true on AC
      problem,
    };

    // Update Zustand store
    startInterviewSession({ timeLimitMins, problem });
    setElapsed(0);

    // Save to chrome.storage → LeetCode tab reads this to show the timer
    const isChromeExtension = typeof chrome !== 'undefined' && chrome.storage?.local;
    if (isChromeExtension) {
      chrome.storage.local.set({ [SESSION_KEY]: session });
    }

    showToast('Interview session started! 🎯', 'success');

    // Open the problem in a new LeetCode tab
    if (problem?.titleSlug || problem?.url) {
      const url = `https://leetcode.com/problems/${problem.titleSlug}/`;
      if (typeof chrome !== 'undefined' && chrome.tabs) {
        chrome.tabs.create({ url });
      }
    }
  }

// ── End session (from dashboard button) ────────────────────────────────────
async function endSession() {
  clearInterval(timerRef.current);

  const isChromeExtension = typeof chrome !== 'undefined' && chrome.storage?.local;
  let solvedDuringSession = false;

  if (isChromeExtension) {
    // Read from BOTH the active session AND the dedicated flag
    await new Promise((resolve) => {
      chrome.storage.local.get(
        [SESSION_KEY, 'dsa_copilot_interview_solved'],
        (result) => {
          const session    = result?.[SESSION_KEY] ?? {};
          const solvedFlag = result?.dsa_copilot_interview_solved ?? false;

          // Either source being true = problem was solved
          solvedDuringSession =
            session.solvedDuringSession === true || solvedFlag === true;

          console.log('[DSA Copilot] endSession — solvedDuringSession:', solvedDuringSession);
          resolve();
        }
      );
    });

    // Remove all interview-related keys
    chrome.storage.local.remove([
      SESSION_KEY,
      LAST_KEY,
      'dsa_copilot_interview_solved',
    ]);
  }

  const timeLimit = (interviewSession?.timeLimitMins ?? 45) * 60;
  const completed = elapsed <= timeLimit;

  await endInterviewSession({ completed, solvedDuringSession });
  await loadInterviewHistory();

  showToast(
    solvedDuringSession
      ? '✓ Problem solved! Session saved to history.'
      : 'Session ended. Problem not solved — score reflects that.',
    solvedDuringSession ? 'success' : 'info',
  );
}

  // ── Add penalty (from dashboard) ───────────────────────────────────────────
  function handlePenalty() {
    addInterviewPenalty();

    const isChromeExtension = typeof chrome !== 'undefined' && chrome.storage?.local;
    if (isChromeExtension && interviewSession) {
      const updated = {
        ...interviewSession,
        penalties: (interviewSession.penalties ?? 0) + 1,
      };
      // Write to storage → LeetCode floating timer updates instantly
      chrome.storage.local.set({ [SESSION_KEY]: updated });
    }
  }

  // ── Computed values ────────────────────────────────────────────────────────
  const timeLimit   = timeLimitMins * 60;
  const timeLeft    = Math.max(0, timeLimit - elapsed);
  const pct         = Math.min(100, Math.round((elapsed / timeLimit) * 100));
  const isWarning   = timeLeft < 300;
  const isCritical  = timeLeft < 60;
  const timerColor  = isCritical ? '#f87171' : isWarning ? '#fbbf24' : '#09d2f5';
  const borderColor = isCritical
    ? 'rgba(239,68,68,0.4)'
    : isWarning
    ? 'rgba(251,191,36,0.3)'
    : 'rgba(9,210,245,0.2)';

  // ── Active session UI ──────────────────────────────────────────────────────
  if (interviewSession) {
    return (
      <div style={{ padding: '32px 36px', maxWidth: 900 }}>

        {/* Page header + action buttons */}
        <div style={{
          marginBottom:   28,
          display:        'flex',
          justifyContent: 'space-between',
          alignItems:     'flex-start',
        }}>
          <div>
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
              Session Active
            </h1>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={handlePenalty}
              style={{
                padding:    '9px 18px',
                background: 'rgba(239,68,68,0.1)',
                border:     '1px solid rgba(239,68,68,0.25)',
                borderRadius: 9,
                color:      '#f87171',
                cursor:     'pointer',
                fontSize:   13,
                fontWeight: 600,
                fontFamily: 'DM Sans, sans-serif',
              }}
            >
              + Penalty ({interviewSession.penalties ?? 0})
            </button>
            <button
              onClick={endSession}
              style={{
                padding:    '9px 18px',
                background: 'rgba(255,255,255,0.06)',
                border:     '1px solid rgba(255,255,255,0.12)',
                borderRadius: 9,
                color:      '#9b9bba',
                cursor:     'pointer',
                fontSize:   13,
                fontWeight: 600,
                fontFamily: 'DM Sans, sans-serif',
              }}
            >
              End Session
            </button>
          </div>
        </div>

        {/* Sync info banner */}
        <div style={{
          padding:      '12px 18px',
          marginBottom: 20,
          background:   'rgba(9,210,245,0.04)',
          border:       '1px solid rgba(9,210,245,0.15)',
          borderRadius: 12,
          fontSize:     12,
          color:        '#737394',
          display:      'flex',
          alignItems:   'center',
          gap:          10,
        }}>
          <span style={{ fontSize: 16 }}>🔄</span>
          Synced with floating timer on your LeetCode tab.
          Score is based on whether you submit an Accepted solution during the session.
        </div>

        {/* Timer card */}
        <div style={{
          padding:      '36px',
          background:   'rgba(20,20,24,0.9)',
          border:       `1px solid ${borderColor}`,
          borderRadius: 20,
          marginBottom: 24,
          textAlign:    'center',
        }}>
          <div style={{
            fontSize:      10,
            color:         '#52526d',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            marginBottom:  16,
          }}>
            Time Remaining
          </div>

          <div style={{
            fontSize:      72,
            fontWeight:    700,
            fontFamily:    'Space Mono, monospace',
            color:         timerColor,
            letterSpacing: '0.05em',
            lineHeight:    1,
            marginBottom:  20,
            textShadow:    `0 0 30px ${timerColor}80`,
          }}>
            {formatSeconds(timeLeft)}
          </div>

          {/* Progress bar */}
          <div style={{
            height:       6,
            background:   'rgba(255,255,255,0.06)',
            borderRadius: 99,
            overflow:     'hidden',
            maxWidth:     400,
            margin:       '0 auto 16px',
          }}>
            <div style={{
              height:       '100%',
              borderRadius: 99,
              width:        `${pct}%`,
              background:   isCritical
                ? '#f87171'
                : isWarning
                ? '#fbbf24'
                : 'linear-gradient(90deg, #09d2f5, #0093bb)',
              transition: 'width 1s linear, background 0.3s ease',
            }} />
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 28, fontSize: 13, color: '#52526d' }}>
            <div>
              Elapsed:{' '}
              <span style={{ color: '#9b9bba' }}>{formatSeconds(elapsed)}</span>
            </div>
            <div>
              Limit:{' '}
              <span style={{ color: '#9b9bba' }}>{timeLimitMins}m</span>
            </div>
            <div>
              Penalties:{' '}
              <span style={{ color: (interviewSession.penalties ?? 0) > 0 ? '#f87171' : '#9b9bba' }}>
                {interviewSession.penalties ?? 0}
              </span>
            </div>
          </div>
        </div>

        {/* Problem card */}
        {interviewSession.problem && (
          <div style={{
            padding:      '20px 24px',
            background:   'rgba(20,20,24,0.8)',
            border:       '1px solid rgba(255,255,255,0.07)',
            borderRadius: 16,
            marginBottom: 20,
          }}>
            <div style={{
              fontSize:      10,
              color:         '#52526d',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom:  10,
            }}>
              Your Problem
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 16, fontWeight: 600, color: '#e8e8f2' }}>
                {interviewSession.problem.title}
              </span>
              <span style={{
                fontSize:   11,
                padding:    '3px 9px',
                borderRadius: 99,
                fontWeight: 600,
                background:
                  interviewSession.problem.difficulty === 'Easy'
                    ? 'rgba(74,222,128,0.1)'
                    : interviewSession.problem.difficulty === 'Medium'
                    ? 'rgba(251,146,60,0.1)'
                    : 'rgba(239,68,68,0.1)',
                color:
                  interviewSession.problem.difficulty === 'Easy'
                    ? '#4ade80'
                    : interviewSession.problem.difficulty === 'Medium'
                    ? '#fb923c'
                    : '#f87171',
              }}>
                {interviewSession.problem.difficulty}
              </span>
            </div>

            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 12 }}>
              {(interviewSession.problem.tags ?? []).slice(0, 4).map((t) => (
                <span
                  key={t}
                  style={{
                    fontSize:   10,
                    padding:    '2px 8px',
                    borderRadius: 99,
                    background: 'rgba(255,255,255,0.04)',
                    border:     '1px solid rgba(255,255,255,0.08)',
                    color:      '#52526d',
                  }}
                >
                  {t}
                </span>
              ))}
            </div>

            
              <a href={`https://leetcode.com/problems/${interviewSession.problem.titleSlug}/`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display:        'inline-block',
                padding:        '8px 16px',
                background:     'linear-gradient(135deg, #09d2f5, #0093bb)',
                color:          '#000',
                borderRadius:   8,
                fontWeight:     700,
                fontSize:       12,
                textDecoration: 'none',
              }}
            >
              Open Problem →
            </a>
          </div>
        )}

        {/* Scoring info */}
        <div style={{
          padding:      '14px 18px',
          marginBottom: 16,
          background:   'rgba(251,191,36,0.04)',
          border:       '1px solid rgba(251,191,36,0.15)',
          borderRadius: 12,
          fontSize:     12,
          color:        '#737394',
          lineHeight:   1.6,
        }}>
          <span style={{ color: '#fbbf24', fontWeight: 600 }}>⭐ Scoring: </span>
          Submit an Accepted solution on LeetCode during this session to unlock full score (up to 100).
          If you end without solving, the max score is 10.
          Faster solves and fewer penalties = higher score.
        </div>

        {/* Interview checklist */}
        <div style={{
          padding:      '18px 20px',
          background:   'rgba(20,20,24,0.6)',
          border:       '1px solid rgba(255,255,255,0.06)',
          borderRadius: 14,
        }}>
          <div style={{
            fontSize:      10,
            color:         '#52526d',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom:  12,
          }}>
            Interview Checklist
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              '✓ Clarify problem constraints',
              '✓ State approach before coding',
              '✓ Discuss time/space complexity',
              '✓ Handle edge cases',
              '✓ Walk through test cases',
              '✓ Optimize if time allows',
            ].map((tip, i) => (
              <div key={i} style={{ fontSize: 12, color: '#737394', padding: '5px 0' }}>
                {tip}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Config UI (no active session) ──────────────────────────────────────────
  return (
    <div style={{ padding: '32px 36px', maxWidth: 700 }}>
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
          Mock Interview
        </h1>
        <p style={{ color: '#52526d', fontSize: 13, marginTop: 6 }}>
          Simulate real interview conditions. Session is auto-saved to history when ended.
        </p>
      </div>

      {/* Config card */}
      <div style={{
        padding:      '28px 30px',
        background:   'rgba(20,20,24,0.8)',
        border:       '1px solid rgba(255,255,255,0.07)',
        borderRadius: 18,
        marginBottom: 20,
      }}>
        {/* Difficulty selector */}
        <div style={{ marginBottom: 24 }}>
          <div style={{
            fontSize:      11,
            color:         '#52526d',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom:  12,
          }}>
            Difficulty
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {DIFFICULTIES.map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                style={{
                  flex:         1,
                  padding:      '10px 8px',
                  background:   difficulty === d ? 'rgba(9,210,245,0.1)' : 'rgba(255,255,255,0.03)',
                  border:       difficulty === d ? '1px solid rgba(9,210,245,0.3)' : '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 10,
                  cursor:       'pointer',
                  color:        difficulty === d ? '#09d2f5' : '#737394',
                  fontSize:     13,
                  fontWeight:   600,
                  fontFamily:   'DM Sans, sans-serif',
                }}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Time limit selector */}
        <div style={{ marginBottom: 28 }}>
          <div style={{
            fontSize:      11,
            color:         '#52526d',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom:  12,
          }}>
            Time Limit
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {TIME_LIMITS.map((t) => (
              <button
                key={t}
                onClick={() => setTimeLimit(t)}
                style={{
                  flex:         1,
                  padding:      '10px 8px',
                  background:   timeLimitMins === t ? 'rgba(9,210,245,0.1)' : 'rgba(255,255,255,0.03)',
                  border:       timeLimitMins === t ? '1px solid rgba(9,210,245,0.3)' : '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 10,
                  cursor:       'pointer',
                  color:        timeLimitMins === t ? '#09d2f5' : '#737394',
                  fontSize:     13,
                  fontWeight:   600,
                  fontFamily:   'DM Sans, sans-serif',
                }}
              >
                {t}m
              </button>
            ))}
          </div>
        </div>

        {/* Start button */}
        <button
          onClick={startSession}
          style={{
            width:         '100%',
            padding:       '14px',
            background:    'linear-gradient(135deg, #09d2f5, #0093bb)',
            color:         '#000',
            border:        'none',
            borderRadius:  12,
            fontWeight:    700,
            fontSize:      15,
            cursor:        'pointer',
            fontFamily:    'Space Mono, monospace',
            letterSpacing: '0.04em',
            boxShadow:     '0 0 20px rgba(9,210,245,0.3)',
          }}
        >
          ⏱ START INTERVIEW
        </button>
      </div>

      {/* Info card */}
      <div style={{
        padding:      '20px 22px',
        background:   'rgba(20,20,24,0.6)',
        border:       '1px solid rgba(255,255,255,0.06)',
        borderRadius: 14,
      }}>
        <div style={{
          fontSize:      11,
          color:         '#52526d',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          marginBottom:  12,
        }}>
          What happens when you start
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { icon: '🎲', label: 'Random problem selected from your history' },
            { icon: '🔗', label: 'Problem opens in a new LeetCode tab automatically' },
            { icon: '⏱', label: 'Draggable floating timer appears on that LeetCode tab' },
            { icon: '🔄', label: 'End/Penalty synced between both tabs instantly' },
            { icon: '✓',  label: 'Submit Accepted on LeetCode to unlock full score' },
            { icon: '📋', label: 'Full session report saved to Interview History' },
          ].map(({ icon, label }) => (
            <div
              key={label}
              style={{
                display:    'flex',
                alignItems: 'center',
                gap:        10,
                fontSize:   12,
                color:      '#9b9bba',
              }}
            >
              <span style={{ fontSize: 16, flexShrink: 0 }}>{icon}</span>
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}