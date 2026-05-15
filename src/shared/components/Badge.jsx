import React from 'react';
import { cn } from '../../shared/utils/index.js';

// ─── Difficulty Badge ────────────────────────────────────────────────────────
const DIFF_MAP = {
  Easy:   'badge-easy',
  Medium: 'badge-medium',
  Hard:   'badge-hard',
};

export function DifficultyBadge({ difficulty, className }) {
  return (
    <span className={cn('difficulty-badge', DIFF_MAP[difficulty] ?? 'bg-surface-400 text-secondary', className)}>
      {difficulty}
    </span>
  );
}

// ─── Tag Chip ────────────────────────────────────────────────────────────────
export function TagChip({ label, onRemove, onClick, active, color }) {
  return (
    <span
      onClick={onClick}
      className={cn(
        'tag-chip',
        active && 'bg-brand-400/15 border-brand-400/40',
      )}
      style={color ? { color, borderColor: `${color}40`, background: `${color}12` } : {}}
    >
      {label}
      {onRemove && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="ml-1 opacity-60 hover:opacity-100 transition-opacity"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontSize: '0.85em', padding: 0, lineHeight: 1 }}
        >
          ✕
        </button>
      )}
    </span>
  );
}

// ─── Status Badge ────────────────────────────────────────────────────────────
const STATUS_MAP = {
  accepted:   { bg: 'rgba(74,222,128,0.12)',  color: '#4ade80', border: 'rgba(74,222,128,0.25)',  label: 'Accepted' },
  wrong:      { bg: 'rgba(239,68,68,0.12)',   color: '#f87171', border: 'rgba(239,68,68,0.25)',   label: 'Wrong Answer' },
  tle:        { bg: 'rgba(251,191,36,0.12)',  color: '#fbbf24', border: 'rgba(251,191,36,0.25)',  label: 'Time Limit' },
  mle:        { bg: 'rgba(167,139,250,0.12)', color: '#a78bfa', border: 'rgba(167,139,250,0.25)', label: 'Memory Limit' },
  runtime:    { bg: 'rgba(251,146,60,0.12)',  color: '#fb923c', border: 'rgba(251,146,60,0.25)',  label: 'Runtime Error' },
  compileErr: { bg: 'rgba(156,163,175,0.12)', color: '#9ca3af', border: 'rgba(156,163,175,0.25)', label: 'Compile Error' },
};

export function StatusBadge({ status, className }) {
  const s = STATUS_MAP[status?.toLowerCase()] ?? STATUS_MAP.accepted;
  return (
    <span
      className={cn('text-[10px] px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wide border', className)}
      style={{ background: s.bg, color: s.color, borderColor: s.border }}
    >
      {s.label}
    </span>
  );
}

// ─── XP Badge ────────────────────────────────────────────────────────────────
export function XPBadge({ xp }) {
  return (
    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold border"
      style={{ background: 'rgba(9,210,245,0.1)', color: '#09d2f5', borderColor: 'rgba(9,210,245,0.25)' }}>
      +{xp} XP
    </span>
  );
}

// ─── Mastery Badge ────────────────────────────────────────────────────────────
const MASTERY_COLORS = ['#52526d','#f59e0b','#38bdf8','#4ade80','#a78bfa','#09d2f5'];
const MASTERY_LABELS = ['New','Learning','Reviewing','Mastered','Expert','Legend'];

export function MasteryBadge({ level = 0 }) {
  const color = MASTERY_COLORS[level] ?? MASTERY_COLORS[0];
  const label = MASTERY_LABELS[level] ?? 'New';
  return (
    <span className="text-[10px] px-2.5 py-0.5 rounded-full font-semibold border"
      style={{ background: `${color}15`, color, borderColor: `${color}35` }}>
      {label}
    </span>
  );
}
