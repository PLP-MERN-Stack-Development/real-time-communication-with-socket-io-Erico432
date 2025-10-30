import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { formatDistanceToNow } from '../../utils/dateUtils';
import ReactionPicker from './ReactionPicker';

const Message = ({ message, onReaction }) => {
  const { user } = useAuth();
  const [showReactions, setShowReactions] = useState(false);
  const isOwnMessage = message.sender._id === user.id;

  const reactionCounts = message.reactions.reduce((acc, reaction) => {
    acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className={`message ${isOwnMessage ? 'own' : 'other'}`}>
      <div className="message-avatar">
        <img src={message.sender.avatar} alt={message.sender.username} />
      </div>
      
      <div className="message-content">
        <div className="message-header">
          <span className="message-sender">{message.sender.username}</span>
          <span className="message-time">
            {formatDistanceToNow(message.createdAt)}
          </span>
        </div>
        
        <div className="message-body">
          {message.type === 'text' && <p>{message.content}</p>}
          
          {message.type === 'image' && (
            <div className="message-image">
              <img src={message.fileUrl} alt="Shared image" />
              {message.content && <p>{message.content}</p>}
            </div>
          )}
          
          {message.type === 'file' && (
            <div className="message-file">
              <a href={message.fileUrl} target="_blank" rel="noopener noreferrer">
                📎 {message.content}
              </a>
            </div>
          )}
        </div>
        
        {message.reactions.length > 0 && (
          <div className="message-reactions">
            {Object.entries(reactionCounts).map(([emoji, count]) => (
              <span
                key={emoji}
                className="reaction"
                onClick={() => onReaction(message._id, emoji)}
              >
                {emoji} {count}
              </span>
            ))}
          </div>
        )}
        
        <button
          className="add-reaction-btn"
          onClick={() => setShowReactions(!showReactions)}
        >
          😊
        </button>
        
        {showReactions && (
          <ReactionPicker
            onSelect={(emoji) => {
              onReaction(message._id, emoji);
              setShowReactions(false);
            }}
            onClose={() => setShowReactions(false)}
          />
        )}
      </div>
    </div>
  );
};

export default Message;
