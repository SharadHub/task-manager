'use client';
import { useEffect, useState } from 'react';
import { getTasks } from '../lib/api';
import { formatTime, formatDate, timeAgo } from '../lib/utils';

export default function HistoryView() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('completed');

  useEffect(() => {
    setLoading(true);
    getTasks({ status: filter })
      .then(data => setTasks(data.sort((a, b) =>
        new Date(b.updatedAt) - new Date(a.updatedAt)
      )))
      .finally(() => setLoading(false));
  }, [filter]);

  // Group by date
  const grouped = tasks.reduce((acc, task) => {
    const date = new Date(task.completedAt || task.updatedAt || task.createdAt)
      .toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    if (!acc[date]) acc[date] = [];
    acc[date].push(task);
    return acc;
  }, {});

  return (
    <div style={{ padding: '28px 32px', flex: 1, overflow: 'auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--text)', marginBottom: 4 }}>
          Task History
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-3)' }}>Full log of all your tasks with timestamps</p>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24 }}>
        {[
          { val: 'completed', label: 'Completed' },
          { val: 'archived', label: 'Archived' },
          { val: 'in_progress', label: 'In Progress' },
        ].map(t => (
          <button key={t.val} onClick={() => setFilter(t.val)} style={{
            padding: '5px 14px', borderRadius: 999,
            background: filter === t.val ? 'var(--accent)' : 'var(--surface)',
            color: filter === t.val ? '#fff' : 'var(--text-2)',
            border: 'none', fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-sans)',
          }}>{t.label}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ color: 'var(--text-3)', fontSize: 13 }}>Loading history...</div>
      ) : Object.keys(grouped).length === 0 ? (
        <div style={{ color: 'var(--text-3)', fontSize: 14, textAlign: 'center', padding: 60 }}>
          No {filter.replace('_', ' ')} tasks
        </div>
      ) : (
        Object.entries(grouped).map(([date, dayTasks]) => (
          <div key={date} style={{ marginBottom: 28 }}>
            <div style={{
              fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em',
              color: 'var(--text-3)', marginBottom: 10,
              textTransform: 'uppercase', paddingBottom: 8,
              borderBottom: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <span>{date}</span>
              <span style={{ color: 'var(--accent)', fontWeight: 500 }}>
                {dayTasks.length} task{dayTasks.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {dayTasks.map((task, i) => (
                <div key={task._id} style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto auto auto auto',
                  gap: 12,
                  padding: '12px 0',
                  borderBottom: i < dayTasks.length - 1 ? '1px solid var(--border)' : 'none',
                  alignItems: 'center',
                }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{
                      fontSize: 13, color: 'var(--text)', fontWeight: 500,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>{task.title}</div>
                    {task.project && (
                      <div style={{ fontSize: 11, color: task.project.color, marginTop: 2 }}>
                        {task.project.icon} {task.project.name}
                      </div>
                    )}
                  </div>

                  <span className={`badge priority-${task.priority}`}>{task.priority}</span>
                  
                  {task.timeSpent > 0 ? (
                    <span style={{
                      fontSize: 11, color: 'var(--accent-2)',
                      fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap',
                    }}>⏱ {formatTime(task.timeSpent)}</span>
                  ) : <span />}

                  <div style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>
                    Created {timeAgo(task.createdAt)}
                  </div>

                  {task.completedAt && (
                    <div style={{ fontSize: 11, color: 'var(--green)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>
                      ✓ {timeAgo(task.completedAt)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
