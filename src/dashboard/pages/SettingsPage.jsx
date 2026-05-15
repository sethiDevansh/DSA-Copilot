import React, { useState } from 'react';
import useAppStore from '../../shared/store/useAppStore.js';
import { storageService } from '../../shared/services/storageService.js';
import { AI_PROVIDERS } from '../../shared/constants/index.js';
import { recalculateAllPatternScores } from '../../shared/services/patternService.js';
import { problemService } from '../../shared/services/problemService.js';

function Section({ title, description, children }) {
  return (
    <div style={{
      padding: '24px 28px',
      background: 'rgba(20,20,24,0.8)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 16,
      marginBottom: 16,
    }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#e8e8f2', marginBottom: 4 }}>{title}</div>
        {description && <div style={{ fontSize: 12, color: '#52526d', lineHeight: 1.5 }}>{description}</div>}
      </div>
      {children}
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#9b9bba', marginBottom: 6 }}>{label}</label>
      {children}
      {hint && <div style={{ fontSize: 11, color: '#52526d', marginTop: 5 }}>{hint}</div>}
    </div>
  );
}

const inputStyle = {
  width: '100%',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 9,
  color: '#e8e8f2',
  padding: '10px 14px',
  fontSize: 13,
  outline: 'none',
  fontFamily: 'DM Sans, sans-serif',
  transition: 'border-color 0.2s ease',
};

export function SettingsPage() {
  const { settings, updateSettings, showToast } = useAppStore();
  const [showKey, setShowKey] = useState(false);
  const [testingAI, setTestingAI] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [exporting, setExporting] = useState(false);

  async function testAIConnection() {
    if (!settings.apiKey) {
      setTestResult({ ok: false, msg: 'Please enter an API key first.' });
      return;
    }
    setTestingAI(true);
    setTestResult(null);
    try {
      const { aiService } = await import('../../shared/services/aiService.js');
      const result = await aiService.getHint({
        problem: { title: 'Two Sum', difficulty: 'Easy', tags: ['Array', 'Hash Table'] },
        level: 1,
      });
      setTestResult({ ok: true, msg: 'Connection successful! AI is ready.' });
    } catch (err) {
      setTestResult({ ok: false, msg: err.message });
    } finally {
      setTestingAI(false);
    }
  }

  async function exportData() {
    setExporting(true);
    try {
      const json = await storageService.exportData();
      const blob = new Blob([json], { type: 'application/json' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `dsa-copilot-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Data exported successfully!', 'success');
    } catch (err) {
      showToast('Export failed: ' + err.message, 'error');
    } finally {
      setExporting(false);
    }
  }

  async function importData(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      await storageService.importData(text);
      showToast('Data imported! Refresh to see changes.', 'success');
    } catch (err) {
      showToast('Import failed: ' + err.message, 'error');
    }
    e.target.value = '';
  }

  async function clearAllData() {
    if (!confirm('This will permanently delete ALL your DSA Copilot data. Are you sure?')) return;
    await storageService.clear();
    showToast('All data cleared.', 'info');
  }

  const toggleStyle = (active) => ({
    width: 40, height: 22,
    background: active ? '#09d2f5' : 'rgba(255,255,255,0.1)',
    borderRadius: 99, position: 'relative',
    cursor: 'pointer', transition: 'background 0.2s ease',
    border: 'none', flexShrink: 0,
  });

  return (
    <div style={{ padding: '32px 36px', maxWidth: 760 }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, color: '#52526d', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>Configuration</div>
        <h1 style={{ fontSize: 28, fontWeight: 700, fontFamily: 'Space Mono, monospace', color: '#e8e8f2', margin: 0 }}>Settings</h1>
        <p style={{ color: '#52526d', fontSize: 13, marginTop: 6 }}>Configure your AI provider, preferences, and data management</p>
      </div>

      {/* AI Configuration */}
      <Section title="🤖 AI Configuration" description="Connect your AI provider to enable hints, analysis, and smart recommendations.">
        <Field label="AI Provider">
          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { value: AI_PROVIDERS.OPENAI, label: 'OpenAI GPT-4o', icon: '⬡' },
              { value: AI_PROVIDERS.GEMINI, label: 'Google Gemini', icon: '◈' },
            ].map((p) => (
              <button
                key={p.value}
                onClick={() => updateSettings({ aiProvider: p.value })}
                style={{
                  flex: 1, padding: '10px 14px',
                  background: settings.aiProvider === p.value ? 'rgba(9,210,245,0.1)' : 'rgba(255,255,255,0.03)',
                  border: settings.aiProvider === p.value ? '1px solid rgba(9,210,245,0.35)' : '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 9, cursor: 'pointer',
                  color: settings.aiProvider === p.value ? '#09d2f5' : '#737394',
                  fontSize: 13, fontWeight: 600, fontFamily: 'DM Sans, sans-serif',
                  display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center',
                }}
              >
                <span>{p.icon}</span> {p.label}
              </button>
            ))}
          </div>
        </Field>

        <Field
          label="API Key"
          hint={
            settings.aiProvider === AI_PROVIDERS.OPENAI
              ? 'Get your key at platform.openai.com → API Keys. Your key is stored locally and never sent to our servers.'
              : 'Get your key at aistudio.google.com. Your key is stored locally and never sent to our servers.'
          }
        >
          <div style={{ position: 'relative' }}>
            <input
              type={showKey ? 'text' : 'password'}
              value={settings.apiKey ?? ''}
              onChange={(e) => updateSettings({ apiKey: e.target.value })}
              placeholder={settings.aiProvider === AI_PROVIDERS.OPENAI ? 'sk-...' : 'AIza...'}
              style={{ ...inputStyle, paddingRight: 80, fontFamily: showKey ? 'JetBrains Mono, monospace' : 'DM Sans, sans-serif', fontSize: showKey ? 12 : 13 }}
              onFocus={(e) => (e.target.style.borderColor = '#09d2f5')}
              onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
            />
            <button
              onClick={() => setShowKey((v) => !v)}
              style={{
                position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                background: 'transparent', border: 'none', color: '#52526d',
                cursor: 'pointer', fontSize: 11, fontFamily: 'DM Sans, sans-serif',
              }}
            >
              {showKey ? 'Hide' : 'Show'}
            </button>
          </div>
        </Field>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={testAIConnection}
            disabled={testingAI}
            style={{
              padding: '10px 20px',
              background: 'linear-gradient(135deg, #09d2f5, #0093bb)',
              color: '#000', border: 'none', borderRadius: 9,
              fontWeight: 700, fontSize: 13, cursor: testingAI ? 'default' : 'pointer',
              fontFamily: 'DM Sans, sans-serif',
              opacity: testingAI ? 0.7 : 1,
            }}
          >
            {testingAI ? '⏳ Testing...' : '⚡ Test Connection'}
          </button>
        </div>

        {testResult && (
          <div style={{
            marginTop: 12, padding: '10px 14px',
            background: testResult.ok ? 'rgba(74,222,128,0.08)' : 'rgba(239,68,68,0.08)',
            border: `1px solid ${testResult.ok ? 'rgba(74,222,128,0.25)' : 'rgba(239,68,68,0.25)'}`,
            borderRadius: 9, fontSize: 12,
            color: testResult.ok ? '#4ade80' : '#f87171',
          }}>
            {testResult.ok ? '✓' : '⚠'} {testResult.msg}
          </div>
        )}
      </Section>

      {/* General Preferences */}
      <Section title="⚙ General Preferences" description="Customize how DSA Copilot behaves.">
        {[
          { key: 'autoDetect',    label: 'Auto-detect solved problems', desc: 'Automatically track when you get an Accepted submission on LeetCode' },
          { key: 'notifications', label: 'Revision reminders',          desc: 'Get notified when problems are due for spaced repetition review' },
        ].map(({ key, label, desc }) => (
          <div key={key} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)',
          }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#c4c4d8' }}>{label}</div>
              <div style={{ fontSize: 11, color: '#52526d', marginTop: 2 }}>{desc}</div>
            </div>
            <button
              onClick={() => updateSettings({ [key]: !settings[key] })}
              style={toggleStyle(settings[key])}
              title={settings[key] ? 'Disable' : 'Enable'}
            >
              <div style={{
                width: 16, height: 16, borderRadius: '50%', background: '#fff',
                position: 'absolute', top: 3,
                left: settings[key] ? 21 : 3,
                transition: 'left 0.2s ease',
                boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
              }} />
            </button>
          </div>
        ))}

        <Field label="Daily Goal (problems/day)" hint="How many problems you aim to solve each day">
          <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
            {[1, 2, 3, 5, 8].map((n) => (
              <button
                key={n}
                onClick={() => updateSettings({ dailyGoal: n })}
                style={{
                  padding: '8px 14px', borderRadius: 8,
                  background: settings.dailyGoal === n ? 'rgba(9,210,245,0.1)' : 'rgba(255,255,255,0.04)',
                  border: settings.dailyGoal === n ? '1px solid rgba(9,210,245,0.3)' : '1px solid rgba(255,255,255,0.08)',
                  color: settings.dailyGoal === n ? '#09d2f5' : '#737394',
                  cursor: 'pointer', fontSize: 13, fontWeight: 600,
                  fontFamily: 'DM Sans, sans-serif',
                }}
              >{n}</button>
            ))}
          </div>
        </Field>
      </Section>

      {/* Data Management */}
<Section title="💾 Data Management" description="Export, import, or reset your DSA Copilot data.">
  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
    
    {/* Export */}
    <button
      onClick={exportData}
      disabled={exporting}
      style={{
        padding: '10px 18px',
        background: 'rgba(9,210,245,0.08)',
        border: '1px solid rgba(9,210,245,0.25)',
        borderRadius: 9, color: '#09d2f5',
        cursor: 'pointer', fontSize: 13, fontWeight: 600,
        fontFamily: 'DM Sans, sans-serif',
      }}
    >
      {exporting ? '⏳ Exporting...' : '⬇ Export Data'}
    </button>

    {/* ← NEW BUTTON — paste exactly here */}
    <button
      onClick={async () => {
        const problems = await problemService.getAllProblems();
        await recalculateAllPatternScores(problems);
        showToast('Pattern scores recalculated from your problem history!', 'success');
      }}
      style={{
        padding:      '10px 18px',
        background:   'rgba(167,139,250,0.08)',
        border:       '1px solid rgba(167,139,250,0.25)',
        borderRadius: 9,
        color:        '#a78bfa',
        cursor:       'pointer',
        fontSize:     13,
        fontWeight:   600,
        fontFamily:   'DM Sans, sans-serif',
      }}
    >
      ◈ Recalculate Pattern Scores
    </button>

    {/* Import */}
    <label style={{
      padding: '10px 18px',
      background: 'rgba(167,139,250,0.08)',
      border: '1px solid rgba(167,139,250,0.25)',
      borderRadius: 9, color: '#a78bfa',
      cursor: 'pointer', fontSize: 13, fontWeight: 600,
      fontFamily: 'DM Sans, sans-serif',
    }}>
      ⬆ Import Data
      <input type="file" accept=".json" onChange={importData} style={{ display: 'none' }} />
    </label>

    {/* Clear All */}
    <button
      onClick={clearAllData}
      style={{
        padding: '10px 18px',
        background: 'rgba(239,68,68,0.08)',
        border: '1px solid rgba(239,68,68,0.2)',
        borderRadius: 9, color: '#f87171',
        cursor: 'pointer', fontSize: 13, fontWeight: 600,
        fontFamily: 'DM Sans, sans-serif',
      }}
    >
      🗑 Clear All Data
    </button>
  </div>

  <div style={{ marginTop: 16, padding: '12px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 9 }}>
    <div style={{ fontSize: 11, color: '#52526d', lineHeight: 1.7 }}>
      <strong style={{ color: '#737394' }}>Privacy:</strong> All data is stored locally in your browser using Chrome Extension storage.
      Your API key and problem data never leave your device. Export creates a JSON backup you can restore anytime.
    </div>
  </div>
</Section>

      {/* About */}
      <Section title="ℹ About DSA Copilot">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { label: 'Version',     value: '1.0.0' },
            { label: 'Manifest',    value: 'V3' },
            { label: 'Framework',   value: 'React + Vite' },
            { label: 'AI Providers',value: 'OpenAI / Gemini' },
          ].map(({ label, value }) => (
            <div key={label} style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 8 }}>
              <div style={{ fontSize: 10, color: '#52526d', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>{label}</div>
              <div style={{ fontSize: 13, color: '#9b9bba', fontFamily: 'JetBrains Mono, monospace' }}>{value}</div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
