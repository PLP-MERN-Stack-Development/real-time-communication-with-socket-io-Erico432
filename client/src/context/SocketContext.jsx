import React, { createContext, useContext, useEffect, useState } from 'react';
import { getSocket } from '../socket/socket';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (isAuthenticated) {
      try {
        const socketInstance = getSocket();
        setSocket(socketInstance);

        socketInstance.on('connect', () => {
          setConnected(true);
          console.log('✅ Socket connected');
        });

        socketInstance.on('disconnect', () => {
          setConnected(false);
          console.log('❌ Socket disconnected');
        });

        socketInstance.on('connect_error', (error) => {
          console.error('Connection error:', error);
          toast.error('Connection error. Please try again.');
        });

        socketInstance.on('users:online', (users) => {
          setOnlineUsers(users);
        });

        socketInstance.on('user:online', (data) => {
          toast.success(`${data.username} is now online`);
        });

        socketInstance.on('user:offline', (data) => {
          toast(`${data.username} went offline`, { icon: '👋' });
        });

        return () => {
          socketInstance.off('connect');
          socketInstance.off('disconnect');
          socketInstance.off('connect_error');
          socketInstance.off('users:online');
          socketInstance.off('user:online');
          socketInstance.off('user:offline');
        };
      } catch (error) {
        console.error('Socket initialization error:', error);
      }
    }
  }, [isAuthenticated]);

  const value = {
    socket,
    connected,
    onlineUsers,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};
