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