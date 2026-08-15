export interface JamSessionState {
  scrollPercent: number;
  capo: number;
  transpose: number;
  currentPage: number;
}

export interface JamSessionPeer {
  peerId: string;
  isHost: boolean;
  connectedAt: number;
}

class JamSessionSignalingService {
  private sessions = new Map<string, Set<string>>();
  private peerStates = new Map<string, JamSessionState>();

  createSession(sessionId: string, hostId: string): void {
    this.sessions.set(sessionId, new Set([hostId]));
  }

  joinSession(sessionId: string, peerId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;
    session.add(peerId);
    return true;
  }

  leaveSession(sessionId: string, peerId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.delete(peerId);
      if (session.size === 0) {
        this.sessions.delete(sessionId);
      }
    }
  }

  getPeersInSession(sessionId: string): string[] {
    const session = this.sessions.get(sessionId);
    return session ? Array.from(session) : [];
  }

  setPeerState(peerId: string, state: JamSessionState): void {
    this.peerStates.set(peerId, state);
  }

  getPeerState(peerId: string): JamSessionState | undefined {
    return this.peerStates.get(peerId);
  }

  sessionExists(sessionId: string): boolean {
    return this.sessions.has(sessionId);
  }
}

export default new JamSessionSignalingService();
