import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../context/SocketContext';
import toast from 'react-hot-toast';

export const useRooms = () => {
  const { socket } = useSocket();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (socket) {
      socket.emit('room:get', (response) => {
        if (response.success) {
          setRooms(response.rooms);
        }
        setLoading(false);
      });

      const handleRoomCreated = (room) => {
        setRooms((prev) => [...prev, room]);
      };

      const handleUserJoined = (data) => {
        toast.success(`${data.username} joined ${data.room}`);
      };

      socket.on('room:created', handleRoomCreated);
      socket.on('room:user:joined', handleUserJoined);

      return () => {
        socket.off('room:created', handleRoomCreated);
        socket.off('room:user:joined', handleUserJoined);
      };
    }
  }, [socket]);

  const createRoom = useCallback(
    (name, description = '', isPrivate = false) => {
      if (!socket) return;

      socket.emit('room:create', { name, description, isPrivate }, (response) => {
        if (response.success) {
          toast.success(`Room "${name}" created successfully`);
        } else {
          toast.error(response.message);
        }
      });
    },
    [socket]
  );

  const joinRoom = useCallback(
    (roomId) => {
      if (!socket) return;

      socket.emit('room:join', { roomId }, (response) => {
        if (response.success) {
          toast.success(`Joined room successfully`);
        } else {
          toast.error(response.message);
        }
      });
    },
    [socket]
  );

  return {
    rooms,
    loading,
    createRoom,
    joinRoom,
  };
};
