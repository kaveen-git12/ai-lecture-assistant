import React, { useEffect, useRef, useState } from 'react';
import chatService from '../services/chatService';
import ChatThread from './AIChat/ChatThread';
import './AIChat.css';

function AIChat() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [settings] = useState({
    temperature: 0.7,
    systemPrompt: 'You are a helpful AI teaching assistant.',
    autoFallback: true,
  });
  const inputRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const loaded = await chatService.getHistory();
      setHistory(Array.isArray(loaded) ? loaded : []);
    } catch (err) {
      console.error('Unable to fetch chat history', err);
      setHistory([]);
    }
  };

  const appendMessage = (newMessage) => {
    setMessages((prev) => [...prev, newMessage]);
  };

  const handleSend = async () => {
    const text = inputValue.trim();
    if (!text) return;

    setInputValue('');
    
    // Create user message object
    const userMessage = { id: `${Date.now()}-user`, role: 'user', text };
    const assistantPlaceholder = { id: `${Date.now()}-assistant`, role: 'assistant', text: 'Thinking...', provider: 'ollama' };
    
    appendMessage(userMessage);
    appendMessage(assistantPlaceholder);
    
    // Save user message to history
    await chatService.saveMessage('user', text);
    
    setLoading(true);

    try {
      const response = await chatService.sendMessage({
        text,
        context: 'none',
        settings,
      });
      const reply = response.message || response.reply || response.text || 'No response returned.';
      
      // Save assistant response to history
      await chatService.saveMessage('assistant', reply, 'ollama', 'llama3:latest');
      
      setMessages((prev) => prev.map((item) =>
        item.role === 'assistant' && item.text === 'Thinking...' ? { ...item, text: reply, provider: 'ollama' } : item
      ));
    } catch (err) {
      console.error(err);
      const errorMsg = 'AI request failed. Please try again.';
      await chatService.saveMessage('assistant', errorMsg, 'ollama', 'llama3:latest');
      setMessages((prev) => prev.map((item) =>
        item.role === 'assistant' && item.text === 'Thinking...' ? { ...item, text: errorMsg } : item
      ));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaChange = (e) => {
    setInputValue(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 150) + 'px';
    }
  };

  const handleClearHistory = async () => {
    try {
      await chatService.clearHistory();
      setHistory([]);
      setMessages([]);
    } catch (err) {
      console.error('Unable to clear history', err);
    }
  };

  return (
    <div className="aichat-claude">
      <div className="aichat-header-top">
        <div className="model-badge">🦙 Llama 3 (Local)</div>
      </div>

      <div className="aichat-container">
        <ChatThread messages={messages} loading={loading} />

        <div className="aichat-input-area">
          <div className="input-container">
            <textarea
              ref={textareaRef}
              className="chat-textarea"
              value={inputValue}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question or send a prompt..."
              rows={1}
              disabled={loading}
            />
            <button
              className="send-button"
              onClick={handleSend}
              disabled={loading || !inputValue.trim()}
              title="Send"
            >
              ↑
            </button>
          </div>
        </div>

        {history.length > 0 && (
          <button className="clear-history-btn" onClick={handleClearHistory}>
            Clear History ({history.length})
          </button>
        )}
      </div>
    </div>
  );
}

export default AIChat;
