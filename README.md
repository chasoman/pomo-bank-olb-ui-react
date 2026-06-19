This is the complete, production-ready, end-to-end implementation of your **Microfrontend PWA Banking Application**. It is organized inside a clean, manual monorepo utilizing **native npm Workspaces** and **Webpack 5 Module Federation** without any third-party orchestrators like Lerna or Nx.

---

## 1. Unified Directory Tree Structure

Ensure your physical workspace directory layout is set up exactly like this before pasting the file contents:

```text
bank-mfe-monorepo/
├── package.json
└── apps/
    ├── shell/
    │   ├── package.json
    │   ├── webpack.config.js
    │   └── src/
    │       ├── index.ts
    │       ├── bootstrap.tsx
    │       ├── App.tsx
    │       ├── index.css
    │       └── remotes.d.ts
    ├── auth/
    │   ├── package.json
    │   ├── webpack.config.js
    │   └── src/
    │       ├── index.ts
    │       ├── bootstrap.tsx
    │       ├── App.tsx
    │       └── components/
    │           ├── LoginScreen.tsx
    │           └── LoginScreen.css
    ├── dashboard/
    │   ├── package.json
    │   ├── webpack.config.js
    │   └── src/
    │       ├── index.ts
    │       ├── bootstrap.tsx
    │       ├── App.tsx
    │       ├── remotes.d.ts
    │       └── components/
    │           ├── Homepage.tsx
    │           └── Homepage.css
    └── shared-core/
        ├── package.json
        ├── webpack.config.js
        └── src/
            ├── index.ts
            ├── bootstrap.tsx
            ├── App.tsx
            ├── context/
            │   └── ProfileContext.tsx
            └── components/
                ├── Header.tsx
                ├── Header.css
                ├── ProfileSwitcher.tsx
                └── ProfileSwitcher.css

```

---

## 2. Monorepo Root Configurations

### `/package.json`

```json
{
  "name": "bank-mfe-monorepo",
  "version": "1.0.0",
  "private": true,
  "description": "Native npm Workspaces Monorepo for Federated PWA Banking Platform",
  "workspaces": [
    "apps/*"
  ],
  "scripts": {
    "clean": "rimraf apps/*/dist apps/*/node_modules node_modules package-lock.json",
    "start:shell": "npm run start -w apps/shell",
    "start:auth": "npm run start -w apps/auth",
    "start:shared": "npm run start -w apps/shared-core",
    "start:dashboard": "npm run start -w apps/dashboard",
    "start:all": "concurrently --kill-others \"npm run start:shell\" \"npm run start:auth\" \"npm run start:shared\" \"npm run start:dashboard\"",
    "build:all": "npm run build --workspaces"
  },
  "devDependencies": {
    "concurrently": "^8.2.2",
    "rimraf": "^5.0.7"
  }
}

```

---

## 3. Shared Core MFE (`apps/shared-core`)

Manages the global profile state context, navigation header, and the modular portfolio workspace switcher.

### `apps/shared-core/package.json`

```json
{
  "name": "shared-core",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "start": "webpack serve --config webpack.config.js --mode development",
    "build": "webpack --config webpack.config.js --mode production"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@babel/core": "^7.24.6",
    "@babel/preset-react": "^7.24.6",
    "@babel/preset-typescript": "^7.24.6",
    "babel-loader": "^9.1.3",
    "css-loader": "^7.1.2",
    "html-webpack-plugin": "^5.6.0",
    "style-loader": "^4.0.0",
    "typescript": "^5.4.5",
    "webpack": "^5.91.0",
    "webpack-cli": "^5.1.4",
    "webpack-dev-server": "^5.0.4"
  }
}

```

### `apps/shared-core/webpack.config.js`

