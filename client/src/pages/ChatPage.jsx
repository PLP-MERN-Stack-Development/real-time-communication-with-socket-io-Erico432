import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import MessageList from '../components/Chat/MessageList';
import MessageInput from '../components/Chat/MessageInput';
import TypingIndicator from '../components/Chat/TypingIndicator';
import { useMessages } from '../hooks/useMessages';
import { useTyping } from '../hooks/useTyping';
import { MessageSquare } from 'lucide-react';

const ChatPage = () => {
  const [activeRoom, setActiveRoom] = useState('global');
  const { messages, loading, hasMore, sendMessage, loadMore, addReaction } = useMessages(activeRoom);
  const { typingUsers, startTyping, stopTyping } = useTyping(activeRoom);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Show browser notification for new messages
  useEffect(() => {
    if (messages.length > 0 && 'Notification' in window && Notification.permission === 'granted') {
      const lastMessage = messages[messages.length - 1];
      
      // Don't notify for own messages
      const currentUser = JSON.parse(localStorage.getItem('user'));
      if (lastMessage.sender._id !== currentUser.id) {
        new Notification(`New message from ${lastMessage.sender.username}`, {
          body: lastMessage.content,
          icon: lastMessage.sender.avatar,
        });
      }
    }
  }, [messages]);

  const handleRoomSelect = (room) => {
    setActiveRoom(room);
  };

  return (
    <div className="chat-page">
      <Sidebar activeRoom={activeRoom} onRoomSelect={handleRoomSelect} />
      
      <div className="chat-main">
        <div className="chat-header">
          <MessageSquare size={24} />
          <h2>#{activeRoom}</h2>
        </div>
        
        <MessageList
          messages={messages}
          loading={loading}
          hasMore={hasMore}
          onLoadMore={loadMore}
          onReaction={addReaction}
        />
        
        <TypingIndicator typingUsers={typingUsers} />
        
        <MessageInput
          onSendMessage={sendMessage}
          onTyping={startTyping}
          onStopTyping={stopTyping}
        />
      </div>
    </div>
  );
};

export default ChatPage;
