import { useContext } from 'react';
import { JamSessionContext } from './JamSessionProvider';
import type { JamSessionContextType } from './types';

export function useJamSession(): JamSessionContextType {
  const context = useContext(JamSessionContext);
  if (context === undefined) {
    throw new Error('useJamSession must be used within a JamSessionProvider');
  }
  return context;
}

// Extended hook with additional functionality
export const useJamSessionConnection = (): JamSessionContextType => {
  return useJamSession();
};
