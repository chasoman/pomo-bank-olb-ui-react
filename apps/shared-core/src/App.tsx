import React from 'react';
import { ProfileProvider } from './context/ProfileContext';
import { Header } from './components/Header';
import { ProfileSwitcher } from './components/ProfileSwitcher';

export default function App() {
  return (
    <ProfileProvider>
      <div style={{ minHeight: '100vh', backgroundColor: '#f1f5f9' }}>
        <div style={{ background: '#0f766e', color: '#fff', textAlign: 'center', padding: '6px', fontSize: '12px', fontWeight: 'bold' }}>
          🎨 Shared-Core Component Sandbox Environment (Port 3002)
        </div>
        <Header />
        <main style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px' }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ marginTop: 0 }}>Isolated Component Verification</h3>
            <ProfileSwitcher />
          </div>
        </main>
      </div>
    </ProfileProvider>
  );
}