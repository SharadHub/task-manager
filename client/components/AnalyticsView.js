'use client';
import { useEffect, useState } from 'react';
import { getOverview, getDaily, getPriority, getLabels, getTimeByProject } from '../lib/api';
import { formatTime } from '../lib/utils';
import {
  BarChart, Bar, AreaChart, Area, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid, Cell, PieChart, Pie, Legend
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--surface-2)', border: '1px solid var(--border-2)',
      borderRadius: 8, padding: '8px 12px', fontSize: 12,
    }}>
      <div style={{ color: 'var(--text-3)', marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || 'var(--text)' }}>
          {p.name}: {p.value}
        </div>
      ))}
    </div>
  );
};

export default function AnalyticsView() {
  const [overview, setOverview] = useState(null);
  const [daily30, setDaily30] = useState([]);
  const [priority, setPriority] = useState([]);
  const [labels, setLabels] = useState([]);
  const [timeByProject, setTimeByProject] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getOverview(), getDaily(30), getPriority(), getLabels(), getTimeByProject()])
      .then(([ov, d, p, l, t]) => {
        setOverview(ov);
        setDaily30(d);
        setPriority(p);
        setLabels(l);
        setTimeByProject(t);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>
      Loading analytics...
    </div>
  );

  const pieData = priority
    .filter(p => p.total > 0)
    .map((p, i) => ({
      name: p.priority,
      value: p.total,
      fill: ['#94a3b8', '#60a5fa', '#fbbf24', '#f87171'][i] || '#7c6af7',
    }));

  const weeklyAvg = daily30.length >= 7
    ? Math.round(daily30.slice(-7).reduce((s, d) => s + d.completed, 0) / 7 * 10) / 10
    : 0;

  const bestDay = [...daily30].sort((a, b) => b.completed - a.completed)[0];

  return (
    <div style={{ padding: '28px 32px', flex: 1, overflow: 'auto' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--text)', marginBottom: 4 }}>
          Analytics
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-3)' }}>Performance insights and productivity trends</p>
      </div>

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'TOTAL TIME TRACKED', value: formatTime(overview?.totalTime), icon: '⏱', color: 'var(--accent)' },
          { label: 'AVG TIME / TASK', value: formatTime(overview?.avgTime), icon: '◷', color: 'var(--blue)' },
          { label: 'WEEKLY AVG', value: `${weeklyAvg}/day`, icon: '📈', color: 'var(--green)' },
          { label: 'BEST DAY', value: bestDay ? `${bestDay.completed} tasks` : '—', icon: '🏆', color: 'var(--amber)' },
        ].map(k => (
          <div key={k.label} style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 12, padding: '16px 18px', position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: k.color }} />
            <div style={{ fontSize: 10, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', marginBottom: 8 }}>
              {k.label}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 22 }}>{k.icon}</span>
              <span style={{ fontSize: 22, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--text)' }}>
                {k.value}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* 30-day bar chart */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 12, padding: 20, marginBottom: 20,
      }}>
        <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 16, fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}>
          30-DAY COMPLETION HISTORY
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={daily30} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 9, fill: 'var(--text-3)' }}
              tickFormatter={d => d.slice(5)} axisLine={false} tickLine={false}
              interval={4} />
            <YAxis tick={{ fontSize: 10, fill: 'var(--text-3)' }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="completed" name="Completed" radius={[3, 3, 0, 0]}>
              {daily30.map((_, i) => (
                <Cell key={i} fill={`rgba(124, 106, 247, ${0.4 + (i / daily30.length) * 0.6})`} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
        {/* Priority pie */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 12, fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}>
            TASK DISTRIBUTION
          </div>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%"
                  outerRadius={65} innerRadius={35} strokeWidth={0}>
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Pie>
                <Tooltip formatter={(v, n) => [v, n.charAt(0).toUpperCase() + n.slice(1)]} />
                <Legend formatter={v => <span style={{ fontSize: 11, color: 'var(--text-2)' }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)', fontSize: 13 }}>
              No data
            </div>
          )}
        </div>

        {/* Labels */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 12, fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}>
            TOP LABELS
          </div>
          {labels.length === 0 ? (
            <div style={{ color: 'var(--text-3)', fontSize: 13 }}>No labels used</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {labels.slice(0, 8).map((l, i) => {
                const maxCount = labels[0]?.count || 1;
                return (
                  <div key={l.label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                      <span style={{ fontSize: 12, color: 'var(--text-2)' }}>#{l.label}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>{l.count}</span>
                    </div>
                    <div style={{ height: 4, background: 'var(--bg-3)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: 2,
                        width: `${(l.count / maxCount) * 100}%`,
                        background: `hsl(${(i * 37 + 220) % 360}, 65%, 60%)`,
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Time by project */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 12, fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}>
            TIME BY PROJECT
          </div>
          {timeByProject.length === 0 ? (
            <div style={{ color: 'var(--text-3)', fontSize: 13 }}>No time tracked</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {timeByProject.map((t, i) => {
                const maxTime = timeByProject[0]?.totalTime || 1;
                return (
                  <div key={t._id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                      <span style={{ fontSize: 12, color: 'var(--text-2)' }}>
                        {t.project.icon} {t.project.name}
                      </span>
                      <span style={{ fontSize: 11, color: t.project.color, fontFamily: 'var(--font-mono)' }}>
                        {formatTime(t.totalTime)}
                      </span>
                    </div>
                    <div style={{ height: 4, background: 'var(--bg-3)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: 2, background: t.project.color,
                        width: `${(t.totalTime / maxTime) * 100}%`,
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
