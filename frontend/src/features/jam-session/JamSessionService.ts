import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { 
  JamSessionConfig,
  SessionConnection,
  PeerConnection,
  ConnectionStringData,
  SignalingMessage,
  RTCConfig,
  PeerConnectionHandlers,
  DataHandler,
  ConnectHandler,
  DisconnectHandler,
  ErrorHandler
} from './types';

const DEFAULT_RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
  iceTransportPolicy: 'all',
  bundlePolicy: 'max-bundle',
  rtcpMuxPolicy: 'require',
  // @ts-ignore - sdpSemantics is valid in WebRTC but not in TypeScript types yet
  sdpSemantics: 'unified-plan',
} as RTCConfiguration;

export class JamSessionService {
  private sessionId: string = '';
  private hostId: string = '';
  public readonly peerId: string;
  private connections: Map<string, SessionConnection> = new Map();
  private isHost: boolean = false;
  private onStateUpdate: (state: {
    isHost: boolean;
    sessionId: string | null;
    connectedPeers: string[];
    isConnected: boolean;
  }) => void = () => {};
  private handlers: Partial<PeerConnectionHandlers> = {
    onData: (data) => console.log('Received data:', data),
    onConnect: () => console.log('Peer connected'),
    onDisconnect: () => console.log('Peer disconnected'),
    onError: (error) => console.error('Peer connection error:', error),
  };

  constructor() {
    this.peerId = uuidv4();
  }

  // Initialize the session as host
  public async initialize() {
    this.sessionId = uuidv4();
    this.hostId = this.peerId; // Use the peerId as hostId for the host
    this.isHost = true;
    
    console.log(`Initializing jam session as host. Session ID: ${this.sessionId}`);
    this.notifyStateUpdate();
    
    return {
      sessionId: this.sessionId,
      hostId: this.hostId,
    };
  }

  // Set event handlers for peer connection events
  public setHandlers(handlers: Partial<PeerConnectionHandlers>) {
    this.handlers = { ...this.handlers, ...handlers };
  }

  // Helper to get a peer connection by ID
  private getPeerConnection(peerId: string): SessionConnection | undefined {
    return this.connections.get(peerId);
  }
  
  // Set the session ID and host ID from a connection string
  public setSessionFromConnectionString(connectionString: string): boolean {
    try {
      const data = JSON.parse(connectionString);
      
      if (data.type !== 'jam-session-invite' || data.version !== '1.0' || !data.sessionId) {
        throw new Error('Invalid connection string format');
      }
      
      this.sessionId = data.sessionId;
      this.hostId = data.hostId || data.sessionId;
      this.isHost = false;
      
      console.log(`Joining jam session as peer. Session ID: ${this.sessionId}`);
      this.notifyStateUpdate();
      
      return true;
    } catch (error) {
      console.error('Invalid connection string:', error);
      return false;
    }
  }

  // Connect to a peer using a connection string from QR code
  public async connectToPeer(connectionString: string): Promise<boolean> {
    try {
      if (!this.setSessionFromConnectionString(connectionString)) {
        throw new Error('Invalid connection string');
      }
      
      // In a real implementation, this would establish a WebRTC connection
      // For now, we'll simulate a successful connection
      return true;
    } catch (error) {
      console.error('Failed to connect to peer:', error);
      toast.error('Failed to connect to the jam session');
      return false;
    }
  }

  // Start a WebRTC connection with a peer
  private async startPeerConnection(peerId: string, initiator: boolean): Promise<SessionConnection> {
    console.log(`Starting ${initiator ? 'initiator' : 'receiver'} connection to ${peerId}`);
    
    const connection = new RTCPeerConnection(DEFAULT_RTC_CONFIG);
    let dataChannel: RTCDataChannel | null = null;
    
    // Create data channel if we're the initiator
    if (initiator) {
      dataChannel = connection.createDataChannel('jam-session');
      this.setupDataChannel(peerId, dataChannel);
    }
    
    // Set up ICE candidate handler
    connection.onicecandidate = (event) => {
      if (event.candidate) {
        // In a real implementation, this would be sent via signaling
        console.log('Generated ICE candidate:', event.candidate);
      }
    };
    
    // Handle incoming data channel (for non-initiators)
    connection.ondatachannel = (event) => {
      const incomingChannel = event.channel;
      if (incomingChannel.label === 'jam-session') {
        dataChannel = incomingChannel;
        this.setupDataChannel(peerId, dataChannel);
      }
    };
    
    // Set up connection state handling
    connection.onconnectionstatechange = () => {
      console.log(`Connection state changed to: ${connection.connectionState}`);
      
      if (connection.connectionState === 'connected') {
        this.handlers.onConnect?.();
      } else if (connection.connectionState === 'disconnected' || 
                 connection.connectionState === 'failed' || 
                 connection.connectionState === 'closed') {
        this.connections.delete(peerId);
        this.notifyStateUpdate();
        this.handlers.onDisconnect?.();
      }
    };
    
    // Create the peer connection wrapper
    const peerConnection: PeerConnection = {
      connected: false,
      send: (data: any) => {
        if (dataChannel?.readyState === 'open') {
          const message = typeof data === 'string' ? data : JSON.stringify(data);
          dataChannel.send(message);
        } else {
          console.warn('Cannot send data - data channel not open');
        }
      },
      destroy: () => {
        connection.close();
        this.connections.delete(peerId);
        this.notifyStateUpdate();
      },
      signal: async (data: RTCSessionDescriptionInit | RTCIceCandidateInit) => {
        try {
          if ('type' in data && (data.type === 'offer' || data.type === 'answer')) {
            await connection.setRemoteDescription(new RTCSessionDescription(data));
            
            // If we received an offer, create an answer
            if (data.type === 'offer') {
              const answer = await connection.createAnswer();
              await connection.setLocalDescription(answer);
              // In a real implementation, this would be sent via signaling
              console.log('Generated answer:', answer);
            }
          } else if ('candidate' in data) {
            await connection.addIceCandidate(new RTCIceCandidate(data));
          }
        } catch (error) {
          console.error('Error handling signal:', error);
          this.handlers.onError?.(error as Error);
        }
      },
    };
    
    // Create the session connection
    const sessionConnection: SessionConnection = {
      peer: peerConnection,
      peerId,
      dataChannel: dataChannel || undefined,
    };
    
    // If we're the initiator, create an offer
    if (initiator) {
      try {
        const offer = await connection.createOffer();
        await connection.setLocalDescription(offer);
        // In a real implementation, this would be sent via signaling
        console.log('Generated offer:', offer);
      } catch (error) {
        console.error('Error creating offer:', error);
        this.handlers.onError?.(error as Error);
      }
    }
    
    // Store the connection
    this.connections.set(peerId, sessionConnection);
    this.notifyStateUpdate();
    
    return sessionConnection;
  }
  
