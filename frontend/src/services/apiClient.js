const BASE_URL = '/api';

const getToken = () => localStorage.getItem('token');

const buildHeaders = (customHeaders = {}) => {
  const headers = { ...customHeaders };
  if (!headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }
  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (response) => {
  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const body = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const error = body?.error || body?.message || response.statusText;
    throw new Error(error || 'Request failed');
  }

  return body;
};

const request = async (path, method = 'GET', body = null, options = {}) => {
  const config = {
    method,
    headers: buildHeaders(options.headers),
    credentials: 'include',
    ...options,
  };

  if (body && !(body instanceof FormData)) {
    config.body = JSON.stringify(body);
  } else if (body instanceof FormData) {
    config.body = body;
    delete config.headers['Content-Type'];
  }

  const response = await fetch(`${BASE_URL}${path}`, config);
  return await handleResponse(response);
};

const apiClient = {
  get: (path, options) => request(path, 'GET', null, options),
  post: (path, body, options) => request(path, 'POST', body, options),
  put: (path, body, options) => request(path, 'PUT', body, options),
  patch: (path, body, options) => request(path, 'PATCH', body, options),
  delete: (path, body, options) => request(path, 'DELETE', body, options),
  postForm: (path, formData, options) => request(path, formData instanceof FormData ? 'POST' : 'POST', formData, options),
};

export default apiClient;
