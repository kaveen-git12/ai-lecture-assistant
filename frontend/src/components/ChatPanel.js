import React, { useState, useRef, useEffect } from 'react';

function ChatPanel({ uploadedPDFs = [], slides = [], onAskAI }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [activeContextTab, setActiveContextTab] = useState('pdf'); // 'pdf' | 'slides'
  
  // Active context state
  const [selectedContextType, setSelectedContextType] = useState(null); // 'pdf' | 'slides' | null
  const [selectedPDF, setSelectedPDF] = useState(null); // { id, name, text }
  const [selectedSlides, setSelectedSlides] = useState([]); // array of base64 images
  
  // Local slide checkboxes state (committed when clicking "Use Selected Slides")
  const [localSelectedSlides, setLocalSelectedSlides] = useState([]); // array of slide images
  
  const chatBoxRef = useRef(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  // Sync local checkboxes selection if slides list changes
  useEffect(() => {
    // Keep only valid selections
    setLocalSelectedSlides(prev => prev.filter(img => slides.some(s => s.image === img || s.img === img)));
  }, [slides]);

  const handleToggleSlide = (slideImg) => {
    setLocalSelectedSlides(prev => {
      if (prev.includes(slideImg)) {
        return prev.filter(img => img !== slideImg);
      } else {
        return [...prev, slideImg];
      }
    });
  };

  const handleUsePDF = (pdf) => {
    setSelectedContextType('pdf');
    setSelectedPDF(pdf);
    setSelectedSlides([]);
  };

  const handleUseSlides = () => {
    if (localSelectedSlides.length === 0) {
      alert('Please select at least one slide.');
      return;
    }
    setSelectedContextType('slides');
    setSelectedSlides(localSelectedSlides);
    setSelectedPDF(null);
  };

  const handleClearContext = () => {
    setSelectedContextType(null);
    setSelectedPDF(null);
    setSelectedSlides([]);
  };

  const addMessage = (text, type) => {
    setMessages(prev => [...prev, { text, type }]);
  };

  const sendMessage = async (textToSend) => {
    const msg = (textToSend || inputValue).trim();
    if (!msg) return;

    if (!textToSend) {
      setInputValue('');
    }

    addMessage(msg, "user");
    addMessage("...thinking...", "ai");

    // Map conversation history for LLM route
    const historyPayload = messages.map(m => ({
      role: m.type === 'ai' ? 'assistant' : 'user',
      content: m.text
    }));

    // Grab active context
    let contextText = '';
    let imagesPayload = [];

    if (selectedContextType === 'pdf' && selectedPDF) {
      contextText = selectedPDF.text;
    } else if (selectedContextType === 'slides') {
      imagesPayload = selectedSlides;
    }

    try {
      if (typeof onAskAI === 'function') {
        const reply = await onAskAI(msg, contextText, historyPayload, imagesPayload, 'ollama');
        
        setMessages(prev => {
          const newMessages = [...prev];
          const lastAIIndex = newMessages.map(m => m.type).lastIndexOf('ai');
          if (lastAIIndex !== -1) {
            newMessages[lastAIIndex] = { text: reply, type: 'ai' };
          }
          return newMessages;
        });
      } else {
        setMessages(prev => {
          const newMessages = [...prev];
          const lastAIIndex = newMessages.map(m => m.type).lastIndexOf('ai');
          if (lastAIIndex !== -1) {
            newMessages[lastAIIndex] = { text: "AI Assistant is unavailable.", type: 'ai' };
          }
          return newMessages;
        });
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => {
        const newMessages = [...prev];
        const lastAIIndex = newMessages.map(m => m.type).lastIndexOf('ai');
        if (lastAIIndex !== -1) {
          newMessages[lastAIIndex] = { 
            text: `Error: ${err.message || "Network error. Please make sure backend server is running."}`, 
            type: 'ai' 
          };
        }
        return newMessages;
      });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  // Premade chip topics to click
  const CHIP_PROMPTS = [
    "Summarise this lecture",
    "What are the main terms?",
    "Generate a 5-question quiz",
    "Explain the hardest concept"
  ];

  return (
    <div className="chat-layout">
      {/* ── LEFT PANEL: CONTEXT SELECTOR ── */}
      <aside className="chat-context-panel">
        <h3 className="context-panel-title">🎯 Chat Context</h3>
        
        {/* Selector Tabs */}
        <div className="chat-context-tabs">
          <button 
            className={`context-tab-btn ${activeContextTab === 'pdf' ? 'active' : ''}`}
            onClick={() => setActiveContextTab('pdf')}
          >
            📄 PDF Notes
          </button>
          <button 
            className={`context-tab-btn ${activeContextTab === 'slides' ? 'active' : ''}`}
            onClick={() => setActiveContextTab('slides')}
          >
            📸 Captured Slides
          </button>
        </div>

        {/* Tab Content */}
        <div className="context-tab-content">
          {/* TAB 1: PDF NOTES */}
          {activeContextTab === 'pdf' && (
            <div className="context-pdf-section">
              {uploadedPDFs.length === 0 ? (
                <div className="context-empty-state">
                  <div className="context-empty-icon">📁</div>
                  <p className="context-empty-text">No PDFs uploaded yet.</p>
                  <p className="context-empty-subtext">Go to the Notes tab to add one!</p>
                </div>
              ) : (
                <div className="pdf-cards-list">
                  {uploadedPDFs.map((pdf) => {
                    const isSelected = selectedContextType === 'pdf' && selectedPDF?.id === pdf.id;
                    return (
                      <div 
                        key={pdf.id} 
                        className={`pdf-context-card ${isSelected ? 'selected' : ''}`}
                      >
                        <div className="pdf-card-info">
                          <span className="pdf-card-icon">📄</span>
                          <div className="pdf-card-meta">
                            <span className="pdf-card-name" title={pdf.name}>{pdf.name}</span>
                            <span className="pdf-card-size">{pdf.size ? formatBytes(pdf.size) : 'Unknown size'}</span>
                          </div>
                        </div>
                        <button 
                          className={`pdf-use-btn ${isSelected ? 'active' : ''}`}
                          onClick={() => handleUsePDF(pdf)}
                          disabled={isSelected}
                        >
                          {isSelected ? '✅ In Use' : 'Use This'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CAPTURED SLIDES */}
          {activeContextTab === 'slides' && (
            <div className="context-slides-section">
              {slides.length === 0 ? (
                <div className="context-empty-state">
                  <div className="context-empty-icon">📸</div>
                  <p className="context-empty-text">No slides captured yet.</p>
                  <p className="context-empty-subtext">Start a Live Session first!</p>
                </div>
              ) : (
                <div className="slides-context-wrapper">
                  <div className="slides-thumbnails-grid">
                    {slides.map((slide, index) => {
                      const slideImg = slide.image || slide.img;
                      const isChecked = localSelectedSlides.includes(slideImg);
                      return (
                        <div 
                          key={index}
                          className={`slide-context-card ${isChecked ? 'checked' : ''}`}
                          onClick={() => handleToggleSlide(slideImg)}
                        >
                          <img src={slideImg} alt={`Slide ${index + 1}`} className="slide-context-img" />
                          <div className="slide-checkbox-overlay">
                            <input 
                              type="checkbox" 
                              checked={isChecked}
                              onChange={() => {}} // toggled by card click
                              className="slide-checkbox"
                            />
                            <span className="slide-index-label">#{index + 1}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Slide commit button */}
                  <div className="slides-use-footer">
                    <button 
                      className="slides-use-btn"
                      onClick={handleUseSlides}
                      disabled={localSelectedSlides.length === 0}
                    >
                      ✨ Use Selected Slides ({localSelectedSlides.length})
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* ── RIGHT PANEL: CHAT INTERFACE ── */}
      <section className="chat-main-panel">
        
        {/* Context Banner */}
        <div className={`chat-context-banner ${selectedContextType ? 'active' : ''}`}>
          <div className="banner-left">
            {selectedContextType === 'pdf' && selectedPDF && (
              <>
                <span className="banner-icon">📄</span>
                <span className="banner-text">Discussing: <strong>{selectedPDF.name}</strong></span>
              </>
            )}
            {selectedContextType === 'slides' && selectedSlides.length > 0 && (
              <>
                <span className="banner-icon">📸</span>
                <span className="banner-text">Discussing: <strong>{selectedSlides.length} captured slides</strong></span>
              </>
            )}
            {!selectedContextType && (
              <>
                <span className="banner-icon">⚠️</span>
                <span className="banner-text warning">No context selected — AI will answer generally</span>
              </>
            )}
          </div>
          {selectedContextType && (
            <button className="banner-change-btn" onClick={handleClearContext}>
              Change
            </button>
          )}
        </div>

        {/* Chat Messages */}
        <div ref={chatBoxRef} className="chat-messages-container">
          {messages.length === 0 ? (
            <div className="chat-welcome-state">
              <div className="welcome-avatar">🤖</div>
              <h4 className="welcome-title">How can I help with your studies?</h4>
              <p className="welcome-subtitle">
                Select a PDF note or captured slides from the left panel to discuss specific content, or ask general lecture questions!
              </p>
              
              {/* Prompt chips */}
              <div className="welcome-chips">
                {CHIP_PROMPTS.map((promptText, i) => (
                  <button 
                    key={i} 
                    className="welcome-chip-btn"
                    onClick={() => sendMessage(promptText)}
                  >
                    💡 "{promptText}"
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="messages-list">
              {messages.map((message, idx) => (
                <div
                  key={idx}
                  className={`chat-bubble-wrapper ${message.type}`}
                >
                  <div className="chat-bubble-avatar">
                    {message.type === 'ai' ? '🤖' : '👨‍🎓'}
                  </div>
                  <div className={`chat-bubble ${message.type}`}>
                    {message.text}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Chat Input */}
        <div className="chat-input-bar">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              selectedContextType === 'pdf' 
                ? "Ask about this PDF notes..." 
                : selectedContextType === 'slides' 
                ? "Ask about these captured slides..." 
                : "Ask anything generally..."
            }
            className="chat-text-input"
          />
          <button 
            onClick={() => sendMessage()}
            disabled={!inputValue.trim()}
            className="chat-send-btn"
          >
            Send
          </button>
        </div>
      </section>
    </div>
  );
}

export default ChatPanel;