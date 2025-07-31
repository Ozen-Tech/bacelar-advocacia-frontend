// src/services/api.ts
import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

console.log(`API baseURL set to: ${baseURL}`); // Ótimo para depuração

const api = axios.create({
  baseURL: baseURL, 
});

// Esta parte é a mágica: antes de cada requisição, ele vai checar
// se temos um token no localStorage e adicioná-lo no cabeçalho.
api.interceptors.request.use(async (config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;