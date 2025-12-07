import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from '@/hooks/use-toast';
import LZString from 'lz-string';

export type JamSessionRole = 'host' | 'peer' | 'none';

export interface JamSessionState {
 transpose: number;
 capo: number;
 scrollPosition: number; // 0-1 percentage
 isAutoScrolling: boolean;
 scrollSpeed: number;
 songPath?: string;
 songTitle?: string;
 songArtist?: string;
 songContent?: string;
}

interface PeerConnection {
 id: string;
 pc: RTCPeerConnection;
 dc?: RTCDataChannel; // Data channel for this connection
 connected: boolean;
}

interface JamSessionContextType {
 role: JamSessionRole;
 isSessionActive: boolean;
 peers: PeerConnection[];
 sessionState: JamSessionState;

 startSession: () => void;
 createPeerConnection: () => Promise<{ id: string, signal: string }>;
 confirmPeerConnection: (connectionId: string, answerSignal: string) => void;
 broadcastState: (partialState: Partial<JamSessionState>) => void;
 endSession: () => void;
 joinSession: (offerSignal: string) => Promise<string>;
 disconnect: () => void;
}

const JamSessionContext = createContext<JamSessionContextType | null>(null);

export const useJamSession = () => {
 const context = useContext(JamSessionContext);
 if (!context) throw new Error('useJamSession must be used within a JamSessionProvider');
 return context;
};

// Configuration for WebRTC
const RTC_CONFIG: RTCConfiguration = {
 iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
};

export const JamSessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
 const [role, setRole] = useState<JamSessionRole>('none');
 const [peers, setPeers] = useState<PeerConnection[]>([]);
 const [sessionState, setSessionState] = useState<JamSessionState>({
  transpose: 0,
  capo: 0,
  scrollPosition: 0,
  isAutoScrolling: false,
  scrollSpeed: 1
 });

 const peersRef = useRef<PeerConnection[]>([]);
 peersRef.current = peers;
 const sessionStateRef = useRef<JamSessionState>(sessionState);
 sessionStateRef.current = sessionState;

 // Helper to gather candidates and return a complete description
 const gatherCandidates = (pc: RTCPeerConnection): Promise<RTCSessionDescriptionInit> => {
  return new Promise((resolve) => {
   if (pc.iceGatheringState === 'complete') {
    resolve(pc.localDescription as RTCSessionDescriptionInit);
   } else {
    const checkState = () => {
     if (pc.iceGatheringState === 'complete') {
      pc.removeEventListener('icegatheringstatechange', checkState);
      resolve(pc.localDescription as RTCSessionDescriptionInit);
     }
    };
    pc.addEventListener('icegatheringstatechange', checkState);
   }
  });
 };

 // Host: Create Peer Connection (Generates Offer)
 const createPeerConnection = useCallback(async (): Promise<{ id: string, signal: string }> => {
  const id = uuidv4();
  const pc = new RTCPeerConnection(RTC_CONFIG);

  // Create Data Channel
  const dc = pc.createDataChannel("jam-session");
  setupDataChannel(dc, id, true);

  pc.onconnectionstatechange = () => {
   console.log(`Peer ${id} connection state:`, pc.connectionState);
   if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
    setPeers(prev => prev.filter(p => p.id !== id));
   }
  };

  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  const completeOffer = await gatherCandidates(pc);

  // Compress offer for QR code
  const signal = LZString.compressToEncodedURIComponent(JSON.stringify(completeOffer));

  const newPeer: PeerConnection = { id, pc, dc, connected: false };
  setPeers(prev => [...prev, newPeer]);

  return { id, signal };
 }, []);

 // Host: Confirm Peer Connection (Receives Answer)
 const confirmPeerConnection = useCallback(async (connectionId: string, answerSignal: string) => {
  const peer = peersRef.current.find(p => p.id === connectionId);
  if (!peer) return;

  try {
   const answer = JSON.parse(LZString.decompressFromEncodedURIComponent(answerSignal) || '{}');
   await peer.pc.setRemoteDescription(new RTCSessionDescription(answer));
  } catch (e) {
   console.error('Failed to set remote description', e);
   toast({ title: 'Error', description: 'Invalid QR Code', variant: 'destructive' });
  }
 }, []);

 // Peer: Join Session (Receives Offer, Generates Answer)
 const joinSession = useCallback(async (offerSignal: string): Promise<string> => {
  setRole('peer');
  const pc = new RTCPeerConnection(RTC_CONFIG);

  pc.ondatachannel = (event) => {
   setupDataChannel(event.channel, 'host', false);
  };

  pc.onconnectionstatechange = () => {
   console.log('Connection state:', pc.connectionState);
   if (pc.connectionState === 'connected') {
    toast({ title: 'Connected', description: 'Joined Jam Session' });
   } else if (pc.connectionState === 'disconnected') {
    setRole('none');
    setPeers([]);
   }
  };

  try {
   const offer = JSON.parse(LZString.decompressFromEncodedURIComponent(offerSignal) || '{}');
   await pc.setRemoteDescription(new RTCSessionDescription(offer));
   const answer = await pc.createAnswer();
   await pc.setLocalDescription(answer);
   const completeAnswer = await gatherCandidates(pc);

   const newPeer: PeerConnection = { id: 'host', pc, connected: true }; // connected status will be updated by dc open
   setPeers([newPeer]); // Overwrite any existing

   const signal = LZString.compressToEncodedURIComponent(JSON.stringify(completeAnswer));
   return signal;
  } catch (e) {
   console.error(e);
   throw e;
  }
 }, []);

 const setupDataChannel = (dc: RTCDataChannel, peerId: string, isHost: boolean) => {
  dc.onopen = () => {
   console.log(`DataChannel open with ${peerId}`);
   setPeers(prev => prev.map(p => p.id === peerId ? { ...p, dc, connected: true } : p));

   if (isHost) {
    // Host sends full state on connect
    const msg = JSON.stringify({ type: 'STATE_FULL', payload: sessionStateRef.current });
    dc.send(msg);
   }
  };

  dc.onmessage = (event) => {
   try {
    const msg = JSON.parse(event.data);
    if (msg.type === 'STATE_FULL' || msg.type === 'STATE_UPDATE') {
     setSessionState(prev => ({ ...prev, ...msg.payload }));
    }
   } catch (e) {
    console.error('Failed to parse message', e);
   }
  };
 };

 const broadcastState = useCallback((partialState: Partial<JamSessionState>) => {
  setSessionState(prev => ({ ...prev, ...partialState }));

  if (role === 'host') {
   const msg = JSON.stringify({ type: 'STATE_UPDATE', payload: partialState });
   peersRef.current.forEach(p => {
    if (p.dc && p.dc.readyState === 'open') {
     p.dc.send(msg);
    }
   });
  }
 }, [role]);

 const startSession = () => { setRole('host'); setPeers([]); };

 const endSession = useCallback(() => {
  peersRef.current.forEach(p => p.pc.close());
  setPeers([]);
  setRole('none');
 }, []);

 const disconnect = () => endSession();

 useEffect(() => {
  return () => endSession();
 }, []);

 return (
  <JamSessionContext.Provider value={{
   role, isSessionActive: role !== 'none', peers, sessionState,
   startSession, createPeerConnection, confirmPeerConnection,
   broadcastState, endSession, joinSession, disconnect
  }}>
   {children}
  </JamSessionContext.Provider>
 );
};
