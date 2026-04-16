'use client';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getProjects } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: '◈', href: '/dashboard' },
  { id: 'tasks', label: 'All Tasks', icon: '≡', href: '/tasks' },
  { id: 'projects', label: 'Projects', icon: '⬡', href: '/projects' },
  { id: 'history', label: 'History', icon: '◷', href: '/history' },
  { id: 'analytics', label: 'Analytics', icon: '◫', href: '/analytics' },
];

export default function NavigationSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [projects, setProjects] = useState([]);
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    getProjects().then(setProjects).catch(() => {});
  }, []);

  const isActive = (href) => {
    if (href === '/dashboard') return pathname === '/' || pathname === '/dashboard';
    return pathname === href;
  };

  const handleNav = (href) => {
    router.push(href);
    if (isMobile) {
      setMobileMenuOpen(false);
    }
  };

  // Mobile Navigation Component - Bottom Navbar
  if (isMobile) {
    return (
      <>
        {/* Mobile Header */}
        <header style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '56px',
          background: 'var(--bg-2)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          zIndex: 1000,
        }}>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: '18px',
            color: 'var(--accent-2)',
            letterSpacing: '-0.5px',
          }}>TaskFlow</span>
          <button
            onClick={() => setShowLogoutConfirm(true)}
            style={{
              background: 'none',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              color: 'var(--text-2)',
              cursor: 'pointer',
              fontSize: '13px',
              fontFamily: 'var(--font-sans)',
              padding: '6px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.12s',
            }}
          >
            <span>⇤</span>
            <span>Logout</span>
          </button>
        </header>

        {/* Bottom Navigation Bar */}
        <nav style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: '65px',
          background: 'var(--bg-2)',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          padding: '0 8px',
          zIndex: 1000,
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}>
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => handleNav(item.href)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                padding: '6px 4px',
                borderRadius: '8px',
                border: 'none',
                background: isActive(item.href) ? 'var(--accent-glow)' : 'transparent',
                color: isActive(item.href) ? 'var(--accent-2)' : 'var(--text-2)',
                cursor: 'pointer',
                fontSize: '10px',
                fontFamily: 'var(--font-sans)',
                fontWeight: isActive(item.href) ? 600 : 400,
                transition: 'all 0.12s',
                minWidth: '48px',
                textDecoration: 'none',
              }}
            >
              <span style={{ 
                fontSize: '20px', 
                lineHeight: 1,
                marginBottom: 1
              }}>{item.icon}</span>
              <span style={{
                fontSize: '9px',
                lineHeight: 1,
                textAlign: 'center',
                maxWidth: '48px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Logout Confirmation Modal */}
        {showLogoutConfirm && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}>
            <div style={{
              background: 'var(--bg-2)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '320px',
              width: '100%',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
            }}>
              <div style={{
                fontSize: '18px',
                fontWeight: 600,
                color: 'var(--text)',
                marginBottom: '12px',
                fontFamily: 'var(--font-sans)'
              }}>
                Confirm Logout
              </div>
              <div style={{
                fontSize: '14px',
                color: 'var(--text-2)',
                marginBottom: '24px',
                lineHeight: '1.5',
                fontFamily: 'var(--font-sans)'
              }}>
                Are you sure you want to log out?
              </div>
              <div style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'flex-end'
              }}>
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    background: 'var(--surface)',
                    color: 'var(--text-2)',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontFamily: 'var(--font-sans)',
                    fontWeight: 500,
                    transition: 'all 0.12s'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    logout();
                    setShowLogoutConfirm(false);
                  }}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'var(--accent)',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontFamily: 'var(--font-sans)',
                    fontWeight: 500,
                    transition: 'all 0.12s'
                  }}
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Desktop Sidebar Component
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
            onClick={() => handleNav(item.href)}
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
              background: isActive(item.href) ? 'var(--accent-glow)' : 'transparent',
              color: isActive(item.href) ? 'var(--accent-2)' : 'var(--text-2)',
              cursor: 'pointer',
              fontSize: 13,
              fontFamily: 'var(--font-sans)',
              fontWeight: isActive(item.href) ? 600 : 400,
              marginBottom: 2,
              transition: 'all 0.12s',
              borderLeft: isActive(item.href) ? '2px solid var(--accent)' : '2px solid transparent',
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
                onClick={() => router.push(`/tasks?project=${p._id}`)}
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
      {/* User section */}
      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
      }}>
        {collapsed ? (
          <button
            onClick={logout}
            title="Logout"
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px 0',
              borderRadius: 8,
              border: 'none',
              background: 'transparent',
              color: 'var(--text-2)',
              cursor: 'pointer',
              fontSize: 16,
            }}
          >
            ⇤
          </button>
        ) : (
          <div>
            <div style={{
              fontSize: 12,
              color: 'var(--text-2)',
              fontFamily: 'var(--font-sans)',
              marginBottom: 4,
              fontWeight: 500,
            }}>
              {user?.username}
            </div>
            <button
              onClick={logout}
              style={{
                fontSize: 11,
                color: 'var(--text-3)',
                fontFamily: 'var(--font-mono)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                textDecoration: 'underline',
              }}
            >
              Logout
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      {!collapsed && (
        <div style={{
          padding: '12px 16px',
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
