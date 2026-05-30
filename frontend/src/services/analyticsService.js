import apiClient from './apiClient';

const ANALYTICS_PATH = '/analytics';
const BASE_URL = '/api';

const analyticsService = {
  getDashboard: () => apiClient.get(`${ANALYTICS_PATH}/dashboard`),
  getRetentionCurve: () => apiClient.get(`${ANALYTICS_PATH}/retention-curve`),
  getLearningCurve: () => apiClient.get(`${ANALYTICS_PATH}/learning-curve`),
  getWeakTopics: () => apiClient.get(`${ANALYTICS_PATH}/weak-topics`),
  getStrongTopics: () => apiClient.get(`${ANALYTICS_PATH}/strong-topics`),
  getStudyPatterns: () => apiClient.get(`${ANALYTICS_PATH}/study-patterns`),
  exportReport: async (format) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${BASE_URL}${ANALYTICS_PATH}/export`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: 'include',
      body: JSON.stringify({ format }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Export request failed');
    }

    return response.blob();
  },
};

export default analyticsService;