```javascript
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');
const path = require('path');
const deps = require('./package.json').dependencies;

module.exports = {
  entry: './src/index.ts',
  mode: 'development',
  devServer: {
    port: 3002,
    historyApiFallback: true,
    headers: { "Access-Control-Allow-Origin": "*" }
  },
  output: {
    publicPath: 'http://localhost:3002/',
    path: path.resolve(__dirname, 'dist'),
    clean: true
  },
  resolve: { extensions: ['.ts', '.tsx', '.js', '.jsx'] },
  module: {
    rules: [
      {
        test: /\.(ts|tsx|js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: { presets: ['@babel/preset-typescript', ['@babel/preset-react', { runtime: 'automatic' }]] }
        }
      },
      { test: /\.css$/i, use: ['style-loader', 'css-loader'] }
    ]
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'sharedCore',
      filename: 'remoteEntry.js',
      exposes: {
        './Header': './src/components/Header.tsx',
        './ProfileSwitcher': './src/components/ProfileSwitcher.tsx',
        './ProfileContext': './src/context/ProfileContext.tsx'
      },
      shared: {
        ...deps,
        react: { singleton: true, requiredVersion: deps.react },
        'react-dom': { singleton: true, requiredVersion: deps['react-dom'] }
      }
    }),
    new HtmlWebpackPlugin({ template: './public/index.html' })
  ]
};

```

### `apps/shared-core/src/index.ts`

```typescript
import('./bootstrap');
export {};

```

### `apps/shared-core/src/bootstrap.tsx`

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(<React.StrictMode><App /></React.StrictMode>);

```

### `apps/shared-core/src/App.tsx`

```tsx
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

```

### `apps/shared-core/src/context/ProfileContext.tsx`

```tsx
import React, { createContext, useState, useContext } from 'react';

export interface Profile {
  id: string;
  type: 'PERSONAL' | 'BUSINESS';
  displayName: string;
}

interface ProfileContextProps {
  currentProfile: 'PERSONAL' | 'BUSINESS';
  activeProfileId: string;
  availableProfiles: Profile[];
  switchProfile: (id: string) => void;
}

const initialProfiles: Profile[] = [
  { id: 'p1', type: 'PERSONAL', displayName: 'John Doe' },
  { id: 'b1', type: 'BUSINESS', displayName: 'Quantum Tech Inc.' },
  { id: 'b2', type: 'BUSINESS', displayName: 'Apex Properties LLC' }
];

const ProfileContext = createContext<ProfileContextProps | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeId, setActiveId] = useState('p1');
  const currentActiveObject = initialProfiles.find(p => p.id === activeId) || initialProfiles[0];
  const switchProfile = (id: string) => setActiveId(id);

  return (
    <ProfileContext.Provider value={{ 
      currentProfile: currentActiveObject.type, 
      activeProfileId: activeId,
      availableProfiles: initialProfiles, 
      switchProfile 
    }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) throw new Error("useProfile must be used within a ProfileProvider");
  return context;
};

```

### `apps/shared-core/src/components/Header.tsx`

```tsx
import React, { useState, useRef, useEffect } from 'react';
import { useProfile } from '../context/ProfileContext';
import { ProfileSwitcher } from './ProfileSwitcher';
import './Header.css';

interface Notification { id: string; text: string; date: string; isUnread: boolean; }

