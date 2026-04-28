import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

// Dummy no-op socket for when the server is unavailable
const noopSocket = {
  emit: () => {},
  on: () => {},
  off: () => {},
  connected: false,
  active: false,
} as unknown as Socket;

export const getSocket = (userId?: string): Socket => {
  if (typeof window === 'undefined') return noopSocket;
  
  if (!socket) {
    try {
      const socketUrl = process.env.NODE_ENV === 'production' 
        ? window.location.origin 
        : 'http://localhost:3001';

      socket = io(socketUrl, {
        reconnectionAttempts: 3,
        reconnectionDelay: 2000,
        transports: ['websocket', 'polling'],
        autoConnect: true,
        timeout: 5000,
      });

      socket.on('connect_error', () => {
        // Silently fail — real-time is optional
        console.warn('[Chat] Socket server unavailable. Real-time features disabled.');
      });

      if (userId) {
        socket.emit('user-online', userId);
      }
    } catch (e) {
      return noopSocket;
    }
  }

  return socket ?? noopSocket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
