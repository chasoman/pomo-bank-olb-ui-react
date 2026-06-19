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