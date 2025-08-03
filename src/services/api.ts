// src/services/api.ts
import axios from 'axios';

// Lê a URL base da variável de ambiente VITE_API_BASE_URL.
// Se não estiver definida, usa a URL do localhost como fallback para desenvolvimento.
const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

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

export default api;