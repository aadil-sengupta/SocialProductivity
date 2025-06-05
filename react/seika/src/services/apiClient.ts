import api from './api';

/**
 * Generic HTTP client methods
 */
export const apiClient = {
  /**
   * GET request
   * @param url - The URL to make the request to
   */
  get: async <T>(url: string): Promise<T> => {
    return await api.get(url);
  },

  /**
   * POST request
   * @param url - The URL to make the request to
   * @param data - The data to send in the request body
   */
  post: async <T>(url: string, data?: any): Promise<T> => {
    return await api.post(url, data);
  },
};

export default apiClient;
