import apiClient from './apiClient';

const QUIZ_PATH = '/quizzes';

const quizService = {
  listQuizzes: () => apiClient.get(QUIZ_PATH),
  generateQuiz: (payload) => apiClient.post(`${QUIZ_PATH}/generate`, payload),
  saveQuiz: (quizId, payload) =>
    quizId ? apiClient.put(`${QUIZ_PATH}/${quizId}`, payload) : apiClient.post(QUIZ_PATH, payload),
  submitQuiz: (quizId, result) => apiClient.post(`${QUIZ_PATH}/${quizId}/submit`, result),
  getQuizHistory: (quizId) => apiClient.get(`${QUIZ_PATH}/${quizId}/history`),
  getQuizById: (quizId) => apiClient.get(`${QUIZ_PATH}/${quizId}`),
  deleteQuiz: (quizId) => apiClient.delete(`${QUIZ_PATH}/${quizId}`),
};

export default quizService;
