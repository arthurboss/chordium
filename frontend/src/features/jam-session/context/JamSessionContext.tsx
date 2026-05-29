import React, { createContext, useContext, useEffect, useState } from 'react';
import { jamSessionService } from '../JamSessionService';

export interface JamSessionState {
  isHost: boolean;
  sessionId: string | null;
  connectedPeers: string[];
  isConnected: boolean;
}

interface JamSessionContextType extends JamSessionState {
  startSession: () => Promise<void>;
  joinSession: (connectionString: string) => Promise<boolean>;
  endSession: () => void;
  broadcastState: (state: any) => void;
}

const JamSessionContext = createContext<JamSessionContextType | undefined>(undefined);

export const JamSessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<JamSessionState>({
    isHost: false,
    sessionId: null,
    connectedPeers: [],
    isConnected: false,
  });

  useEffect(() => {
    // Set up state updates from the service
    const handleStateUpdate = (newState: any) => {
      setState(prev => ({
        ...prev,
        ...newState,
        isConnected: newState.connectedPeers.length > 0 || newState.isHost,
      }));
    };

    jamSessionService.setOnStateUpdate(handleStateUpdate);

    return () => {
      jamSessionService.destroy();
    };
  }, []);

  const startSession = async () => {
    await jamSessionService.initialize();
    // Additional session start logic can go here
  };

  const joinSession = async (connectionString: string) => {
    return await jamSessionService.connectToPeer(connectionString);
  };

  const endSession = () => {
    jamSessionService.destroy();
    setState({
      isHost: false,
      sessionId: null,
      connectedPeers: [],
      isConnected: false,
    });
  };

  const broadcastState = (state: any) => {
    jamSessionService.broadcastState(state);
  };

  return (
    <JamSessionContext.Provider
      value={{
        ...state,
        startSession,
        joinSession,
        endSession,
        broadcastState,
      }}
    >
      {children}
    </JamSessionContext.Provider>
  );
};

export const useJamSession = (): JamSessionContextType => {
  const context = useContext(JamSessionContext);
  if (context === undefined) {
    throw new Error('useJamSession must be used within a JamSessionProvider');
  }
  return context;
};
