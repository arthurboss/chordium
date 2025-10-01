// WebRTC connection configuration
export interface RTCConfig extends RTCConfiguration {
  // Extend RTCConfiguration to include sdpSemantics
  sdpSemantics?: 'plan-b' | 'unified-plan';
}

// Session configuration
export interface JamSessionConfig {
  sessionId: string;
  hostId: string;
  iceServers?: RTCIceServer[];
  // Add any additional session configuration here
}

// Types for WebRTC signaling messages
export type SignalingMessage = 
  | { type: 'offer'; sdp: string; senderId: string }
  | { type: 'answer'; sdp: string; senderId: string }
  | { type: 'ice-candidate'; candidate: RTCIceCandidateInit; senderId: string }
  | { type: 'session-config'; config: JamSessionConfig; senderId: string }
  | { type: 'ui-state'; state: any; senderId: string };

export interface PeerConnection {
  // Basic WebRTC connection properties
  connected: boolean;
  
  // Methods for sending data and managing the connection
  send: (data: any) => void;
  destroy: () => void;
  
  // Simple-peer specific method
  signal?: (data: any) => void;
  
  // Allow any other properties
  [key: string]: any;
}

export interface SessionConnection {
  peer: PeerConnection;
  peerId: string;
  dataChannel?: RTCDataChannel;
}

export interface JamSessionState {
  isHost: boolean;
  sessionId: string | null;
  connectedPeers: string[];
  isConnected: boolean;
}

export interface JamSessionContextType extends JamSessionState {
  startSession: () => Promise<boolean>;
  joinSession: (connectionString: string) => Promise<boolean>;
  endSession: () => void;
  broadcastState: (state: any) => void;
  generateConnectionString: () => string;
  processConnectionString: (connectionString: string) => boolean;
  peerId?: string;
}

// Types for the connection string used in QR codes
export interface ConnectionStringData {
  sessionId: string;
  hostId: string;
  peerId: string;
  type: 'jam-session-invite';
  version: string;
  timestamp: number;
  // Add any additional data needed for connection
  [key: string]: any; // Allow for future extensions
}

// Event handler types
export type DataHandler = (data: any) => void;
export type ConnectHandler = () => void;
export type DisconnectHandler = () => void;
export type ErrorHandler = (error: Error) => void;

// Peer connection event handlers
export interface PeerConnectionHandlers {
  onData: DataHandler;
  onConnect: ConnectHandler;
  onDisconnect: DisconnectHandler;
  onError: ErrorHandler;
}

// Type guard for signaling messages
export function isSignalingMessage(message: any): message is SignalingMessage {
  return (
    message &&
    typeof message === 'object' &&
    'type' in message &&
    'senderId' in message &&
    typeof message.senderId === 'string' &&
    (
      (message.type === 'offer' && 'sdp' in message) ||
      (message.type === 'answer' && 'sdp' in message) ||
      (message.type === 'ice-candidate' && 'candidate' in message) ||
      (message.type === 'session-config' && 'config' in message) ||
      (message.type === 'ui-state' && 'state' in message)
    )
  );
}
