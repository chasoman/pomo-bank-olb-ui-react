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
        <div className="bank-brand">PomoBank</div>
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