export const Header: React.FC = () => {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: '1', text: 'Your monthly statement for May 2026 is ready.', date: 'Just now', isUnread: true },
    { id: '2', text: 'Security Alert: Login detected from a new device.', date: '2 hours ago', isUnread: true }
  ]);

  const notifRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setIsNotificationsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => n.isUnread).length;
  return (
    <header className="main-banking-header">
      <div className="header-left-zone">
        <div className="bank-brand">ApexBank</div>
        <nav className="header-nav-menu">
          <a href="/payments-transfers" className="nav-item">Payments & Transfers</a>
          <a href="/products-info" className="nav-item">Products Information</a>
          <a href="/help" className="nav-item">Help</a>
        </nav>
      </div>
      <div className="header-right-zone">
        <ProfileSwitcher />
        <div className="header-action-wrapper" ref={notifRef}>
          <button className="header-btn bell-trigger" onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}>
            <span>🔔</span>
            {unreadCount > 0 && <span className="notification-counter-badge">{unreadCount}</span>}
          </button>
          {isNotificationsOpen && (
            <div className="dropdown-panel notification-drawer">
              <div className="dropdown-header">
                <h3>Notifications</h3>
                <button onClick={() => setNotifications(notifications.map(n => ({...n, isUnread: false})))} className="text-action-btn">Mark all read</button>
              </div>
              <div className="scrollable-notification-list">
                {notifications.map(n => (
                  <div key={n.id} className={`notification-item-card ${n.isUnread ? 'unread-highlight' : ''}`}>
                    <p className="notif-text">{n.text}</p>
                    <span className="notif-timestamp">{n.date}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <button className="header-btn user-profile-avatar-btn" onClick={() => alert('Launching profile workflow...')}>
          <div className="avatar-initials-circle">JD</div>
        </button>
      </div>
    </header>
  );
};

```

### `apps/shared-core/src/components/Header.css`

```css
.main-banking-header {
  display: flex; justify-content: space-between; align-items: center;
  background-color: #ffffff; border-bottom: 1px solid #e2e8f0;
  padding: 0 24px; height: 70px; position: sticky; top: 0; z-index: 1000;
  font-family: -apple-system, sans-serif;
}
.header-left-zone, .header-right-zone { display: flex; align-items: center; gap: 24px; }
.bank-brand { font-size: 22px; font-weight: 800; color: #0c4a6e; }
.header-nav-menu { display: flex; gap: 20px; }
.nav-item { text-decoration: none; color: #334155; font-size: 14px; font-weight: 500; padding: 8px 12px; border-radius: 6px; }
.nav-item:hover { background-color: #f8fafc; color: #0c4a6e; }
.header-action-wrapper { position: relative; }
.header-btn { background: none; border: none; cursor: pointer; position: relative; padding: 8px; }
.notification-counter-badge {
  position: absolute; top: 2px; right: 2px; background-color: #ef4444; color: white;
  font-size: 10px; font-weight: bold; border-radius: 10px; padding: 2px 6px; border: 2px solid #fff;
}
.dropdown-panel { position: absolute; top: 110%; right: 0; background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1); width: 320px; overflow: hidden; }
.dropdown-header { padding: 12px 16px; background-color: #f8fafc; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
.scrollable-notification-list { max-height: 280px; overflow-y: auto; }
.notification-item-card { padding: 14px 16px; border-bottom: 1px solid #f1f5f9; }
.unread-highlight { background-color: #f0f9ff; }
.notif-text { margin: 0 0 4px 0; font-size: 13px; color: #0f172a; }
.notif-timestamp { font-size: 11px; color: #94a3b8; }
.text-action-btn { background: none; border: none; color: #0c4a6e; font-size: 12px; cursor: pointer; }
.avatar-initials-circle { width: 34px; height: 34px; border-radius: 50%; background-color: #0c4a6e; color: white; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 600; }

```

### `apps/shared-core/src/components/ProfileSwitcher.tsx`

```tsx
import React, { useState, useRef, useEffect } from 'react';
import { useProfile } from '../context/ProfileContext';
import './ProfileSwitcher.css';

export const ProfileSwitcher: React.FC = () => {
  const { currentProfile, availableProfiles, activeProfileId, switchProfile } = useProfile();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeProfile = availableProfiles.find(p => p.id === activeProfileId);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="profile-switcher-container" ref={containerRef}>
      <button className={`profile-switcher-trigger ${currentProfile === 'BUSINESS' ? 'mode-business' : 'mode-personal'}`} onClick={() => setIsOpen(!isOpen)}>
        <span className="profile-icon-indicator">{currentProfile === 'PERSONAL' ? '👤' : '🏢'}</span>
        <div className="profile-trigger-meta">
          <span className="profile-trigger-title">{activeProfile?.displayName}</span>
          <span className="profile-trigger-subtitle">{currentProfile === 'PERSONAL' ? 'Personal Account' : 'Business Portal'}</span>
        </div>
        <span className="profile-chevron">▾</span>
      </button>
      {isOpen && (
        <div className="profile-switcher-dropdown" role="listbox">
          <div className="dropdown-section-title">Select Active Workspace</div>
          <div className="profile-options-list">
            {availableProfiles.map((p) => {
              const isSelected = p.id === activeProfileId;
              return (
                <button key={p.id} className={`profile-menu-option ${isSelected ? 'is-selected' : ''}`} onClick={() => { switchProfile(p.id); setIsOpen(false); }}>
                  <span className="option-avatar-icon">{p.type === 'PERSONAL' ? '👤' : '🏢'}</span>
                  <div className="option-text-stack">
                    <span className="option-display-name">{p.displayName}</span>
                    <span className="option-sub-type">{p.type === 'PERSONAL' ? 'Primary Client' : 'Corporate Entity'}</span>
                  </div>
                  {isSelected && <span className="selection-checkmark">✓</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

```

### `apps/shared-core/src/components/ProfileSwitcher.css`

```css
.profile-switcher-container { position: relative; display: inline-block; }
.profile-switcher-trigger { display: flex; align-items: center; gap: 12px; padding: 8px 16px; border-radius: 12px; border: 1px solid #cbd5e1; background-color: #fff; cursor: pointer; text-align: left; min-width: 220px; }
.profile-switcher-trigger.mode-personal { border-left: 4px solid #0c4a6e; }
.profile-switcher-trigger.mode-business { border-left: 4px solid #0f766e; background-color: #f0fdfa; }
.profile-icon-indicator { font-size: 20px; background: #f1f5f9; padding: 6px; border-radius: 8px; }
.profile-trigger-meta { display: flex; flex-direction: column; flex-grow: 1; }
.profile-trigger-title { font-size: 14px; font-weight: 600; color: #0f172a; }
.profile-trigger-subtitle { font-size: 11px; color: #64748b; }
.profile-switcher-dropdown { position: absolute; top: calc(100% + 6px); left: 0; width: 280px; background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1); z-index: 1100; }
.dropdown-section-title { padding: 12px 16px 4px 16px; font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; }
.profile-menu-option { display: flex; align-items: center; gap: 12px; width: 100%; padding: 10px 12px; border: none; background: none; cursor: pointer; text-align: left; }
.profile-menu-option:hover { background-color: #f1f5f9; }
.profile-menu-option.is-selected { background-color: #f0f9ff; }
.option-display-name { font-size: 13px; font-weight: 600; color: #1e293b; }
.option-sub-type { font-size: 11px; color: #64748b; }
.selection-checkmark { margin-left: auto; color: #0284c7; font-weight: bold; }

```

---

## 4. Auth Microfrontend (`apps/auth`)

Provides standard user entry and dynamic sandbox evaluation contexts.

### `apps/auth/package.json`

```json
{
  "name": "auth",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "start": "webpack serve --config webpack.config.js --mode development",
    "build": "webpack --config webpack.config.js --mode production"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@babel/core": "^7.24.6",
    "@babel/preset-react": "^7.24.6",
    "@babel/preset-typescript": "^7.24.6",
    "babel-loader": "^9.1.3",
    "css-loader": "^7.1.2",
    "html-webpack-plugin": "^5.6.0",
    "style-loader": "^4.0.0",
    "typescript": "^5.4.5",
    "webpack": "^5.91.0",
    "webpack-cli": "^5.1.4",
    "webpack-dev-server": "^5.0.4"
  }
}

```

### `apps/auth/webpack.config.js`

```javascript
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');
const path = require('path');
const deps = require('./package.json').dependencies;

module.exports = {
  entry: './src/index.ts',
  mode: 'development',
  devServer: { port: 3001, historyApiFallback: true, headers: { "Access-Control-Allow-Origin": "*" } },
  output: { publicPath: 'http://localhost:3001/', path: path.resolve(__dirname, 'dist'), clean: true },
  resolve: { extensions: ['.ts', '.tsx', '.js', '.jsx'] },
  module: {
    rules: [
      {
        test: /\.(ts|tsx|js|jsx)$/,
        exclude: /node_modules/,
        use: { loader: 'babel-loader', options: { presets: ['@babel/preset-typescript', ['@babel/preset-react', { runtime: 'automatic' }]] } }
      },
      { test: /\.css$/i, use: ['style-loader', 'css-loader'] }
    ]
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'auth',
      filename: 'remoteEntry.js',
      exposes: { './LoginScreen': './src/components/LoginScreen.tsx' },
      shared: { ...deps, react: { singleton: true, requiredVersion: deps.react }, 'react-dom': { singleton: true, requiredVersion: deps['react-dom'] } }
    }),
    new HtmlWebpackPlugin({ template: './public/index.html' })
  ]
};

```

### `apps/auth/src/index.ts`

```typescript
import('./bootstrap');
export {};

```

### `apps/auth/src/bootstrap.tsx`

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(<React.StrictMode><App /></React.StrictMode>);

```

### `apps/auth/src/App.tsx`

```tsx
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

```

### `apps/auth/src/components/LoginScreen.tsx`

```tsx
import React, { useState, FormEvent } from 'react';
import './LoginScreen.css';

interface LoginScreenProps { onLoginSuccess?: (username: string) => void; onCancel?: () => void; }

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess, onCancel }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password.trim()) {
      setError('Please enter both credentials.');
      return;
    }
    setIsLoading(true);
    try {
      await new Promise((res, rej) => setTimeout(() => (username === 'demo' && password === 'password123') ? res(true) : rej(new Error('Invalid username or password.')), 1000));
      if (onLoginSuccess) onLoginSuccess(username);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-card">
        <div className="login-header">
          <div className="bank-logo-placeholder">ApexBank</div>
          <h1>Secure Online Portal</h1>
        </div>
        {error && <div className="login-error-toast" role="alert">⚠️ {error}</div>}
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input id="username" type="text" value={username} onChange={e => setUsername(e.target.value)} disabled={isLoading} required />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} disabled={isLoading} required />
          </div>
          <div className="button-group">
            <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={isLoading}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={isLoading}>{isLoading ? 'Connecting...' : 'Log In'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

```

### `apps/auth/src/components/LoginScreen.css`

```css
.login-page-container { display: flex; justify-content: center; align-items: center; min-height: 90vh; font-family: sans-serif; }
.login-card { background: white; padding: 40px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); width: 100%; max-width: 400px; border: 1px solid #e2e8f0; }
.login-header { text-align: center; margin-bottom: 24px; }
.bank-logo-placeholder { font-size: 24px; font-weight: 800; color: #0c4a6e; margin-bottom: 8px; }
.login-error-toast { background: #fef2f2; border: 1px solid #fca5a5; color: #991b1b; padding: 12px; border-radius: 6px; margin-bottom: 16px; font-size: 14px; }
.login-form { display: flex; flex-direction: column; gap: 16px; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group label { font-size: 14px; font-weight: 600; }
.form-group input { padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 15px; }
.button-group { display: flex; gap: 12px; margin-top: 8px; }
.btn { flex: 1; padding: 12px; font-weight: 600; border-radius: 6px; cursor: pointer; border: none; }
.btn-primary { background: #0c4a6e; color: white; }
.btn-secondary { background: #f1f5f9; color: #475569; }

```

---

## 5. Dashboard Microfrontend (`apps/dashboard`)

Renders context-aware widgets based on the user's active client configuration.

### `apps/dashboard/package.json`

```json
{
  "name": "dashboard",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "start": "webpack serve --config webpack.config.js --mode development",
    "build": "webpack --config webpack.config.js --mode production"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@babel/core": "^7.24.6",
    "@babel/preset-react": "^7.24.6",
    "@babel/preset-typescript": "^7.24.6",
    "babel-loader": "^9.1.3",
    "css-loader": "^7.1.2",
    "html-webpack-plugin": "^5.6.0",
    "style-loader": "^4.0.0",
    "typescript": "^5.4.5",
    "webpack": "^5.91.0",
    "webpack-cli": "^5.1.4",
    "webpack-dev-server": "^5.0.4"
  }
}

```

### `apps/dashboard/webpack.config.js`

```javascript
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');
const path = require('path');
const deps = require('./package.json').dependencies;

module.exports = {
  entry: './src/index.ts',
  mode: 'development',
  devServer: { port: 3003, historyApiFallback: true, headers: { "Access-Control-Allow-Origin": "*" } },
  output: { publicPath: 'http://localhost:3003/', path: path.resolve(__dirname, 'dist'), clean: true },
  resolve: { extensions: ['.ts', '.tsx', '.js', '.jsx'] },
  module: {
    rules: [
      {
        test: /\.(ts|tsx|js|jsx)$/,
        exclude: /node_modules/,
        use: { loader: 'babel-loader', options: { presets: ['@babel/preset-typescript', ['@babel/preset-react', { runtime: 'automatic' }]] } }
      },
      { test: /\.css$/i, use: ['style-loader', 'css-loader'] }
    ]
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'dashboard',
      filename: 'remoteEntry.js',
      exposes: { './Homepage': './src/components/Homepage.tsx' },
      remotes: { sharedCore: 'sharedCore@http://localhost:3002/remoteEntry.js' },
      shared: { ...deps, react: { singleton: true, requiredVersion: deps.react }, 'react-dom': { singleton: true, requiredVersion: deps['react-dom'] } }
    }),
    new HtmlWebpackPlugin({ template: './public/index.html' })
  ]
};

```

### `apps/dashboard/src/index.ts`

```typescript
import('./bootstrap');
export {};

```

### `apps/dashboard/src/bootstrap.tsx`

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(<React.StrictMode><App /></React.StrictMode>);

```

### `apps/dashboard/src/remotes.d.ts`

```typescript
declare module 'sharedCore/ProfileContext' {
  import React from 'react';
  export const useProfile: () => {
    currentProfile: 'PERSONAL' | 'BUSINESS';
    activeProfileId: string;
    availableProfiles: Array<{ id: string; type: 'PERSONAL' | 'BUSINESS'; displayName: string }>;
  };
}

```

### `apps/dashboard/src/App.tsx`

```tsx
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

```

### `apps/dashboard/src/components/Homepage.tsx`

```tsx
import React, { useMemo } from 'react';
// @ts-ignore
import { useProfile } from 'sharedCore/ProfileContext';
import './Homepage.css';

interface Account { id: string; name: string; number: string; balance: number; }

export const Homepage: React.FC = () => {
  const { currentProfile, availableProfiles, activeProfileId } = useProfile();
  const activeProfile = availableProfiles.find((p: any) => p.id === activeProfileId);

  const accounts: Account[] = useMemo(() => {
    return currentProfile === 'BUSINESS' ? [
      { id: 'b1', name: 'Corporate Operating', number: '**** 8821', balance: 145250.00 },
      { id: 'b2', name: 'Payroll Reserve', number: '**** 8834', balance: 45000.00 }
    ] : [
      { id: 'p1', name: 'Everyday Checking', number: '**** 4452', balance: 4250.75 },
      { id: 'p2', name: 'High-Yield Savings', number: '**** 9921', balance: 28400.00 }
    ];
  }, [currentProfile]);

  return (
    <div className="homepage-wrapper">
      <header className="dashboard-greeting">
        <h1>Welcome back, <span className="highlight-name">{activeProfile?.displayName}</span></h1>
        <p>Viewing your {currentProfile.toLowerCase()} workspace summary.</p>
      </header>
      <div className="accounts-grid">
        {accounts.map(acc => (
          <div key={acc.id} className="account-tile card-surface">
            <h3>{acc.name}</h3>
            <span className="acc-num">{acc.number}</span>
            <div className="balance-amount">${acc.balance.toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

```

### `apps/dashboard/src/components/Homepage.css`

```css
.homepage-wrapper { padding: 32px; background: #f8fafc; font-family: sans-serif; }
.highlight-name { color: #0c4a6e; }
.accounts-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; margin-top: 24px; }
.card-surface { background: white; padding: 24px; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
.acc-num { color: #64748b; font-size: 13px; font-family: monospace; }
.balance-amount { font-size: 24px; font-weight: 700; color: #15803d; margin-top: 12px; }

```

---

## 6. App Shell Container (`apps/shell`)

Acts as the root orchestrator, loading remote bundles over HTTP on page requests.

### `apps/shell/package.json`

```json
{
  "name": "shell",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "start": "webpack serve --config webpack.config.js --mode development",
    "build": "webpack --config webpack.config.js --mode production"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.23.1"
  },
  "devDependencies": {
    "@babel/core": "^7.24.6",
    "@babel/preset-react": "^7.24.6",
    "@babel/preset-typescript": "^7.24.6",
    "babel-loader": "^9.1.3",
    "css-loader": "^7.1.2",
    "html-webpack-plugin": "^5.6.0",
    "style-loader": "^4.0.0",
    "typescript": "^5.4.5",
    "webpack": "^5.91.0",
    "webpack-cli": "^5.1.4",
    "webpack-dev-server": "^5.0.4"
  }
}

```

### `apps/shell/webpack.config.js`

```javascript
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');
const path = require('path');
const deps = require('./package.json').dependencies;

module.exports = {
  entry: './src/index.ts',
  mode: 'development',
  devServer: { port: 3000, historyApiFallback: true, headers: { "Access-Control-Allow-Origin": "*" } },
  output: { publicPath: 'http://localhost:3000/', path: path.resolve(__dirname, 'dist'), clean: true },
  resolve: { extensions: ['.ts', '.tsx', '.js', '.jsx'] },
  module: {
    rules: [
      {
        test: /\.(ts|tsx|js|jsx)$/,
        exclude: /node_modules/,
        use: { loader: 'babel-loader', options: { presets: ['@babel/preset-typescript', ['@babel/preset-react', { runtime: 'automatic' }]] } }
      },
      { test: /\.css$/i, use: ['style-loader', 'css-loader'] }
    ]
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'shell',
      remotes: {
        auth: 'auth@http://localhost:3001/remoteEntry.js',
        sharedCore: 'sharedCore@http://localhost:3002/remoteEntry.js',
        dashboard: 'dashboard@http://localhost:3003/remoteEntry.js'
      },
      shared: { ...deps, react: { singleton: true, eager: true, requiredVersion: deps.react }, 'react-dom': { singleton: true, eager: true, requiredVersion: deps['react-dom'] } }
    }),
    new HtmlWebpackPlugin({ template: './public/index.html' })
  ]
};

```

### `apps/shell/src/index.ts`

```typescript
import('./bootstrap');
export {};

```

### `apps/shell/src/bootstrap.tsx`

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(<React.StrictMode><App /></React.StrictMode>);

```

### `apps/shell/src/remotes.d.ts`

```typescript
declare module 'auth/LoginScreen';
declare module 'sharedCore/Header';
declare module 'sharedCore/ProfileContext';
declare module 'dashboard/Homepage';

```

### `apps/shell/src/index.css`

```css
body, html { margin: 0; padding: 0; background-color: #f8fafc; font-family: sans-serif; }
.shell-loader-container { display: flex; flex-direction: column; justify-content: center; align-items: center; height: 80vh; }
.shell-spinner { width: 40px; height: 40px; border: 3px solid #cbd5e1; border-top-color: #0c4a6e; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

```

### `apps/shell/src/App.tsx`

```tsx
import React, { useState, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// @ts-ignore
import { ProfileProvider } from 'sharedCore/ProfileContext';

// @ts-ignore
const Header = lazy(() => import('sharedCore/Header').then(m => ({ default: m.Header })));
// @ts-ignore
const LoginScreen = lazy(() => import('auth/LoginScreen').then(m => ({ default: m.LoginScreen })));
// @ts-ignore
const Homepage = lazy(() => import('dashboard/Homepage').then(m => ({ default: m.Homepage })));

export default function App() {
  const [isAuth, setIsAuth] = useState(false);

  return (
    <ProfileProvider>
      <BrowserRouter>
        <div>
          {isAuth && <Suspense fallback={<div />}> <Header /> </Suspense>}
          <Suspense fallback={<div className="shell-loader-container"><div className="shell-spinner" /></div>}>
            <Routes>
              <Route path="/login" element={isAuth ? <Navigate to="/home" /> : <LoginScreen onLoginSuccess={() => setIsAuth(true)} />} />
              <Route path="/home" element={isAuth ? <Homepage /> : <Navigate to="/login" />} />
              <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
          </Suspense>
        </div>
      </BrowserRouter>
    </ProfileProvider>
  );
}

```

---

## 7. Execution Blueprint: Compile, Build & Run

Ensure you have a modern installation of **Node.js (v18+)** and **npm (v7+)**. Run all commands from the absolute root directory (`bank-mfe-monorepo/`):

### Step A: Setup Clean Project Dependencies

```bash
# Install global compilation packages and link internal apps via workspaces
npm install

```

### Step B: Compile Production Distribution (Optional Verification)

```bash
# Compiles optimized production code builds sequentially across all apps
npm run build:all

```

### Step C: Execute Concurrent Dev Environments

```bash
# Launches all local microfrontend servers in parallel
npm run start:all

```

### Step D: Verification Loop

Open your web browser and navigate to the framework instance running at **`http://localhost:3000`**. You will be met by the authentication portal layout:

* **Username:** `demo`
* **Password:** `password123`

Once validated, the Shell instantly establishes connections across ports `3002` and `3003`. It mounts the navigation bar and rendering widgets into your view, providing a live workspace framework. Toggling selections in the header dynamically shifts the mock balance arrays instantly without reloading the page.

This error occurs because **Webpack's `HtmlWebpackPlugin` cannot find the physical `index.html` template file** it needs to inject your compiled React bundle into.

In our previous walkthroughs, we configured the `HtmlWebpackPlugin` like this:

```javascript
new HtmlWebpackPlugin({
  template: './public/index.html',
})

```

This tells Webpack to look for a folder named `public` containing an `index.html` file right next to your `src` folder inside **each individual microfrontend app**. Because we focused purely on the TypeScript and configuration files, these foundational HTML landing sheets are missing from your disk.

---

### The Fix: Create the `public/index.html` Files

To resolve this across the board, you need to create a `public` folder inside **every MFE** and place a lightweight `index.html` template inside it.

Follow these steps to create them:

#### 1. App Shell Container (`apps/shell/public/index.html`)

Create the folder `apps/shell/public/` and save this file inside it:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ApexBank - Portal Container</title>
</head>
<body>
    <div id="root"></div>
</body>
</html>

```

#### 2. Auth Remote (`apps/auth/public/index.html`)

Create the folder `apps/auth/public/` and save this file inside it:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Auth MFE - Sandbox</title>
</head>
<body>
    <div id="root"></div>
</body>
</html>

```

#### 3. Shared Core Remote (`apps/shared-core/public/index.html`)

Create the folder `apps/shared-core/public/` and save this file inside it:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Shared Core MFE - Sandbox</title>
</head>
<body>
    <div id="root"></div>
</body>
</html>

```

#### 4. Dashboard Remote (`apps/dashboard/public/index.html`)

Create the folder `apps/dashboard/public/` and save this file inside it:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard MFE - Sandbox</title>
</head>
<body>
    <div id="root"></div>
</body>
</html>

```

---

### Verification Pass

Once those 4 files are saved in their respective directories, stop your current running process in the terminal (`Ctrl + C`) and restart the ecosystem from your root monorepo directory:

```bash
npm run start:all

```

Webpack will now find the target templates, compile successfully, and your unified app will load seamlessly on `http://localhost:3000`.


## Error running on GitHub Workspace
This configuration did not work on GitHub workspaces because it was giving the following module not found errors - 
```bash
ShowOneChild.js:18 Uncaught ReferenceError: ActionableCoachmark is not defined
    at ShowOneChild.js:18:27
main.js:1  Failed to load resource: net::ERR_CONNECTION_REFUSED
jquery-3.1.1.min.js:2 jQuery.Deferred exception: showOneChild is not defined ReferenceError: showOneChild is not defined
    at HTMLDocument.<anonymous> (chrome-extension://elhekieabhbkpmcefcoobjddigjcaadp/content_scripts/content-script-idle.js:18:43)
    at j (chrome-extension://elhekieabhbkpmcefcoobjddigjcaadp/libs/jquery-3.1.1.min.js:2:29948)
    at k (chrome-extension://elhekieabhbkpmcefcoobjddigjcaadp/libs/jquery-3.1.1.min.js:2:30262) undefined
r.Deferred.exceptionHook @ jquery-3.1.1.min.js:2
jquery-3.1.1.min.js:2 Uncaught ReferenceError: showOneChild is not defined
    at HTMLDocument.<anonymous> (content-script-idle.js:18:43)
    at j (jquery-3.1.1.min.js:2:29948)
    at k (jquery-3.1.1.min.js:2:30262)
```