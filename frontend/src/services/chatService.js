import apiClient from './apiClient';

// Generate or retrieve session ID (stored in sessionStorage for current browser session)
const getSessionId = () => {
  let sessionId = sessionStorage.getItem('chatSessionId');
  if (!sessionId) {
    sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('chatSessionId', sessionId);
  }
  return sessionId;
};

const chatService = {
  sendMessage: (payload) => apiClient.post('/llm/chat', {
    messages: payload.messages || [
      { role: 'user', content: payload.text || '' }
    ],
    model: 'llama3:latest'
  }),
  
  saveMessage: async (role, content, provider = 'ollama', model = 'llama3:latest') => {
    const sessionId = getSessionId();
    try {
      const response = await apiClient.post('/llm/chat/save', {
        role,
        content,
        provider,
        model,
        sessionId
      });
      return response;
    } catch (error) {
      console.warn('Failed to save message to history:', error);
      // Don't throw - continue without persistence if DB is unavailable
    }
  },
  
  getHistory: async () => {
    try {
      const sessionId = getSessionId();
      const response = await apiClient.get(`/llm/chat/history/${sessionId}`);
      return response.history || [];
    } catch (error) {
      console.warn('Failed to fetch chat history:', error);
      return [];
    }
  },
  
  clearHistory: async () => {
    try {
      const sessionId = getSessionId();
      await apiClient.post(`/llm/chat/clear/${sessionId}`);
      return { success: true };
    } catch (error) {
      console.warn('Failed to clear chat history:', error);
      return { success: false };
    }
  },
  
  compareProviders: (payload) => apiClient.post('/llm/compare', payload),
};

export default chatService;
