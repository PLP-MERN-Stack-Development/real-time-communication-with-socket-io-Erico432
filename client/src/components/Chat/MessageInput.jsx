import React, { useState, useRef } from 'react';
import { Send, Paperclip, Image, X } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const MessageInput = ({ onSendMessage, onTyping, onStopTyping }) => {
  const [message, setMessage] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    setMessage(e.target.value);
    if (e.target.value.length > 0) {
      onTyping();
    } else {
      onStopTyping();
    }
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      
      // Create preview for images
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result);
        };
        reader.readAsDataURL(selectedFile);
      } else {
        setPreview(null);
      }
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    onStopTyping();

    if (!message.trim() && !file) return;

    let fileUrl = null;
    let messageType = 'text';

    // Upload file if present
    if (file) {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/upload`,
          formData,
          {
            headers: { 'Content-Type': 'multipart/form-data' },
          }
        );

        if (response.data.success) {
          fileUrl = `${import.meta.env.VITE_API_URL}${response.data.fileUrl}`;
          messageType = file.type.startsWith('image/') ? 'image' : 'file';
        }
      } catch (error) {
        toast.error('Failed to upload file');
        setUploading(false);
        return;
      }
      setUploading(false);
    }

    // Send message
    onSendMessage(message || file.name, messageType, fileUrl);
    
    // Reset form
    setMessage('');
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <form className="message-input" onSubmit={handleSubmit}>
      {preview && (
        <div className="file-preview">
          <img src={preview} alt="Preview" />
          <button type="button" onClick={handleRemoveFile} className="remove-file">
            <X size={16} />
          </button>
        </div>
      )}
      
      {file && !preview && (
        <div className="file-preview file-name">
          <span>📎 {file.name}</span>
          <button type="button" onClick={handleRemoveFile} className="remove-file">
            <X size={16} />
          </button>
        </div>
      )}
      
      <div className="input-wrapper">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          accept="image/*,.pdf,.doc,.docx"
        />
        
        <button
          type="button"
          className="attach-btn"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          <Paperclip size={20} />
        </button>
        
        <input
          type="text"
          value={message}
          onChange={handleChange}
          placeholder="Type a message..."
          disabled={uploading}
        />
        
        <button type="submit" className="send-btn" disabled={uploading || (!message.trim() && !file)}>
          <Send size={20} />
        </button>
      </div>
    </form>
  );
};

export default MessageInput;
