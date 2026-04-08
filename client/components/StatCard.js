'use client';

export default function StatCard({ label, value, sub, color = 'var(--accent)', icon, trend }) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 12,
      padding: '18px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: color, opacity: 0.8,
      }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ fontSize: 12, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}>
          {label}
        </span>
        {icon && (
          <span style={{
            fontSize: 18, opacity: 0.7,
            background: 'var(--bg-3)', borderRadius: 6, padding: '3px 6px'
          }}>{icon}</span>
        )}
      </div>
      <div style={{
        fontSize: 32, fontWeight: 700, color: 'var(--text)',
        fontFamily: 'var(--font-display)', lineHeight: 1
      }}>
        {value ?? '—'}
      </div>
      {sub && (
        <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{sub}</div>
      )}
      {trend !== undefined && (
        <div style={{
          fontSize: 11,
          color: trend >= 0 ? 'var(--green)' : 'var(--red)',
          fontFamily: 'var(--font-mono)',
        }}>
          {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)} vs yesterday
        </div>
      )}
    </div>
  );
}
