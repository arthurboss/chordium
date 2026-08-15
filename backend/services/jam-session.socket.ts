import { Server as SocketIOServer, Socket } from 'socket.io';
import type { Server } from 'http';
import jamSessionSignalingService, { type JamSessionState } from '../services/jam-session.service.js';
import logger from '../utils/logger.js';

export function setupJamSessionSocket(httpServer: Server): SocketIOServer {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
  });

  io.on('connection', (socket: Socket) => {
    logger.info(`Client connected: ${socket.id}`);

    socket.on('jam:create-session', (data: { hostId: string }, callback) => {
      const sessionId = Math.random().toString(36).substring(2, 11);
      jamSessionSignalingService.createSession(sessionId, data.hostId);
      socket.join(`jam-${sessionId}`);
      logger.info(`Created jam session: ${sessionId}`);
      callback({ sessionId });
    });

    socket.on('jam:join-session', (data: { sessionId: string; peerId: string }, callback) => {
      const sessionId = data.sessionId;
      if (!jamSessionSignalingService.sessionExists(sessionId)) {
        callback({ success: false, error: 'Session not found' });
        return;
      }

      jamSessionSignalingService.joinSession(sessionId, data.peerId);
      socket.join(`jam-${sessionId}`);
      socket.broadcast.to(`jam-${sessionId}`).emit('jam:peer-joined', {
        peerId: data.peerId,
      });
      logger.info(`Peer ${data.peerId} joined session ${sessionId}`);
      callback({ success: true });
    });

    socket.on('jam:broadcast-state', (data: { sessionId: string; state: JamSessionState; isHost: boolean }) => {
      const { sessionId, state, isHost } = data;
      if (!jamSessionSignalingService.sessionExists(sessionId)) {
        logger.warn(`Broadcast to non-existent session: ${sessionId}`);
        return;
      }

      socket.broadcast.to(`jam-${sessionId}`).emit('jam:state-update', {
        state,
        isHost,
      });
      logger.debug(`State broadcast in session ${sessionId}: scroll=${state.scrollPercent}% capo=${state.capo} transpose=${state.transpose}`);
    });

    socket.on('jam:heartbeat', (data: { sessionId: string; peerId: string }) => {
      // Keep-alive for connection monitoring
      socket.broadcast.to(`jam-${data.sessionId}`).emit('jam:heartbeat', {
        peerId: data.peerId,
      });
    });

    socket.on('jam:leave-session', (data: { sessionId: string; peerId: string }) => {
      const sessionId = data.sessionId;
      jamSessionSignalingService.leaveSession(sessionId, data.peerId);
      socket.leave(`jam-${sessionId}`);
      socket.broadcast.to(`jam-${sessionId}`).emit('jam:peer-left', {
        peerId: data.peerId,
      });
      logger.info(`Peer ${data.peerId} left session ${sessionId}`);
    });

    socket.on('disconnect', () => {
      logger.info(`Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

export default setupJamSessionSocket;
