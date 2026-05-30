import apiClient from './apiClient';

const NOTES_PATH = '/notes';

const noteService = {
  fetchNotes: () => apiClient.get(NOTES_PATH),
  createNote: (payload) => apiClient.post(NOTES_PATH, payload),
  updateNote: (noteId, payload) => apiClient.put(`${NOTES_PATH}/${noteId}`, payload),
  deleteNote: (noteId) => apiClient.delete(`${NOTES_PATH}/${noteId}`),
  generateSummary: (noteId, payload) => apiClient.post(`${NOTES_PATH}/${noteId}/generate/summary`, payload),
  generateKeyConcepts: (noteId, payload) => apiClient.post(`${NOTES_PATH}/${noteId}/generate/concepts`, payload),
  generateTopicExtraction: (noteId, payload) => apiClient.post(`${NOTES_PATH}/${noteId}/generate/topics`, payload),
  generateStudyPlan: (noteId, payload) => apiClient.post(`${NOTES_PATH}/${noteId}/generate/study-plan`, payload),
  generateExamPrediction: (noteId, payload) => apiClient.post(`${NOTES_PATH}/${noteId}/generate/exam-prediction`, payload),
  generateFlashcards: (noteId, payload) => apiClient.post(`${NOTES_PATH}/${noteId}/generate/flashcards`, payload),
  exportNote: (noteId, format, options) => apiClient.post(`${NOTES_PATH}/${noteId}/export`, { format, options })
};

export default noteService;
