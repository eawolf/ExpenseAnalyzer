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

export const authApi = axios.create({
  baseURL: 'http://localhost:8081/api', // For auth-service
});

export default api;
