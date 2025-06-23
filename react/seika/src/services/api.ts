// Define base API configuration
//export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/';
export const API_BASE_URL = import.meta.env.VITE_API_URL //|| 'https://server.seika.fun';

// Helper function to get headers with authorization token
const getHeaders = (): HeadersInit => {
  const token = localStorage.getItem('token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  if (token) {
    headers.Authorization = `Token ${token}`;
  }

  return headers;
};

// Helper function to handle response errors
const handleResponse = async (response: Response) => {
  // Handle 401 Unauthorized errors (token expired or invalid)
  if (response.status === 401) {
    localStorage.removeItem('authToken');
    // If you're using React Router, you can redirect to login
    // window.location.href = '/login';
  }

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`HTTP ${response.status}: ${error}`);
  }

  return response;
};

// GET function
export const get = async (url: string): Promise<any> => {
  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
  
  const response = await fetch(fullUrl, {
    method: 'GET',
    headers: getHeaders(),
  });

  await handleResponse(response);
  return response.json();
};

// POST function
export const post = async (url: string, data?: any): Promise<any> => {
  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
  
  const response = await fetch(fullUrl, {
    method: 'POST',
    headers: getHeaders(),
    body: data ? JSON.stringify(data) : undefined,
  });

  await handleResponse(response);
  return response.json();
};

// Export the functions as default
export default { get, post };
