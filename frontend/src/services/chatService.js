import apiClient from './apiClient';

const CHAT_PATH = '/chat';

const chatService = {
  sendMessage: (payload) => apiClient.post(`${CHAT_PATH}/message`, payload),
  getHistory: () => apiClient.get(`${CHAT_PATH}/history`),
  clearHistory: () => apiClient.post(`${CHAT_PATH}/clear`, {}),
  compareProviders: (payload) => apiClient.post(`${CHAT_PATH}/compare`, payload),
};

export default chatService;
