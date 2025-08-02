// src/services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://bacelar-api.onrender.com/api/v1"',
});

api.interceptors.request.use(async (config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;