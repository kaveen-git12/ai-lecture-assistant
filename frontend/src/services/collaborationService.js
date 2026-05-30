import apiClient from './apiClient';

const COLLAB_PATH = '/collaboration';

const collaborationService = {
  createRoom: (payload) => apiClient.post(`${COLLAB_PATH}/room`, payload),
  joinRoom: (payload) => apiClient.post(`${COLLAB_PATH}/room/join`, payload),
  leaveRoom: (payload) => apiClient.post(`${COLLAB_PATH}/room/leave`, payload),
  shareLink: (payload) => apiClient.post(`${COLLAB_PATH}/share-link`, payload),
  getGroups: () => apiClient.get(`${COLLAB_PATH}/groups`),
  createGroup: (payload) => apiClient.post(`${COLLAB_PATH}/groups`, payload),
  inviteMember: (payload) => apiClient.post(`${COLLAB_PATH}/groups/invite`, payload),
  scheduleMeeting: (payload) => apiClient.post(`${COLLAB_PATH}/meetings`, payload),
};

export default collaborationService;
