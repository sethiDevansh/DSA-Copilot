import React, { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  LineChart, Line, CartesianGrid,
} from 'recharts';
import useAppStore from '../../shared/store/useAppStore.js';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#14141c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 12px', fontSize: 12 }}>
      <div style={{ color: '#9b9bba', marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color ?? '#09d2f5' }}>{p.name}: {p.value}</div>
      ))}
    </div>
  );
};

export function AnalyticsPage() {
  const { problems, problemStats, mistakeStats } = useAppStore();

  const topicData = useMemo(() => {
    return (problemStats?.topicsArr ?? []).slice(0, 12).map(({ topic, count }) => ({
      topic: topic.length > 14 ? topic.slice(0, 14) + '…' : topic,
      count,
    }));
  }, [problemStats]);

  const diffByMonth = useMemo(() => {
    const months = {};
    for (const p of problems) {
      const m = (p.solvedAt ?? p.addedAt ?? '').slice(0, 7);
      if (!m) continue;
      months[m] = months[m] ?? { month: m, Easy: 0, Medium: 0, Hard: 0 };
      months[m][p.difficulty] = (months[m][p.difficulty] ?? 0) + 1;
    }
    return Object.values(months).sort((a, b) => a.month.localeCompare(b.month)).slice(-6);
  }, [problems]);

  const langData = useMemo(() => {
    return Object.entries(problemStats?.byLanguage ?? {}).map(([lang, count]) => ({ lang, count })).sort((a, b) => b.count - a.count).slice(0, 6);
  }, [problemStats]);

  const radarData = useMemo(() => {
    const topicsMap = problemStats?.byTopic ?? {};
    const max = Math.max(...Object.values(topicsMap), 1);
    const topics = ['Array', 'Dynamic Programming', 'Graph', 'Tree', 'String', 'Binary Search', 'Greedy', 'Stack'];
    return topics.map(t => ({
      topic: t.length > 10 ? t.slice(0, 10) + '…' : t,
      value: Math.round(((topicsMap[t] ?? 0) / max) * 100),
    }));
  }, [problemStats]);

  const mistakeData = useMemo(() => {
    return (mistakeStats?.topMistakes ?? []).slice(0, 6).map(({ type, count }) => ({
      type: type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      count,
    }));
  }, [mistakeStats]);

  const totalProblems = problemStats?.total ?? 0;

  return (
    <div style={{ padding: '32px 36px', maxWidth: 1100 }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, color: '#52526d', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>Analytics</div>
        <h1 style={{ fontSize: 28, fontWeight: 700, fontFamily: 'Space Mono, monospace', color: '#e8e8f2', margin: 0 }}>Performance Analytics</h1>
        <p style={{ color: '#52526d', fontSize: 13, marginTop: 6 }}>Deep insights into your solving patterns and progress</p>
      </div>

      {/* Summary Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Avg Solve Time', value: problemStats?.avgTimeMins > 0 ? `${problemStats.avgTimeMins}m` : '—', color: '#09d2f5' },
          { label: 'Topics Covered', value: Object.keys(problemStats?.byTopic ?? {}).length, color: '#a78bfa' },
          { label: 'Mistakes Logged', value: mistakeStats?.total ?? 0, color: '#f87171' },
          { label: 'Languages Used', value: Object.keys(problemStats?.byLanguage ?? {}).length, color: '#4ade80' },
        ].map((s) => (
          <div key={s.label} style={{
            padding: '18px 20px', background: 'rgba(20,20,24,0.8)',
            border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14,
          }}>
            <div style={{ fontSize: 10, color: '#52526d', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: s.color, fontFamily: 'Space Mono, monospace' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Topics Bar */}
        <div style={{ padding: '20px 22px', background: 'rgba(20,20,24,0.8)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16 }}>
          <div style={{ fontSize: 11, color: '#52526d', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>Problems by Topic</div>
          {topicData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topicData} layout="vertical" margin={{ left: 0, right: 8 }}>
                <XAxis type="number" tick={{ fill: '#52526d', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="topic" tick={{ fill: '#9b9bba', fontSize: 11 }} axisLine={false} tickLine={false} width={95} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Solved" fill="#09d2f5" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3d3d52', fontSize: 13 }}>No data yet</div>
          )}
        </div>

        {/* Skill Radar */}
        <div style={{ padding: '20px 22px', background: 'rgba(20,20,24,0.8)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16 }}>
          <div style={{ fontSize: 11, color: '#52526d', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>Skill Radar</div>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.06)" />
              <PolarAngleAxis dataKey="topic" tick={{ fill: '#52526d', fontSize: 10 }} />
              <Radar name="Proficiency" dataKey="value" stroke="#09d2f5" fill="#09d2f5" fillOpacity={0.15} />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Monthly Difficulty */}
        <div style={{ padding: '20px 22px', background: 'rgba(20,20,24,0.8)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16 }}>
          <div style={{ fontSize: 11, color: '#52526d', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>
            Monthly Progress by Difficulty
          </div>
          {diffByMonth.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={diffByMonth} margin={{ left: -20, right: 8 }}>
                <XAxis dataKey="month" tick={{ fill: '#52526d', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#52526d', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="Easy"   name="Easy"   stackId="a" fill="#4ade80" radius={[0,0,0,0]} />
                <Bar dataKey="Medium" name="Medium" stackId="a" fill="#fb923c" radius={[0,0,0,0]} />
                <Bar dataKey="Hard"   name="Hard"   stackId="a" fill="#f87171" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3d3d52', fontSize: 13 }}>No monthly data</div>
          )}
        </div>

        {/* Language breakdown */}
        <div style={{ padding: '20px 22px', background: 'rgba(20,20,24,0.8)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16 }}>
          <div style={{ fontSize: 11, color: '#52526d', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>
            Languages Used
          </div>
          {langData.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {langData.map(({ lang, count }) => (
                <div key={lang}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: '#9b9bba' }}>{lang}</span>
                    <span style={{ fontSize: 11, color: '#52526d' }}>{count}</span>
                  </div>
                  <div style={{ height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: 99,
                      width: `${(count / (langData[0]?.count ?? 1)) * 100}%`,
                      background: 'linear-gradient(90deg, #a78bfa, #c084fc)',
                    }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: '#3d3d52', fontSize: 13, marginTop: 20 }}>No language data</div>
          )}
        </div>
      </div>

      {/* Mistake Breakdown */}
      {mistakeData.length > 0 && (
        <div style={{ padding: '20px 22px', background: 'rgba(20,20,24,0.8)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16 }}>
          <div style={{ fontSize: 11, color: '#52526d', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>
            Common Mistakes
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={mistakeData} margin={{ left: -20, right: 8 }}>
              <XAxis dataKey="type" tick={{ fill: '#52526d', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#52526d', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Occurrences" fill="#f87171" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
