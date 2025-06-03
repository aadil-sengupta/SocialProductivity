import api from './api';
import { AxiosRequestConfig, AxiosResponse } from 'axios';

/**
 * Generic HTTP client methods
 */
export const apiClient = {
  /**
   * GET request
   * @param url - The URL to make the request to
   * @param config - Optional Axios request config
   */
  get: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response: AxiosResponse<T> = await api.get(url, config);
    return response.data;
  },

  /**
   * POST request
   * @param url - The URL to make the request to
   * @param data - The data to send in the request body
   * @param config - Optional Axios request config
   */
  post: async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response: AxiosResponse<T> = await api.post(url, data, config);
    return response.data;
  },

  /**
   * PUT request
   * @param url - The URL to make the request to
   * @param data - The data to send in the request body
   * @param config - Optional Axios request config
   */
  put: async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response: AxiosResponse<T> = await api.put(url, data, config);
    return response.data;
  },

  /**
   * PATCH request
   * @param url - The URL to make the request to
   * @param data - The data to send in the request body
   * @param config - Optional Axios request config
   */
  patch: async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response: AxiosResponse<T> = await api.patch(url, data, config);
    return response.data;
  },

  /**
   * DELETE request
   * @param url - The URL to make the request to
   * @param config - Optional Axios request config
   */
  delete: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response: AxiosResponse<T> = await api.delete(url, config);
    return response.data;
  },
};

export default apiClient;
