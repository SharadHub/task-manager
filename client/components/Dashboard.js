'use client';
import { useEffect, useState } from 'react';
import { getOverview, getDaily, getPriority, getRecentActivity, getTimeByProject } from '../lib/api';
import StatCard from './StatCard';
import { formatTime, timeAgo } from '../lib/utils';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid, Cell
} from 'recharts';

const COLORS = ['#7c6af7', '#3b82f6', '#22c55e', '#f59e0b', '#ef4444'];
const PRIORITY_COLORS = { low: '#94a3b8', medium: '#60a5fa', high: '#fbbf24', urgent: '#f87171' };

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--surface-2)', border: '1px solid var(--border-2)',
      borderRadius: 8, padding: '8px 12px', fontSize: 12,
    }}>
      <div style={{ color: 'var(--text-3)', marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color }}>{p.name}: {p.value}</div>
      ))}
    </div>
  );
};

export default function Dashboard({ onNav }) {
  const [overview, setOverview] = useState(null);
  const [daily, setDaily] = useState([]);
  const [priority, setPriority] = useState([]);
  const [recent, setRecent] = useState([]);
  const [timeByProject, setTimeByProject] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getOverview(), getDaily(14), getPriority(), getRecentActivity(), getTimeByProject()
    ]).then(([ov, d, p, r, t]) => {
      setOverview(ov);
      setDaily(d);
      setPriority(p);
      setRecent(r);
      setTimeByProject(t);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{
      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'var(--text-3)', fontFamily: 'var(--font-mono)', fontSize: 13,
    }}>Loading dashboard...</div>
  );

  const completionRate = overview?.total
    ? Math.round((overview.completed / overview.total) * 100) : 0;

  return (
    <div style={{ padding: '16px', flex: 1, overflow: 'auto' }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: 24,
          color: 'var(--text)', marginBottom: 4
        }}>Dashboard</h1>
        <p style={{ fontSize: 12, color: 'var(--text-3)' }}>
          Your productivity at a glance
        </p>
      </div>

      {/* Overview cards */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
        gap: 12, marginBottom: 20,
      }}>
        <StatCard label="TOTAL TASKS" value={overview?.total} icon="≡" color="var(--accent)" />
        <StatCard label="COMPLETED" value={overview?.completed} icon="✓" color="var(--green)" />
        <StatCard label="IN PROGRESS" value={overview?.inProgress} icon="◷" color="var(--blue)" />
        <StatCard label="PENDING" value={overview?.pending} icon="○" color="var(--amber)" />
        <StatCard
          label="COMPLETION RATE"
          value={`${completionRate}%`}
          icon="◫"
          color={completionRate > 70 ? 'var(--green)' : 'var(--amber)'}
          sub={`${overview?.completed}/${overview?.total} tasks`}
        />
        <StatCard
          label="TIME TRACKED"
          value={formatTime(overview?.totalTime)}
          icon="⏱"
          color="var(--accent-2)"
          sub={`Avg ${formatTime(overview?.avgTime)}/task`}
        />
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12, marginBottom: 20 }}>
        {/* Daily chart */}
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 12, padding: 16,
        }}>
          <div style={{
            fontSize: 12, color: 'var(--text-3)', marginBottom: 16,
            fontFamily: 'var(--font-mono)', letterSpacing: '0.05em'
          }}>14-DAY COMPLETION TREND</div>
          <ResponsiveContainer width="100%" height={140}>
            <AreaChart data={daily} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gradCompleted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c6af7" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#7c6af7" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradCreated" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-3)', fontFamily: 'DM Mono' }}
                tickFormatter={d => d.slice(5)} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text-3)' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="created" name="Created" stroke="#3b82f6"
                strokeWidth={1.5} fill="url(#gradCreated)" dot={false} />
              <Area type="monotone" dataKey="completed" name="Completed" stroke="#7c6af7"
                strokeWidth={2} fill="url(#gradCompleted)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Priority breakdown */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 12, padding: 16,
        marginBottom: 20,
      }}>
        <div style={{
          fontSize: 12, color: 'var(--text-3)', marginBottom: 12,
          fontFamily: 'var(--font-mono)', letterSpacing: '0.05em'
        }}>PRIORITY BREAKDOWN</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {priority.map(p => (
              <div key={p.priority}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{
                    fontSize: 12, color: PRIORITY_COLORS[p.priority],
                    fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.05em'
                  }}>{p.priority}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
                    {p.completed}/{p.total}
                  </span>
                </div>
                <div style={{ height: 6, background: 'var(--bg-3)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 3,
                    width: p.total > 0 ? `${(p.completed / p.total) * 100}%` : '0%',
                    background: PRIORITY_COLORS[p.priority],
                    transition: 'width 0.6s ease',
                  }} />
                </div>
              </div>
            ))}
          </div>

          {/* Time by project */}
          {timeByProject.length > 0 && (
            <>
              <div style={{
                fontSize: 12, color: 'var(--text-3)', margin: '20px 0 12px',
                fontFamily: 'var(--font-mono)', letterSpacing: '0.05em'
              }}>TIME BY PROJECT</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {timeByProject.slice(0, 4).map((t, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: 'var(--text-2)' }}>
                      {t.project.icon} {t.project.name}
                    </span>
                    <span style={{
                      fontSize: 11, color: 'var(--accent-2)',
                      fontFamily: 'var(--font-mono)'
                    }}>{formatTime(t.totalTime)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Recent activity */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 12, padding: 16,
      }}>
        <div style={{
          fontSize: 12, color: 'var(--text-3)', marginBottom: 12,
          fontFamily: 'var(--font-mono)', letterSpacing: '0.05em',
          display: 'flex', justifyContent: 'space-between',
        }}>
          <span>RECENTLY COMPLETED</span>
          <button
            onClick={() => onNav('history')}
            style={{
              background: 'none', border: 'none', color: 'var(--accent)',
              cursor: 'pointer', fontSize: 11, fontFamily: 'var(--font-mono)',
            }}
          >view all →</button>
        </div>
        {recent.length === 0 ? (
          <div style={{ color: 'var(--text-3)', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>
            No completed tasks yet
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {recent.slice(0, 8).map((t, i) => (
              <div key={t._id} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 0',
                borderBottom: i < recent.length - 1 ? '1px solid var(--border)' : 'none',
              }}>
                <span style={{ color: 'var(--green)', fontSize: 13 }}>✓</span>
                <span style={{
                  flex: 1, fontSize: 13, color: 'var(--text)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>{t.title}</span>
                {t.project && (
                  <span style={{
                    fontSize: 11, color: t.project.color, fontFamily: 'var(--font-mono)',
                    background: `${t.project.color}18`, border: `1px solid ${t.project.color}33`,
                    borderRadius: 4, padding: '2px 6px', flexShrink: 0,
                  }}>{t.project.name}</span>
                )}
                {t.timeSpent > 0 && (
                  <span style={{
                    fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', flexShrink: 0
                  }}>⏱ {formatTime(t.timeSpent)}</span>
                )}
                <span style={{
                  fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', flexShrink: 0
                }}>{timeAgo(t.completedAt)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
