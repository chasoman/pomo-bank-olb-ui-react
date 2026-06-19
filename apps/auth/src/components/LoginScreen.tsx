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