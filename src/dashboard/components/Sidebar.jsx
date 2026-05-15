import React from 'react';
import { NavLink } from 'react-router-dom';
import useAppStore from '../../shared/store/useAppStore.js';
import { getLevel } from '../../shared/utils/index.js';

const NAV_ITEMS = [
  { to: '/overview',  label: 'Overview',  icon: '⊞' },
  { to: '/problems',  label: 'Problems',  icon: '≡' },
  { to: '/revision',  label: 'Revision',  icon: '↺' },
  { to: '/analytics', label: 'Analytics', icon: '◎' },
  { to: '/patterns',  label: 'Patterns',  icon: '◈' },
  { to: '/mistakes',  label: 'Mistakes',  icon: '⊘' },
  { to: '/interview', label: 'Interview', icon: '⏱', exact: true },
];

export function Sidebar() {
  const { streak, userProfile, dueRevisions, problemStats, theme, toggleTheme, interviewHistory } = useAppStore();
  const level  = userProfile ? getLevel(userProfile.xp) : null;
  const isDark = theme === 'dark';

  const sidebarBg   = isDark ? 'rgba(14,14,18,0.95)'    : 'rgba(255,255,255,0.95)';
  const borderColor = isDark ? 'rgba(255,255,255,0.07)'  : 'rgba(0,0,0,0.08)';
  const textPrimary = isDark ? '#e8e8f2'                 : '#1c1c22';
  const textMuted   = isDark ? '#52526d'                 : '#9b9bba';
  const navActive   = isDark ? 'rgba(9,210,245,0.08)'    : 'rgba(9,210,245,0.12)';
  const footerBg    = isDark ? 'rgba(9,9,11,0.6)'        : 'rgba(0,0,0,0.04)';

  const navLinkStyle = (isActive) => ({
    display: 'flex', alignItems: 'center', gap: 9,
    padding: '8px 12px', borderRadius: 8, marginBottom: 2,
    textDecoration: 'none',
    color:      isActive ? '#09d2f5' : textMuted,
    background: isActive ? navActive  : 'transparent',
    border:     isActive ? '1px solid rgba(9,210,245,0.15)' : '1px solid transparent',
    fontSize: 13, fontWeight: isActive ? 600 : 400,
    transition: 'all 0.15s ease',
  });

  return (
    <aside style={{
      width: 220, height: '100vh',
      position: 'fixed', left: 0, top: 0,
      background: sidebarBg,
      borderRight: `1px solid ${borderColor}`,
      display: 'flex', flexDirection: 'column',
      zIndex: 100, backdropFilter: 'blur(12px)',
      transition: 'background 0.3s ease',
    }}>
      {/* Logo */}
      <div style={{ padding: '22px 18px 16px', borderBottom: `1px solid ${borderColor}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #09d2f5, #0093bb)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: '#000', fontFamily: 'monospace', boxShadow: '0 0 15px rgba(9,210,245,0.3)' }}>⟨/⟩</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, fontFamily: 'Space Mono, monospace', color: textPrimary }}>DSA Copilot</div>
            <div style={{ fontSize: 9, color: textMuted, letterSpacing: '0.08em', textTransform: 'uppercase' }}>v1.0.0</div>
          </div>
          {/* <button onClick={toggleTheme} title={isDark ? 'Light Mode' : 'Dark Mode'} style={{ marginLeft: 'auto', background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)', border: `1px solid ${borderColor}`, borderRadius: 8, cursor: 'pointer', fontSize: 14, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {isDark ? '☀' : '🌙'}
          </button> */}
        </div>
      </div>

      {/* User Card */}
      {level && (
        <div style={{ padding: '14px 18px', borderBottom: `1px solid ${borderColor}` }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: textPrimary }}>Lv.{level.level} — {level.label}</div>
              <div style={{ fontSize: 10, color: textMuted }}>{userProfile?.xp ?? 0} XP total</div>
            </div>
            {streak?.current > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '3px 8px', borderRadius: 99, background: 'rgba(251,146,60,0.1)', border: '1px solid rgba(251,146,60,0.2)' }}>
                <span style={{ fontSize: 12 }}>🔥</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#fb923c' }}>{streak.current}</span>
              </div>
            )}
          </div>
          <div style={{ height: 3, background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: 99, width: `${Math.min(100, ((userProfile?.xp ?? 0) / 100) * 100)}%`, background: 'linear-gradient(90deg, #09d2f5, #0093bb)', transition: 'width 0.6s ease' }} />
          </div>
        </div>
      )}

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 10px', overflow: 'auto' }}>
        <div style={{ fontSize: 9, color: textMuted, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '0 8px', marginBottom: 6 }}>
          Navigation
        </div>

        {NAV_ITEMS.map(({ to, label, icon, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            style={({ isActive }) => navLinkStyle(isActive)}
          >
            <span style={{ fontSize: 14, width: 18, textAlign: 'center', flexShrink: 0 }}>{icon}</span>
            <span>{label}</span>
            {to === '/revision' && dueRevisions?.length > 0 && (
              <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 99, background: 'rgba(251,191,36,0.15)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.25)' }}>
                {dueRevisions.length}
              </span>
            )}
          </NavLink>
        ))}

        {/* Interview History sub-link */}
        <NavLink
          to="/interview/history"
          style={({ isActive }) => ({
            ...navLinkStyle(isActive),
            paddingLeft: 36,
            fontSize: 12,
          })}
        >
          <span style={{ fontSize: 12, width: 18, textAlign: 'center', flexShrink: 0 }}>📋</span>
          <span>History</span>
          {interviewHistory?.length > 0 && (
            <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 99, background: 'rgba(9,210,245,0.1)', color: '#09d2f5', border: '1px solid rgba(9,210,245,0.2)' }}>
              {interviewHistory.length}
            </span>
          )}
        </NavLink>

        <div style={{ height: 1, background: borderColor, margin: '10px 8px' }} />

        <NavLink to="/settings" style={({ isActive }) => navLinkStyle(isActive)}>
          <span style={{ fontSize: 14, width: 18, textAlign: 'center' }}>⚙</span>
          <span>Settings</span>
        </NavLink>
      </nav>

      {/* Footer stats */}
      <div style={{ padding: '12px 18px', borderTop: `1px solid ${borderColor}`, background: footerBg }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
          {[
            { label: 'Solved',     value: problemStats?.total ?? 0,                color: '#09d2f5' },
            { label: 'Easy',       value: problemStats?.byDifficulty?.Easy   ?? 0, color: '#4ade80' },
            { label: 'Hard',       value: problemStats?.byDifficulty?.Hard   ?? 0, color: '#f87171' },
          ].map((s) => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: s.color, fontFamily: 'Space Mono, monospace' }}>{s.value}</div>
              <div style={{ fontSize: 9, color: textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}