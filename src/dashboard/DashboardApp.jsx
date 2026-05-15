import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar }               from './components/Sidebar.jsx';
import { OverviewPage }          from './pages/OverviewPage.jsx';
import { ProblemsPage }          from './pages/ProblemsPage.jsx';
import { RevisionPage }          from './pages/RevisionPage.jsx';
import { AnalyticsPage }         from './pages/AnalyticsPage.jsx';
import { PatternsPage }          from './pages/PatternsPage.jsx';
import { InterviewPage }         from './pages/InterviewPage.jsx';
import { InterviewHistoryPage }  from './pages/InterviewHistoryPage.jsx';
import { SettingsPage }          from './pages/SettingsPage.jsx';
import { MistakesPage }          from './pages/MistakesPage.jsx';
import { Toast }                 from './components/Toast.jsx';
import useAppStore               from '../shared/store/useAppStore.js';

export default function DashboardApp() {
  const { loadProblems, loadMistakes, loadStreak, loadInterviewHistory, ui, theme, initTheme } = useAppStore();

  useEffect(() => {
    loadProblems();
    loadMistakes();
    loadStreak();
    loadInterviewHistory();
    initTheme();
  }, []);

  const isDark = theme === 'dark';

  return (
    <div style={{
      display:    'flex',
      minHeight:  '100vh',
      background: isDark ? '#09090b' : '#f4f4f8',
      color:      isDark ? '#e8e8f2' : '#1c1c22',
      fontFamily: "'DM Sans', sans-serif",
      transition: 'background 0.3s ease, color 0.3s ease',
    }}>
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        backgroundImage: isDark
          ? 'linear-gradient(rgba(9,210,245,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(9,210,245,0.03) 1px, transparent 1px)'
          : 'linear-gradient(rgba(9,210,245,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(9,210,245,0.06) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', left: -200, top: -200, background: 'radial-gradient(circle, rgba(9,210,245,0.05) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', right: -100, bottom: -100, background: 'radial-gradient(circle, rgba(239,33,232,0.04) 0%, transparent 70%)' }} />
      </div>

      <Sidebar />

      <main style={{ flex: 1, marginLeft: 220, position: 'relative', zIndex: 1, minHeight: '100vh', overflow: 'auto' }}>
        <Routes>
          <Route path="/"                  element={<Navigate to="/overview" replace />} />
          <Route path="/overview"          element={<OverviewPage />} />
          <Route path="/problems"          element={<ProblemsPage />} />
          <Route path="/revision"          element={<RevisionPage />} />
          <Route path="/analytics"         element={<AnalyticsPage />} />
          <Route path="/patterns"          element={<PatternsPage />} />
          <Route path="/interview"         element={<InterviewPage />} />
          <Route path="/interview/history" element={<InterviewHistoryPage />} />
          <Route path="/mistakes"          element={<MistakesPage />} />
          <Route path="/settings"          element={<SettingsPage />} />
          <Route path="/onboarding"        element={<SettingsPage />} />
        </Routes>
      </main>

      {ui.toast && <Toast toast={ui.toast} />}
    </div>
  );
}