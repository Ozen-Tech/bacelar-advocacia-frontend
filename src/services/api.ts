// src/services/api.ts (VERSÃO FINAL E CORRIGIDA)
import axios from 'axios';

// A única "fonte da verdade" para a URL base. Começa com https.
const baseURL = 'https://bacelar-api.onrender.com';

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

export default api;