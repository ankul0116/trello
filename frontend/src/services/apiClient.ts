import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT token from localStorage to `headers.token`
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('trello_token');
    if (token) {
      // Backend authMiddleware strictly looks for `req.headers.token`
      config.headers.token = token;
      // Also provide standard Authorization header for compatibility
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 and extract backend error message
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; errors?: Array<{ message: string }> }>) => {
    if (error.response?.status === 401) {
      // Only clear and redirect if we had a token and it was invalidated
      const currentToken = localStorage.getItem('trello_token');
      if (currentToken && !window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        localStorage.removeItem('trello_token');
        localStorage.removeItem('trello_username');
        window.location.href = '/login';
      }
    }
    
    // Extract informative error message
    const customMessage = 
      error.response?.data?.message || 
      error.response?.data?.errors?.[0]?.message || 
      error.message || 
      'An unexpected error occurred';

    return Promise.reject(new Error(customMessage));
  }
);
