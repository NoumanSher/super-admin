import  { useState } from 'react';
import { Mail, Lock, Shield, AlertTriangle, Eye, EyeOff, Loader2 } from 'lucide-react';
import { authService } from '../services/authService';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await authService.login(email, password);
      if (response.success) {
        onLoginSuccess(response.admin);
      }
    } catch (err) {
      setError(err.message || 'Invalid administrator credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page neon-gradient-bg fade-in" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '20px'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '440px',
        padding: '40px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: 'var(--shadow-card), 0 0 40px rgba(99, 102, 241, 0.05)'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            marginBottom: '16px',
            boxShadow: '0 0 20px rgba(99, 102, 241, 0.15)'
          }}>
            <Shield size={32} color="#818cf8" />
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>
            PAKSHIPPER
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Platform Control Center
          </p>
        </div>

        {/* Error Indicator */}
        {error && (
          <div className="glass-panel fade-in" style={{
            background: 'rgba(239, 68, 68, 0.1)',
            borderColor: 'rgba(239, 68, 68, 0.2)',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <AlertTriangle size={18} color="#ef4444" style={{ flexShrink: 0 }} />
            <p style={{ color: '#fca5a5', fontSize: '0.85rem', fontWeight: 500 }}>{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ position: 'relative' }}>
            <label className="form-label">Admin Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} color="var(--text-muted)" style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)'
              }} />
              <input
                type="email"
                className="form-input"
                placeholder="admin@pakshipper.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                style={{ paddingLeft: '48px' }}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ position: 'relative', marginBottom: '32px' }}>
            <label className="form-label">Security Keyphrase</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="var(--text-muted)" style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)'
              }} />
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                style={{ paddingLeft: '48px', paddingRight: '48px' }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', height: '48px', fontSize: '1rem' }}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                Authenticating...
              </>
            ) : (
              'Enter Control Board'
            )}
          </button>
        </form>
      </div>

      {/* Embedded Spin Keyframes style */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}
