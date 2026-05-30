import React, { useEffect, useMemo, useState } from 'react';
import chatService from '../services/chatService';
import ChatThread from './AIChat/ChatThread';
import ChatInput from './AIChat/ChatInput';
import ProviderSelector from './AIChat/ProviderSelector';
import CompareView from './AIChat/CompareView';
import ChatSettings from './AIChat/ChatSettings';
import QuickActions from './AIChat/QuickActions';
import './AIChat.css';

const PROVIDERS = [
  { id: 'gpt-4o-mini', label: 'OpenAI GPT-4o-mini' },
  { id: 'claude-3-sonnet', label: 'Claude 3 Sonnet' },
  { id: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' },
];

const CONTEXT_OPTIONS = [
  { id: 'none', label: 'No Context' },
  { id: 'lecture', label: 'Lecture Context' },
  { id: 'note', label: 'Note Context' },
];

function AIChat() {
  const [mode, setMode] = useState('single');
  const [provider, setProvider] = useState(PROVIDERS[0].id);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [compareResponses, setCompareResponses] = useState(null);
  const [history, setHistory] = useState([]);
  const [settings, setSettings] = useState({
    temperature: 0.7,
    systemPrompt: 'You are a helpful AI teaching assistant.',
    autoFallback: true,
  });
  const [selectedContext, setSelectedContext] = useState('none');

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const response = await chatService.getHistory();
      const loaded = response.history || response || [];
      setHistory(Array.isArray(loaded) ? loaded : [loaded]);
    } catch (err) {
      console.error('Unable to fetch chat history', err);
    }
  };

  const appendMessage = (newMessage) => {
    setMessages((prev) => [...prev, newMessage]);
  };

  const handleSend = async (text) => {
    if (!text.trim()) return;
    if (mode === 'compare') {
      return handleCompare(text);
    }

    appendMessage({ id: `${Date.now()}-user`, role: 'user', text });
    appendMessage({ id: `${Date.now()}-assistant`, role: 'assistant', text: 'Thinking...', provider });
    setLoading(true);

    try {
      const response = await chatService.sendMessage({
        text,
        provider,
        context: selectedContext,
        settings,
      });
      const reply = response.reply || response.text || 'No response returned.';
      setMessages((prev) => prev.map((item) =>
        item.role === 'assistant' && item.text === 'Thinking...' ? { ...item, text: reply } : item
      ));
    } catch (err) {
      console.error(err);
      setMessages((prev) => prev.map((item) =>
        item.role === 'assistant' && item.text === 'Thinking...' ? { ...item, text: 'AI request failed. Please try again.' } : item
      ));
    } finally {
      setLoading(false);
    }
  };

  const handleCompare = async (text) => {
    appendMessage({ id: `${Date.now()}-user`, role: 'user', text });
    setCompareResponses(null);
    setLoading(true);

    try {
      const response = await chatService.compareProviders({
        text,
        context: selectedContext,
        settings,
        providers: PROVIDERS.map((p) => p.id),
      });
      setCompareResponses(response.responses || response);
    } catch (err) {
      console.error('Compare providers failed', err);
      setCompareResponses({
        error: 'Unable to compare providers. Try again later.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    try {
      await chatService.clearHistory();
      setHistory([]);
      setMessages([]);
      setCompareResponses(null);
    } catch (err) {
      console.error('Unable to clear history', err);
    }
  };

  const handleSettingsChange = (updates) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  };

  const handleQuickAction = (shortcut) => {
    handleSend(shortcut);
  };

  const contextLabel = useMemo(() => CONTEXT_OPTIONS.find((item) => item.id === selectedContext)?.label || 'No Context', [selectedContext]);

  return (
    <div className="aichat-root">
      <div className="aichat-header">
        <div>
          <h1>AI Chat</h1>
          <p>Ask questions, compare providers, and keep lecture context attached.</p>
        </div>
        <div className="aichat-modes">
          <button className={`mode-btn ${mode === 'single' ? 'active' : ''}`} onClick={() => setMode('single')}>Single Provider</button>
          <button className={`mode-btn ${mode === 'compare' ? 'active' : ''}`} onClick={() => setMode('compare')}>Compare Providers</button>
        </div>
      </div>

      <div className="aichat-controls">
        <ProviderSelector
          providers={PROVIDERS}
          activeProvider={provider}
          onSelectProvider={setProvider}
        />
        <div className="context-label">Context: {contextLabel}</div>
      </div>

      <div className="aichat-body">
        <main className="aichat-main">
          {mode === 'single' ? (
            <ChatThread messages={messages} loading={loading} />
          ) : (
            <CompareView responses={compareResponses} loading={loading} providers={PROVIDERS} />
          )}

          <ChatInput
            onSend={handleSend}
            onSelectContext={setSelectedContext}
            selectedContext={selectedContext}
            contextOptions={CONTEXT_OPTIONS}
            loading={loading}
          />

          <QuickActions onAction={handleQuickAction} />
        </main>

        <aside className="aichat-side">
          <ChatSettings settings={settings} onChange={handleSettingsChange} />
          <div className="chat-history-panel">
            <div className="panel-title">Chat History</div>
            <div className="history-summary">{history.length} stored conversation{history.length === 1 ? '' : 's'}</div>
            <button className="control-button secondary" onClick={handleClearHistory}>Clear History</button>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default AIChat;
