import React, { useState, useEffect, useMemo } from 'react';
import useAppStore from '../../shared/store/useAppStore.js';
import { problemService } from '../../shared/services/problemService.js';
import { formatDate, formatDuration, getDifficultyColor, getLeetCodeProblemURL, debounce } from '../../shared/utils/index.js';
import { DIFFICULTY } from '../../shared/constants/index.js';

const DIFF_COLORS = { Easy: '#4ade80', Medium: '#fb923c', Hard: '#f87171' };
const SORT_OPTIONS = [
  { value: 'recent',     label: 'Most Recent' },
  { value: 'oldest',     label: 'Oldest First' },
  { value: 'difficulty', label: 'Difficulty' },
  { value: 'title',      label: 'Title A-Z' },
  { value: 'time',       label: 'Solve Time' },
];

export function ProblemsPage() {
  const { problems, toggleBookmark, isLoadingProblems } = useAppStore();
  const [query,      setQuery]      = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [sortBy,     setSortBy]     = useState('recent');
  const [bookmarked, setBookmarked] = useState(false);

  const filtered = useMemo(() => {
    let list = [...problems];

    if (query)      list = list.filter(p => p.title?.toLowerCase().includes(query.toLowerCase()) || p.tags?.some(t => t.toLowerCase().includes(query.toLowerCase())));
    if (difficulty) list = list.filter(p => p.difficulty === difficulty);
    if (bookmarked) list = list.filter(p => p.bookmarked);

    list.sort((a, b) => {
      if (sortBy === 'recent')     return new Date(b.addedAt ?? 0) - new Date(a.addedAt ?? 0);
      if (sortBy === 'oldest')     return new Date(a.addedAt ?? 0) - new Date(b.addedAt ?? 0);
      if (sortBy === 'difficulty') {
        const order = { Easy: 0, Medium: 1, Hard: 2 };
        return (order[a.difficulty] ?? 1) - (order[b.difficulty] ?? 1);
      }
      if (sortBy === 'title')      return (a.title ?? '').localeCompare(b.title ?? '');
      if (sortBy === 'time')       return (b.timeTaken ?? 0) - (a.timeTaken ?? 0);
      return 0;
    });

    return list;
  }, [problems, query, difficulty, sortBy, bookmarked]);

  return (
    <div style={{ padding: '32px 36px', maxWidth: 1100 }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, color: '#52526d', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>Problems</div>
        <h1 style={{ fontSize: 28, fontWeight: 700, fontFamily: 'Space Mono, monospace', color: '#e8e8f2', margin: 0 }}>
          Problem History
        </h1>
        <p style={{ color: '#52526d', fontSize: 13, marginTop: 6 }}>
          {problems.length} problems tracked · {problems.filter(p => p.bookmarked).length} bookmarked
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search problems or tags..."
          style={{
            flex: 1, minWidth: 200,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 9, color: '#e8e8f2',
            padding: '9px 14px', fontSize: 13,
            outline: 'none', fontFamily: 'DM Sans, sans-serif',
          }}
          onFocus={e => e.target.style.borderColor = '#09d2f5'}
          onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
        />

        {['', 'Easy', 'Medium', 'Hard'].map((d) => (
          <button
            key={d || 'all'}
            onClick={() => setDifficulty(d)}
            style={{
              padding: '8px 14px', borderRadius: 9, fontSize: 12, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
              background: difficulty === d
                ? (d ? `${DIFF_COLORS[d]}20` : 'rgba(9,210,245,0.1)')
                : 'rgba(255,255,255,0.04)',
              border: difficulty === d
                ? `1px solid ${d ? DIFF_COLORS[d] : '#09d2f5'}50`
                : '1px solid rgba(255,255,255,0.08)',
              color: difficulty === d
                ? (d ? DIFF_COLORS[d] : '#09d2f5')
                : '#737394',
            }}
          >
            {d || 'All'}
          </button>
        ))}

        <button
          onClick={() => setBookmarked(v => !v)}
          style={{
            padding: '8px 14px', borderRadius: 9, fontSize: 12, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
            background: bookmarked ? 'rgba(167,139,250,0.12)' : 'rgba(255,255,255,0.04)',
            border: bookmarked ? '1px solid rgba(167,139,250,0.3)' : '1px solid rgba(255,255,255,0.08)',
            color: bookmarked ? '#a78bfa' : '#737394',
          }}
        >
          ★ Bookmarked
        </button>

        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          style={{
            padding: '8px 14px', borderRadius: 9, fontSize: 12,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: '#9b9bba', cursor: 'pointer',
            fontFamily: 'DM Sans, sans-serif', outline: 'none',
          }}
        >
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* Problem List */}
      {isLoadingProblems ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#52526d' }}>Loading...</div>
      ) : filtered.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: 60,
          background: 'rgba(20,20,24,0.6)',
          border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16,
        }}>
          <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.3 }}>≡</div>
          <div style={{ fontSize: 14, color: '#52526d' }}>
            {problems.length === 0 ? 'No problems tracked yet. Solve problems on LeetCode to get started!' : 'No problems match your filters.'}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {/* Header */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 100px 90px 80px 100px 80px',
            padding: '8px 16px', fontSize: 10, color: '#52526d',
            letterSpacing: '0.1em', textTransform: 'uppercase',
          }}>
            <span>Problem</span>
            <span>Difficulty</span>
            <span>Time</span>
            <span>Attempts</span>
            <span>Solved</span>
            <span style={{ textAlign: 'right' }}>Actions</span>
          </div>

          {filtered.map((p) => (
            <div
              key={p.id}
              style={{
                display: 'grid', gridTemplateColumns: '1fr 100px 90px 80px 100px 80px',
                alignItems: 'center',
                padding: '14px 16px',
                background: 'rgba(20,20,24,0.7)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 12,
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(9,210,245,0.15)'; e.currentTarget.style.background = 'rgba(20,20,24,0.9)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.background = 'rgba(20,20,24,0.7)'; }}
            >
              {/* Title + Tags */}
              <div>
                <a
                  href={p.url || getLeetCodeProblemURL(p.titleSlug)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: 13, fontWeight: 600, color: '#c4c4d8',
                    textDecoration: 'none', display: 'block', marginBottom: 4,
                  }}
                  onMouseEnter={e => e.target.style.color = '#09d2f5'}
                  onMouseLeave={e => e.target.style.color = '#c4c4d8'}
                >
                  {p.title}
                </a>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {(p.tags ?? []).slice(0, 3).map(tag => (
                    <span key={tag} style={{
                      fontSize: 10, padding: '1px 7px', borderRadius: 99,
                      background: 'rgba(9,210,245,0.06)',
                      border: '1px solid rgba(9,210,245,0.15)',
                      color: '#737394',
                    }}>{tag}</span>
                  ))}
                </div>
              </div>

              {/* Difficulty */}
              <span style={{
                fontSize: 11, padding: '3px 9px', borderRadius: 99,
                fontWeight: 600, display: 'inline-block',
                background: `${DIFF_COLORS[p.difficulty] ?? '#9b9bba'}15`,
                color: DIFF_COLORS[p.difficulty] ?? '#9b9bba',
                border: `1px solid ${DIFF_COLORS[p.difficulty] ?? '#9b9bba'}30`,
              }}>{p.difficulty}</span>

              {/* Time */}
              <span style={{ fontSize: 12, color: '#737394' }}>
                {p.timeTaken ? `${p.timeTaken}m` : '—'}
              </span>

              {/* Attempts */}
              <span style={{ fontSize: 12, color: '#737394' }}>{p.attempts ?? 1}</span>

              {/* Date */}
              <span style={{ fontSize: 11, color: '#52526d' }}>{formatDate(p.solvedAt)}</span>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                <button
                  onClick={() => toggleBookmark(p.id)}
                  title={p.bookmarked ? 'Remove bookmark' : 'Bookmark'}
                  style={{
                    background: 'transparent', border: 'none',
                    color: p.bookmarked ? '#a78bfa' : '#3d3d52',
                    cursor: 'pointer', fontSize: 15, padding: '2px 4px',
                    transition: 'color 0.15s ease',
                  }}
                >
                  {p.bookmarked ? '★' : '☆'}
                </button>
                <a
                  href={p.url || getLeetCodeProblemURL(p.titleSlug)}
                  target="_blank" rel="noopener noreferrer"
                  style={{
                    background: 'rgba(9,210,245,0.08)',
                    border: '1px solid rgba(9,210,245,0.2)',
                    borderRadius: 6, color: '#09d2f5',
                    fontSize: 11, fontWeight: 600,
                    padding: '3px 9px', textDecoration: 'none',
                  }}
                >
                  Open
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
