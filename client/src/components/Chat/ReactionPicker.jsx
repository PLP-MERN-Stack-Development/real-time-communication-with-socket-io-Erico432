import React from 'react';

const REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🔥', '👏', '🎉'];

const ReactionPicker = ({ onSelect, onClose }) => {
  return (
    <div className="reaction-picker">
      <div className="reaction-picker-content">
        {REACTIONS.map((emoji) => (
          <button
            key={emoji}
            className="reaction-option"
            onClick={() => onSelect(emoji)}
          >
            {emoji}
          </button>
        ))}
      </div>
      <div className="reaction-picker-backdrop" onClick={onClose} />
    </div>
  );
};

export default ReactionPicker;
