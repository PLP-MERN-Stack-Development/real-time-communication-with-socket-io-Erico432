import React from 'react';

const UserList = ({ users }) => {
  return (
    <div className="user-list">
      {users.map((user) => (
        <div key={user._id} className="user-item">
          <img src={user.avatar} alt={user.username} className="user-avatar-small" />
          <span>{user.username}</span>
          <span className={`status-dot ${user.status}`}></span>
        </div>
      ))}
      
      {users.length === 0 && (
        <p className="no-users">No users online</p>
      )}
    </div>
  );
};

export default UserList;
