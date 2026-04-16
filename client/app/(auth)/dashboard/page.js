'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getOverview, getDaily, getPriority, getRecentActivity, getTimeByProject } from '../../../lib/api';
import StatCard from '../../../components/StatCard';
import { formatTime, timeAgo } from '../../../lib/utils';
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

export default function DashboardPage() {
  const router = useRouter();
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
    <div style={{ 
      padding: 'var(--spacing-md)', 
      flex: 1, 
      overflow: 'auto',
      maxWidth: '100%'
    }}>
      <div style={{ marginBottom: 'var(--spacing-lg)' }}>
        <h1 style={{
          fontFamily: 'var(--font-display)', 
          fontSize: 'var(--font-2xl)',
          color: 'var(--text)', 
          marginBottom: 'var(--spacing-xs)',
          lineHeight: '1.3'
        }}>Dashboard</h1>
        <p style={{ 
          fontSize: 'var(--font-sm)', 
          color: 'var(--text-3)',
          lineHeight: '1.5'
        }}>
          Your productivity at a glance
        </p>
      </div>

      {/* Overview cards */}
      <div className="grid-responsive dashboard-grid" style={{
        gap: 'var(--spacing-md)', 
        marginBottom: 'var(--spacing-lg)',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))'
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
      <div className="flex-responsive dashboard-charts" style={{ 
        gap: 'var(--spacing-md)', 
        marginBottom: 'var(--spacing-lg)',
        flexDirection: 'column'
      }}>
        {/* Daily chart */}
        <div style={{
          background: 'var(--surface)', 
          border: '1px solid var(--border)',
          borderRadius: 12, 
          padding: 'var(--spacing-lg)',
          order: 1
        }}>
          <div style={{
            fontSize: 'var(--font-xs)', 
            color: 'var(--text-3)', 
            marginBottom: 'var(--spacing-md)',
            fontFamily: 'var(--font-mono)', 
            letterSpacing: '0.05em',
            textAlign: 'center'
          }}>14-DAY COMPLETION TREND</div>
          <ResponsiveContainer width="100%" height={200}>
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

        {/* Priority breakdown */}
        <div style={{
          background: 'var(--surface)', 
          border: '1px solid var(--border)',
          borderRadius: 12, 
          padding: 'var(--spacing-lg)',
          order: 2
        }}>
          <div style={{
            fontSize: 'var(--font-xs)', 
            color: 'var(--text-3)', 
            marginBottom: 'var(--spacing-md)',
            fontFamily: 'var(--font-mono)', 
            letterSpacing: '0.05em',
            textAlign: 'center'
          }}>PRIORITY BREAKDOWN</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
            {priority.map(p => (
              <div key={p.priority}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-xs)' }}>
                  <span style={{
                    fontSize: 'var(--font-xs)', 
                    color: PRIORITY_COLORS[p.priority],
                    fontFamily: 'var(--font-mono)', 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.05em'
                  }}>{p.priority}</span>
                  <span style={{ 
                    fontSize: 'var(--font-xs)', 
                    color: 'var(--text-3)', 
                    fontFamily: 'var(--font-mono)' 
                  }}>
                    {p.completed}/{p.total}
                  </span>
                </div>
                <div style={{ 
                  height: 6, 
                  background: 'var(--bg-3)', 
                  borderRadius: 3, 
                  overflow: 'hidden' 
                }}>
                  <div style={{
                    height: '100%', 
                    borderRadius: 3,
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
                fontSize: 'var(--font-xs)', 
                color: 'var(--text-3)', 
                margin: 'var(--spacing-lg) 0 var(--spacing-sm)',
                fontFamily: 'var(--font-mono)', 
                letterSpacing: '0.05em',
                textAlign: 'center'
              }}>TIME BY PROJECT</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
                {timeByProject.slice(0, 4).map((t, i) => (
                  <div key={i} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: 'var(--spacing-xs) 0'
                  }}>
                    <span style={{ 
                      fontSize: 'var(--font-xs)', 
                      color: 'var(--text-2)',
                      flex: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {t.project.icon} {t.project.name}
                    </span>
                    <span style={{
                      fontSize: 10, 
                      color: 'var(--accent-2)',
                      fontFamily: 'var(--font-mono)',
                      flexShrink: 0
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
        background: 'var(--surface)', 
        border: '1px solid var(--border)',
        borderRadius: 12, 
        padding: 'var(--spacing-lg)',
      }}>
        <div style={{
          fontSize: 'var(--font-xs)', 
          color: 'var(--text-3)', 
          marginBottom: 'var(--spacing-md)',
          fontFamily: 'var(--font-mono)', 
          letterSpacing: '0.05em',
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'var(--spacing-xs)'
        }}>
          <span>RECENTLY COMPLETED</span>
          <button
            onClick={() => router.push('/history')}
            style={{
              background: 'none', 
              border: 'none', 
              color: 'var(--accent)',
              cursor: 'pointer', 
              fontSize: 10, 
              fontFamily: 'var(--font-mono)',
              padding: 'var(--spacing-xs)',
              borderRadius: '4px',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--accent-glow)'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >view all →</button>
        </div>
        {recent.length === 0 ? (
          <div style={{ 
            color: 'var(--text-3)', 
            fontSize: 'var(--font-sm)', 
            textAlign: 'center', 
            padding: 'var(--spacing-lg) 0',
            lineHeight: '1.5'
          }}>
            No completed tasks yet
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {recent.slice(0, 6).map((t, i) => (
              <div key={t._id} className="recent-activity-item" style={{
                display: 'flex', 
                alignItems: 'center', 
                gap: 'var(--spacing-sm)',
                padding: 'var(--spacing-sm) 0',
                borderBottom: i < Math.min(recent.length - 1, 5) ? '1px solid var(--border)' : 'none',
                flexWrap: 'wrap',
              }}>
                <span style={{ 
                  color: 'var(--green)', 
                  fontSize: 'var(--font-sm)',
                  flexShrink: 0
                }}>✓</span>
                <span style={{
                  flex: 1, 
                  fontSize: 'var(--font-sm)', 
                  color: 'var(--text)',
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis', 
                  whiteSpace: 'nowrap',
                  minWidth: 0,
                  lineHeight: '1.4'
                }}>{t.title}</span>
                <div className="meta-info" style={{ 
                  display: 'flex', 
                  gap: 'var(--spacing-xs)', 
                  alignItems: 'center',
                  flexShrink: 0 
                }}>
                  {t.project && (
                    <span style={{
                      fontSize: 10, 
                      color: t.project.color, 
                      fontFamily: 'var(--font-mono)',
                      background: `${t.project.color}18`, 
                      border: `1px solid ${t.project.color}33`,
                      borderRadius: 4, 
                      padding: '2px 6px',
                      whiteSpace: 'nowrap'
                    }}>{t.project.name}</span>
                  )}
                  {t.timeSpent > 0 && (
                    <span style={{
                      fontSize: 10, 
                      color: 'var(--text-3)', 
                      fontFamily: 'var(--font-mono)',
                      whiteSpace: 'nowrap'
                    }}>⏱ {formatTime(t.timeSpent)}</span>
                  )}
                  <span style={{
                    fontSize: 10, 
                    color: 'var(--text-3)', 
                    fontFamily: 'var(--font-mono)',
                    whiteSpace: 'nowrap'
                  }}>{timeAgo(t.completedAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
