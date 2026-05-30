import React, { useEffect, useRef } from 'react';

function ChatThread({ messages, loading }) {
  const threadRef = useRef(null);

  useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight;
    }
  }, [messages, loading]);

  return (
    <section className="chat-thread">
      {messages.length === 0 ? (
        <div className="thread-empty">Start the conversation by asking a question.</div>
      ) : (
        <div className="thread-messages" ref={threadRef}>
          {messages.map((message) => (
            <div key={message.id} className={`message-bubble ${message.role}`}>
              {message.role === 'assistant' && (
                <div className="message-meta">{message.provider || 'AI Assistant'}</div>
              )}
              <div className="message-text">{message.text}</div>
            </div>
          ))}
        </div>
      )}

      {loading && (
        <div className="thread-loading">
          <div className="loading-dot" />
          <div className="loading-dot" />
          <div className="loading-dot" />
        </div>
      )}
    </section>
  );
}

export default ChatThread;
