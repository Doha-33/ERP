import apiClient from '../client/apiClient';

/**
 * API Service: A wrapper around the base apiClient.
 * This can be used for general API calls while specific services (like authService)
 * handle domain-specific logic.
 */

const api = {
  get: (url: string, config?: any) => apiClient.get(url, config),
  post: (url: string, data?: any, config?: any) => apiClient.post(url, data, config),
  put: (url: string, data?: any, config?: any) => apiClient.put(url, data, config),
  delete: (url: string, config?: any) => apiClient.delete(url, config),
  patch: (url: string, data?: any, config?: any) => apiClient.patch(url, data, config),
};

export default api;
    