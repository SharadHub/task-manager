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
    <div style={{ 
      padding: 'var(--spacing-md)', 
      flex: 1, 
      overflow: 'auto',
      maxWidth: '100%'
    }}>
      <div className="flex-responsive" style={{ 
        marginBottom: 'var(--spacing-lg)',
        justifyContent: 'space-between',
        alignItems: 'flex-start'
      }}>
        <div>
          <h1 className="heading-responsive" style={{ 
            fontFamily: 'var(--font-display)', 
            color: 'var(--text)', 
            marginBottom: 'var(--spacing-xs)',
            lineHeight: '1.3'
          }}>
            Projects
          </h1>
          <p style={{ 
            fontSize: 'var(--font-sm)', 
            color: 'var(--text-3)',
            lineHeight: '1.5'
          }}>{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: 'var(--spacing-sm) var(--spacing-md)',
            fontSize: 'var(--font-sm)',
            minHeight: '44px',
            minWidth: '140px'
          }}
        >
          {showForm ? 'Cancel' : '+ New Project'}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div style={{
          background: 'var(--surface)', 
          border: '1px solid var(--border)',
          borderRadius: 12, 
          padding: 'var(--spacing-lg)', 
          marginBottom: 'var(--spacing-lg)',
        }} className="animate-fade-up">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            <div className="project-form-inputs" style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: 'var(--spacing-md)' 
            }}>
              <input 
                className="tf-input" 
                placeholder="Project name *"
                value={form.name} 
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))} 
                autoFocus 
                style={{ minHeight: '44px' }}
              />
              <input 
                className="tf-input" 
                placeholder="Description (optional)"
                value={form.description} 
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))} 
                style={{ minHeight: '44px' }}
              />
            </div>
            <div className="project-form-customization" style={{ 
              display: 'flex', 
              gap: 'var(--spacing-lg)', 
              alignItems: 'flex-start',
              flexWrap: 'wrap'
            }}>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <div style={{ 
                  fontSize: 11, 
                  color: 'var(--text-3)', 
                  marginBottom: 'var(--spacing-sm)', 
                  fontFamily: 'var(--font-mono)' 
                }}>ICON</div>
                <div style={{ 
                  display: 'flex', 
                  gap: 'var(--spacing-xs)', 
                  flexWrap: 'wrap', 
                  maxWidth: '100%'
                }}>
                  {PROJECT_ICONS.map(icon => (
                    <button 
                      key={icon} 
                      onClick={() => setForm(f => ({ ...f, icon }))} 
                      style={{
                        fontSize: 18, 
                        padding: 'var(--spacing-xs)', 
                        borderRadius: 6, 
                        border: 'none',
                        background: form.icon === icon ? 'var(--accent-glow)' : 'var(--bg-3)',
                        cursor: 'pointer',
                        minHeight: '36px',
                        minWidth: '36px'
                      }}
                    >{icon}</button>
                  ))}
                </div>
              </div>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <div style={{ 
                  fontSize: 11, 
                  color: 'var(--text-3)', 
                  marginBottom: 'var(--spacing-sm)', 
                  fontFamily: 'var(--font-mono)' 
                }}>COLOR</div>
                <div style={{ 
                  display: 'flex', 
                  gap: 'var(--spacing-xs)', 
                  flexWrap: 'wrap', 
                  maxWidth: '100%'
                }}>
                  {PROJECT_COLORS.map(c => (
                    <button 
                      key={c} 
                      onClick={() => setForm(f => ({ ...f, color: c }))} 
                      style={{
                        width: 24, 
                        height: 24, 
                        borderRadius: '50%', 
                        border: 'none',
                        background: c, 
                        cursor: 'pointer',
                        outline: form.color === c ? `3px solid ${c}` : 'none',
                        outlineOffset: 2,
                        minHeight: '24px',
                        minWidth: '24px'
                      }} 
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="project-form-actions" style={{ 
              display: 'flex', 
              gap: 'var(--spacing-sm)',
              flexWrap: 'wrap'
            }}>
              <button 
                className="btn btn-primary" 
                onClick={handleCreate}
                style={{
                  padding: 'var(--spacing-sm) var(--spacing-lg)',
                  fontSize: 'var(--font-sm)',
                  minHeight: '44px'
                }}
              >Create Project</button>
              <button 
                className="btn btn-ghost" 
                onClick={() => setShowForm(false)}
                style={{
                  padding: 'var(--spacing-sm) var(--spacing-lg)',
                  fontSize: 'var(--font-sm)',
                  minHeight: '44px'
                }}
              >Cancel</button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ 
          color: 'var(--text-3)', 
          fontSize: 'var(--font-sm)', 
          fontFamily: 'var(--font-mono)',
          textAlign: 'center',
          padding: 'var(--spacing-lg)',
          lineHeight: '1.5'
        }}>Loading...</div>
      ) : projects.length === 0 ? (
        <div className="empty-state" style={{
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          justifyContent: 'center', 
          gap: 'var(--spacing-md)', 
          padding: 'var(--spacing-xl)',
          textAlign: 'center'
        }}>
          <span style={{ 
            fontSize: '48px', 
            opacity: 0.5,
            marginBottom: 'var(--spacing-sm)'
          }}>⬡</span>
          <div style={{ 
            color: 'var(--text-3)', 
            fontSize: 'var(--font-base)',
            lineHeight: '1.5'
          }}>No projects yet</div>
          <button 
            className="btn btn-primary" 
            onClick={() => setShowForm(true)}
            style={{
              padding: 'var(--spacing-sm) var(--spacing-lg)',
              fontSize: 'var(--font-sm)',
              minHeight: '44px'
            }}
          >Create first project</button>
        </div>
      ) : (
        <div className="projects-grid" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', 
          gap: 'var(--spacing-md)',
          maxWidth: '100%'
        }}>
          {projects.map(p => {
            const pct = p.taskCount > 0 ? (p.completedCount / p.taskCount) * 100 : 0;
            return (
              <div key={p._id} className="project-card" style={{
                background: 'var(--surface)', 
                border: '1px solid var(--border)',
                borderRadius: 12, 
                padding: 'var(--spacing-lg)',
                borderTop: `3px solid ${p.color}`,
                cursor: 'pointer', 
                transition: 'all 0.15s',
                maxWidth: '100%',
                wordBreak: 'break-word'
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor = p.color}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <div className="project-header" style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  marginBottom: 'var(--spacing-md)',
                  alignItems: 'flex-start'
                }}>
                  <div className="project-title" style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 'var(--spacing-sm)',
                    flex: 1,
                    minWidth: 0
                  }}>
                    <span style={{ fontSize: '22px' }}>{p.icon}</span>
                    <span style={{ 
                      fontSize: 'var(--font-base)', 
                      fontWeight: 600, 
                      color: 'var(--text)',
                      wordBreak: 'break-word',
                      lineHeight: '1.3'
                    }}>{p.name}</span>
                  </div>
                  <button 
                    onClick={() => handleDelete(p._id)} 
                    style={{
                      background: 'none', 
                      border: 'none', 
                      color: 'var(--text-3)',
                      cursor: 'pointer', 
                      fontSize: 14, 
                      opacity: 0.5,
                      padding: 'var(--spacing-xs)',
                      borderRadius: '4px',
                      flexShrink: 0,
                      transition: 'opacity 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '0.5'}
                  >✕</button>
                </div>
                {p.description && (
                  <div style={{ 
                    fontSize: 'var(--font-sm)', 
                    color: 'var(--text-3)', 
                    marginBottom: 'var(--spacing-md)',
                    lineHeight: '1.4'
                  }}>{p.description}</div>
                )}
                <div style={{ marginBottom: 'var(--spacing-sm)' }}>
                  <div style={{ 
                    height: 4, 
                    background: 'var(--bg-3)', 
                    borderRadius: 2, 
                    overflow: 'hidden' 
                  }}>
                    <div style={{
                      height: '100%', 
                      background: p.color, 
                      borderRadius: 2,
                      width: `${pct}%`, 
                      transition: 'width 0.6s ease',
                    }} />
                  </div>
                </div>
                <div className="project-footer" style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 'var(--spacing-xs)'
                }}>
                  <span style={{ 
                    fontSize: 12, 
                    color: 'var(--text-3)', 
                    fontFamily: 'var(--font-mono)',
                    flex: 1,
                    minWidth: 0
                  }}>
                    {p.completedCount}/{p.taskCount} tasks · {Math.round(pct)}%
                  </span>
                  <button
                    onClick={() => router.push(`/tasks?project=${p._id}`)}
                    style={{
                      background: `${p.color}18`, 
                      border: `1px solid ${p.color}33`,
                      color: p.color, 
                      borderRadius: 6, 
                      padding: 'var(--spacing-xs) var(--spacing-sm)',
                      fontSize: 11, 
                      cursor: 'pointer', 
                      fontFamily: 'var(--font-mono)',
                      flexShrink: 0,
                      whiteSpace: 'nowrap',
                      minHeight: '28px'
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
