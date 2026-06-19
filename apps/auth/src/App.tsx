import React from 'react';
import { LoginScreen } from './components/LoginScreen';

export default function App() {
  return (
    <div>
      <div style={{ background: '#e11d48', color: 'white', textAlign: 'center', padding: '6px', fontSize: '12px', fontWeight: 'bold' }}>
        ⚙️ Auth MFE Standalone Sandbox Environment (Port 3001)
      </div>
      <LoginScreen onLoginSuccess={(u) => alert(`Logged in: ${u}`)} onCancel={() => alert('Cancelled')} />
    </div>
  );
}