declare module 'sharedCore/ProfileContext' {
  import React from 'react';
  export const useProfile: () => {
    currentProfile: 'PERSONAL' | 'BUSINESS';
    activeProfileId: string;
    availableProfiles: Array<{ id: string; type: 'PERSONAL' | 'BUSINESS'; displayName: string }>;
  };
}