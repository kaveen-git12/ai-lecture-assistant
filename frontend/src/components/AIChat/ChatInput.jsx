import React, { useState } from 'react';

function ChatInput({ value, onSend, selectedContext, onSelectContext, contextOptions, loading }) {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text);
    setText('');
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-input-bar">
      <div className="context-dropdown">
        <label htmlFor="chat-context">Attach context</label>
        <select
          id="chat-context"
          value={selectedContext}
          onChange={(e) => onSelectContext(e.target.value)}
        >
          {contextOptions.map((option) => (
            <option key={option.id} value={option.id}>{option.label}</option>
          ))}
        </select>
      </div>

      <textarea
        className="chat-input-field"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask a question or send a prompt..."
        rows={2}
      />
      <button className="control-button" onClick={handleSend} disabled={loading || !text.trim()}>
        {loading ? 'Sending...' : 'Send'}
      </button>
    </div>
  );
}

export default ChatInput;
