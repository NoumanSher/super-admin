import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

export default function Shell({ activeTab, setActiveTab, admin, onLogout, children }) {
  return (
    <div className="layout-shell neon-gradient-bg" style={{ minHeight: '100vh', display: 'flex' }}>
      {/* Dynamic Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        admin={admin}
        onLogout={onLogout}
      />

      {/* Main Screen Panel */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0 // Prevent flex children from expanding beyond screen
      }}>
        {/* Dynamic Global Topbar */}
        <Header activeTab={activeTab} />

        {/* Dynamic Inner Router Views */}
        <main className="main-content fade-in" style={{ flex: 1 }}>
          {children}
        </main>
      </div>
    </div>
  );
}
