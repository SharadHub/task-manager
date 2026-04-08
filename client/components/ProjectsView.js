'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getProjects, createProject, deleteProject } from '../lib/api';
import { PROJECT_COLORS, PROJECT_ICONS } from '../lib/utils';

export default function ProjectsView() {
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', color: PROJECT_COLORS[0], icon: '📁' });

  const load = () => {
    setLoading(true);
    getProjects().then(setProjects).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleCreate = async () => {
    if (!form.name.trim()) return;
    const p = await createProject(form);
    setProjects(prev => [{ ...p, taskCount: 0, completedCount: 0 }, ...prev]);
    setForm({ name: '', description: '', color: PROJECT_COLORS[0], icon: '📁' });
    setShowForm(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete project? Tasks will be unassigned.')) return;
    await deleteProject(id);
    setProjects(prev => prev.filter(p => p._id !== id));
  };

  return (
    <div style={{ padding: '28px 32px', flex: 1, overflow: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--text)', marginBottom: 4 }}>
            Projects
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-3)' }}>{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ New Project'}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border-2)',
          borderRadius: 12, padding: 20, marginBottom: 20,
        }} className="animate-fade-up">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <input className="tf-input" placeholder="Project name *"
                value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} autoFocus />
              <input className="tf-input" placeholder="Description (optional)"
                value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 6, fontFamily: 'var(--font-mono)' }}>ICON</div>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', maxWidth: 200 }}>
                  {PROJECT_ICONS.map(icon => (
                    <button key={icon} onClick={() => setForm(f => ({ ...f, icon }))} style={{
                      fontSize: 18, padding: '4px 6px', borderRadius: 6, border: 'none',
                      background: form.icon === icon ? 'var(--accent-glow)' : 'var(--bg-3)',
                      cursor: 'pointer',
                    }}>{icon}</button>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 6, fontFamily: 'var(--font-mono)' }}>COLOR</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', maxWidth: 220 }}>
                  {PROJECT_COLORS.map(c => (
                    <button key={c} onClick={() => setForm(f => ({ ...f, color: c }))} style={{
                      width: 24, height: 24, borderRadius: '50%', border: 'none',
                      background: c, cursor: 'pointer',
                      outline: form.color === c ? `3px solid ${c}` : 'none',
                      outlineOffset: 2,
                    }} />
                  ))}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary" onClick={handleCreate}>Create Project</button>
              <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ color: 'var(--text-3)', fontSize: 13, fontFamily: 'var(--font-mono)' }}>Loading...</div>
      ) : projects.length === 0 ? (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', gap: 12, padding: 60,
        }}>
          <span style={{ fontSize: 48 }}>⬡</span>
          <div style={{ color: 'var(--text-3)', fontSize: 14 }}>No projects yet</div>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>Create first project</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
          {projects.map(p => {
            const pct = p.taskCount > 0 ? (p.completedCount / p.taskCount) * 100 : 0;
            return (
              <div key={p._id} style={{
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 12, padding: 20,
                borderTop: `3px solid ${p.color}`,
                cursor: 'pointer', transition: 'all 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor = p.color}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 22 }}>{p.icon}</span>
                    <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>{p.name}</span>
                  </div>
                  <button onClick={() => handleDelete(p._id)} style={{
                    background: 'none', border: 'none', color: 'var(--text-3)',
                    cursor: 'pointer', fontSize: 14, opacity: 0.5,
                  }}>✕</button>
                </div>
                {p.description && (
                  <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 12 }}>{p.description}</div>
                )}
                <div style={{ marginBottom: 8 }}>
                  <div style={{ height: 4, background: 'var(--bg-3)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', background: p.color, borderRadius: 2,
                      width: `${pct}%`, transition: 'width 0.6s ease',
                    }} />
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
                    {p.completedCount}/{p.taskCount} tasks · {Math.round(pct)}%
                  </span>
                  <button
                    onClick={() => router.push(`/tasks?project=${p._id}`)}
                    style={{
                      background: `${p.color}18`, border: `1px solid ${p.color}33`,
                      color: p.color, borderRadius: 6, padding: '3px 8px',
                      fontSize: 11, cursor: 'pointer', fontFamily: 'var(--font-mono)',
                    }}
                  >view →</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