  // Set up a data channel with event handlers
  private setupDataChannel(peerId: string, dataChannel: RTCDataChannel) {
    dataChannel.onopen = () => {
      console.log(`Data channel opened with ${peerId}`);
      this.connections.get(peerId)!.peer.connected = true;
      this.notifyStateUpdate();
      this.handlers.onConnect?.();
    };
    
    dataChannel.onclose = () => {
      console.log(`Data channel closed with ${peerId}`);
      this.connections.get(peerId)!.peer.connected = false;
      this.notifyStateUpdate();
      this.handlers.onDisconnect?.();
    };
    
    dataChannel.onerror = (error) => {
      console.error('Data channel error:', error);
      this.handlers.onError?.(new Error('Data channel error'));
    };
    
    dataChannel.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handlers.onData?.(data);
      } catch (error) {
        console.error('Error parsing message:', error);
        this.handlers.onError?.(error as Error);
      }
    };
  }

  // Process a signaling message from a peer
  public async handleSignal(peerId: string, message: SignalingMessage): Promise<void> {
    console.log(`Received signal from ${peerId}:`, message);
    
    let connection = this.connections.get(peerId);
    
    // If we don't have a connection yet and this is an offer, create one
    if (!connection && message.type === 'offer') {
      connection = await this.startPeerConnection(peerId, false);
    }
    
    // Forward the signal to the peer connection
    if (connection) {
      await connection.peer.signal(message);
    } else {
      console.warn(`Received signal for unknown peer: ${peerId}`);
    }
  }
  
  // Generate a connection string for sharing via QR code
  public generateConnectionString(): string {
    return JSON.stringify({
      type: 'jam-session-invite',
      version: '1.0',
      sessionId: this.sessionId,
      hostId: this.hostId,
      peerId: this.peerId,
      timestamp: Date.now(),
    });
  }
  
  // Process a connection string from a QR code
  public processConnectionString(connectionString: string): boolean {
    try {
      const data = JSON.parse(connectionString);
      
      if (data.type !== 'jam-session-invite' || data.version !== '1.0' || !data.sessionId) {
        throw new Error('Invalid connection string format');
      }
      
      // If we're the host, don't process our own connection string
      if (this.isHost && data.hostId === this.hostId) {
        return false;
      }
      
      // If we're not in a session, join the session
      if (!this.sessionId) {
        this.sessionId = data.sessionId;
        this.hostId = data.hostId;
        // Keep the existing peerId, don't generate a new one
        this.isHost = false;
        this.notifyStateUpdate();
      }
      
      return true;
    } catch (error) {
      console.error('Error processing connection string:', error);
      return false;
    }
  }

  private handleData(peerId: string, data: any): void {
    try {
      const message = typeof data === 'string' ? JSON.parse(data) : data;
      console.log('Received data from peer:', peerId, message);
      
      // Handle the received data (e.g., UI state updates)
      if (message.type === 'ui-state') {
        // In a real implementation, this would update the UI state
        console.log('UI state update from peer:', message.state);
      }
    } catch (error) {
      console.error('Error parsing message from peer:', error);
    }
  }

  // Send UI state to all connected peers
  public broadcastState(state: any): void {
    if (this.connections.size === 0) return;
    
    const message = {
      type: 'ui-state' as const,
      state,
      timestamp: Date.now(),
    };

    const messageString = JSON.stringify(message);
    
    this.connections.forEach((connection) => {
      if (connection.peer.connected && connection.peer.send) {
        try {
          connection.peer.send(messageString);
        } catch (error) {
          console.error('Error sending data to peer:', error);
        }
      }
    });
  }

  // Clean up resources
  public destroy(): void {
    this.connections.forEach((connection) => {
      try {
        if (connection.peer.destroy) {
          connection.peer.destroy();
        }
      } catch (error) {
        console.error('Error destroying peer connection:', error);
      }
    });
    
    this.connections.clear();
    this.sessionId = '';
    this.hostId = '';
    this.isHost = false;
    this.notifyStateUpdate();
  }

  private notifyStateUpdate(): void {
    this.onStateUpdate({
      isHost: this.isHost,
      sessionId: this.sessionId,
      connectedPeers: Array.from(this.connections.keys()),
      isConnected: this.connections.size > 0 || this.isHost,
    });
  }

  // Set state update callback
  public setOnStateUpdate(callback: (state: {
    isHost: boolean;
    sessionId: string | null;
    connectedPeers: string[];
    isConnected: boolean;
  }) => void): void {
    this.onStateUpdate = callback;
    // Trigger an initial update
    this.notifyStateUpdate();
  }
}

// Singleton instance
export const jamSessionService = new JamSessionService();
