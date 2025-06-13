import axios from 'axios';

// Create an Axios instance with default configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  timeout: 60000, // Increased timeout to 60 seconds for Gemini AI calls
  headers: {
    'Content-Type': 'application/json',
  },
  // Add withCredentials to handle cookies properly
  withCredentials: true,
});

// Add a request interceptor to attach the auth token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Check for specific error conditions
    if (error.response?.status === 401) {
      // Unauthorized - token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      window.location.href = '/jobnest/auth';
    }

    return Promise.reject(error);
  }
);

export default api;