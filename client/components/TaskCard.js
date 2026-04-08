'use client';
import { useState, useEffect } from 'react';
import { formatTime, timeAgo } from '../lib/utils';
import { startTimer, stopTimer, updateTask, deleteTask } from '../lib/api';

export default function TaskCard({ task, onUpdate, onDelete, compact = false }) {
  const [elapsed, setElapsed] = useState(0);
  const [loading, setLoading] = useState(false);

  // Live timer tick
  useEffect(() => {
    if (!task.timerRunning || !task.timerStartedAt) { setElapsed(0); return; }
    const tick = () => {
      setElapsed(Math.floor((Date.now() - new Date(task.timerStartedAt).getTime()) / 1000));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [task.timerRunning, task.timerStartedAt]);

  const totalTime = (task.timeSpent || 0) + elapsed;

  const handleTimer = async () => {
    setLoading(true);
    try {
      const updated = task.timerRunning ? await stopTimer(task._id) : await startTimer(task._id);
      onUpdate(updated);
    } finally { setLoading(false); }
  };

  const handleStatus = async (status) => {
    setLoading(true);
    try {
      const updated = await updateTask(task._id, { status });
      onUpdate(updated);
    } finally { setLoading(false); }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this task?')) return;
    await deleteTask(task._id);
    onDelete(task._id);
  };

  const isCompleted = task.status === 'completed';
  const isInProgress = task.status === 'in_progress';

  return (
    <div className="task-card" style={{
      borderRadius: 10,
      padding: compact ? '12px 14px' : '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      opacity: isCompleted ? 0.75 : 1,
    }}>
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        {/* Checkbox */}
        <button
          onClick={() => handleStatus(isCompleted ? 'pending' : 'completed')}
          style={{
            width: 18, height: 18, borderRadius: 5,
            border: `2px solid ${isCompleted ? 'var(--green)' : 'var(--border-2)'}`,
            background: isCompleted ? 'var(--green-dim)' : 'transparent',
            cursor: 'pointer', flexShrink: 0, marginTop: 2,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--green)', fontSize: 11, transition: 'all 0.15s',
          }}
        >
          {isCompleted ? '✓' : ''}
        </button>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 14, fontWeight: 500, color: 'var(--text)',
            textDecoration: isCompleted ? 'line-through' : 'none',
            wordBreak: 'break-word',
          }}>{task.title}</div>
          {task.description && !compact && (
            <div style={{
              fontSize: 12, color: 'var(--text-3)', marginTop: 3,
              overflow: 'hidden', display: '-webkit-box',
              WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            }}>{task.description}</div>
          )}
        </div>

        {/* Timer button */}
        {!isCompleted && (
          <button
            onClick={handleTimer}
            disabled={loading}
            style={{
              background: task.timerRunning ? 'rgba(239,68,68,0.12)' : 'var(--bg-3)',
              border: `1px solid ${task.timerRunning ? 'rgba(239,68,68,0.3)' : 'var(--border)'}`,
              color: task.timerRunning ? 'var(--red)' : 'var(--text-3)',
              borderRadius: 6, padding: '4px 8px', cursor: 'pointer',
              fontSize: 11, fontFamily: 'var(--font-mono)', flexShrink: 0,
              display: 'flex', alignItems: 'center', gap: 4,
              transition: 'all 0.15s',
            }}
          >
            {task.timerRunning ? (
              <>
                <span style={{
                  width: 6, height: 6, borderRadius: 1,
                  background: 'var(--red)', display: 'inline-block'
                }} />
                {formatTime(totalTime)}
              </>
            ) : (
              <>▷ {totalTime > 0 ? formatTime(totalTime) : 'Start'}</>
            )}
          </button>
        )}
        {isCompleted && totalTime > 0 && (
          <span style={{
            fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)',
            background: 'var(--bg-3)', border: '1px solid var(--border)',
            borderRadius: 6, padding: '4px 8px', flexShrink: 0,
          }}>⏱ {formatTime(totalTime)}</span>
        )}
      </div>

      {/* Badges row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, alignItems: 'center' }}>
        <span className={`badge status-${task.status}`}>{task.status.replace('_', ' ')}</span>
        <span className={`badge priority-${task.priority}`}>{task.priority}</span>
        {task.project && (
          <span className="badge" style={{
            background: `${task.project.color}18`,
            color: task.project.color,
            border: `1px solid ${task.project.color}33`,
          }}>
            {task.project.icon} {task.project.name}
          </span>
        )}
        {task.labels?.map(l => (
          <span key={l} className="badge" style={{
            background: 'var(--bg-3)', color: 'var(--text-3)',
            border: '1px solid var(--border)',
          }}>#{l}</span>
        ))}
        <span style={{
          fontSize: 11, color: 'var(--text-3)', marginLeft: 'auto',
          fontFamily: 'var(--font-mono)',
        }}>{timeAgo(task.createdAt)}</span>
      </div>

      {/* Status change bar */}
      {!compact && !isCompleted && (
        <div style={{ display: 'flex', gap: 4 }}>
          {['pending', 'in_progress', 'archived'].filter(s => s !== task.status).map(s => (
            <button
              key={s}
              onClick={() => handleStatus(s)}
              className="btn btn-ghost btn-sm"
              style={{ fontSize: 11 }}
            >
              → {s.replace('_', ' ')}
            </button>
          ))}
          <button onClick={handleDelete} className="btn btn-danger btn-sm" style={{ marginLeft: 'auto' }}>
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
