import React, { useState } from 'react';

function ChatSidebar({ messages, onSendMessage }) {
  const [draft, setDraft] = useState('');

  const send = () => {
    onSendMessage(draft);
    setDraft('');
  };

  return (
    <aside className="chat-sidebar">
      <div className="panel-title">Chat</div>
      <div className="chat-thread">
        {messages.length === 0 ? (
          <div className="empty-state">No messages yet. Start the conversation.</div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className="chat-message">
              <div className="message-author">{message.sender}</div>
              <div className="message-text">{message.text}</div>
              <div className="message-time">{message.time}</div>
            </div>
          ))
        )}
      </div>
      <div className="chat-input-row">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Type a message..."
          onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
        />
        <button type="button" className="control-button accent" onClick={send}>Send</button>
      </div>
    </aside>
  );
}

export default ChatSidebar;
