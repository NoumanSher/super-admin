import  { useState, useEffect, useCallback } from 'react';
import Login from './pages/Login';
import Shell from './components/layout/Shell';
import Overview from './pages/Overview';
import Tenants from './pages/Tenants';
import Settings from './pages/Settings';
import { authService } from './services/authService';

export default function App() {
  const [admin, setAdmin] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Verify and sync administrator session on mount
  const syncSession = useCallback(async () => {
    try {
      const activeUser = await authService.checkSession();
      if (activeUser) {
        setAdmin(activeUser);
      } else {
        // Double check local storage user as fallback if network is silent
        const cachedUser = authService.getCurrentUser();
        if (cachedUser) {
          setAdmin(cachedUser);
        }
      }
    } catch {
      setAdmin(null);
    } finally {
      setCheckingSession(false);
    }
  }, []);

  useEffect(() => {
    syncSession();

    // Listen to session expiry triggers dispatched by our API interceptor
    const handleExpiry = () => {
      setAdmin(null);
      alert("Administrator security session has expired. Please log in again.");
    };

    window.addEventListener('auth_session_expired', handleExpiry);
    return () => window.removeEventListener('auth_session_expired', handleExpiry);
  }, [syncSession]);

  const handleLoginSuccess = (authenticatedAdmin) => {
    setAdmin(authenticatedAdmin);
  };

  const handleLogout = () => {
    setAdmin(null);
  };

  // Render Loader during initial session check
  if (checkingSession) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#070913',
        color: '#818cf8',
        fontSize: '1rem',
        fontWeight: 600,
        fontFamily: 'monospace'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: '3px solid rgba(99, 102, 241, 0.1)',
            borderTopColor: '#818cf8',
            animation: 'spin 1s linear infinite'
          }} />
          <span>Verifying Control Board clearance...</span>
        </div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Auth Guard: Render Login View if unauthenticated
  if (!admin) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Authenticated View: Render Shell Layout with active tab
  return (
    <Shell
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      admin={admin}
      onLogout={handleLogout}
    >
      {activeTab === 'overview' && <Overview />}
      {activeTab === 'tenants' && <Tenants />}
      {activeTab === 'settings' && <Settings />}
    </Shell>
  );
}
