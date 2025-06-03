import apiClient from './apiClient';

// Define interfaces for authentication data
interface LoginCredentials {
  username: string;
  password: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
}

interface AuthResponse {
  token: string;
  user: {
    id: string | number;
    username: string;
    email: string;
  };
}

/**
 * Authentication service for handling login, registration, and token management
 */
export const authService = {
  /**
   * Login user and store token
   * @param credentials - User credentials
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    
    if (response.token) {
      localStorage.setItem('authToken', response.token);
    }
    
    return response;
  },

  /**
   * Register a new user
   * @param userData - User registration data
   */
  register: async (userData: RegisterData): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/register', userData);
    
    if (response.token) {
      localStorage.setItem('authToken', response.token);
    }
    
    return response;
  },

  /**
   * Logout user and remove token
   */
  logout: (): void => {
    localStorage.removeItem('authToken');
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('authToken');
  },

  /**
   * Get current user's authentication token
   */
  getToken: (): string | null => {
    return localStorage.getItem('authToken');
  },
};

export default authService;
