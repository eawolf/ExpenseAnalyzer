import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api', // Default to expense-service
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = 'Bearer ' + token;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = axios.create({
  baseURL: 'http://localhost:8081/api', // For auth-service
});

authApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
