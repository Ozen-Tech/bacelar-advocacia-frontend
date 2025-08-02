// src/services/api.ts
import axios from 'axios';

const baseURL = 'https://bacelar-api.onrender.com';

console.log(`[API Service] Conectando à base: ${baseURL}`);

const api = axios.create({
  baseURL: `${baseURL}/api/v1`,
});

api.interceptors.request.use(async (config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Simplificamos de volta, o interceptor não vai atrapalhar o login
export default api;