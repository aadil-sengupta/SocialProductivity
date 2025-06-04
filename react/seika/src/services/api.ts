import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// Define base API configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/';

// Default config for axios instance
const axiosConfig: AxiosRequestConfig = {
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

// Create axios instance
const api: AxiosInstance = axios.create(axiosConfig);

// Request interceptor to attach the authorization token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = localStorage.getItem('authToken');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle common response scenarios
api.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized errors (token expired or invalid)
    if (error.response && error.response.status === 401) {
      // You can handle token expiration here
      // For example, redirect to login page or refresh token
      localStorage.removeItem('authToken');
      
      // If you're using React Router, you can redirect to login
      // window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default api;
