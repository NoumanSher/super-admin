import React, { useState } from 'react';
import { Sliders, Shield, UserPlus, Server, Save, Eye, EyeOff, Check, Users, Key } from 'lucide-react';

export default function Settings() {
  const [activeSubTab, setActiveSubTab] = useState('platform');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Platform Config State
  const [platformConfig, setPlatformConfig] = useState({
    systemName: 'PakShipper SaaS Infrastructure',
    globalDomain: 'pakshipper.local',
    sessionTimeout: '60',
    globalSmtpUser: 'no-reply@pakshipper.com',
    globalSmtpPass: '••••••••••••••••',
    platformLogsLevel: 'verbose'
  });

  // Admin users seat state
  const [adminSeat, setAdminSeat] = useState({
    name: '',
    email: '',
    password: '',
    role: 'platform_admin'
  });

  const handleConfigSave = (e) => {
    e.preventDefault();
    setSuccessMsg('Platform global settings updated successfully');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleAdminSeatSubmit = (e) => {
    e.preventDefault();
    setSuccessMsg(`Administrative seat provisioned for ${adminSeat.name}`);
    setAdminSeat({ name: '', email: '', password: '', role: 'platform_admin' });
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Sub Tabs Selection Header */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', gap: '24px', pb: '8px' }}>
        <button
          onClick={() => setActiveSubTab('platform')}
          style={{
            background: 'none',
            border: 'none',
            color: activeSubTab === 'platform' ? '#818cf8' : 'var(--text-secondary)',
            fontWeight: 600,
            fontSize: '0.95rem',
            paddingBottom: '12px',
            borderBottom: activeSubTab === 'platform' ? '2px solid #818cf8' : '2px solid transparent',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)'
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Server size={16} />
            Global Parameters
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('admins')}
          style={{
            background: 'none',
            border: 'none',
            color: activeSubTab === 'admins' ? '#818cf8' : 'var(--text-secondary)',
            fontWeight: 600,
            fontSize: '0.95rem',
            paddingBottom: '12px',
            borderBottom: activeSubTab === 'admins' ? '2px solid #818cf8' : '2px solid transparent',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)'
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={16} />
            Administrative Seats
          </span>
        </button>
      </div>

      {/* Action alerts */}
      {successMsg && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          color: 'hsla(var(--color-emerald), 1)',
          padding: '12px 16px',
          borderRadius: '8px',
          fontSize: '0.85rem',
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <Check size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Dynamic Sub Tab Screens */}
      {activeSubTab === 'platform' ? (
        <div className="glass-panel fade-in" style={{ padding: '32px', maxWidth: '800px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Server size={18} color="#818cf8" />
            <span>Platform Service Parameters</span>
          </h3>

          <form onSubmit={handleConfigSave}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-group">
                <label className="form-label">SaaS Cluster Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={platformConfig.systemName}
                  onChange={(e) => setPlatformConfig({ ...platformConfig, systemName: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Global Base Domain DNS</label>
                <input
                  type="text"
                  className="form-input"
                  value={platformConfig.globalDomain}
                  onChange={(e) => setPlatformConfig({ ...platformConfig, globalDomain: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Admin Session Timeout (Minutes)</label>
                <input
                  type="number"
                  className="form-input"
                  value={platformConfig.sessionTimeout}
                  onChange={(e) => setPlatformConfig({ ...platformConfig, sessionTimeout: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Platform Logs Diagnostics level</label>
                <select
                  className="form-input"
                  value={platformConfig.platformLogsLevel}
                  onChange={(e) => setPlatformConfig({ ...platformConfig, platformLogsLevel: e.target.value })}
                >
                  <option value="verbose">Verbose Tracing (Verbose)</option>
                  <option value="info">Standard Reporting (Info)</option>
                  <option value="error">Production Silent (Errors only)</option>
                </select>
              </div>
            </div>

            <div style={{ padding: '16px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px', border: 'var(--border-glass)', margin: '16px 0 28px 0' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f3f4f6', marginBottom: '12px' }}>
                Shared System Fallback Email Gateway
              </h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Global SMTP Address</label>
                  <input
                    type="email"
                    className="form-input"
                    value={platformConfig.globalSmtpUser}
                    onChange={(e) => setPlatformConfig({ ...platformConfig, globalSmtpUser: e.target.value })}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Global SMTP Passkey</label>
                  <input
                    type="password"
                    className="form-input"
                    value={platformConfig.globalSmtpPass}
                    onChange={(e) => setPlatformConfig({ ...platformConfig, globalSmtpPass: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <button type="submit" className="btn-primary">
              <Save size={16} />
              <span>Apply Service Settings</span>
            </button>
          </form>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px', alignItems: 'start' }}>
          {/* Active Admins List */}
          <div className="glass-panel" style={{ padding: '32px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={18} color="#818cf8" />
              <span>Super Admin Operators</span>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                background: 'rgba(255, 255, 255, 0.01)',
                border: 'var(--border-glass)',
                borderRadius: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, hsla(var(--accent-indigo), 1) 0%, hsla(var(--accent-purple), 1) 100%)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '0.8rem'
                  }}>
                    A
                  </div>
                  <div>
                    <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>Active Platform Administrator</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>admin@pakshipper.com</p>
                  </div>
                </div>
                <span className="badge badge-active" style={{ fontSize: '0.65rem' }}>Platform Owner</span>
              </div>
            </div>
          </div>

          {/* Provision New Admin */}
          <div className="glass-panel" style={{ padding: '32px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserPlus size={18} color="#a855f7" />
              <span>Add Platform Administrator</span>
            </h3>

            <form onSubmit={handleAdminSeatSubmit}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Asad Jameel"
                  value={adminSeat.name}
                  onChange={(e) => setAdminSeat({ ...adminSeat, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Operator Email</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="asad@pakshipper.com"
                  value={adminSeat.email}
                  onChange={(e) => setAdminSeat({ ...adminSeat, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Temporary Access Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={adminSeat.password}
                  onChange={(e) => setAdminSeat({ ...adminSeat, password: e.target.value })}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '28px' }}>
                <label className="form-label">Access Clearance Level</label>
                <select
                  className="form-input"
                  value={adminSeat.role}
                  onChange={(e) => setAdminSeat({ ...adminSeat, role: e.target.value })}
                >
                  <option value="platform_admin">System Operator (Platform Admin)</option>
                  <option value="super_admin">Complete Clearance (Super Admin Owner)</option>
                </select>
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                <UserPlus size={16} />
                <span>Issue Admin Credentials</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
