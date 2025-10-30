import React, { useState } from 'react';
import { useRooms } from '../../hooks/useRooms';
import { Plus, Hash } from 'lucide-react';
import CreateRoomModal from './CreateRoomModal';

const RoomList = ({ activeRoom, onRoomSelect }) => {
  const { rooms, loading, createRoom, joinRoom } = useRooms();
  const [showModal, setShowModal] = useState(false);

  const handleCreateRoom = (name, description, isPrivate) => {
    createRoom(name, description, isPrivate);
    setShowModal(false);
  };

  return (
    <div className="room-list">
      <button className="create-room-btn" onClick={() => setShowModal(true)}>
        <Plus size={16} /> Create Room
      </button>

      <div className="rooms">
        <div
          className={`room-item ${activeRoom === 'global' ? 'active' : ''}`}
          onClick={() => onRoomSelect('global')}
        >
          <Hash size={16} />
          <span>Global</span>
        </div>

        {!loading &&
          rooms.map((room) => (
            <div
              key={room._id}
              className={`room-item ${activeRoom === room.name ? 'active' : ''}`}
              onClick={() => {
                joinRoom(room._id);
                onRoomSelect(room.name);
              }}
            >
              <Hash size={16} />
              <span>{room.name}</span>
              <span className="member-count">{room.members.length}</span>
            </div>
          ))}
      </div>

      {showModal && (
        <CreateRoomModal
          onClose={() => setShowModal(false)}
          onCreate={handleCreateRoom}
        />
      )}
    </div>
  );
};

export default RoomList;
