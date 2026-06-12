import React from 'react';
import { LayoutDashboard, Store, Sliders, LogOut, Shield, ChevronRight } from 'lucide-react';
import { authService } from '../../services/authService';

export default function Sidebar({ activeTab, setActiveTab, admin, onLogout }) {
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'tenants', label: 'Tenant Stores', icon: Store },
    { id: 'settings', label: 'Platform Settings', icon: Sliders },
  ];

  const handleLogout = () => {
    authService.logout();
    onLogout();
  };

  return (
    <aside className="glass-panel" style={{
      width: '280px',
      minHeight: 'calc(100vh - 40px)',
      margin: '20px 0 20px 20px',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 16px',
      borderColor: 'rgba(255, 255, 255, 0.05)',
      background: 'rgba(12, 15, 29, 0.65)',
      flexShrink: 0,
      position: 'sticky',
      top: '20px'
    }}>
      {/* Brand Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        paddingBottom: '24px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        marginBottom: '32px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          boxShadow: '0 0 15px rgba(99, 102, 241, 0.1)'
        }}>
          <Shield size={20} color="#818cf8" />
        </div>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, lineHeight: 1.1 }}>PAKSHIPPER</h2>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            SUPER ADMIN
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                borderRadius: '12px',
                border: 'none',
                background: isActive ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.1) 100%)' : 'transparent',
                borderLeft: isActive ? '3px solid hsla(var(--accent-indigo), 1)' : '3px solid transparent',
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'all var(--transition-fast)'
              }}
              className={!isActive ? 'sidebar-btn-hover' : ''}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Icon size={18} color={isActive ? '#818cf8' : 'var(--text-muted)'} style={{ transition: 'color var(--transition-fast)' }} />
                <span style={{ fontSize: '0.9rem', fontWeight: isActive ? 600 : 500 }}>{item.label}</span>
              </div>
              {isActive && <ChevronRight size={14} color="#818cf8" />}
            </button>
          );
        })}
      </nav>

      {/* Admin Quick Profile */}
      <div style={{
        marginTop: 'auto',
        paddingTop: '24px',
        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, hsla(var(--accent-indigo), 1) 0%, hsla(var(--accent-purple), 1) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            fontSize: '0.85rem',
            color: '#fff'
          }}>
            {admin?.name?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <p style={{ fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {admin?.name || 'Platform Admin'}
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {admin?.email || 'admin@pakshipper.com'}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="btn-secondary"
          style={{
            width: '100%',
            justifyContent: 'center',
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '0.85rem',
            background: 'rgba(239, 68, 68, 0.05)',
            borderColor: 'rgba(239, 68, 68, 0.1)',
            color: 'hsla(var(--color-ruby), 0.9)'
          }}
        >
          <LogOut size={14} />
          <span>Exit Console</span>
        </button>
      </div>

      <style>{`
        .sidebar-btn-hover:hover {
          background: rgba(255, 255, 255, 0.03) !important;
          color: #ffffff !important;
        }
        .sidebar-btn-hover:hover svg {
          color: #ffffff !important;
        }
      `}</style>
    </aside>
  );
}
