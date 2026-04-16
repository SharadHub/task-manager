'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import Link from 'next/link';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(formData);
      router.push('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: 'var(--bg)',
      padding: 'var(--spacing-md)',
      width: '100%'
    }}>
      <div style={{
        backgroundColor: 'var(--surface)',
        padding: 'var(--spacing-lg)',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '400px',
        border: '1px solid var(--border)'
      }}>
        <h1 style={{
          textAlign: 'center',
          marginBottom: 'var(--spacing-lg)',
          color: 'var(--text)',
          fontSize: 'var(--font-xl)',
          fontWeight: '600',
          lineHeight: '1.3'
        }}>
          Login to TaskFlow
        </h1>

        {error && (
          <div style={{
            backgroundColor: 'var(--red-dim)',
            color: 'var(--red)',
            padding: 'var(--spacing-sm)',
            borderRadius: '8px',
            marginBottom: 'var(--spacing-md)',
            fontSize: 'var(--font-sm)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            lineHeight: '1.4'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 'var(--spacing-lg)' }}>
            <label style={{
              display: 'block',
              marginBottom: 'var(--spacing-xs)',
              color: 'var(--text-2)',
              fontSize: 'var(--font-sm)',
              fontWeight: '500'
            }}>
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-2)',
                color: 'var(--text)',
                fontSize: 'var(--font-sm)',
                outline: 'none',
                transition: 'border-color 0.2s',
                minHeight: '44px'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          <div style={{ marginBottom: 'var(--spacing-xl)' }}>
            <label style={{
              display: 'block',
              marginBottom: 'var(--spacing-xs)',
              color: 'var(--text-2)',
              fontSize: 'var(--font-sm)',
              fontWeight: '500'
            }}>
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-2)',
                color: 'var(--text)',
                fontSize: 'var(--font-sm)',
                outline: 'none',
                transition: 'border-color 0.2s',
                minHeight: '44px'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: loading ? 'var(--border)' : 'var(--accent)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: 'var(--font-base)',
              fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s',
              marginBottom: 'var(--spacing-lg)',
              minHeight: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p style={{
          textAlign: 'center',
          color: 'var(--text-3)',
          fontSize: 'var(--font-sm)',
          lineHeight: '1.5'
        }}>
          Don't have an account?{' '}
          <Link 
            href="/register"
            style={{
              color: 'var(--accent)',
              textDecoration: 'none',
              fontWeight: '500',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.color = 'var(--accent-2)'}
            onMouseLeave={(e) => e.target.style.color = 'var(--accent)'}
          >
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
