import React, { createContext, useCallback, useEffect, useState } from 'react';
import { JamSessionService } from './JamSessionService';
import type { 
  JamSessionContextType, 
  JamSessionState, 
  DataHandler, 
  ConnectHandler, 
  DisconnectHandler, 
  ErrorHandler,
  SignalingMessage
} from './types';
import { toast } from 'sonner';

export const JamSessionContext = createContext<JamSessionContextType | undefined>(undefined);

interface JamSessionProviderProps {
  children: React.ReactNode;
}

export const JamSessionProvider: React.FC<JamSessionProviderProps> = ({ children }) => {
  const [jamSession] = useState(() => new JamSessionService());
  const [state, setState] = useState<JamSessionState>({
    isHost: false,
    sessionId: null,
    connectedPeers: [],
    isConnected: false,
  });
  
  // Generate a connection string for sharing via QR code
  const generateConnectionString = useCallback(() => {
    return jamSession.generateConnectionString();
  }, [jamSession]);
  
  // Process a connection string from a QR code
  const processConnectionString = useCallback((connectionString: string): boolean => {
    return jamSession.processConnectionString(connectionString);
  }, [jamSession]);

  // Set up event handlers for peer connections
  useEffect(() => {
    const handleData: DataHandler = (data) => {
      console.log('Received data from peer:', data);
      // Handle incoming data from peers
    };
    
    const handleConnect: ConnectHandler = () => {
      console.log('Connected to peer');
      toast.success('Connected to peer');
    };
    
    const handleDisconnect: DisconnectHandler = () => {
      console.log('Disconnected from peer');
      toast.info('Disconnected from peer');
    };
    
    const handleError: ErrorHandler = (error) => {
      console.error('Peer connection error:', error);
      toast.error(`Connection error: ${error.message}`);
    };
    
    // Set up the handlers
    jamSession.setHandlers({
      onData: handleData,
      onConnect: handleConnect,
      onDisconnect: handleDisconnect,
      onError: handleError,
    });
    
    // Set up state updates from the service
    const handleStateUpdate = (newState: JamSessionState) => {
      setState(prev => ({
        ...prev,
        ...newState,
        isConnected: newState.connectedPeers.length > 0 || newState.isHost,
      }));
    };
    
    jamSession.setOnStateUpdate(handleStateUpdate);
    
    // Clean up
    return () => {
      jamSession.destroy();
    };
  }, [jamSession]);

  // Start a new jam session
  const startSession = async () => {
    try {
      await jamSession.initialize();
      toast.success('Jam session started! Share the QR code to invite others.');
      return true;
    } catch (error) {
      console.error('Failed to start jam session:', error);
      toast.error('Failed to start jam session');
      throw error;
    }
  };

  // Join an existing jam session
  const joinSession = async (connectionString: string) => {
    try {
      const success = jamSession.processConnectionString(connectionString);
      if (!success) {
        throw new Error('Invalid connection string');
      }
      toast.success('Successfully joined the jam session!');
      return true;
    } catch (error) {
      console.error('Failed to join jam session:', error);
      toast.error('Failed to join jam session');
      throw error;
    }
  };

  // End the current jam session
  const endSession = () => {
    jamSession.destroy();
    setState({
      isHost: false,
      sessionId: null,
      connectedPeers: [],
      isConnected: false,
    });
    toast.info('Jam session ended');
  };

  // Broadcast UI state to all connected peers
  const broadcastState = (state: any) => {
    if (state.connectedPeers.length > 0) {
      jamSession.broadcastState({
        type: 'ui-state',
        state,
        senderId: jamSession.peerId,
        timestamp: Date.now(),
      });
    }
  };

  return (
    <JamSessionContext.Provider
      value={{
        ...state,
        startSession,
        joinSession,
        endSession,
        broadcastState,
        generateConnectionString,
        processConnectionString,
        peerId: jamSession.peerId,
      }}
    >
      {children}
    </JamSessionContext.Provider>
  );
};

// useJamSession is now defined in useJamSession.ts
