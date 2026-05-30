import apiClient from './apiClient';

const SEARCH_PATH = '/search';

const searchService = {
  semanticSearch: (payload) => apiClient.post(`${SEARCH_PATH}/semantic`, payload),
  getRecommendations: () => apiClient.get(`${SEARCH_PATH}/recommendations`),
};

export default searchService;
