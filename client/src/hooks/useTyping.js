import { useState, useEffect, useCallback, useRef } from 'react';
import { useSocket } from '../context/SocketContext';

export const useTyping = (room = 'global') => {
  const { socket } = useSocket();
  const [typingUsers, setTypingUsers] = useState([]);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (socket) {
      const handleTyping = (data) => {
        if (data.isTyping) {
          setTypingUsers((prev) => {
            if (!prev.find((u) => u.userId === data.userId)) {
              return [...prev, data];
            }
            return prev;
          });
        } else {
          setTypingUsers((prev) => prev.filter((u) => u.userId !== data.userId));
        }
      };

      socket.on('typing:user', handleTyping);

      return () => {
        socket.off('typing:user', handleTyping);
      };
    }
  }, [socket]);

  const startTyping = useCallback(() => {
    if (!socket) return;

    socket.emit('typing:start', { room });

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Auto-stop typing after 3 seconds
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 3000);
  }, [socket, room]);

  const stopTyping = useCallback(() => {
    if (!socket) return;

    socket.emit('typing:stop', { room });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  }, [socket, room]);

  return {
    typingUsers,
    startTyping,
    stopTyping,
  };
};
