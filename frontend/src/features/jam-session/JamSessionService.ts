import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import io, { Socket } from 'socket.io-client';
import { 
  JamSessionConfig,
  SessionConnection,
  PeerConnection,
  ConnectionStringData,
  PeerConnectionHandlers,
} from './types';

export interface JamSessionState {
  scrollPercent: number;
  capo: number;
  transpose: number;
  currentPage: number;
}

export class JamSessionService {
  private sessionId: string = '';
  private hostId: string = '';
  public readonly peerId: string;
  private isHost: boolean = false;
  private socket: Socket | null = null;
  private currentState: JamSessionState = {
    scrollPercent: 0,
    capo: 0,
    transpose: 0,
    currentPage: 0,
  };
  private connectedPeers: Set<string> = new Set();
  private onStateUpdate: (state: {
    isHost: boolean;
    sessionId: string | null;
    connectedPeers: string[];
    isConnected: boolean;
  }) => void = () => {};
  private onStateChanged: (state: JamSessionState) => void = () => {};
  private handlers: Partial<PeerConnectionHandlers> = {
    onData: (data) => console.log('Received data:', data),
    onConnect: () => console.log('Peer connected'),
    onDisconnect: () => console.log('Peer disconnected'),
    onError: (error) => console.error('Peer connection error:', error),
  };
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.peerId = uuidv4();
  }

  public async initialize() {
    this.sessionId = uuidv4().substring(0, 8);
    this.hostId = this.peerId;
    this.isHost = true;
    this.connectSocket();
    
    console.log(`Initializing jam session as host. Session ID: ${this.sessionId}`);
    this.notifyStateUpdate();
    
    return {
      sessionId: this.sessionId,
      hostId: this.hostId,
    };
  }

  private connectSocket(): void {
    if (this.socket?.connected) return;
    
    const apiUrl = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:3001`;
    this.socket = io(apiUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('Connected to jam session server');
      if (this.isHost && this.sessionId) {
        this.socket?.emit('jam:create-session', 
          { hostId: this.hostId }, 
          (res: any) => {
            console.log('Session created:', res.sessionId);
          }
        );
      }
    });

    this.socket.on('jam:peer-joined', (data: { peerId: string }) => {
      console.log('Peer joined:', data.peerId);
      this.connectedPeers.add(data.peerId);
      this.notifyStateUpdate();
      this.handlers.onConnect?.();
    });

    this.socket.on('jam:peer-left', (data: { peerId: string }) => {
      console.log('Peer left:', data.peerId);
      this.connectedPeers.delete(data.peerId);
      this.notifyStateUpdate();
      this.handlers.onDisconnect?.();
    });

    this.socket.on('jam:state-update', (data: { state: JamSessionState; isHost: boolean }) => {
      if (!this.isHost) {
        // Peer receives state from host
        this.currentState = data.state;
        this.onStateChanged(data.state);
        console.log('Applied state update from host:', data.state);
      }
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from jam session server');
      this.connectedPeers.clear();
      this.notifyStateUpdate();
    });

    this.socket.on('connect_error', (error: any) => {
      console.error('Connection error:', error);
      this.handlers.onError?.(new Error(error.message || 'Connection failed'));
    });
  }

  public setHandlers(handlers: Partial<PeerConnectionHandlers>) {
    this.handlers = { ...this.handlers, ...handlers };
  }

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
      this.connectSocket();
      this.notifyStateUpdate();
      
      return true;
    } catch (error) {
      console.error('Invalid connection string:', error);
      return false;
    }
  }

  public async connectToPeer(connectionString: string): Promise<boolean> {
    try {
      if (!this.setSessionFromConnectionString(connectionString)) {
        throw new Error('Invalid connection string');
      }
      
      // Connect via Socket.IO
      if (this.socket) {
        this.socket.emit('jam:join-session', 
          { sessionId: this.sessionId, peerId: this.peerId },
          (res: any) => {
            if (res.success) {
              console.log('Successfully joined jam session');
              this.startHeartbeat();
              this.handlers.onConnect?.();
            } else {
              console.error('Failed to join session:', res.error);
              toast.error(res.error || 'Failed to join jam session');
            }
          }
        );
      }
      
      return true;
    } catch (error) {
      console.error('Failed to connect to peer:', error);
      toast.error('Failed to connect to the jam session');
      return false;
    }
  }

  public async processConnectionString(connectionString: string): Promise<boolean> {
    try {
      const data = JSON.parse(connectionString);
      
      if (data.type !== 'jam-session-invite' || data.version !== '1.0' || !data.sessionId) {
        throw new Error('Invalid connection string format');
      }
      
      if (this.isHost && data.hostId === this.hostId) {
        return false;
      }
      
      if (!this.sessionId) {
        this.sessionId = data.sessionId;
        this.hostId = data.hostId;
        this.isHost = false;
        this.connectSocket();
        this.notifyStateUpdate();
      }
      
      return true;
    } catch (error) {
      console.error('Error processing connection string:', error);
      return false;
    }
  }

  public broadcastState(state: Partial<JamSessionState>): void {
    this.currentState = { ...this.currentState, ...state };
    
    if (this.isHost && this.socket?.connected) {
      this.socket.emit('jam:broadcast-state', {
        sessionId: this.sessionId,
        state: this.currentState,
        isHost: true,
      });
      console.log('Broadcast state:', this.currentState);
    }
  }

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

  public setOnStateChanged(callback: (state: JamSessionState) => void): void {
    this.onStateChanged = callback;
  }

  public getCurrentState(): JamSessionState {
    return this.currentState;
  }

  private startHeartbeat(): void {
    if (this.heartbeatInterval) return;
    
    this.heartbeatInterval = setInterval(() => {
      if (this.socket?.connected) {
        this.socket.emit('jam:heartbeat', {
          sessionId: this.sessionId,
          peerId: this.peerId,
        });
      }
    }, 10000);
  }

  public destroy(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    if (this.socket?.connected) {
      this.socket.emit('jam:leave-session', {
        sessionId: this.sessionId,
        peerId: this.peerId,
      });
      this.socket.disconnect();
    }
    
    this.sessionId = '';
    this.hostId = '';
    this.isHost = false;
    this.connectedPeers.clear();
    this.currentState = {
      scrollPercent: 0,
      capo: 0,
      transpose: 0,
      currentPage: 0,
    };
    this.notifyStateUpdate();
  }

  private notifyStateUpdate(): void {
    this.onStateUpdate({
      isHost: this.isHost,
      sessionId: this.sessionId,
      connectedPeers: Array.from(this.connectedPeers),
      isConnected: this.socket?.connected || false,
    });
  }

  public setOnStateUpdate(callback: (state: {
    isHost: boolean;
    sessionId: string | null;
    connectedPeers: string[];
    isConnected: boolean;
  }) => void): void {
    this.onStateUpdate = callback;
    this.notifyStateUpdate();
  }
}

export const jamSessionService = new JamSessionService();
