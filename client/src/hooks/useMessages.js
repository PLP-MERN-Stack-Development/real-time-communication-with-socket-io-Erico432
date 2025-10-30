import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../context/SocketContext';
import toast from 'react-hot-toast';

export const useMessages = (room = 'global') => {
  const { socket } = useSocket();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Load initial messages
  useEffect(() => {
    if (socket && room) {
      setLoading(true);
      socket.emit('message:get', { room, page: 1, limit: 50 }, (response) => {
        if (response.success) {
          setMessages(response.messages);
          setHasMore(response.messages.length === 50);
        }
        setLoading(false);
      });
    }
  }, [socket, room]);

  // Listen for new messages and reactions
  useEffect(() => {
    if (socket) {
      const handleNewMessage = (message) => {
        setMessages((prev) => [...prev, message]);

        // Play notification sound
        const audio = new Audio('/notification.mp3');
        audio.play().catch(() => {});
      };

      const handleReactionUpdate = (data) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === data.messageId
              ? { ...msg, reactions: data.reactions }
              : msg
          )
        );
      };

      socket.on('message:new', handleNewMessage);
      socket.on('message:reaction:update', handleReactionUpdate);

      return () => {
        socket.off('message:new', handleNewMessage);
        socket.off('message:reaction:update', handleReactionUpdate);
      };
    }
  }, [socket]);

  // Send message
  const sendMessage = useCallback(
    (content, type = 'text', fileUrl = null, recipient = null) => {
      if (!socket) return;

      socket.emit(
        'message:send',
        { content, room, type, fileUrl, recipient },
        (response) => {
          if (!response.success) {
            toast.error('Failed to send message');
          }
        }
      );
    },
    [socket, room]
  );

  // Load more messages (pagination)
  const loadMore = useCallback(() => {
    if (!socket || !hasMore || loading) return;

    const nextPage = page + 1;
    socket.emit('message:get', { room, page: nextPage, limit: 50 }, (response) => {
      if (response.success) {
        setMessages((prev) => [...response.messages, ...prev]);
        setPage(nextPage);
        setHasMore(response.messages.length === 50);
      }
    });
  }, [socket, room, page, hasMore, loading]);

  // Mark message as read
  const markAsRead = useCallback(
    (messageId) => {
      if (!socket) return;
      socket.emit('message:read', { messageId, room });
    },
    [socket, room]
  );

  // Add reaction
  const addReaction = useCallback(
    (messageId, emoji) => {
      if (!socket) return;
      socket.emit('message:reaction', { messageId, emoji, room });
    },
    [socket, room]
  );

  return {
    messages,
    loading,
    hasMore,
    sendMessage,
    loadMore,
    markAsRead,
    addReaction,
  };
};
