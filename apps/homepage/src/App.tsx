import React from 'react';
import { Homepage } from './components/Homepage';

const MockProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div style={{ border: '2px dashed #0c4a6e', margin: '10px' }}>
      <div style={{ background: '#0c4a6e', color: 'white', padding: '6px', fontSize: '12px' }}>
        Dashboard Standalone Dev Mock Environment
      </div>
      {children}
    </div>
  );
};

export default function App() {
  return (
    <MockProfileProvider>
      <Homepage />
    </MockProfileProvider>
  );
}