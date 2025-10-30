import React, { useEffect, useRef } from 'react';
import Message from './Message';
import { Loader2 } from 'lucide-react';

const MessageList = ({ messages, loading, hasMore, onLoadMore, onReaction }) => {
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleScroll = (e) => {
    const { scrollTop } = e.target;
    if (scrollTop === 0 && hasMore && !loading) {
      onLoadMore();
    }
  };

  if (loading && messages.length === 0) {
    return (
      <div className="message-list loading">
        <Loader2 className="spinner" />
        <p>Loading messages...</p>
      </div>
    );
  }

  return (
    <div className="message-list" ref={containerRef} onScroll={handleScroll}>
      {hasMore && (
        <div className="load-more">
          <button onClick={onLoadMore} disabled={loading}>
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
      
      {messages.map((message) => (
        <Message key={message._id} message={message} onReaction={onReaction} />
      ))}
      
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
