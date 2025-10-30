import React, { useState } from 'react';
import { X } from 'lucide-react';

const CreateRoomModal = ({ onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPrivate: false,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name.trim()) {
      onCreate(formData.name, formData.description, formData.isPrivate);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>Create New Room</h3>
          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Room name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          
          <textarea
            placeholder="Description (optional)"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows="3"
          />
          
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={formData.isPrivate}
              onChange={(e) => setFormData({ ...formData, isPrivate: e.target.checked })}
            />
            Private room
          </label>
          
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Create Room
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRoomModal;
