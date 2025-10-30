import React from 'react';

const TypingIndicator = ({ typingUsers }) => {
  if (typingUsers.length === 0) return null;

  const names = typingUsers.map((u) => u.username).join(', ');
  const text = typingUsers.length === 1 
    ? `${names} is typing...` 
    : `${names} are typing...`;

  return (
    <div className="typing-indicator">
      <span className="typing-text">{text}</span>
      <div className="typing-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  );
};

export default TypingIndicator;
