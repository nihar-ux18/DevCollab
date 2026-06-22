import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

// Auto-detect Socket URL in production
const getSocketUrl = (): string => {
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL;
  }
  return window.location.origin;
};

interface SocketContextType {
  socket: ReturnType<typeof io> | null;
  isConnected: boolean;
  joinRoom: (roomId: string) => void;
  sendCodeChange: (data: { roomId: string; code: string }) => void;
  sendTyping: (data: { roomId: string; isTyping: boolean }) => void;
  onCodeUpdate: (callback: (data: any) => void) => void;
  onUserJoined: (callback: (data: any) => void) => void;
  onUserLeft: (callback: (data: any) => void) => void;
  onUserTyping: (callback: (data: any) => void) => void;
  onRoomParticipants: (callback: (data: any) => void) => void;
  onChatMessage: (callback: (data: any) => void) => void;
  onPreviousMessages: (callback: (data: any) => void) => void;
  onSignal: (callback: (data: any) => void) => void;
  off: (event: string) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<any>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const SOCKET_URL = getSocketUrl();
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      withCredentials: true,
    } as any);

    newSocket.on('connect', () => {
      console.log('✅ Socket connected:', newSocket.id);
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error: Error) => {
      console.error('Socket connection error:', error);
    });

    setSocket(newSocket);

    return () => {
      if (newSocket) {
        newSocket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
    };
  }, [user]);

  const joinRoom = (roomId: string): void => {
    if (!socket || !user) return;
    socket.emit('join-room', { 
      roomId, 
      username: user.username 
    });
  };

  const sendCodeChange = (data: { roomId: string; code: string }): void => {
    if (!socket) return;
    socket.emit('code-change', data);
  };

  const sendTyping = (data: { roomId: string; isTyping: boolean }): void => {
    if (!socket) return;
    socket.emit('typing', data);
  };

  const onCodeUpdate = (callback: (data: any) => void): void => {
    if (!socket) return;
    socket.on('code-update', callback);
  };

  const onUserJoined = (callback: (data: any) => void): void => {
    if (!socket) return;
    socket.on('user-joined', callback);
  };

  const onUserLeft = (callback: (data: any) => void): void => {
    if (!socket) return;
    socket.on('user-left', callback);
  };

  const onUserTyping = (callback: (data: any) => void): void => {
    if (!socket) return;
    socket.on('user-typing', callback);
  };

  const onRoomParticipants = (callback: (data: any) => void): void => {
    if (!socket) return;
    socket.on('room-participants', callback);
  };

  const onChatMessage = (callback: (data: any) => void): void => {
    if (!socket) return;
    socket.on('chat-message', callback);
  };

  const onPreviousMessages = (callback: (data: any) => void): void => {
    if (!socket) return;
    socket.on('previous-messages', callback);
  };

  const onSignal = (callback: (data: any) => void): void => {
    if (!socket) return;
    socket.on('signal', callback);
  };

  const off = (event: string): void => {
    if (!socket) return;
    socket.off(event);
  };

  const value: SocketContextType = {
    socket,
    isConnected,
    joinRoom,
    sendCodeChange,
    sendTyping,
    onCodeUpdate,
    onUserJoined,
    onUserLeft,
    onUserTyping,
    onRoomParticipants,
    onChatMessage,
    onPreviousMessages,
    onSignal,
    off,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};