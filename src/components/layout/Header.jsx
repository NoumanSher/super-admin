import React, { useState, useEffect } from 'react';
import { Activity, Bell, Calendar, Server } from 'lucide-react';

export default function Header({ activeTab }) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getTitle = () => {
    switch (activeTab) {
      case 'overview':
        return 'System Overview';
      case 'tenants':
        return 'Store Provisioning Control';
      case 'settings':
        return 'Security & Platform Controls';
      default:
        return 'Control Board';
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '24px 40px',
      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
      background: 'rgba(7, 9, 19, 0.3)',
      backdropFilter: 'var(--glass-blur)',
      position: 'sticky',
      top: 0,
      zIndex: 10
    }}>
      {/* Title */}
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>
          {getTitle()}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>
          Real-time dynamic multi-tenant infrastructure metrics.
        </p>
      </div>

      {/* Control Right Side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        {/* Real-time Clock */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: 'rgba(255, 255, 255, 0.02)',
          padding: '8px 16px',
          borderRadius: '10px',
          border: 'var(--border-glass)',
          fontSize: '0.85rem',
          color: 'var(--text-secondary)'
        }}>
          <Calendar size={14} color="#818cf8" />
          <span style={{ fontWeight: 500 }}>{formatDate(currentTime)}</span>
          <span style={{ color: 'rgba(255, 255, 255, 0.1)' }}>|</span>
          <span style={{ color: '#ffffff', fontFamily: 'monospace', fontWeight: 600 }}>{formatTime(currentTime)}</span>
        </div>

        {/* Database / Server Status */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(16, 185, 129, 0.06)',
          padding: '8px 16px',
          borderRadius: '10px',
          border: '1px solid rgba(16, 185, 129, 0.15)',
          fontSize: '0.85rem',
          color: 'hsla(var(--color-emerald), 0.95)'
        }}>
          <Server size={14} />
          <span style={{ fontWeight: 600, fontSize: '0.8rem', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
            Platform Online
          </span>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: 'hsla(var(--color-emerald), 1)',
            display: 'inline-block',
            boxShadow: '0 0 10px rgba(16, 185, 129, 0.8)',
            animation: 'pulse-glow-green 1.5s infinite ease-in-out'
          }} />
        </div>
      </div>

      <style>{`
        @keyframes pulse-glow-green {
          0%, 100% {
            transform: scale(1);
            opacity: 0.8;
          }
          50% {
            transform: scale(1.2);
            opacity: 1;
            box-shadow: 0 0 15px rgba(16, 185, 129, 1);
          }
        }
      `}</style>
    </header>
  );
}
