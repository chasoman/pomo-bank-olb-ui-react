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