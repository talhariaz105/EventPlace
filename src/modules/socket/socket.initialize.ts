import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import authMiddleWareSocket from './socket.middleware';
import type { AuthenticatedSocket } from './socket.middleware';
import { chatEvent } from '../chat/chat.socket';

let io: Server | undefined;

export function getSocketInstance(): Server | undefined {
  return io;
}

export function initializeSocket(server: HttpServer) {
  if (!io) {
    console.log('Initializing Socket.io...');
    io = new Server(server, { 
      cors: { 
        origin: '*',
        methods: ['GET', 'POST'],
        credentials: true
      },
      transports: ['websocket', 'polling'],
      allowEIO3: true,
      pingTimeout: 60000,
      pingInterval: 25000
    });
  }
  
  // Now io is guaranteed to be defined
  const socketServer = io;
  
  socketServer.use((socket: AuthenticatedSocket, next) => {
    authMiddleWareSocket(socket, next).catch((error) => {
      console.error('Socket middleware error:', error);
      next(error);
    });
  });
  
  socketServer.on('connection', async (socket: AuthenticatedSocket) => {
    const username = socket?.user?.name ?? socket?.user?.name;
    const userId = socket?.user?._id.toString();

    if (userId) {
      socket.join(userId.toString());
      console.log(`User ${userId}  ${username} connected and joined room `);
    }
    chatEvent(socketServer, socket);
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
}
