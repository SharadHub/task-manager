'use client';
import { useState } from 'react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: '◈' },
  { id: 'tasks', label: 'All Tasks', icon: '≡' },
  { id: 'projects', label: 'Projects', icon: '⬡' },
  { id: 'history', label: 'History', icon: '◷' },
  { id: 'analytics', label: 'Analytics', icon: '◫' },
];

export default function Sidebar({ active, onNav, projects = [] }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside style={{
      width: collapsed ? 60 : 220,
      minWidth: collapsed ? 60 : 220,
      background: 'var(--bg-2)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.2s ease, min-width 0.2s ease',
      overflow: 'hidden',
      position: 'relative',
      zIndex: 10,
    }}>
      {/* Logo */}
      <div style={{
        padding: '20px 16px 16px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        justifyContent: collapsed ? 'center' : 'space-between',
      }}>
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: 20,
              color: 'var(--accent-2)',
              letterSpacing: '-0.5px',
            }}>TaskFlow</span>
          </div>
        )}
        {collapsed && <span style={{ fontSize: 18, color: 'var(--accent-2)' }}>◈</span>}
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            background: 'none', border: 'none', color: 'var(--text-3)',
            cursor: 'pointer', fontSize: 14, padding: 2,
            display: 'flex', alignItems: 'center',
          }}
        >
          {collapsed ? '›' : '‹'}
        </button>
      </div>

      {/* Nav */}
      <nav style={{ padding: '12px 8px', flex: 1, overflow: 'hidden' }}>
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            onClick={() => onNav(item.id)}
            title={collapsed ? item.label : undefined}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: collapsed ? '9px 0' : '9px 10px',
              justifyContent: collapsed ? 'center' : 'flex-start',
              borderRadius: 8,
              border: 'none',
              background: active === item.id ? 'var(--accent-glow)' : 'transparent',
              color: active === item.id ? 'var(--accent-2)' : 'var(--text-2)',
              cursor: 'pointer',
              fontSize: 13,
              fontFamily: 'var(--font-sans)',
              fontWeight: active === item.id ? 600 : 400,
              marginBottom: 2,
              transition: 'all 0.12s',
              borderLeft: active === item.id ? '2px solid var(--accent)' : '2px solid transparent',
            }}
          >
            <span style={{ fontSize: 15, minWidth: 16, textAlign: 'center' }}>{item.icon}</span>
            {!collapsed && <span>{item.label}</span>}
          </button>
        ))}

        {/* Projects section */}
        {!collapsed && projects.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <div style={{
              fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em',
              color: 'var(--text-3)', padding: '0 10px 8px', textTransform: 'uppercase'
            }}>Projects</div>
            {projects.slice(0, 6).map(p => (
              <button
                key={p._id}
                onClick={() => onNav('tasks', { project: p._id })}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                  padding: '7px 10px', borderRadius: 8, border: 'none',
                  background: 'transparent', color: 'var(--text-2)', cursor: 'pointer',
                  fontSize: 12, fontFamily: 'var(--font-sans)', marginBottom: 2,
                  transition: 'all 0.12s', textAlign: 'left',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <span style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: p.color, flexShrink: 0
                }} />
                <span style={{
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  flex: 1
                }}>{p.icon} {p.name}</span>
                <span style={{
                  fontSize: 10, color: 'var(--text-3)', fontFamily: 'var(--font-mono)'
                }}>{p.completedCount}/{p.taskCount}</span>
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div style={{
          padding: '12px 16px',
          borderTop: '1px solid var(--border)',
          fontSize: 11,
          color: 'var(--text-3)',
          fontFamily: 'var(--font-mono)',
        }}>
          TaskFlow v1.0
        </div>
      )}
    </aside>
  );
}
