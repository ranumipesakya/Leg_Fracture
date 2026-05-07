import axios from 'axios';
import { auth } from './auth';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

/**
 * Pre-configured axios instance with interceptors for auth and error handling.
 */
const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to attach the token
api.interceptors.request.use(
  (config) => {
    const token = auth.getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle session expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Auto logout on 401 Unauthorized or 403 Forbidden (if specifically related to session)
      if (error.response.status === 401) {
        console.warn('Session expired or invalid. Logging out...');
        auth.logout();
      }
    }
    return Promise.reject(error);
  }
);

export default api;
