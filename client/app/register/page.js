'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import Link from 'next/link';

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const { register } = useAuth();
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const getPasswordStrength = (password) => {
    if (password.length === 0) return 0;
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    return Math.min(strength, 4);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password
      });
      router.push('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength(formData.password);

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
          Create Account
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
              Username
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-3)',
                fontSize: '16px'
              }}>
                👤
              </span>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                minLength="3"
                placeholder="Enter your username"
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 40px',
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
            <p style={{
              fontSize: 'var(--font-xs)',
              color: 'var(--text-3)',
              marginTop: 'var(--spacing-xs)'
            }}>
              3-20 characters
            </p>
          </div>

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
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-3)',
                fontSize: '16px'
              }}>
                ✉️
              </span>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 40px',
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
            <p style={{
              fontSize: 'var(--font-xs)',
              color: 'var(--text-3)',
              marginTop: 'var(--spacing-xs)'
            }}>
              a combination of letters, numbers, and symbols
            </p>
          </div>

          <div style={{ marginBottom: 'var(--spacing-lg)' }}>
            <label style={{
              display: 'block',
              marginBottom: 'var(--spacing-xs)',
              color: 'var(--text-2)',
              fontSize: 'var(--font-sm)',
              fontWeight: '500'
            }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-3)',
                fontSize: '16px',
                zIndex: 1
              }}>
                🔒
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength="6"
                placeholder="Enter your password"
                style={{
                  width: '100%',
                  padding: '12px 40px 12px 40px',
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
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-3)',
                  cursor: 'pointer',
                  fontSize: '14px',
                  padding: '4px',
                  borderRadius: '4px',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.color = 'var(--text)'}
                onMouseLeave={(e) => e.target.style.color = 'var(--text-3)'}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            
            {formData.password && (
              <div style={{ marginTop: 'var(--spacing-xs)' }}>
                <div style={{
                  display: 'flex',
                  gap: '4px',
                  marginBottom: 'var(--spacing-xs)'
                }}>
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      style={{
                        flex: 1,
                        height: '4px',
                        borderRadius: '2px',
                        backgroundColor: level <= passwordStrength 
                          ? passwordStrength <= 1 ? 'var(--red)' 
                          : passwordStrength <= 2 ? 'var(--amber)'
                          : passwordStrength <= 3 ? 'var(--green)'
                          : '#10b981'
                          : 'var(--border)'
                      }}
                    />
                  ))}
                </div>
                <p style={{
                  fontSize: 'var(--font-xs)',
                  color: passwordStrength <= 1 ? 'var(--red)' 
                  : passwordStrength <= 2 ? 'var(--amber)'
                  : passwordStrength <= 3 ? 'var(--green)'
                  : '#10b981',
                  marginTop: 'var(--spacing-xs)'
                }}>
                  {passwordStrength <= 1 ? 'Weak' 
                  : passwordStrength <= 2 ? 'Fair'
                  : passwordStrength <= 3 ? 'Good'
                  : 'Strong'} password
                </p>
              </div>
            )}
          </div>

          <div style={{ marginBottom: 'var(--spacing-xl)' }}>
            <label style={{
              display: 'block',
              marginBottom: 'var(--spacing-xs)',
              color: 'var(--text-2)',
              fontSize: 'var(--font-sm)',
              fontWeight: '500'
            }}>
              Confirm Password
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-3)',
                fontSize: '16px',
                zIndex: 1
              }}>
                🔒
              </span>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                minLength="6"
                placeholder="Confirm your password"
                style={{
                  width: '100%',
                  padding: '12px 40px 12px 40px',
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
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-3)',
                  cursor: 'pointer',
                  fontSize: '14px',
                  padding: '4px',
                  borderRadius: '4px',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.color = 'var(--text)'}
                onMouseLeave={(e) => e.target.style.color = 'var(--text-3)'}
              >
                {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
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
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p style={{
          textAlign: 'center',
          color: 'var(--text-3)',
          fontSize: 'var(--font-sm)',
          lineHeight: '1.5'
        }}>
          Already have an account?{' '}
          <Link 
            href="/login"
            style={{
              color: 'var(--accent)',
              textDecoration: 'none',
              fontWeight: '500',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.color = 'var(--accent-2)'}
            onMouseLeave={(e) => e.target.style.color = 'var(--accent)'}
          >
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}
