import React, { useEffect, useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import useAppStore from '../../shared/store/useAppStore.js';
import { problemService } from '../../shared/services/problemService.js';
import { getHeatColor, formatDate, formatDuration, getLevel, getXPToNextLevel } from '../../shared/utils/index.js';

const DIFF_COLORS = { Easy: '#4ade80', Medium: '#fb923c', Hard: '#f87171' };

function StatCard({ label, value, sub, color = '#09d2f5', icon }) {
  return (
    <div style={{
      padding: '20px 22px',
      background: 'rgba(20,20,24,0.8)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 16,
      transition: 'all 0.2s ease',
      cursor: 'default',
    }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(9,210,245,0.2)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ fontSize: 11, color: '#52526d', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</div>
        {icon && <span style={{ fontSize: 18, opacity: 0.7 }}>{icon}</span>}
      </div>
      <div style={{ fontSize: 32, fontWeight: 700, color, fontFamily: 'Space Mono, monospace', lineHeight: 1, marginBottom: 4 }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 11, color: '#52526d' }}>{sub}</div>}
    </div>
  );
}

function HeatmapCalendar({ byDate }) {
  const weeks = [];
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 6 * 7 + 1);

  let current = new Date(startDate);
  let week = [];
  while (current <= today) {
    const dateStr = current.toISOString().split('T')[0];
    week.push({ date: dateStr, count: byDate[dateStr] ?? 0 });
    if (week.length === 7) { weeks.push(week); week = []; }
    current.setDate(current.getDate() + 1);
  }
  if (week.length) weeks.push(week);

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div>
      <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
        {dayLabels.map(d => (
          <div key={d} style={{ width: 12, fontSize: 8, color: '#3d3d52', textAlign: 'center' }}>{d[0]}</div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 3 }}>
        {weeks.map((week, wi) => (
          <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {week.map((day) => (
              <div
                key={day.date}
                title={`${day.date}: ${day.count} problem${day.count !== 1 ? 's' : ''}`}
                style={{
                  width: 12, height: 12, borderRadius: 2,
                  background: getHeatColor(day.count),
                  cursor: 'pointer',
                  transition: 'transform 0.1s ease',
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.4)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function OverviewPage() {
  const { problems, problemStats, streak, userProfile, dueRevisions, isLoadingProblems } = useAppStore();
  const level  = userProfile ? getLevel(userProfile.xp) : null;
  const xpInfo = userProfile ? getXPToNextLevel(userProfile.xp) : null;

  // Build daily activity data for chart
  const last14 = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    const str = d.toISOString().split('T')[0];
    return {
      date:  str.slice(5), // MM-DD
      count: problemStats?.byDate?.[str] ?? 0,
    };
  });

  const pieData = ['Easy', 'Medium', 'Hard'].map((d) => ({
    name:  d,
    value: problemStats?.byDifficulty?.[d] ?? 0,
  })).filter(d => d.value > 0);

  if (isLoadingProblems) {
    return (
      <div style={{ padding: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.3 }}>⊞</div>
          <div style={{ color: '#52526d', fontSize: 14 }}>Loading your data...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px 36px', maxWidth: 1200 }}>
      {/* Page Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, color: '#52526d', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>
          Dashboard
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 700, fontFamily: 'Space Mono, monospace', color: '#e8e8f2', margin: 0, lineHeight: 1.2 }}>
          Overview
        </h1>
        <p style={{ color: '#52526d', fontSize: 13, marginTop: 6 }}>
          Your DSA journey at a glance
        </p>
      </div>

      {/* Empty state */}
      {!problems.length && (
        <div style={{
          padding: '48px 40px', textAlign: 'center',
          background: 'rgba(20,20,24,0.6)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 20, marginBottom: 28,
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🚀</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#e8e8f2', marginBottom: 8 }}>
            Welcome to DSA Copilot!
          </div>
          <div style={{ fontSize: 13, color: '#52526d', lineHeight: 1.8, maxWidth: 440, margin: '0 auto', marginBottom: 20 }}>
            Start solving problems on LeetCode and DSA Copilot will automatically
            track your progress, schedule revisions, and analyze patterns.
          </div>
          <a
            href="https://leetcode.com/problemset/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '11px 24px',
              background: 'linear-gradient(135deg, #09d2f5, #0093bb)',
              color: '#000', borderRadius: 10, fontWeight: 700,
              fontSize: 13, textDecoration: 'none',
              display: 'inline-block',
            }}
          >
            Start on LeetCode →
          </a>
        </div>
      )}

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        <StatCard
          label="Total Solved"
          value={problemStats?.total ?? 0}
          sub={`Best streak: ${streak?.best ?? 0} days`}
          color="#09d2f5"
          icon="≡"
        />
        <StatCard
          label="Current Streak"
          value={`${streak?.current ?? 0}🔥`}
          sub="Keep it going!"
          color="#fb923c"
          icon="🔥"
        />
        <StatCard
          label="Due for Revision"
          value={dueRevisions?.length ?? 0}
          sub={dueRevisions?.length > 0 ? 'Go to Revision tab' : 'All caught up!'}
          color={dueRevisions?.length > 0 ? '#fbbf24' : '#4ade80'}
          icon="↺"
        />
        <StatCard
          label="Avg Solve Time"
          value={problemStats?.avgTimeMins > 0 ? `${problemStats.avgTimeMins}m` : '—'}
          sub="Per problem"
          color="#a78bfa"
          icon="⏱"
        />
      </div>

      {/* Difficulty row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 24 }}>
        {['Easy', 'Medium', 'Hard'].map((d) => {
          const count = problemStats?.byDifficulty?.[d] ?? 0;
          const total = problemStats?.total ?? 1;
          return (
            <div key={d} style={{
              padding: '18px 20px',
              background: 'rgba(20,20,24,0.8)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 14,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{
                  fontSize: 11, padding: '3px 9px', borderRadius: 99, fontWeight: 700,
                  background: `${DIFF_COLORS[d]}15`, color: DIFF_COLORS[d],
                  border: `1px solid ${DIFF_COLORS[d]}30`, textTransform: 'uppercase', letterSpacing: '0.06em',
                }}>{d}</span>
                <span style={{ fontSize: 22, fontWeight: 700, color: DIFF_COLORS[d], fontFamily: 'Space Mono, monospace' }}>
                  {count}
                </span>
              </div>
              <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 99,
                  width: `${Math.round((count / Math.max(total, 1)) * 100)}%`,
                  background: DIFF_COLORS[d],
                  transition: 'width 0.8s ease',
                }} />
              </div>
              <div style={{ fontSize: 10, color: '#52526d', marginTop: 5 }}>
                {Math.round((count / Math.max(total, 1)) * 100)}% of total
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14, marginBottom: 24 }}>
        {/* Activity chart */}
        <div style={{
          padding: '22px 24px',
          background: 'rgba(20,20,24,0.8)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 16,
        }}>
          <div style={{ fontSize: 11, color: '#52526d', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>
            14-Day Activity
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <AreaChart data={last14} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#09d2f5" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#09d2f5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fill: '#52526d', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fill: '#52526d', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#14141c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: '#9b9bba' }}
                itemStyle={{ color: '#09d2f5' }}
              />
              <Area type="monotone" dataKey="count" name="Solved" stroke="#09d2f5" strokeWidth={2} fill="url(#areaGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div style={{
          padding: '22px 24px',
          background: 'rgba(20,20,24,0.8)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 16,
          display: 'flex', flexDirection: 'column',
        }}>
          <div style={{ fontSize: 11, color: '#52526d', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>
            Difficulty Mix
          </div>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={120}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={35} outerRadius={55} paddingAngle={3} dataKey="value">
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={DIFF_COLORS[entry.name]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#14141c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 8 }}>
                {pieData.map((d) => (
                  <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: DIFF_COLORS[d.name] }} />
                    <span style={{ color: '#9b9bba' }}>{d.name}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3d3d52', fontSize: 13 }}>
              No data yet
            </div>
          )}
        </div>
      </div>

      {/* Heatmap */}
      <div style={{
        padding: '22px 24px',
        background: 'rgba(20,20,24,0.8)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 16, marginBottom: 24,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: '#52526d', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Solving Heatmap — Last 6 Weeks
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: '#52526d' }}>
            Less
            {[0, 1, 2, 3, 4].map((n) => (
              <div key={n} style={{ width: 10, height: 10, borderRadius: 2, background: getHeatColor(n) }} />
            ))}
            More
          </div>
        </div>
        <HeatmapCalendar byDate={problemStats?.byDate ?? {}} />
      </div>

      {/* Top Topics */}
      {problemStats?.topicsArr?.length > 0 && (
        <div style={{
          padding: '22px 24px',
          background: 'rgba(20,20,24,0.8)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 16,
        }}>
          <div style={{ fontSize: 11, color: '#52526d', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>
            Topic Breakdown
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {problemStats.topicsArr.slice(0, 8).map(({ topic, count }) => (
              <div key={topic} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ fontSize: 12, color: '#9b9bba', width: 110, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexShrink: 0 }}>
                  {topic}
                </div>
                <div style={{ flex: 1, height: 5, background: 'rgba(255,255,255,0.05)', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 99,
                    width: `${Math.round((count / (problemStats.topicsArr[0]?.count ?? 1)) * 100)}%`,
                    background: 'linear-gradient(90deg, #09d2f5, #0093bb)',
                    transition: 'width 0.8s ease',
                  }} />
                </div>
                <div style={{ fontSize: 11, color: '#52526d', width: 24, textAlign: 'right', flexShrink: 0 }}>{count}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
