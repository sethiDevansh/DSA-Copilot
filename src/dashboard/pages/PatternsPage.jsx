import React from 'react';
import { RadialBarChart, RadialBar, ResponsiveContainer, Tooltip } from 'recharts';
import useAppStore from '../../shared/store/useAppStore.js';
import { DSA_PATTERNS } from '../../shared/constants/index.js';

function PatternCard({ pattern, score, problemCount }) {
  const pct = Math.min(100, score ?? 0);

  return (
    <div style={{
      padding: '18px 20px',
      background: 'rgba(20,20,24,0.8)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 14,
      transition: 'all 0.2s ease',
      cursor: 'default',
    }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = `${pattern.color}30`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: `${pattern.color}12`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, color: pattern.color,
            border: `1px solid ${pattern.color}25`,
          }}>
            {pattern.icon}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#c4c4d8' }}>{pattern.label}</div>
            <div style={{ fontSize: 10, color: '#52526d' }}>{problemCount} problems solved</div>
          </div>
        </div>
        <div style={{
          fontSize: 18, fontWeight: 700,
          color: pct >= 70 ? '#4ade80' : pct >= 40 ? '#fbbf24' : '#f87171',
          fontFamily: 'Space Mono, monospace',
        }}>
          {pct}%
        </div>
      </div>

      <div style={{ fontSize: 11, color: '#52526d', marginBottom: 8, lineHeight: 1.5 }}>
        {pattern.description}
      </div>

      <div style={{ height: 5, background: 'rgba(255,255,255,0.05)', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: 99,
          width: `${pct}%`,
          background: `linear-gradient(90deg, ${pattern.color}, ${pattern.color}99)`,
          transition: 'width 0.8s cubic-bezier(0.16,1,0.3,1)',
        }} />
      </div>

      <div style={{ display: 'flex', gap: 4, marginTop: 10, flexWrap: 'wrap' }}>
        {pattern.keywords.slice(0, 3).map((kw) => (
          <span key={kw} style={{
            fontSize: 9, padding: '2px 7px', borderRadius: 99,
            background: `${pattern.color}08`,
            border: `1px solid ${pattern.color}20`,
            color: pattern.color, letterSpacing: '0.03em',
          }}>
            {kw}
          </span>
        ))}
      </div>
    </div>
  );
}

export function PatternsPage() {
  const { patternScores, problemStats } = useAppStore();
  const topicMap = problemStats?.byTopic ?? {};

  function getPatternProblemCount(pattern) {
    return pattern.keywords.reduce((acc, kw) => {
      const key = Object.keys(topicMap).find(t => t.toLowerCase().includes(kw.toLowerCase().split(' ')[0]));
      return acc + (key ? topicMap[key] : 0);
    }, 0);
  }

  const patterns = DSA_PATTERNS.map(p => ({
    ...p,
    score:  patternScores[p.id] ?? 0,
    count:  getPatternProblemCount(p),
  })).sort((a, b) => b.score - a.score);

  const avgScore = patterns.length
    ? Math.round(patterns.reduce((acc, p) => acc + p.score, 0) / patterns.length)
    : 0;

  const mastered  = patterns.filter(p => p.score >= 70).length;
  const learning  = patterns.filter(p => p.score >= 30 && p.score < 70).length;
  const weak      = patterns.filter(p => p.score < 30).length;

  return (
    <div style={{ padding: '32px 36px', maxWidth: 1100 }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, color: '#52526d', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>Pattern Engine</div>
        <h1 style={{ fontSize: 28, fontWeight: 700, fontFamily: 'Space Mono, monospace', color: '#e8e8f2', margin: 0 }}>Pattern Mastery</h1>
        <p style={{ color: '#52526d', fontSize: 13, marginTop: 6 }}>Track your mastery of DSA patterns across all solved problems</p>
      </div>

      {/* Overview cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }}>
        <div style={{ padding: '18px 20px', background: 'rgba(20,20,24,0.8)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, textAlign: 'center' }}>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#09d2f5', fontFamily: 'Space Mono, monospace' }}>{avgScore}%</div>
          <div style={{ fontSize: 11, color: '#52526d', marginTop: 4 }}>Avg Mastery</div>
        </div>
        <div style={{ padding: '18px 20px', background: 'rgba(20,20,24,0.8)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, textAlign: 'center' }}>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#4ade80', fontFamily: 'Space Mono, monospace' }}>{mastered}</div>
          <div style={{ fontSize: 11, color: '#52526d', marginTop: 4 }}>Mastered (≥70%)</div>
        </div>
        <div style={{ padding: '18px 20px', background: 'rgba(20,20,24,0.8)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, textAlign: 'center' }}>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#fbbf24', fontFamily: 'Space Mono, monospace' }}>{learning}</div>
          <div style={{ fontSize: 11, color: '#52526d', marginTop: 4 }}>Learning (30-70%)</div>
        </div>
        <div style={{ padding: '18px 20px', background: 'rgba(20,20,24,0.8)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, textAlign: 'center' }}>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#f87171', fontFamily: 'Space Mono, monospace' }}>{weak}</div>
          <div style={{ fontSize: 11, color: '#52526d', marginTop: 4 }}>Needs Work (&lt;30%)</div>
        </div>
      </div>

      {/* Info banner */}
      <div style={{
        padding: '14px 18px', marginBottom: 24,
        background: 'rgba(9,210,245,0.04)',
        border: '1px solid rgba(9,210,245,0.12)',
        borderRadius: 12, fontSize: 12, color: '#737394', lineHeight: 1.6,
      }}>
        <strong style={{ color: '#09d2f5' }}>How scores update:</strong> Pattern scores automatically increase when you solve problems tagged with related topics.
        Use the AI Hints panel on LeetCode to detect patterns in specific problems and boost mastery scores.
      </div>

      {/* Pattern Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
        {patterns.map((p) => (
          <PatternCard key={p.id} pattern={p} score={p.score} problemCount={p.count} />
        ))}
      </div>
    </div>
  );
}
