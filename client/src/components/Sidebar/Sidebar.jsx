import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import RoomList from './RoomList';
import UserList from './UserList';
import { LogOut, Users, MessageSquare } from 'lucide-react';

const Sidebar = ({ activeRoom, onRoomSelect }) => {
  const { user, logout } = useAuth();
  const { connected, onlineUsers } = useSocket();

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="user-info">
          <img src={user.avatar} alt={user.username} className="user-avatar" />
          <div>
            <h3>{user.username}</h3>
            <span className={`status ${connected ? 'online' : 'offline'}`}>
              {connected ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>
        <button className="logout-btn" onClick={logout} title="Logout">
          <LogOut size={20} />
        </button>
      </div>

      <div className="sidebar-content">
        <div className="section">
          <h4>
            <MessageSquare size={18} /> Rooms
          </h4>
          <RoomList activeRoom={activeRoom} onRoomSelect={onRoomSelect} />
        </div>

        <div className="section">
          <h4>
            <Users size={18} /> Online ({onlineUsers.length})
          </h4>
          <UserList users={onlineUsers} />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
