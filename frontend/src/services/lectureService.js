import apiClient from './apiClient';

const BASE_PATH = '/lectures';

export const fetchRecentLectures = async (limit = 5) => {
  return apiClient.get(`${BASE_PATH}/recent?limit=${limit}`);
};

export const getLectureDetails = async (lectureId) => {
  return apiClient.get(`${BASE_PATH}/${lectureId}`);
};

export const createLectureSession = async (payload) => {
  return apiClient.post(BASE_PATH, payload);
};

export const updateLectureMetadata = async (lectureId, metadata) => {
  return apiClient.put(`${BASE_PATH}/${lectureId}`, metadata);
};

export const saveSlideCapture = async (lectureId, slideData) => {
  return apiClient.post(`${BASE_PATH}/${lectureId}/slides`, slideData);
};

export const deleteSlide = async (lectureId, slideId) => {
  return apiClient.delete(`${BASE_PATH}/${lectureId}/slides/${slideId}`);
};

export const reorderSlides = async (lectureId, order = []) => {
  return apiClient.post(`${BASE_PATH}/${lectureId}/slides/reorder`, { order });
};

export const transcribeAudio = async (lectureId, audioFile) => {
  const formData = new FormData();
  formData.append('audio', audioFile);
  return apiClient.postForm(`${BASE_PATH}/${lectureId}/transcribe`, formData);
};

export const fetchTranscript = async (lectureId) => {
  return apiClient.get(`${BASE_PATH}/${lectureId}/transcript`);
};

export const fetchSubtitles = async (lectureId, language = 'en') => {
  return apiClient.get(`${BASE_PATH}/${lectureId}/subtitles?lang=${language}`);
};

export const translateSubtitles = async (lectureId, targetLanguage) => {
  return apiClient.post(`${BASE_PATH}/${lectureId}/subtitles/translate`, { targetLanguage });
};

export const exportSubtitles = async (lectureId, format) => {
  return apiClient.get(`${BASE_PATH}/${lectureId}/subtitles/export/${format}`);
};

export const saveLectureSession = async (lectureId, payload) => {
  return apiClient.post(`${BASE_PATH}/${lectureId}/save`, payload);
};

export const discardLectureSession = async (lectureId) => {
  return apiClient.delete(`${BASE_PATH}/${lectureId}/draft`);
};
