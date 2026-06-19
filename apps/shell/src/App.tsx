import React, { useState, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// @ts-ignore
import { ProfileProvider } from 'sharedCore/ProfileContext';

// @ts-ignore
const Header = lazy(() => import('sharedCore/Header').then(m => ({ default: m.Header })));
// @ts-ignore
const LoginScreen = lazy(() => import('auth/LoginScreen').then(m => ({ default: m.LoginScreen })));
// @ts-ignore
const Homepage = lazy(() => import('homepage/Homepage').then(m => ({ default: m.Homepage })));

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