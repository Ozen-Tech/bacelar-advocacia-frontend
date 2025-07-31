// src/services/api.ts
import axios from 'axios';

const api = axios.create({
  // Aponte para a URL do seu backend. Use uma variável de ambiente no futuro.
  baseURL: 'http://localhost:8000/api/v1', 
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