'use client';
import { useState, useEffect } from 'react';
import { createTask, updateTask, getProjects } from '../lib/api';

const DEFAULT = {
  title: '', description: '', priority: 'medium',
  status: 'pending', labels: '', project: '', dueDate: ''
};

export default function TaskModal({ task, onClose, onSave }) {
  const [form, setForm] = useState(DEFAULT);
  const [projects, setProjects] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getProjects().then(setProjects).catch(() => {});
    if (task) {
      setForm({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'medium',
        status: task.status || 'pending',
        labels: (task.labels || []).join(', '),
        project: task.project?._id || task.project || '',
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      });
    }
  }, [task]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.title.trim()) { setError('Title is required'); return; }
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        labels: form.labels ? form.labels.split(',').map(l => l.trim()).filter(Boolean) : [],
        project: form.project || null,
        dueDate: form.dueDate || null,
      };
      const saved = task
        ? await updateTask(task._id, payload)
        : await createTask(payload);
      onSave(saved);
      onClose();
    } catch (e) {
      setError(e.response?.data?.error || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: 20, backdropFilter: 'blur(4px)',
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border-2)',
        borderRadius: 16,
        padding: 28,
        width: '100%',
        maxWidth: 520,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
      }} className="animate-fade-up">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--text)' }}>
            {task ? 'Edit Task' : 'New Task'}
          </h2>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: 'var(--text-3)',
            cursor: 'pointer', fontSize: 18,
          }}>✕</button>
        </div>

        {error && (
          <div style={{
            background: 'var(--red-dim)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 8, padding: '8px 12px', fontSize: 13, color: 'var(--red)'
          }}>{error}</div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-3)', display: 'block', marginBottom: 5 }}>
              TITLE *
            </label>
            <input
              className="tf-input"
              value={form.title}
              onChange={e => set('title', e.target.value)}
              placeholder="Task title..."
              autoFocus
            />
          </div>

          <div>
            <label style={{ fontSize: 12, color: 'var(--text-3)', display: 'block', marginBottom: 5 }}>
              DESCRIPTION
            </label>
            <textarea
              className="tf-input"
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Optional details..."
              rows={3}
              style={{ resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-3)', display: 'block', marginBottom: 5 }}>
                PRIORITY
              </label>
              <select className="tf-input" value={form.priority} onChange={e => set('priority', e.target.value)}>
                {['low', 'medium', 'high', 'urgent'].map(p => (
                  <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-3)', display: 'block', marginBottom: 5 }}>
                STATUS
              </label>
              <select className="tf-input" value={form.status} onChange={e => set('status', e.target.value)}>
                {['pending', 'in_progress', 'completed', 'archived'].map(s => (
                  <option key={s} value={s}>{s.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-3)', display: 'block', marginBottom: 5 }}>
                PROJECT
              </label>
              <select className="tf-input" value={form.project} onChange={e => set('project', e.target.value)}>
                <option value="">No project</option>
                {projects.map(p => (
                  <option key={p._id} value={p._id}>{p.icon} {p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-3)', display: 'block', marginBottom: 5 }}>
                DUE DATE
              </label>
              <input
                type="date"
                className="tf-input"
                value={form.dueDate}
                onChange={e => set('dueDate', e.target.value)}
                style={{ colorScheme: 'dark' }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, color: 'var(--text-3)', display: 'block', marginBottom: 5 }}>
              LABELS (comma separated)
            </label>
            <input
              className="tf-input"
              value={form.labels}
              onChange={e => set('labels', e.target.value)}
              placeholder="design, frontend, bug..."
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
          <button onClick={onClose} className="btn btn-ghost">Cancel</button>
          <button onClick={handleSubmit} className="btn btn-primary" disabled={saving}>
            {saving ? '...' : task ? 'Save Changes' : 'Create Task'}
          </button>
        </div>
      </div>
    </div>
  );
}
